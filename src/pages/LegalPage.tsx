import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LegalShell: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-full bg-[#FDF8F6] dark:bg-[#16151A] text-stone-800 dark:text-stone-100 overflow-y-auto">
    <div className="max-w-2xl mx-auto px-4 pb-16 pt-8 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-[#C95565] font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Glazy
      </Link>
      <h1 className="font-serif text-3xl font-bold">{title}</h1>
      <p className="text-xs text-stone-500 dark:text-stone-400">Last updated: 31 October 2026</p>
      <div className="space-y-4 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{children}</div>
    </div>
  </div>
);

const H: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 pt-2">{children}</h2>
);

export const TermsPage: React.FC = () => (
  <LegalShell title="Terms of Use">
    <p>These terms apply when you use Glazy at glazy.electrosparkzz.in or the Glazy app. By creating a space or signing in, you agree to them.</p>

    <H>1. What Glazy is</H>
    <p>Glazy is a private app for two people. Each space is shared by a couple, and content is visible only to members of that space.</p>

    <H>2. Accounts and PIN</H>
    <p>You choose a username and a 6-digit PIN. You are responsible for keeping your PIN private and for all activity on your account. The app does not currently offer a PIN reset, and encrypted content may be unrecoverable without your PIN, so keep it safe.</p>

    <H>3. Who may use Glazy</H>
    <p>You must be old enough to agree to these terms in your country. Use Glazy only to share a space with a person who has agreed to be part of it.</p>

    <H>4. Your content</H>
    <p>You keep the rights to what you send. You give Glazy permission to store and deliver it to your partner, and to process it only as needed to run the app.</p>

    <H>5. Acceptable use</H>
    <p>Do not use Glazy to harass anyone, share unlawful content, attack or overload the service, try to access another person's space, or reverse-engineer the service except where the law allows it.</p>

    <H>6. Deleted and inactive spaces</H>
    <p>If neither partner opens Glazy for 30 days, the space and everything in it is deleted permanently. To ask for earlier deletion, contact us below.</p>

    <H>7. Availability</H>
    <p>Glazy is provided as is. We try to keep it running, but features such as calls, notifications and syncing may be interrupted or change over time.</p>

    <H>8. Liability</H>
    <p>To the extent the law allows, Glazy is not liable for indirect or consequential loss, including loss of data caused by a forgotten PIN or by a device you no longer control.</p>

    <H>9. Changes</H>
    <p>We may update these terms. The date at the top shows the latest version. Continued use after a change means you accept it.</p>

    <H>10. Contact</H>
    <p>Questions about these terms: <strong>[your contact email]</strong>.</p>

    <p className="pt-4 text-xs text-stone-500">Draft text for review. It is not legal advice.</p>
  </LegalShell>
);

export const PrivacyPage: React.FC = () => (
  <LegalShell title="Privacy Policy">
    <p>This policy explains what Glazy collects and why. Glazy is built so that your messages and photos are encrypted on your device before they reach our servers.</p>

    <H>1. What we collect</H>
    <p><strong>Account:</strong> your username and a key derived from your PIN. Your PIN itself is not stored on our servers.</p>
    <p><strong>Content:</strong> messages, photos, audio, and game and garden data. Content is encrypted on your device before it is sent. Our servers store only encrypted content and the metadata needed to deliver it, such as timestamps and who the message is for.</p>
    <p><strong>Device and notifications:</strong> if you allow notifications, a push subscription token for your device. Calls use WebRTC, and the connection details needed to set a call up are exchanged through our servers.</p>
    <p><strong>Technical data:</strong> basic logs needed to keep the service secure and working.</p>

    <H>2. How we use it</H>
    <p>To run Glazy: sign you in, deliver messages and calls, send notifications you asked for, and keep the service secure. We do not sell your data and do not use it for advertising.</p>

    <H>3. Service providers</H>
    <p>Glazy runs on Supabase (database, file storage and authentication), and is hosted on GitHub Pages. These providers process data on our behalf.</p>

    <H>4. Keeping and deleting data</H>
    <p>Spaces that nobody opens for 30 days are deleted permanently, together with the encrypted content in them. To ask for earlier deletion, contact us below.</p>

    <H>5. Your choices</H>
    <p>You can change your notification settings on your device, update your profile in the app, and ask us to delete your space. You can ask us for a copy of the personal data we hold about you, or ask us to correct or delete it, by contacting us below.</p>

    <H>6. Children</H>
    <p>Glazy is not intended for children under 13.</p>

    <H>7. Changes</H>
    <p>We may update this policy. The date at the top shows the latest version.</p>

    <H>8. Contact</H>
    <p>Privacy questions: <strong>[your contact email]</strong>.</p>

    <p className="pt-4 text-xs text-stone-500">Draft text for review. It is not legal advice. Please check the list of providers and the data you collect before publishing.</p>
  </LegalShell>
);
