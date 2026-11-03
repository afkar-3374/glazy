import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Download, Smartphone, Lock, MessageCircle, Sprout, Gamepad2, Globe, Share, LogIn, X, Clock,
  type LucideIcon,
} from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { KittyGuide } from '../components/Landing/KittyGuide';
import {
  detectInstallDevice, isAppInstalled, isIOSNonSafari, type InstallDevice,
} from '../services/installDevice';

const FEATURES = [
  { icon: MessageCircle, t: 'Chat', d: 'Messages with replies, reactions, photos, audio and voice or video calls.' },
  { icon: Sprout, t: 'Garden', d: 'Water a shared garden every day and build 30 cute things together, from tulip beds to a rainbow arch.' },
  { icon: Globe, t: 'World', d: 'A small 3D town where you dress up your avatar and explore together.' },
  { icon: Gamepad2, t: 'Play', d: 'Daily games such as Tic-Tac-Toe and a daily doodle, with weekly scores.' },
  { icon: Heart, t: 'Us', d: 'Your start date, special dates and little love taps.' },
];

const STEPS = [
  'Tap Sign in. On the kitty timer screen, tap the kitty three times to sign in, or five times to create a new space.',
  'Create your space for two: choose a username and a 6-digit PIN.',
  'Your partner joins with their own username and PIN, so you share one private space.',
  'Use the bottom bar to chat, water the garden, explore the world, or play.',
];

const HOW_IT_WORKS = [
  { icon: Lock, t: 'Encrypted for two', d: 'Messages and photos are encrypted on your device before they are sent, so the server only stores encrypted content.' },
  { icon: Smartphone, t: 'Works like an app', d: 'Install it on your phone for a full-screen app with its own icon. The app itself loads offline; messages need a connection.' },
  { icon: Clock, t: 'Unused spaces are removed', d: 'If neither of you opens Glazy for 30 days, your space and everything in it is deleted for good.' },
];

const STEP_LISTS: Record<'ios' | 'iosOther' | 'android' | 'other', string[]> = {
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

const DIALOG_TITLE = 'Add Glazy to your device';

const InstallSection: React.FC = () => {
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
      <section className="text-center space-y-3">
        <p className="text-white/80">Glazy is installed on this device.</p>
        <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF3B5C] text-white font-semibold shadow-[0_8px_24px_rgba(255,59,92,0.35)]">
          <LogIn className="w-4 h-4" /> Open Glazy
        </Link>
      </section>
    );
  }

  // Chrome or Edge offered a real install: use it directly
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
      // A prompt can only be used once
      setInstallPrompt(null);
      setBusy(false);
    }
  };

  const stepsKey: keyof typeof STEP_LISTS =
    device === 'ios' ? (iosOther ? 'iosOther' : 'ios') : device === 'android' ? 'android' : 'other';

  const label = !canOneTap && device === 'ios' ? 'Add Glazy to iPhone' : 'Install Glazy';

  return (
    <section className="space-y-4 text-center">
      <button
        onClick={onInstallClick}
        disabled={busy}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#FF3B5C] text-white font-semibold shadow-[0_10px_30px_rgba(255,59,92,0.35)] hover:bg-[#E62E4E] active:scale-[0.98] transition disabled:opacity-60"
      >
        <Download className="w-5 h-5" /> {busy ? 'Installing…' : label}
      </button>
      <p className="text-xs text-white/60">
        {canOneTap
          ? 'Your browser will ask you to confirm. Glazy then appears on your home screen like a store app.'
          : device === 'ios'
            ? 'iPhone installs are done from Safari, so the steps appear when you tap the button.'
            : 'Your browser shows the install steps for this device when you tap the button.'}
      </p>

      {showSteps && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-[#17161B] text-white rounded-3xl p-6 shadow-[0_20px_60px_rgba(255,59,92,0.25)] text-left border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-xl font-bold">{DIALOG_TITLE}</h3>
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
    </section>
  );
};

const Card: React.FC<{ icon: LucideIcon; t: string; d: string }> = ({ icon: Icon, t, d }) => (
  <div className="bg-[#17161B] border border-white/10 rounded-2xl p-4">
    <div className="flex items-center gap-2 font-semibold">
      <Icon className="w-4 h-4 text-[#FF3B5C]" /> {t}
    </div>
    <p className="text-sm text-white/70 mt-1">{d}</p>
  </div>
);

const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Glazy · a private space for two';
    return () => {
      document.title = 'Kitty Timer';
    };
  }, []);

  return (
    <div className="min-h-full bg-[#0B0A0D] text-white overflow-y-auto">
      <div className="max-w-2xl mx-auto px-5 pb-16 pt-10 space-y-14">
        <header className="text-center space-y-5 rounded-[2rem] bg-gradient-to-b from-[#FF3B5C]/25 via-[#17161B] to-[#0B0A0D] border border-white/10 px-5 pt-8 pb-10">
          <h1 className="font-serif italic font-bold text-5xl tracking-tight">Glazy</h1>
          <p className="text-xl font-semibold text-[#FF8FA3]">Two hearts, one little space.</p>
          <KittyGuide />
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <a href="#install" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF3B5C] text-white font-semibold shadow-[0_8px_24px_rgba(255,59,92,0.35)] hover:bg-[#E62E4E]">
              <Download className="w-4 h-4" /> Download the Glazy app
            </a>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/70 text-white font-semibold hover:bg-white hover:text-[#0B0A0D]">
              <LogIn className="w-4 h-4" /> Open in browser
            </Link>
          </div>
          <p className="text-xs text-white/60">Works on Android and iPhone</p>
        </header>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">What is Glazy?</h2>
          <p className="text-white/75">
            Glazy is an app for two people. You make one space together, and everything in it, from messages to
            photos, is shared only between the two of you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">What you can do</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => <Card key={f.t} icon={f.icon} t={f.t} d={f.d} />)}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">How it works</h2>
          <div className="space-y-4">
            {HOW_IT_WORKS.map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-3">
                <Icon className="w-5 h-5 mt-0.5 text-[#FF3B5C] shrink-0" />
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="text-sm text-white/70">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl font-bold">How to use Glazy</h2>
          <ol className="space-y-2 list-decimal pl-5 text-white/85">
            {STEPS.map((s) => <li key={s}>{s}</li>)}
          </ol>
          <p className="text-sm text-white/60">
            Tip: keep your PIN somewhere safe. It is the only key to your space.
          </p>
        </section>

        <div id="install" className="scroll-mt-6 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-center">Install the app</h2>
          <InstallSection />
        </div>

        <footer className="pt-6 border-t border-white/10 text-sm text-white/60 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link to="/terms" className="hover:text-[#FF8FA3] hover:underline">Terms</Link>
          <Link to="/privacy" className="hover:text-[#FF8FA3] hover:underline">Privacy</Link>
          <Link to="/login" className="hover:text-[#FF8FA3] hover:underline">Sign in</Link>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
