import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AtSign, Check, ChevronLeft, Eye, EyeOff, Loader2, Lock, ShieldCheck, Smartphone, User, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { accountService, AccountError, HANDLE_RE, PIN_LENGTH, normalizeHandle, type NewPartner } from '../services/accountService';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useDebounce } from '../hooks/useDebounce';
import { GlazyLogo } from './LoginPage';

type Availability = 'idle' | 'checking' | 'free' | 'taken' | 'invalid' | 'unknown';

interface PartnerForm extends NewPartner {
  pinAgain: string;
}

const EMPTY: PartnerForm = { name: '', handle: '', pin: '', pinAgain: '' };

/** PINs anyone would try first. */
function weakPin(pin: string): boolean {
  if (/^(\d)\1+$/.test(pin)) return true; // 111111
  const asc = '01234567890123456789';
  const desc = '98765432109876543210';
  return asc.includes(pin) || desc.includes(pin); // 123456, 654321
}

function pinProblem(p: PartnerForm): string | null {
  if (p.pin.length < PIN_LENGTH) return null;
  if (weakPin(p.pin)) return 'Too easy to guess — pick a less obvious PIN';
  if (p.pinAgain.length === PIN_LENGTH && p.pinAgain !== p.pin) return "The two PINs don't match";
  return null;
}

/** Live "is this ID free?" check while typing. */
function useAvailability(handle: string, otherHandle: string): Availability {
  const id = normalizeHandle(handle);
  const debounced = useDebounce(id, 400);
  const [state, setState] = useState<Availability>('idle');

  useEffect(() => {
    if (!debounced) return setState('idle');
    if (!HANDLE_RE.test(debounced)) return setState('invalid');
    if (debounced === normalizeHandle(otherHandle)) return setState('taken');
    let alive = true;
    setState('checking');
    void accountService.isHandleAvailable(debounced).then((free) => {
      if (alive) setState(free === null ? 'unknown' : free ? 'free' : 'taken');
    });
    return () => {
      alive = false;
    };
  }, [debounced, otherHandle]);

  return id !== debounced && id ? 'checking' : state;
}

const field =
  'w-full rounded-2xl bg-white dark:bg-[#1E1D24] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-base px-4 py-3 focus:outline-none focus:border-[#C95565] focus:ring-2 focus:ring-[#C95565]/20';

