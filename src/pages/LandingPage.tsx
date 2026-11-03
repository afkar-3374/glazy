import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, LogIn, Share, X } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { KittyGuide } from '../components/Landing/KittyGuide';
import {
  detectInstallDevice, isAppInstalled, isIOSNonSafari, type InstallDevice,
} from '../services/installDevice';

/** Little sticker cards: each one tilts a bit differently. */
const STICKERS = [
  { e: '💬', t: 'Chat', d: 'Replies, reactions, photos, voice and video calls.', tilt: '-rotate-2' },
  { e: '🌱', t: 'Garden', d: 'Water it together daily. Build 30 cute things, from a tulip bed to a rainbow arch.', tilt: 'rotate-2' },
  { e: '🏡', t: 'Town', d: 'A cozy 3D town. Dress up your avatar and wander together.', tilt: 'rotate-1' },
  { e: '🎮', t: 'Play', d: 'Daily games like Tic-Tac-Toe and a doodle, with weekly scores.', tilt: '-rotate-1' },
  { e: '💞', t: 'Us', d: 'Your start date, special dates and little love taps.', tilt: 'rotate-2' },
];

const STEPS = [
  { t: 'Sign in', d: 'On the kitty timer, tap the kitty three times. Five taps create a new space.' },
  { t: 'Make your space', d: 'Choose a username and a 6-digit PIN.' },
  { t: 'Invite your partner', d: 'They join with their own username and PIN. One private space for two.' },
  { t: 'Start', d: 'Chat, water the garden, explore the town or play.' },
];

const PRIVACY = [
  { e: '🔒', t: 'Encrypted for two', d: 'Messages and photos are encrypted on your device before they are sent.' },
  { e: '📱', t: 'Feels like an app', d: 'Full screen, its own icon. The app loads offline; messages need a connection.' },
  { e: '🕊️', t: 'Quietly removed', d: 'If neither of you opens Glazy for 30 days, the space is deleted for good.' },
];

type StepKey = 'ios' | 'iosOther' | 'android' | 'other';
const STEP_LISTS: Record<StepKey, string[]> = {
  android: [
    'Open this page in Chrome or Edge.',
    'Tap the menu (⋮) at the top right.',
    'Tap "Install app" (or "Add to Home screen").',
    'Confirm "Install". Glazy appears on your home screen and in your app drawer.',
  ],
  ios: [
    'Tap the Share button at the bottom of Safari.',
    'Scroll down and tap "Add to Home Screen".',
    'Tap "Add". Glazy appears on your home screen.',
  ],
  iosOther: [
    'This browser cannot add apps to an iPhone.',
    'Copy this page address, open it in Safari, then tap Share and "Add to Home Screen".',
  ],
  other: [
    'On Android, open this page in Chrome, tap the menu (⋮), then "Install app".',
    'On iPhone, open this page in Safari, tap Share, then "Add to Home Screen".',
    'On a computer, look for the install icon in the address bar of Chrome or Edge.',
  ],
};

