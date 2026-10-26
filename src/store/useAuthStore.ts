import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';
import { chatService } from '../services/chatService';
import {
  unwrapCoupleKey,
  setCoupleKey,
  cacheVault,
  getCachedVault,
  clearCachedVault,
  type KeyVaultRow,
} from '../services/crypto/coupleCrypto';
import { accountService, AccountError, normalizeHandle } from '../services/accountService';
import { setCoupleId } from '../services/coupleScope';
import { logger } from '../services/logger/logger';
import { ivyDb } from '../db/ivyDb';
import { notifyKeyStore } from '../services/notifyKeyStore';
import { useChatStore } from './useChatStore';

/** Who is signed in on this phone (remembered, so the next time only the PIN is asked). */
export interface DeviceAccount {
  userId: string;
  handle: string;
  coupleId: string;
  slot: 1 | 2;
  name: string;
}

interface AuthState {
  account: DeviceAccount | null;
  user: UserProfile | null;
  partner: UserProfile | null;
  isAuthenticated: boolean;
  /** True only while the couple key is in memory. Never persisted: every app start is locked. */
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  /** Sign in with ID + PIN (a new phone, or another account). */
  login: (handle: string, pin: string) => Promise<boolean>;
  /** The account already on this phone: just the PIN (works offline). */
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  logout: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  updateCurrentUser: (updates: Partial<UserProfile>) => Promise<void>;
  getPartnerProfile: () => UserProfile;
}

const placeholderProfile = (id: string, name: string): UserProfile => ({
  id,
  display_name: name,
  nickname: '',
  about: '',
  avatar_url: '',
  wallpaper: 'botanical',
  theme: 'rose',
  created_at: '',
  updated_at: '',
});

// One shared object: screens subscribe to getPartnerProfile(), so it must not change identity
const PARTNER_PLACEHOLDER = placeholderProfile('', 'Your partner');

async function clearLocalData(): Promise<void> {
  await Promise.all([
    ivyDb.messages.clear(),
    ivyDb.reactions.clear(),
    ivyDb.syncQueue.clear(),
    ivyDb.profiles.clear(),
    ivyDb.attachments.clear(),
    ivyDb.callLogs.clear(),
  ]);
}

let profilesUnsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      account: null,
      user: null,
      partner: null,
      isAuthenticated: false,
      isUnlocked: false,
      isLoading: false,
      error: null,

      login: async (handle: string, pin: string) => {
        set({ isLoading: true, error: null });
        const id = normalizeHandle(handle);
        try {
          if (!supabase) throw new AccountError('Glazy is not connected to its server yet.');
          await accountService.signIn(id, pin.trim());

          const { data: session } = await supabase.auth.getSession();
          const userId = session.session?.user.id;
          if (!userId) throw new AccountError('Could not sign in. Please try again.');

          const [{ data: me, error: meError }, { data: vault, error: vaultError }] = await Promise.all([
            supabase.from('profiles').select('couple_id, slot, handle, display_name').eq('id', userId).single(),
            supabase.from('key_vault').select('salt, iv, wrapped_key, iterations').eq('user_id', userId).single(),
          ]);
          if (meError || !me) throw new Error(meError?.message || 'Missing profile');
          if (vaultError || !vault) throw new Error(vaultError?.message || 'Missing key');

          const key = await unwrapCoupleKey(pin, vault as KeyVaultRow);
          const previous = get().account;
          if (previous && previous.userId !== userId) {
            // Someone else used this phone before: never show their cached chats
            useChatStore.getState().stopRealtimeSubscription();
            useChatStore.setState({ messages: [] });
            await clearLocalData();
          }

          const account: DeviceAccount = {
            userId,
            handle: me.handle,
            coupleId: me.couple_id,
            slot: me.slot as 1 | 2,
            name: me.display_name,
          };
          setCoupleKey(key);
          setCoupleId(account.coupleId);
          void notifyKeyStore.remember(key, userId);
          cacheVault(userId, vault as KeyVaultRow);

          set({
            account,
            user: placeholderProfile(userId, me.display_name),
            isAuthenticated: true,
            isUnlocked: true,
            isLoading: false,
          });
          await get().refreshProfiles();
          return true;
        } catch (err) {
          logger.error('Login error:', err);
          set({
            isLoading: false,
            error: err instanceof AccountError ? err.message : 'Something went wrong. Please try again.',
          });
          return false;
        }
      },

      unlock: async (pin: string) => {
        const account = get().account;
        if (!account) return false;
        set({ isLoading: true, error: null });

        // The PIN opens the key cached on this phone, so this works without internet
        const cached = getCachedVault();
        const { data: sessionData } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
        if (cached && cached.userId === account.userId && sessionData.session?.user.id === account.userId) {
          try {
            const key = await unwrapCoupleKey(pin.trim(), cached.vault);
            setCoupleKey(key);
            setCoupleId(account.coupleId);
            void notifyKeyStore.remember(key, account.userId);
            set({ isUnlocked: true, isAuthenticated: true, isLoading: false });
            void get().refreshProfiles();
            return true;
          } catch {
            set({ isLoading: false, error: 'Wrong PIN' });
            return false;
          }
        }

        // Signed out meanwhile (or first run after an update): full sign-in
        return get().login(account.handle, pin);
      },

      lock: () => {
        if (!get().isUnlocked) return;
        useChatStore.getState().stopRealtimeSubscription();
        setCoupleKey(null);
        set({ isUnlocked: false });
      },

      logout: async () => {
        logger.info('User logged out');
        useChatStore.getState().stopRealtimeSubscription();
        useChatStore.setState({ messages: [], activeReplyTarget: null, selectedMessage: null, editingMessage: null });
        profilesUnsubscribe?.();
        profilesUnsubscribe = null;
        setCoupleKey(null);
        setCoupleId(null);
        clearCachedVault();
        await notifyKeyStore.forget();
        await clearLocalData();
        if (supabase) await supabase.auth.signOut();
        set({ account: null, user: null, partner: null, isAuthenticated: false, isUnlocked: false, error: null });
      },

      refreshProfiles: async () => {
        const current = get().user;
        if (!current) return;
        // Policies only return this couple's two profiles
        const profiles = await chatService.getProfiles();
        const me = profiles.find((p) => p.id === current.id);
        const partner = profiles.find((p) => p.id !== current.id);
        set({ user: me || current, partner: partner || get().partner });

        if (!profilesUnsubscribe) {
          profilesUnsubscribe = chatService.subscribeToProfileChanges(() => {
            void get().refreshProfiles();
          });
        }
      },

      updateCurrentUser: async (updates: Partial<UserProfile>) => {
        const current = get().user;
        if (!current) return;
        const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
        set({ user: updated });
        await chatService.updateProfile(updated);
      },

      getPartnerProfile: () => get().partner ?? PARTNER_PLACEHOLDER,
    }),
    {
      name: 'glazy_auth_session',
      // Only remember who is signed in; decrypted profile details stay in memory.
      partialize: (state) => ({
        account: state.account,
        user: state.account ? placeholderProfile(state.account.userId, state.account.name) : null,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.account) setCoupleId(state.account.coupleId);
      },
    }
  )
);