const PartnerStep: React.FC<{
  value: PartnerForm;
  otherHandle: string;
  onChange: (v: PartnerForm) => void;
  onAvailability: (a: Availability) => void;
}> = ({ value, otherHandle, onChange, onAvailability }) => {
  const availability = useAvailability(value.handle, otherHandle);
  const [showPin, setShowPin] = useState(false);
  useEffect(() => onAvailability(availability), [availability]);

  const set = (patch: Partial<PartnerForm>) => onChange({ ...value, ...patch });
  const digits = (s: string) => s.replace(/\D/g, '').slice(0, PIN_LENGTH);
  const problem = pinProblem(value);

  const hint: Record<Availability, React.ReactNode> = {
    idle: <span className="text-stone-400">3–20 letters, numbers, dots or underscores</span>,
    checking: <span className="text-stone-400 flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking…</span>,
    free: <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Available</span>,
    taken: <span className="text-rose-500 flex items-center gap-1"><X className="w-3.5 h-3.5" /> {normalizeHandle(value.handle) === normalizeHandle(otherHandle) ? 'Already used for your partner' : 'Already taken'}</span>,
    invalid: <span className="text-rose-500">Use 3–20 letters, numbers, dots or underscores</span>,
    unknown: <span className="text-amber-600">Couldn’t check right now — we’ll check when you finish</span>,
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">Name</span>
        <div className="relative">
          <User className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input className={`${field} pl-10`} value={value.name} maxLength={40} autoComplete="off" placeholder="What should your partner see?" onChange={(e) => set({ name: e.target.value })} />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">Glazy ID (used to log in)</span>
        <div className="relative">
          <AtSign className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            className={`${field} pl-10`}
            value={value.handle}
            maxLength={21}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="off"
            placeholder="choose.an.id"
            onChange={(e) => set({ handle: e.target.value.toLowerCase().replace(/\s/g, '') })}
          />
        </div>
        <span className="text-xs font-medium min-h-4">{hint[availability]}</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">6-digit PIN</span>
          <input
            className={`${field} tracking-[0.4em] text-center`}
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            autoComplete="new-password"
            value={value.pin}
            placeholder="••••••"
            onChange={(e) => set({ pin: digits(e.target.value) })}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">PIN again</span>
          <input
            className={`${field} tracking-[0.4em] text-center`}
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            autoComplete="new-password"
            value={value.pinAgain}
            placeholder="••••••"
            onChange={(e) => set({ pinAgain: digits(e.target.value) })}
          />
        </label>
      </div>
      <div className="flex items-start justify-between gap-3 -mt-1">
        <span className="text-xs font-medium text-rose-500 min-h-4">{problem}</span>
        <button type="button" onClick={() => setShowPin(!showPin)} className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-stone-500">
          {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showPin ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className="text-[11px] text-stone-400 leading-relaxed -mt-2">
        Only this partner should know this PIN. It can’t be recovered, and Glazy can’t see it.
      </p>
    </div>
  );
};

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(0); // 0 intro · 1 partner 1 · 2 partner 2 · 3 this phone
  const [p1, setP1] = useState<PartnerForm>(EMPTY);
  const [p2, setP2] = useState<PartnerForm>(EMPTY);
  const [a1, setA1] = useState<Availability>('idle');
  const [a2, setA2] = useState<Availability>('idle');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);
  const addToast = useUIStore((s) => s.addToast);

  const ready = (p: PartnerForm, a: Availability) =>
    p.name.trim().length > 0 && (a === 'free' || a === 'unknown') && p.pin.length === PIN_LENGTH && p.pinAgain === p.pin && !weakPin(p.pin);

  const create = async (thisPhone: 1 | 2) => {
    setBusy(true);
    setError(null);
    try {
      await accountService.registerCouple([p1, p2]);
      const me = thisPhone === 1 ? p1 : p2;
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      addToast('Your space is ready 💞', 'success');
      await login(me.handle, me.pin);
    } catch (err) {
      const e = err as AccountError;
      setError(e.message || 'Could not create your space. Please try again.');
      // Send them back to the partner whose ID got taken meanwhile
      if (e.taken?.includes(normalizeHandle(p1.handle))) setStep(1);
      else if (e.taken?.includes(normalizeHandle(p2.handle))) setStep(2);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-[#FDF8F6] via-[#FCE8EC]/50 to-[#FDF8F6] dark:from-[#16151A] dark:via-[#4A1D28]/30 dark:to-[#16151A]">
      <header className="flex items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-2">
        {step > 0 ? (
          <button type="button" onClick={() => { setError(null); setStep(step - 1); }} className="p-2 -ml-2 rounded-full text-stone-600 dark:text-stone-300" aria-label="Back">
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <Link to="/login" className="p-2 -ml-2 rounded-full text-stone-600 dark:text-stone-300" aria-label="Back to login">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        )}
        {step > 0 && (
          <div className="flex-1 flex gap-1.5 pr-8" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((s) => (
              <span key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-[#C95565]' : 'bg-stone-200 dark:bg-stone-800'}`} />
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)] flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            {step === 0 && (
              <div className="flex-1 flex flex-col">
                <div className="text-center pt-6 pb-8">
                  <GlazyLogo size="md" />
                  <h2 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-100">Create your couple space</h2>
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Set it up together — it takes a minute.</p>
                </div>
                <ul className="flex flex-col gap-3">
                  {[
                    { icon: User, t: 'Made for two', d: 'Glazy accounts come in pairs. Nobody can join your space after it’s made.' },
                    { icon: Lock, t: 'Each of you picks an ID and a PIN', d: 'You’ll each log in on your own phone with them.' },
                    { icon: ShieldCheck, t: 'Private by design', d: 'Chats, photos and voice notes are encrypted on your phones. Not even Glazy can read them.' },
                  ].map(({ icon: Icon, t, d }) => (
                    <li key={t} className="flex gap-3 p-4 rounded-3xl bg-white/80 dark:bg-[#1E1D24]/80 border border-rose-100/70 dark:border-stone-800">
                      <span className="w-10 h-10 flex-shrink-0 rounded-2xl bg-rose-50 dark:bg-[#C95565]/15 text-[#C95565] flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                      <span>
                        <span className="block text-sm font-bold text-stone-800 dark:text-stone-100">{t}</span>
                        <span className="block text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-0.5">{d}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <label className="mt-6 flex items-start gap-3 text-sm text-stone-600 dark:text-stone-300">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 w-5 h-5 accent-[#C95565]" />
                  <span>We are both 18 or older and agree to use Glazy kindly and lawfully.</span>
                </label>
                <div className="flex-1" />
                <button type="button" disabled={!agree} onClick={() => setStep(1)} className="mt-6 w-full py-3.5 rounded-2xl bg-[#C95565] text-white font-bold shadow-soft disabled:opacity-40 active:scale-[0.98] transition">
                  Let’s start
                </button>
              </div>
            )}

            {step === 1 && (
              <StepShell title="Partner 1" subtitle="The first of you fills this in." error={error} next={() => { setError(null); setStep(2); }} canNext={ready(p1, a1)}>
                <PartnerStep value={p1} otherHandle={p2.handle} onChange={setP1} onAvailability={setA1} />
              </StepShell>
            )}

            {step === 2 && (
              <StepShell title="Partner 2" subtitle="Now hand the phone to your partner." error={error} next={() => { setError(null); setStep(3); }} canNext={ready(p2, a2)}>
                <PartnerStep value={p2} otherHandle={p1.handle} onChange={setP2} onAvailability={setA2} />
              </StepShell>
            )}

            {step === 3 && (
              <div className="flex-1 flex flex-col pt-4">
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Whose phone is this?</h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">We’ll create your space and log this phone in. The other one logs in on their own phone.</p>
                <div className="mt-6 flex flex-col gap-3">
                  {([[1, p1], [2, p2]] as const).map(([slot, p]) => (
                    <button
                      key={slot}
                      type="button"
                      disabled={busy}
                      onClick={() => void create(slot)}
                      className="flex items-center gap-3 p-4 rounded-3xl bg-white dark:bg-[#1E1D24] border border-stone-100 dark:border-stone-800 shadow-soft text-left active:scale-[0.98] transition disabled:opacity-50"
                    >
                      <span className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-[#C95565]/15 text-[#C95565] flex items-center justify-center"><Smartphone className="w-5 h-5" /></span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-base font-bold text-stone-800 dark:text-stone-100 truncate">{p.name.trim()}</span>
                        <span className="block text-xs text-stone-500 truncate">@{normalizeHandle(p.handle)} · Partner {slot}</span>
                      </span>
                    </button>
                  ))}
                </div>
                {busy && (
                  <p className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-stone-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating your space…
                  </p>
                )}
                {error && <p className="mt-5 text-sm font-medium text-rose-500 text-center" role="alert">{error}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const StepShell: React.FC<{ title: string; subtitle: string; error: string | null; canNext: boolean; next: () => void; children: React.ReactNode }> = ({
  title,
  subtitle,
  error,
  canNext,
  next,
  children,
}) => (
  <form
    className="flex-1 flex flex-col pt-4"
    onSubmit={(e) => {
      e.preventDefault();
      if (canNext) next();
    }}
  >
    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{title}</h2>
    <p className="mt-1 mb-6 text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
    {children}
    {error && <p className="mt-4 text-sm font-medium text-rose-500" role="alert">{error}</p>}
    <div className="flex-1" />
    <button type="submit" disabled={!canNext} className="mt-6 w-full py-3.5 rounded-2xl bg-[#C95565] text-white font-bold shadow-soft disabled:opacity-40 active:scale-[0.98] transition">
      Continue
    </button>
  </form>
);

export default RegisterPage;
