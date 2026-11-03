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

const BLACK = "#3A3742";
const BLACK_SOFT = "#2C2A33";
const RED = '#FF3B5C';
const PINK = '#FF8FA3';
const WHITE = '#FFFFFF';

/**
 * Kitty in side profile, facing right: black coat, white chest and paws, red bow.
 * Breathes, swishes its tail, blinks, twitches an ear, lifts a paw to wave and
 * opens its mouth when it talks.
 */
const SideKitty: React.FC<{ reduce: boolean; talking: boolean }> = ({ reduce, talking }) => {
  return (
    <motion.svg
      viewBox="0 0 280 300"
      role="img"
      aria-label="Kitty, the Glazy guide"
      className="w-[260px] sm:w-[300px] h-auto mx-auto"
      style={{ overflow: 'visible' }}
    >
      {/* tail, swishing from its base */}
      <motion.path
        d="M66 196 C30 196 20 160 34 132 C40 120 52 122 50 134 C46 152 56 166 80 170 Z"
        fill={BLACK} stroke={PINK} strokeWidth="1.4" strokeOpacity="0.6"
        animate={reduce ? undefined : { rotate: [0, -12, 0, 8, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '80px 196px' }}
      />

      {/* body breathing */}
      <motion.g
        animate={reduce ? undefined : { scaleY: [1, 1.03, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '130px 240px' }}
      >
        {/* back legs (behind the body) */}
        <rect x="74" y="200" width="22" height="66" rx="11" fill={BLACK_SOFT} />
        <ellipse cx="86" cy="266" rx="16" ry="8" fill={WHITE} />

        <ellipse cx="128" cy="198" rx="78" ry="46" fill={BLACK} stroke={PINK} strokeWidth="1.6" strokeOpacity="0.6" />
        {/* neck joining head and body */}
        <ellipse cx="180" cy="150" rx="30" ry="40" fill={BLACK} stroke={PINK} strokeWidth="1.4" strokeOpacity="0.6" />
        {/* white chest on the front side */}
        <ellipse cx="184" cy="204" rx="20" ry="26" fill={WHITE} />

        {/* front legs */}
        <motion.g
          animate={reduce ? undefined : { rotate: [0, 4, 0, -4, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '164px 200px' }}
        >
          <rect x="152" y="200" width="24" height="66" rx="12" fill={BLACK} />
          <ellipse cx="166" cy="266" rx="17" ry="8" fill={WHITE} />
        </motion.g>
      </motion.g>

      {/* head bobbing, lifted paw and talking */}
      <motion.g
        animate={reduce ? undefined : { y: talking ? [0, -3, 0] : [0, -1.5, 0] }}
        transition={{ duration: talking ? 0.5 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* back ear */}
        <motion.path
          d="M190 74 L204 30 L226 70 Z"
          fill={BLACK} stroke={PINK} strokeWidth="1.4" strokeOpacity="0.6"
          animate={reduce ? undefined : { rotate: [0, 0, -8, 0, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.7, 0.8, 0.9, 1] }}
          style={{ transformOrigin: '206px 70px' }}
        />
        <path d="M198 66 L206 44 L218 64 Z" fill={PINK} />
        {/* head */}
        <ellipse cx="200" cy="112" rx="50" ry="46" fill={BLACK} stroke={PINK} strokeWidth="1.6" strokeOpacity="0.6" />
        {/* front ear */}
        <motion.path
          d="M160 86 L170 38 L198 74 Z"
          fill={BLACK} stroke={PINK} strokeWidth="1.4" strokeOpacity="0.6"
          animate={reduce ? undefined : { rotate: [0, 0, 6, 0, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, times: [0, 0.75, 0.82, 0.9, 1] }}
          style={{ transformOrigin: '184px 80px' }}
        />
        <path d="M168 84 L174 52 L190 76 Z" fill={PINK} />
        {/* muzzle */}
        <ellipse cx="238" cy="126" rx="16" ry="12" fill={WHITE} />
        {/* eye (blinks) */}
        <motion.g
          animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
          style={{ transformOrigin: '218px 106px' }}
        >
          <ellipse cx="218" cy="106" rx="9" ry="11" fill={WHITE} />
          <circle cx="221" cy="108" r="6" fill="#14131A" />
          <circle cx="223" cy="105" r="2.2" fill={WHITE} />
        </motion.g>
        {/* blush */}
        <ellipse cx="222" cy="126" rx="7" ry="4.5" fill={RED} opacity="0.55" />
        {/* nose and mouth */}
        <path d="M248 116 L256 118 L250 124 Z" fill={RED} />
        <motion.path
          d="M250 124 Q246 134 240 132"
          fill="none"
          stroke={WHITE}
          strokeWidth="2.2"
          strokeLinecap="round"
          animate={reduce ? undefined : { d: talking ? ['M250 124 Q246 134 240 132', 'M250 124 Q246 142 238 140', 'M250 124 Q246 134 240 132'] : undefined }}
          transition={{ duration: 0.45, repeat: talking ? Infinity : 0 }}
        />
        {/* whiskers */}
        <path d="M256 122 L278 116 M256 128 L278 132" stroke={WHITE} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
        {/* red bow at the neck */}
        <path d="M184 150 L170 140 L170 162 Z" fill={RED} />
        <path d="M184 150 L198 140 L198 162 Z" fill={RED} />
        <circle cx="184" cy="150" r="5" fill="#B3142E" />
      </motion.g>

      {/* waving paw, raised from the front shoulder */}
      <motion.g
        animate={reduce ? undefined : { rotate: [0, -28, 0, -28, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
        style={{ transformOrigin: '186px 176px' }}
      >
        <rect x="178" y="130" width="16" height="50" rx="8" fill={BLACK_SOFT} />
        <ellipse cx="186" cy="130" rx="10" ry="9" fill={WHITE} />
      </motion.g>
    </motion.svg>
  );
};

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
      <SideKitty reduce={reduce} talking={typing} />
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
            className="w-full text-left bg-white text-[#17161B] rounded-3xl rounded-tl-md px-5 py-4 shadow-[0_8px_30px_rgba(255,59,92,0.25)] text-base leading-relaxed"
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
