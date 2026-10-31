import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Download, Smartphone, Lock, MessageCircle, Sprout, Gamepad2, Globe, Share, LogIn, X, Clock,
} from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

type Platform = 'ios' | 'android' | 'other';

const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const FEATURES = [
  { icon: MessageCircle, t: 'Chat', d: 'Messages with replies, reactions, photos, audio and voice or video calls.' },
  { icon: Sprout, t: 'Garden', d: 'Water a shared garden every day. Watering on the same day together earns bonus points and a rainbow.' },
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

const InstallSection: React.FC = () => {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [stepsFor, setStepsFor] = useState<Platform | null>(null);
  const [installed] = useState(isInstalled);

  if (installed) {
    return (
      <section className="text-center space-y-3">
        <p className="text-stone-600 dark:text-stone-300">Glazy is installed on this device.</p>
        <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C95565] text-white font-semibold shadow-soft">
          <LogIn className="w-4 h-4" /> Open Glazy
        </Link>
      </section>
    );
  }

  const openSteps = (p: Platform) => {
    if (p === 'android' && canInstall) {
      promptInstall();
      return;
    }
    setStepsFor(p);
  };

  const STEP_LISTS: Record<Platform, string[]> = {
    android: [
      'Open this page in Chrome.',
      'Tap the menu (⋮) at the top right.',
      'Tap "Install app" (or "Add to Home screen").',
      'Confirm "Install". Glazy appears on your home screen and in your app drawer.',
    ],
    ios: [
      'Open this page in Safari (iPhone apps can only be added from Safari).',
      'Tap the Share button at the bottom of the screen.',
      'Scroll down and tap "Add to Home Screen".',
      'Tap "Add". Glazy appears on your home screen.',
    ],
    other: [
      'On Android, open this page in Chrome, tap the menu (⋮), then "Install app".',
      'On iPhone, open this page in Safari, tap Share, then "Add to Home Screen".',
      'On a computer, look for the install icon in the address bar of Chrome or Edge.',
    ],
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => openSteps('android')}
          className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-[#C95565] text-white font-semibold shadow-soft hover:bg-[#B34757] active-scale"
        >
          <Download className="w-5 h-5" /> Install for Android
        </button>
        <button
          onClick={() => openSteps('ios')}
          className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold shadow-soft active-scale"
        >
          <Download className="w-5 h-5" /> Install for iPhone
        </button>
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
        On Android, Install adds Glazy to your home screen like a store app. On iPhone, Apple only allows
        installs from Safari, so the steps appear when you tap the button.
      </p>

      {stepsFor && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-[#FDF8F6] dark:bg-[#1E1D24] rounded-3xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">Install Glazy</h3>
              <button onClick={() => setStepsFor(null)} className="p-1 text-stone-500" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ol className="space-y-2 list-decimal pl-5 text-sm text-stone-700 dark:text-stone-200">
              {STEP_LISTS[stepsFor].map((s) => <li key={s}>{s}</li>)}
            </ol>
            {stepsFor === 'ios' && (
              <p className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                <Share className="w-4 h-4" /> Look for the Share icon in Safari.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

const LandingPage: React.FC = () => (
  <div className="min-h-full bg-[#FDF8F6] dark:bg-[#16151A] text-stone-800 dark:text-stone-100 overflow-y-auto">
    <div className="max-w-2xl mx-auto px-4 pb-16 pt-10 space-y-12">
      <header className="text-center space-y-4">
        <h1 className="font-serif italic font-bold text-5xl tracking-tight">Glazy</h1>
        <p className="text-lg text-stone-600 dark:text-stone-300">
          A private little space for two: chat, a shared garden, a 3D town and daily games.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C95565] text-white font-semibold shadow-soft">
            <LogIn className="w-4 h-4" /> Sign in
          </Link>
          <a href="#install" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#C95565] text-[#C95565] font-semibold">
            <Download className="w-4 h-4" /> Install
          </a>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl font-bold">What is Glazy?</h2>
        <p className="text-stone-600 dark:text-stone-300">
          Glazy is an app for two people. You make one space together, and everything in it, from messages to
          photos, is shared only between the two of you.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl font-bold">What you can do</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, t, d }) => (
            <div key={t} className="bg-white dark:bg-[#1E1D24] rounded-2xl p-4 shadow-soft">
              <div className="flex items-center gap-2 font-semibold">
                <Icon className="w-4 h-4 text-[#C95565]" /> {t}
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl font-bold">How it works</h2>
        <div className="space-y-3">
          {HOW_IT_WORKS.map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex gap-3">
              <Icon className="w-5 h-5 mt-0.5 text-[#C95565] shrink-0" />
              <div>
                <p className="font-semibold">{t}</p>
                <p className="text-sm text-stone-600 dark:text-stone-300">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl font-bold">How to use Glazy</h2>
        <ol className="space-y-2 list-decimal pl-5 text-stone-700 dark:text-stone-200">
          {STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Tip: keep your PIN somewhere safe. It is the only key to your space.
        </p>
      </section>

      <div id="install" className="scroll-mt-6 space-y-3">
        <h2 className="font-serif text-2xl font-bold text-center">Install the app</h2>
        <InstallSection />
      </div>

      <footer className="pt-6 border-t border-stone-200 dark:border-stone-700 text-sm text-stone-500 dark:text-stone-400 flex flex-wrap justify-center gap-x-6 gap-y-2">
        <Link to="/terms" className="hover:underline">Terms</Link>
        <Link to="/privacy" className="hover:underline">Privacy</Link>
        <Link to="/login" className="hover:underline">Sign in</Link>
      </footer>
    </div>
  </div>
);

export default LandingPage;