const InstallCard: React.FC = () => {
  const deferredPrompt = useUIStore((s) => s.deferredInstallPrompt);
  const setInstallPrompt = useUIStore((s) => s.setInstallPrompt);
  const addToast = useUIStore((s) => s.addToast);
  const [device] = useState<InstallDevice>(detectInstallDevice);
  const [iosOther] = useState(isIOSNonSafari);
  const [installed, setInstalled] = useState(isAppInstalled);
  const [showSteps, setShowSteps] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onInstalled = () => setInstalled(true);
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);

  if (installed) {
    return (
      <div className="text-center space-y-4">
        <p className="text-lg font-semibold">Glazy is on this device 💖</p>
        <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#0B0A0D] font-bold">
          <LogIn className="w-4 h-4" /> Open Glazy
        </Link>
      </div>
    );
  }

  const canOneTap = Boolean(deferredPrompt);

  const onInstallClick = async () => {
    if (!deferredPrompt) {
      setShowSteps(true);
      return;
    }
    setBusy(true);
    try {
      const promptEvent = deferredPrompt as { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
      } else {
        addToast('Install cancelled. You can try again any time.', 'info');
      }
    } finally {
      setInstallPrompt(null);
      setBusy(false);
    }
  };

  const stepsKey: StepKey =
    device === 'ios' ? (iosOther ? 'iosOther' : 'ios') : device === 'android' ? 'android' : 'other';
  const label = !canOneTap && device === 'ios' ? 'Add Glazy to iPhone' : 'Download Glazy';

  return (
    <div className="text-center space-y-4">
      <button
        onClick={onInstallClick}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#0B0A0D] font-bold shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:scale-[1.03] active:scale-[0.98] transition disabled:opacity-60"
      >
        <Download className="w-5 h-5" /> {busy ? 'Installing…' : label}
      </button>
      <p className="text-xs text-white/75">
        {canOneTap
          ? 'Your browser will ask you to confirm. Glazy then sits on your home screen like a store app.'
          : device === 'ios'
            ? 'iPhone installs happen in Safari. Tap the button for the steps.'
            : 'Tap the button to see the install steps for your device.'}
      </p>

      {showSteps && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-[#17161B] text-white rounded-[2rem] p-6 text-left border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-xl font-bold">Add Glazy to your device</h3>
              <button onClick={() => setShowSteps(false)} className="p-1 text-white/60" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ol className="space-y-2 list-decimal pl-5 text-sm text-white/85">
              {STEP_LISTS[stepsKey].map((s) => <li key={s}>{s}</li>)}
            </ol>
            {stepsKey === 'ios' && (
              <p className="mt-3 flex items-center gap-2 text-xs text-white/60">
                <Share className="w-4 h-4" /> Look for the Share icon in Safari.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Glazy · a private space for two';
    return () => {
      document.title = 'Kitty Timer';
    };
  }, []);

  return (
    <div className="min-h-full bg-[#0B0A0D] text-white overflow-y-auto">
      {/* hero */}
      <header className="relative overflow-hidden px-5 pt-10 pb-14 text-center">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full bg-[#FF3B5C]/25 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-md mx-auto space-y-5">
          <span className="inline-block -rotate-3 rounded-full bg-[#FF3B5C] px-4 py-1 text-sm font-bold tracking-wide">
            a private space for two
          </span>
          <h1 className="font-serif italic font-bold text-6xl tracking-tight">Glazy</h1>
          <KittyGuide />
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <a href="#install" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF3B5C] font-bold shadow-[0_8px_24px_rgba(255,59,92,0.45)] hover:bg-[#E62E4E]">
              <Download className="w-4 h-4" /> Get the app
            </a>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-white font-bold hover:bg-white hover:text-[#0B0A0D]">
              <LogIn className="w-4 h-4" /> Open in browser
            </Link>
          </div>
          <p className="text-xs text-white/60">Works on Android and iPhone</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-5 pb-20 space-y-16">
        {/* what is it */}
        <section className="text-center space-y-3">
          <h2 className="font-serif text-3xl font-bold">Just the two of you</h2>
          <p className="text-white/80">
            Glazy is one space you make together. Messages, photos, the garden and the town are shared only between you.
          </p>
        </section>

        {/* stickers */}
        <section className="space-y-5">
          <h2 className="font-serif text-3xl font-bold text-center">What's inside</h2>
          <div className="grid grid-cols-2 gap-4">
            {STICKERS.map((s, i) => (
              <div
                key={s.t}
                className={`${s.tilt} ${i === STICKERS.length - 1 ? 'col-span-2' : ''} rounded-[1.6rem] bg-white text-[#0B0A0D] p-5 shadow-[0_10px_26px_rgba(0,0,0,0.35)]`}
              >
                <div className="text-4xl">{s.e}</div>
                <p className="mt-2 font-bold text-lg">{s.t}</p>
                <p className="text-sm text-[#0B0A0D]/70 leading-snug">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* steps */}
        <section className="space-y-5">
          <h2 className="font-serif text-3xl font-bold text-center">Start in four taps</h2>
          <ol className="relative space-y-5 border-l-2 border-dashed border-[#FF3B5C]/60 ml-4 pl-8">
            {STEPS.map((s, i) => (
              <li key={s.t} className="relative">
                <span className="absolute -left-[3.05rem] top-0 grid h-8 w-8 place-items-center rounded-full bg-[#FF3B5C] text-sm font-bold">
                  {i + 1}
                </span>
                <p className="font-bold">{s.t}</p>
                <p className="text-sm text-white/75">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* privacy */}
        <section className="rounded-[2rem] border border-[#FF3B5C]/50 bg-[#17161B] p-6 space-y-4">
          <h2 className="font-serif text-2xl font-bold">Private by design</h2>
          {PRIVACY.map((p) => (
            <div key={p.t} className="flex gap-3">
              <span className="text-2xl" aria-hidden="true">{p.e}</span>
              <div>
                <p className="font-bold">{p.t}</p>
                <p className="text-sm text-white/75">{p.d}</p>
              </div>
            </div>
          ))}
        </section>

        {/* install */}
        <section id="install" className="scroll-mt-6 rounded-[2rem] bg-[#FF3B5C] p-7 space-y-5">
          <h2 className="font-serif text-3xl font-bold text-center">Install Glazy</h2>
          <InstallCard />
        </section>

        <footer className="pt-2 border-t border-white/10 text-sm text-white/60 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link to="/terms" className="hover:text-[#FF8FA3] hover:underline">Terms</Link>
          <Link to="/privacy" className="hover:text-[#FF8FA3] hover:underline">Privacy</Link>
          <Link to="/login" className="hover:text-[#FF8FA3] hover:underline">Sign in</Link>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
