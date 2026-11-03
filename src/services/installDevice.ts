import { useUIStore } from '../store/useUIStore';

/**
 * Install support differs by device:
 * - Chrome/Edge on Android and desktop: the browser offers a real one-tap install
 *   (beforeinstallprompt). We capture it as early as possible so it is never missed.
 * - iPhone and iPad: Safari has no install API. Only the Share → Add to Home Screen steps work.
 * - Anything else: the install steps for that browser.
 */

export type InstallDevice = 'ios' | 'android' | 'desktop' | 'other';

export function detectInstallDevice(): InstallDevice {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as a Mac, so check for touch as well
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows|Macintosh|X11|CrOS|Linux/.test(ua)) return 'desktop';
  return 'other';
}

/** On iPhone and iPad, only Safari can add the app to the home screen. */
export function isIOSNonSafari(): boolean {
  const ua = navigator.userAgent;
  return detectInstallDevice() === 'ios' && /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(ua);
}

export function isAppInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Call once at startup, before the first render, so the install prompt is never missed. */
export function captureInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    useUIStore.getState().setInstallPrompt(e);
  });
  window.addEventListener('appinstalled', () => {
    useUIStore.getState().setInstallPrompt(null);
  });
}
