import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/** Lines Kitty says, one after another, to explain Glazy. Tap the bubble to skip ahead. */
const LINES = [
  'Hi! I\'m Kitty 🐾 Welcome to Glazy!',
  'Glazy is a private little space, just for the two of you.',
  'Chat, share photos and have voice or video calls 💬',
  'Water our shared garden together for rainbow bonuses 🌈',
  'Wander a cozy 3D town and dress up your avatar 🏡',
  'Play daily games and see weekly scores 🎮',
  'Everything is encrypted on your device. Only you two can read it 🔒',
  'Tap Download below and I\'ll see you inside! 💖',
];

const TYPE_MS = 28;
const HOLD_MS = 2600;

const COAT = '#2E2C36';
const PINK = '#FF8FA3';
const RED = '#FF3B5C';
const DEEP_RED = '#B3142E';
const WHITE = '#FFFFFF';

/**
 * A chibi kitty: big round head, small body, sitting. Black coat, white chest and paws,
 * red bow. Breathes, blinks, swishes its tail, waves a paw, bobs its head and talks.
 */
const ChibiKitty: React.FC<{ reduce: boolean; talking: boolean }> = ({ reduce, talking }) => (
  <motion.svg
    viewBox="0 0 240 236"
    role="img"
    aria-label="Kitty, the Glazy guide"
    className="w-[230px] sm:w-[260px] h-auto mx-auto overflow-visible"
  >
    {/* soft red stage behind her */}
    <circle cx="120" cy="120" r="112" fill={RED} opacity="0.14" />
    <circle cx="120" cy="120" r="88" fill={RED} opacity="0.12" />

    {/* tail */}
    <motion.path
      d="M168 196 C212 196 222 158 204 146 C196 141 190 148 196 156 C204 168 198 184 170 184 Z"
      fill={COAT}
      stroke={PINK}
      strokeWidth="1.4"
      strokeOpacity="0.6"
      animate={reduce ? undefined : { rotate: [0, -10, 0, 8, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '170px 190px' }}
    />

    {/* body breathes */}
    <motion.g
      animate={reduce ? undefined : { scaleY: [1, 1.025, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: '120px 220px' }}
    >
      <ellipse cx="120" cy="184" rx="54" ry="42" fill={COAT} stroke={PINK} strokeWidth="1.4" strokeOpacity="0.6" />
      <ellipse cx="120" cy="192" rx="26" ry="24" fill={WHITE} />
      {/* bow */}
      <path d="M120 170 L100 158 L100 182 Z" fill={RED} />
      <path d="M120 170 L140 158 L140 182 Z" fill={RED} />
      <circle cx="120" cy="170" r="6" fill={DEEP_RED} />
      {/* paws */}
      <ellipse cx="94" cy="216" rx="18" ry="11" fill={WHITE} />
      <ellipse cx="146" cy="216" rx="18" ry="11" fill={WHITE} />
      {/* waving arm */}
      <motion.g
        animate={reduce ? undefined : { rotate: [0, -24, 0, -24, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
        style={{ transformOrigin: '76px 176px' }}
      >
        <ellipse cx="74" cy="186" rx="12" ry="22" fill={COAT} stroke={PINK} strokeWidth="1.4" strokeOpacity="0.6" />
        <ellipse cx="74" cy="206" rx="11" ry="9" fill={WHITE} />
      </motion.g>
    </motion.g>

    {/* head bobs */}
    <motion.g
      animate={reduce ? undefined : { y: talking ? [0, -3, 0] : [0, -1.5, 0] }}
      transition={{ duration: talking ? 0.5 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* ears */}
      <path d="M62 74 C56 38 62 20 80 18 C98 16 108 40 112 58 Z" fill={COAT} stroke={PINK} strokeWidth="1.4" strokeOpacity="0.6" strokeLinejoin="round" />
      <path d="M178 74 C184 38 178 20 160 18 C142 16 132 40 128 58 Z" fill={COAT} stroke={PINK} strokeWidth="1.4" strokeOpacity="0.6" strokeLinejoin="round" />
      <path d="M72 66 C70 46 74 36 82 34 C92 34 100 46 102 58 Z" fill={PINK} />
      <path d="M168 66 C170 46 166 36 158 34 C148 34 140 46 138 58 Z" fill={PINK} />
      {/* head */}
      <circle cx="120" cy="104" r="70" fill={COAT} stroke={PINK} strokeWidth="1.4" strokeOpacity="0.6" />
      {/* eyes (blink) */}
      <motion.g
        animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
        style={{ transformOrigin: '120px 106px' }}
      >
        <ellipse cx="92" cy="106" rx="13" ry="15" fill={WHITE} />
        <ellipse cx="148" cy="106" rx="13" ry="15" fill={WHITE} />
        <circle cx="94" cy="109" r="8" fill="#14131A" />
        <circle cx="146" cy="109" r="8" fill="#14131A" />
        <circle cx="97" cy="104" r="3" fill={WHITE} />
        <circle cx="149" cy="104" r="3" fill={WHITE} />
      </motion.g>
      {/* blush */}
      <ellipse cx="72" cy="130" rx="10" ry="6" fill={RED} opacity="0.55" />
      <ellipse cx="168" cy="130" rx="10" ry="6" fill={RED} opacity="0.55" />
      {/* muzzle, nose, mouth */}
      <ellipse cx="120" cy="134" rx="20" ry="14" fill={WHITE} />
      <path d="M115 125 L125 125 L120 131 Z" fill={RED} />
      <motion.path
        d="M120 131 Q114 139 108 135 M120 131 Q126 139 132 135"
        fill="none"
        stroke={WHITE}
        strokeWidth="2.4"
        strokeLinecap="round"
        animate={reduce ? undefined : { d: talking ? ['M120 131 Q114 139 108 135 M120 131 Q126 139 132 135', 'M120 131 Q114 146 108 141 M120 131 Q126 146 132 141', 'M120 131 Q114 139 108 135 M120 131 Q126 139 132 135'] : undefined }}
        transition={{ duration: 0.45, repeat: talking ? Infinity : 0 }}
      />
      {/* whiskers */}
      <path d="M50 124 L24 118 M50 132 L24 136 M190 124 L216 118 M190 132 L216 136" stroke={WHITE} strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
    </motion.g>

    {/* a little heart floats up now and then */}
    <motion.path
      d="M204 36 C200 30 194 33 196 38 C197 41 204 46 204 46 C204 46 211 41 212 38 C214 33 208 30 204 36 Z"
      fill={PINK}
      animate={reduce ? undefined : { y: [0, -10, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.2 }}
    />
  </motion.svg>
);

export const KittyGuide: React.FC = () => {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState('');
  const [typing, setTyping] = useState(true);

  // Type out the current line
  useEffect(() => {
    const full = LINES[index];
    setShown('');
    setTyping(true);
    if (reduce) {
      setShown(full);
      setTyping(false);
      return;
    }
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setShown(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(timer);
        setTyping(false);
      }
    }, TYPE_MS);
    return () => window.clearInterval(timer);
  }, [index, reduce]);

  // Move to the next line once the current one is read
  useEffect(() => {
    if (typing) return;
    const next = window.setTimeout(() => {
      setIndex((i) => (i + 1) % LINES.length);
    }, reduce ? 4000 : HOLD_MS);
    return () => window.clearTimeout(next);
  }, [typing, reduce]);

  const advance = () => setIndex((i) => (i + 1) % LINES.length);

  return (
    <div className="flex flex-col items-center gap-4">
      <ChibiKitty reduce={reduce} talking={typing} />
      <div className="relative w-full max-w-sm min-h-[5.5rem]">
        <AnimatePresence mode="wait">
          <motion.button
            key={index}
            type="button"
            onClick={advance}
            initial={reduce ? false : { opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="w-full text-left bg-white text-[#17161B] rounded-[1.6rem] rounded-tl-md px-5 py-4 shadow-[0_8px_30px_rgba(255,59,92,0.25)] text-base leading-relaxed"
            aria-live="polite"
            aria-label="Kitty's message, tap for the next one"
          >
            {shown}
            <span className="inline-block w-[2px] h-[1em] align-[-0.15em] ml-0.5 bg-[#FF3B5C]" style={{ opacity: typing && !reduce ? 1 : 0 }} />
          </motion.button>
        </AnimatePresence>
        <div className="flex justify-center gap-1.5 pt-3" aria-hidden="true">
          {LINES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-[#FF3B5C]' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KittyGuide;
