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

const BLACK = '#17161B';
const RED = '#FF3B5C';
const PINK = '#FF8FA3';

/** Full-length standing kitty: black coat, white chest and paws, red bow. */
const StandingKitty: React.FC<{ reduce: boolean; talking: boolean }> = ({ reduce, talking }) => {
  const idle = reduce ? undefined : { scaleY: [1, 1.025, 1] };
  return (
    <motion.svg
      viewBox="0 0 220 350"
      role="img"
      aria-label="Kitty, the Glazy guide"
      className="w-[250px] sm:w-[300px] h-auto mx-auto"
      style={{ overflow: 'visible' }}
    >
      {/* tail, swishing from its base */}
      <motion.path
        d="M150 300 C190 296 196 250 178 226 C170 216 160 222 166 232 C176 248 170 282 146 286 Z"
        fill={BLACK}
        animate={reduce ? undefined : { rotate: [0, 10, 0, -6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '150px 300px' }}
      />
      {/* body breathing */}
      <motion.g animate={idle} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '110px 330px' }}>
        <ellipse cx="110" cy="236" rx="60" ry="80" fill={BLACK} />
        <ellipse cx="110" cy="246" rx="32" ry="52" fill="#FFFFFF" />
        {/* legs */}
        <rect x="70" y="292" width="30" height="40" rx="15" fill={BLACK} />
        <rect x="120" y="292" width="30" height="40" rx="15" fill={BLACK} />
        <ellipse cx="85" cy="330" rx="17" ry="9" fill="#FFFFFF" />
        <ellipse cx="135" cy="330" rx="17" ry="9" fill="#FFFFFF" />
        {/* left arm resting */}
        <ellipse cx="58" cy="236" rx="13" ry="34" fill={BLACK} transform="rotate(10 58 236)" />
      </motion.g>
      {/* waving right arm */}
      <motion.g
        animate={reduce ? undefined : { rotate: [0, -24, 0, -24, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
        style={{ transformOrigin: '162px 220px' }}
      >
        <ellipse cx="164" cy="246" rx="13" ry="36" fill={BLACK} transform="rotate(-12 164 246)" />
        <ellipse cx="172" cy="276" rx="10" ry="8" fill="#FFFFFF" />
      </motion.g>
      {/* ears */}
      <path d="M62 84 L58 22 L104 60 Z" fill={BLACK} />
      <path d="M158 84 L162 22 L116 60 Z" fill={BLACK} />
      <path d="M66 76 L64 40 L92 62 Z" fill={PINK} />
      <path d="M154 76 L156 40 L128 62 Z" fill={PINK} />
      {/* head bobbing while talking */}
      <motion.g
        animate={reduce ? undefined : { y: talking ? [0, -3, 0] : [0, -1.5, 0] }}
        transition={{ duration: talking ? 0.5 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx="110" cy="110" rx="60" ry="52" fill={BLACK} />
        <ellipse cx="110" cy="128" rx="30" ry="20" fill="#FFFFFF" />
        {/* eyes with blinking */}
        <motion.g
          animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
          style={{ transformOrigin: '110px 104px' }}
        >
          <ellipse cx="86" cy="104" rx="11" ry="13" fill="#FFFFFF" />
          <ellipse cx="134" cy="104" rx="11" ry="13" fill="#FFFFFF" />
          <circle cx="88" cy="106" r="6.5" fill="#14131A" />
          <circle cx="136" cy="106" r="6.5" fill="#14131A" />
          <circle cx="90" cy="103" r="2.2" fill="#FFFFFF" />
          <circle cx="138" cy="103" r="2.2" fill="#FFFFFF" />
        </motion.g>
        {/* blush */}
        <ellipse cx="70" cy="126" rx="9" ry="5" fill={RED} opacity="0.55" />
        <ellipse cx="150" cy="126" rx="9" ry="5" fill={RED} opacity="0.55" />
        {/* nose and mouth */}
        <path d="M105 118 L115 118 L110 124 Z" fill={RED} />
        <motion.path
          d="M110 124 Q104 132 98 128 M110 124 Q116 132 122 128"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          animate={reduce ? undefined : { d: talking ? ['M110 124 Q104 132 98 128 M110 124 Q116 132 122 128', 'M110 124 Q104 138 98 130 M110 124 Q116 138 122 130', 'M110 124 Q104 132 98 128 M110 124 Q116 132 122 128'] : undefined }}
          transition={{ duration: 0.45, repeat: talking ? Infinity : 0 }}
        />
        {/* whiskers */}
        <path d="M44 118 L14 110 M44 128 L14 132 M176 118 L206 110 M176 128 L206 132" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        {/* red bow tie */}
        <path d="M110 166 L88 154 L88 178 Z" fill={RED} />
        <path d="M110 166 L132 154 L132 178 Z" fill={RED} />
        <circle cx="110" cy="166" r="6" fill="#B3142E" />
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
      <StandingKitty reduce={reduce} talking={typing} />
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
