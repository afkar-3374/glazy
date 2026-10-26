import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Delete, AtSign, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { HANDLE_RE, PIN_LENGTH, normalizeHandle } from '../services/accountService';
import confetti from 'canvas-confetti';
import { KittyTimer } from '../components/Decoy/KittyTimer';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export const GlazyLogo: React.FC<{ size?: 'lg' | 'md' }> = ({ size = 'lg' }) => (
  <div className="relative inline-block">
    <h1 className={`font-serif italic font-bold tracking-tight text-stone-900 dark:text-stone-100 ${size === 'lg' ? 'text-6xl' : 'text-4xl'}`}>
      Glazy
    </h1>
    <Heart className="w-5 h-5 text-[#C95565] fill-[#C95565] absolute -top-1 -right-4 animate-bounce" />
  </div>
);

const LoginPage: React.FC = () => {
  const account = useAuthStore((s) => s.account);
  const login = useAuthStore((s) => s.login);
  const unlock = useAuthStore((s) => s.unlock);
  const isLoading = useAuthStore((s) => s.isLoading);
  const authError = useAuthStore((s) => s.error);
  const addToast = useUIStore((s) => s.addToast);
  const navigate = useNavigate();
  // Opens as a plain timer: 3 taps on the kitty → log in, 5 taps → register a couple
  const [showTimer, setShowTimer] = useState(true);

  // Known phone: only the PIN. New phone (or "not you?"): ID first, then the PIN.
  const [otherAccount, setOtherAccount] = useState(false);
  const [handle, setHandle] = useState('');
  const [handleDone, setHandleDone] = useState(false);
  const [pin, setPin] = useState('');

  const usingSaved = !!account && !otherAccount;
  const askingId = !usingSaved && !handleDone;

  useEffect(() => {
    useAuthStore.setState({ error: null });
  }, [usingSaved, handleDone]);

  const submit = async (code: string) => {
    const ok = usingSaved ? await unlock(code) : await login(handle, code);
    setPin('');
    if (ok) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      addToast('Welcome to Glazy ❤️', 'success');
    }
  };

  const press = (key: string) => {
    if (isLoading || askingId) return;
    if (key === 'del') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (!key || pin.length >= PIN_LENGTH) return;
    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LENGTH) void submit(next);
  };

  // Physical keyboard support for the PIN
  useEffect(() => {
    if (askingId || showTimer) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('del');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const idValid = HANDLE_RE.test(normalizeHandle(handle));

  if (showTimer) {
    return <KittyTimer onSecretTap={() => setShowTimer(false)} onRegisterTap={() => navigate('/register')} />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between p-6 bg-gradient-to-b from-[#FDF8F6] via-[#FCE8EC]/50 to-[#FDF8F6] dark:from-[#16151A] dark:via-[#4A1D28]/30 dark:to-[#16151A] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-rose-200/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="pt-4" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm mx-auto flex flex-col items-center text-center z-10"
      >
        <div className="mb-3">
          <GlazyLogo />
        </div>
        <p className="text-xs font-semibold tracking-wide text-stone-500 dark:text-stone-400 mb-8">
          {usingSaved ? `Welcome back, ${account!.name} 🌹` : 'A private little world for two 🌹'}
        </p>

        {askingId ? (
          <form
            className="w-full flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (idValid) {
                setHandle(normalizeHandle(handle));
                setHandleDone(true);
              }
            }}
          >
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-300 text-left" htmlFor="login-id">
              Your Glazy ID
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="login-id"
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="username"
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/\s/g, ''))}
                placeholder="your.id"
                className="w-full rounded-2xl bg-white dark:bg-[#1E1D24] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-base pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#C95565] focus:ring-2 focus:ring-[#C95565]/20"
              />
            </div>
            <button
              type="submit"
              disabled={!idValid}
              className="w-full py-3.5 rounded-2xl bg-[#C95565] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-soft active:scale-[0.98] transition disabled:opacity-40"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <>
            <p className="text-xs font-semibold text-stone-600 dark:text-stone-300 mb-4">
              {isLoading ? 'Checking…' : (
                <>Enter the PIN for <span className="text-[#C95565]">@{usingSaved ? account!.handle : handle}</span></>
              )}
            </p>

            <div className="flex gap-3 mb-3" aria-label={`${pin.length} of ${PIN_LENGTH} digits entered`}>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ scale: i < pin.length ? 1.15 : 1 }}
                  className={`w-3.5 h-3.5 rounded-full border-2 border-[#C95565] ${i < pin.length ? 'bg-[#C95565]' : 'bg-transparent'} ${isLoading ? 'animate-pulse' : ''}`}
                />
              ))}
            </div>

            <p className="text-xs text-rose-500 font-medium min-h-4 mb-4" role="alert">{authError}</p>

            <div className="grid grid-cols-3 gap-4 w-full max-w-[17rem]">
              {KEYS.map((key, i) =>
                key === '' ? (
                  <span key={i} />
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => press(key)}
                    disabled={isLoading}
                    aria-label={key === 'del' ? 'Delete' : key}
                    className="h-16 rounded-full bg-white dark:bg-[#1E1D24] border border-stone-100 dark:border-stone-800 shadow-soft text-2xl font-semibold text-stone-800 dark:text-stone-100 flex items-center justify-center active:scale-95 active:bg-rose-50 dark:active:bg-[#2A1E24] transition-all disabled:opacity-60"
                  >
                    {key === 'del' ? <Delete className="w-6 h-6 text-stone-500" /> : key}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setPin('');
                if (usingSaved) setOtherAccount(true);
                else setHandleDone(false);
              }}
              className="mt-6 text-xs font-semibold text-stone-500 dark:text-stone-400 underline underline-offset-4"
            >
              {usingSaved ? 'Not you? Use another ID' : 'Change ID'}
            </button>
          </>
        )}
      </motion.div>

      <div className="text-center pb-2 pt-6 z-10">
        <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
          End-to-end encrypted · only the two of you can read it
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
