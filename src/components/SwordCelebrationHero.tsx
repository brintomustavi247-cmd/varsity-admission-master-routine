import { useId } from 'react';
import { motion } from 'motion/react';
import type { CelebrationPayload } from '../types/study';

interface SwordCelebrationHeroProps {
  kind: CelebrationPayload['kind'];
  reducedMotion?: boolean;
}

const SPARKS = [
  { angle: -155, dist: 58, len: 13, color: '#e0f2fe', delay: 0.31 },
  { angle: -125, dist: 68, len: 16, color: '#7dd3fc', delay: 0.32 },
  { angle: -95, dist: 62, len: 14, color: '#fde68a', delay: 0.31 },
  { angle: -65, dist: 72, len: 15, color: '#38bdf8', delay: 0.33 },
  { angle: -30, dist: 64, len: 12, color: '#e0f2fe', delay: 0.31 },
  { angle: 10, dist: 66, len: 14, color: '#7dd3fc', delay: 0.32 },
  { angle: 42, dist: 60, len: 13, color: '#fde68a', delay: 0.33 },
  { angle: 78, dist: 56, len: 12, color: '#38bdf8', delay: 0.31 },
  { angle: 112, dist: 62, len: 14, color: '#e0f2fe', delay: 0.32 },
  { angle: 148, dist: 68, len: 15, color: '#7dd3fc', delay: 0.31 },
  { angle: 175, dist: 58, len: 12, color: '#fde68a', delay: 0.33 },
  { angle: -175, dist: 54, len: 11, color: '#38bdf8', delay: 0.32 },
];

interface HeroSwordProps {
  uid: string;
  side: 'left' | 'right';
  reducedMotion: boolean;
}

function HeroSword({ uid, side, reducedMotion }: HeroSwordProps) {
  const isLeft = side === 'left';
  const targetRot = isLeft ? -39 : 39;
  const startRot = isLeft ? -82 : 82;
  const startX = isLeft ? -86 : 86;
  const clipId = `${uid}-blade-clip-${side}`;
  const sheenDelay = isLeft ? 0.9 : 1.15;

  return (
    <motion.g
      style={{ transformOrigin: '140px 92px' }}
      initial={
        reducedMotion
          ? { x: 0, y: 0, rotate: targetRot, scale: 1, opacity: 1 }
          : { x: startX, y: -56, rotate: startRot, scale: 0.72, opacity: 0 }
      }
      animate={
        reducedMotion
          ? { x: 0, y: 0, rotate: targetRot, scale: 1, opacity: 1 }
          : {
              x: [startX, isLeft ? 5 : -5, 0],
              y: [-56, 3, 0],
              rotate: [startRot, isLeft ? -34 : 34, targetRot],
              scale: [0.72, 1.06, 1],
              opacity: [0, 1, 1],
            }
      }
      transition={{
        duration: 0.46,
        delay: 0.06,
        times: [0, 0.68, 1],
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M 140 16 L 148 34 L 146.5 104 L 133.5 104 L 132 34 Z" />
        </clipPath>
      </defs>

      {/* Subtle ambient sword drop glow */}
      <path
        d="M 140 14 L 149.5 34 L 148 105 L 132 105 L 130.5 34 Z"
        fill="none"
        stroke="rgba(56, 189, 248, 0.35)"
        strokeWidth="3"
        filter={`url(#${uid}-glow)`}
      />

      {/* Left Blade Bevel (Bright Icy Platinum-Sky) */}
      <polygon
        points="140,16 132,34 133.5,104 140,104"
        fill={`url(#${uid}-blade-light)`}
      />

      {/* Right Blade Bevel (Deep Royal Sapphire Steel) */}
      <polygon
        points="140,16 148,34 146.5,104 140,104"
        fill={`url(#${uid}-blade-dark)`}
      />

      {/* Razor Edge Highlights */}
      <polyline
        points="133.5,104 132,34 140,16 148,34 146.5,104"
        fill="none"
        stroke="rgba(224, 242, 254, 0.85)"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />

      {/* Glowing Center Fuller / Arcane Spine */}
      <line
        x1="140"
        y1="26"
        x2="140"
        y2="100"
        stroke={`url(#${uid}-spine-glow)`}
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <line
        x1="140"
        y1="30"
        x2="140"
        y2="98"
        stroke="#f0f9ff"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Liquid Specular Light Glint Sweeping Up Blade */}
      {!reducedMotion && (
        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x="126"
            y="0"
            width="28"
            height="18"
            rx="4"
            fill={`url(#${uid}-glint)`}
            transform="skewY(-22)"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: [120, -25], opacity: [0, 0.95, 0] }}
            transition={{
              duration: 0.95,
              delay: sheenDelay,
              repeat: Infinity,
              repeatDelay: 2.8,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </g>
      )}

      {/* Ornate Winged Crossguard */}
      <path
        d="M 116 101 Q 127 109 140 109 Q 153 109 164 101 Q 160 112 140 115 Q 120 112 116 101 Z"
        fill={`url(#${uid}-gold)`}
        stroke="#fef3c7"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      {/* Guard inner collar */}
      <rect
        x="131"
        y="102.5"
        width="18"
        height="7"
        rx="2.5"
        fill={`url(#${uid}-gold-dark)`}
        stroke="#fde68a"
        strokeWidth="0.6"
      />
      {/* Center Sapphire Gem */}
      <polygon
        points="140,101.5 144.2,106 140,110.5 135.8,106"
        fill={`url(#${uid}-gem)`}
        stroke="#e0f2fe"
        strokeWidth="0.7"
      />
      <polygon
        points="140,102.8 142.3,105.5 140,106.5 137.7,105.5"
        fill="#ffffff"
        opacity="0.7"
      />

      {/* Wrapped Royal Indigo Grip */}
      <path
        d="M 136.4 114 L 143.6 114 L 142.8 138 L 137.2 138 Z"
        fill={`url(#${uid}-grip)`}
        stroke="#4f46e5"
        strokeWidth="0.5"
      />
      {/* Gold wire spiral grip bands */}
      <path
        d="M 136.5 119 L 143.4 121.5 M 136.7 125 L 143.2 127.5 M 136.9 131 L 143 133.5"
        stroke="#fcd34d"
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Faceted Pommel */}
      <path
        d="M 135 138 L 145 138 L 140 150 Z"
        fill={`url(#${uid}-gold)`}
        stroke="#fef3c7"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <circle
        cx="140"
        cy="141.5"
        r="2.2"
        fill={`url(#${uid}-gem)`}
        stroke="#e0f2fe"
        strokeWidth="0.5"
      />
    </motion.g>
  );
}

