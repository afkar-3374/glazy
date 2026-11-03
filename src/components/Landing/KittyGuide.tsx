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

const Kitty: React.FC<{ reduce: boolean; talking: boolean }> = ({ reduce, talking }) => (
  <motion.svg
    viewBox="0 0 160 150"
    width={160}
    height={150}
    role="img"
    aria-label="Kitty, the Glazy guide"
    className="drop-shadow-sm"
    animate={reduce ? undefined : { y: talking ? [0, -6, 0] : [0, -3, 0] }}
    transition={{ duration: talking ? 0.6 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
  >
    {/* tail */}
    <motion.path
      d="M122 118 C150 110 152 82 136 78"
      fill="none"
      stroke="#F2A65A"
      strokeWidth="11"
      strokeLinecap="round"
      animate={reduce ? undefined : { d: ['M122 118 C150 110 152 82 136 78', 'M122 118 C146 104 150 76 134 70', 'M122 118 C150 110 152 82 136 78'] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* ears */}
    <path d="M38 52 L44 14 L72 40 Z" fill="#F2A65A" />
    <path d="M122 52 L116 14 L88 40 Z" fill="#F2A65A" />
    <path d="M45 46 L48 26 L62 40 Z" fill="#FFD2D8" />
    <path d="M115 46 L112 26 L98 40 Z" fill="#FFD2D8" />
    {/* head */}
    <ellipse cx="80" cy="84" rx="54" ry="48" fill="#F7B76A" />
    {/* stripes */}
    <path d="M70 40 L74 52 M80 38 L80 52 M90 40 L86 52" stroke="#E08E3C" strokeWidth="4" strokeLinecap="round" />
    {/* eyes (blink) */}
    <motion.ellipse
      cx="62" cy="82" rx="6.5" ry="8" fill="#3A2A2E"
      animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
      transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
      style={{ transformOrigin: '62px 82px' }}
    />
    <motion.ellipse
      cx="98" cy="82" rx="6.5" ry="8" fill="#3A2A2E"
      animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
      transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
      style={{ transformOrigin: '98px 82px' }}
    />
    <circle cx="64.5" cy="79" r="2.4" fill="#fff" />
    <circle cx="100.5" cy="79" r="2.4" fill="#fff" />
    {/* blush */}
    <ellipse cx="46" cy="98" rx="8" ry="5" fill="#F58DA0" opacity="0.6" />
    <ellipse cx="114" cy="98" rx="8" ry="5" fill="#F58DA0" opacity="0.6" />
    {/* nose and mouth */}
    <path d="M76 96 L84 96 L80 101 Z" fill="#E0637A" />
    <motion.path
      d={talking ? 'M70 106 Q80 116 90 106' : 'M70 105 Q75 111 80 105 Q85 111 90 105'}
      fill={talking ? '#A8465A' : 'none'}
      stroke="#A8465A"
      strokeWidth="2.6"
      strokeLinecap="round"
      animate={reduce ? undefined : { d: talking ? ['M70 106 Q80 116 90 106', 'M70 106 Q80 108 90 106', 'M70 106 Q80 116 90 106'] : 'M70 105 Q75 111 80 105 Q85 111 90 105' }}
      transition={{ duration: 0.45, repeat: talking ? Infinity : 0 }}
    />
    {/* whiskers */}
    <path d="M30 96 L10 92 M30 104 L10 106 M130 96 L150 92 M130 104 L150 106" stroke="#A8465A" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    {/* little paw wave */}
    <motion.ellipse
      cx="132" cy="128" rx="11" ry="9" fill="#F7B76A"
      animate={reduce ? undefined : { rotate: [0, -18, 0, -18, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
      style={{ transformOrigin: '128px 132px' }}
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
    <div className="flex flex-col items-center gap-3">
      <Kitty reduce={reduce} talking={typing} />
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
            className="w-full text-left bg-white dark:bg-[#1E1D24] rounded-3xl rounded-tl-md px-5 py-4 shadow-soft text-stone-700 dark:text-stone-100 text-base leading-relaxed"
            aria-live="polite"
            aria-label="Kitty's message, tap for the next one"
          >
            {shown}
            <span className="inline-block w-[2px] h-[1em] align-[-0.15em] ml-0.5 bg-[#C95565]" style={{ opacity: typing && !reduce ? 1 : 0 }} />
          </motion.button>
        </AnimatePresence>
        <div className="flex justify-center gap-1.5 pt-3" aria-hidden="true">
          {LINES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-[#C95565]' : 'w-1.5 bg-[#C95565]/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KittyGuide;
