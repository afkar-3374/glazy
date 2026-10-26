import { supabase } from './supabaseClient';
import { createCoupleVaults, deriveLoginKey } from './crypto/coupleCrypto';

/** IDs: 3–20 lowercase letters, numbers, dots or underscores. */
export const HANDLE_RE = /^[a-z0-9_.]{3,20}$/;
export const PIN_LENGTH = 6;

export const normalizeHandle = (value: string) => value.trim().toLowerCase().replace(/^@/, '');

export interface NewPartner {
  name: string;
  handle: string;
  pin: string;
}

export class AccountError extends Error {
  constructor(message: string, readonly status = 0, readonly taken: string[] = [], readonly locked = false) {
    super(message);
  }
}

async function callFunction<T>(name: string, body: unknown): Promise<T> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new AccountError('Glazy is not connected to its server yet.');
  let res: Response;
  try {
    res = await fetch(`${url}/functions/v1/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AccountError('No internet connection. Please try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AccountError(data.error || 'Something went wrong. Please try again.', res.status, data.taken ?? [], !!data.locked);
  return data as T;
}

export const accountService = {
  /** Is this ID free? (null when it can't be checked right now) */
  async isHandleAvailable(handle: string): Promise<boolean | null> {
    if (!supabase || !HANDLE_RE.test(handle)) return null;
    const { data, error } = await supabase.rpc('handle_available', { candidate: handle });
    return error ? null : Boolean(data);
  },

  /** Create the couple: both accounts, each with the couple's key locked by their own PIN. */
  async registerCouple(partners: [NewPartner, NewPartner]): Promise<void> {
    const vaults = await createCoupleVaults(partners.map((p) => p.pin));
    const body = {
      partners: await Promise.all(
        partners.map(async (p, i) => ({
          name: p.name.trim(),
          handle: normalizeHandle(p.handle),
          loginKey: await deriveLoginKey(normalizeHandle(p.handle), p.pin),
          vault: vaults[i],
        }))
      ),
    };
    await callFunction('register', body);
  },

  /**
   * Mark the couple as active. Spaces nobody opens for 30 days are deleted, so this runs
   * whenever Glazy is unlocked (the server counts at most once an hour).
   */
  async touchActivity(): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.rpc('touch_activity');
    if (error) console.warn('Unable to record activity:', error.message);
  },

  /** Sign in through the `login` function (which locks an ID after 5 wrong PINs). */
  async signIn(handle: string, pin: string): Promise<void> {
    if (!supabase) throw new AccountError('Glazy is not connected to its server yet.');
    const id = normalizeHandle(handle);
    const tokens = await callFunction<{ access_token: string; refresh_token: string }>('login', {
      handle: id,
      loginKey: await deriveLoginKey(id, pin),
    });
    const { error } = await supabase.auth.setSession(tokens);
    if (error) throw new AccountError(error.message);
  },
};