export function SwordCelebrationHero({
  kind,
  reducedMotion = false,
}: SwordCelebrationHeroProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');

  return (
    <div className="relative mx-auto mb-3 w-full max-w-[270px] h-40 sm:h-44 flex items-center justify-center select-none pointer-events-none">
      {/* Soft radial cyan halo behind swords */}
      <motion.div
        initial={reducedMotion ? { opacity: 0.7 } : { scale: 0.4, opacity: 0 }}
        animate={
          reducedMotion
            ? { opacity: 0.7 }
            : {
                scale: [0.4, 1.15, 1],
                opacity: [0, 0.85, 0.65],
              }
        }
        transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="absolute w-36 h-36 rounded-full bg-radial from-sky-300/45 via-blue-500/20 to-transparent blur-xl"
      />

      <svg
        viewBox="0 0 280 184"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id={`${uid}-blade-light`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id={`${uid}-blade-dark`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="55%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          <linearGradient id={`${uid}-spine-glow`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="55%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          <linearGradient id={`${uid}-glint`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <linearGradient id={`${uid}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="45%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id={`${uid}-gold-dark`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id={`${uid}-gem`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id={`${uid}-grip`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id={`${uid}-shield-fill`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#1e3a8a" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.98" />
          </linearGradient>

          <linearGradient id={`${uid}-shield-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        {/* Outer Rotating Arcane Orbit Ring */}
        <motion.g
          style={{ transformOrigin: '140px 92px' }}
          initial={reducedMotion ? { opacity: 0.55 } : { scale: 0.65, opacity: 0 }}
          animate={
            reducedMotion
              ? { opacity: 0.55 }
              : { scale: 1, opacity: 0.65, rotate: 360 }
          }
          transition={{
            scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.45 },
            rotate: { duration: 24, repeat: Infinity, ease: 'linear' },
          }}
        >
          <circle
            cx="140"
            cy="92"
            r="68"
            fill="none"
            stroke="rgba(125, 211, 252, 0.35)"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
          <circle cx="140" cy="24" r="2.8" fill="#bae6fd" />
          <circle cx="208" cy="92" r="2.2" fill="#7dd3fc" />
          <circle cx="72" cy="92" r="2.2" fill="#fde68a" />
        </motion.g>

        {/* Counter-Rotating Inner Geometric Ring */}
        <motion.g
          style={{ transformOrigin: '140px 92px' }}
          initial={reducedMotion ? { opacity: 0.4 } : { scale: 0.55, opacity: 0 }}
          animate={
            reducedMotion
              ? { opacity: 0.4 }
              : { scale: 1, opacity: 0.45, rotate: -360 }
          }
          transition={{
            scale: { duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.5, delay: 0.1 },
            rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
          }}
        >
          <circle
            cx="140"
            cy="92"
            r="53"
            fill="none"
            stroke="rgba(186, 230, 253, 0.28)"
            strokeWidth="1"
            strokeDasharray="2 5"
          />
        </motion.g>

        {/* Slash Trail Arcs (Sweep before clash) */}
        {!reducedMotion && (
          <>
            <motion.path
              d="M 48 34 Q 108 18 168 96"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter={`url(#${uid}-glow)`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 0.95, 0] }}
              transition={{ duration: 0.48, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M 232 34 Q 172 18 112 96"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter={`url(#${uid}-glow)`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 0.95, 0] }}
              transition={{ duration: 0.48, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          </>
        )}

        {/* Levitating & Impact-Shaking Swords + Crest Assembly */}
        <motion.g
          animate={
            reducedMotion
              ? {}
              : {
                  x: [0, 0, -2.5, 2.5, -1, 0],
                  y: [0, 0, 2, -2, -4, 0],
                }
          }
          transition={{
            x: { duration: 0.28, delay: 0.32, ease: 'easeOut' },
            y: {
              duration: 3.4,
              delay: 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          {/* Central Royal Knight Shield Crest (pops right behind sword clash) */}
          <motion.g
            style={{ transformOrigin: '140px 92px' }}
            initial={
              reducedMotion
                ? { scale: 1, opacity: 1 }
                : { scale: 0.4, opacity: 0 }
            }
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.48,
              delay: 0.26,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <path
              d="M 140 50 L 170 63 L 166 105 C 164 121 153 132 140 138 C 127 132 116 121 114 105 L 110 63 Z"
              fill={`url(#${uid}-shield-fill)`}
              stroke={`url(#${uid}-shield-rim)`}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M 140 57 L 163 67 L 160 103 C 158 116 149 125 140 130 C 131 125 122 116 120 103 L 117 67 Z"
              fill="none"
              stroke="rgba(186, 230, 253, 0.35)"
              strokeWidth="1"
            />
            {/* Emblem center motif (Diamond star for Day, Crowned Prism for Chapter) */}
            <polygon
              points={
                kind === 'chapter'
                  ? '140,74 148,88 140,104 132,88'
                  : '140,76 147,90 140,104 133,90'
              }
              fill={`url(#${uid}-gem)`}
              stroke="#e0f2fe"
              strokeWidth="0.9"
            />
          </motion.g>

          {/* Left & Right Heroic Swords */}
          <HeroSword uid={uid} side="left" reducedMotion={reducedMotion} />
          <HeroSword uid={uid} side="right" reducedMotion={reducedMotion} />
        </motion.g>

        {/* Clash Impact Shockwaves, Star Flare & Sparks */}
        {!reducedMotion && (
          <g>
            {/* Primary Shockwave Ring */}
            <motion.circle
              cx="140"
              cy="92"
              r="34"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="3"
              style={{ transformOrigin: '140px 92px' }}
              initial={{ scale: 0.15, opacity: 0 }}
              animate={{ scale: [0.15, 1.9], opacity: [0, 0.95, 0] }}
              transition={{ duration: 0.56, delay: 0.31, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Secondary Cyan Shockwave Ring */}
            <motion.circle
              cx="140"
              cy="92"
              r="26"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              style={{ transformOrigin: '140px 92px' }}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [0.1, 1.55], opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.48, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* 4-Point Celestial Impact Star Flash */}
            <motion.path
              d="M 140 60 L 145 87 L 172 92 L 145 97 L 140 124 L 135 97 L 108 92 L 135 87 Z"
              fill="#ffffff"
              filter={`url(#${uid}-glow)`}
              style={{ transformOrigin: '140px 92px' }}
              initial={{ scale: 0, opacity: 0, rotate: -15 }}
              animate={{
                scale: [0, 1.25, 0],
                opacity: [0, 1, 0],
                rotate: [-15, 18, 35],
              }}
              transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* 12 Directional Razor Impact Sparks */}
            {SPARKS.map((sp, i) => {
              const rad = (sp.angle * Math.PI) / 180;
              const tx = Math.cos(rad) * sp.dist;
              const ty = Math.sin(rad) * sp.dist;
              return (
                <motion.line
                  key={i}
                  x1="140"
                  y1="92"
                  x2={140 + Math.cos(rad) * sp.len}
                  y2={92 + Math.sin(rad) * sp.len}
                  stroke={sp.color}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
                  animate={{
                    x: [0, tx],
                    y: [0, ty],
                    scale: [0.4, 1.15, 0.3],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 0.55,
                    delay: sp.delay,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}
