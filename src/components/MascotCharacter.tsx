import React from 'react';
import type { MascotMood } from '../data/savageNotifications';

interface MascotCharacterProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

const MOOD_IMAGE_MAP: Record<MascotMood, { src: string; fallback: string; alt: string }> = {
  sassy: {
    src: '/mascot/cyber-cat-sassy.png',
    fallback: '/mascot/cyber-cat-sassy.png',
    alt: 'Sassy Shushing Cat',
  },
  psycho: {
    src: '/mascot/cyber-cat-psycho.png',
    fallback: '/mascot/cyber-cat-psycho.png',
    alt: 'Furious Psycho Cat',
  },
  crying: {
    src: '/mascot/cyber-cat-crying.png',
    fallback: '/mascot/cyber-cat-crying.png',
    alt: 'Teary Crying Cat',
  },
  smug: {
    src: '/mascot/cyber-cat-smug.png',
    fallback: '/mascot/cyber-cat-smug.png',
    alt: 'Confident Thumbs-Up Cat',
  },
  panic: {
    src: '/mascot/cyber-cat-panic.png',
    fallback: '/mascot/cyber-cat-panic.png',
    alt: 'Trembling Panic Cat',
  },
  exhausted: {
    src: '/mascot/cyber-cat-exhausted.png',
    fallback: '/mascot/cyber-cat-exhausted.png',
    alt: 'Facepalm Exhausted Cat',
  },
  sleepy: {
    src: '/mascot/cyber-cat-sleepy.png',
    fallback: '/mascot/cyber-cat-sleepy.png',
    alt: 'Yawning Sleepy Cat',
  },
  happy: {
    src: '/mascot/cyber-cat-happy.png',
    fallback: '/mascot/cyber-cat-happy.png',
    alt: 'Smiling Cheerful Cat',
  },
  pleading: {
    src: '/mascot/cyber-cat-crying.png',
    fallback: '/mascot/cyber-cat-crying.png',
    alt: 'Pleading Emotional Kira',
  },
  heart: {
    src: '/mascot/cyber-cat-smug.png',
    fallback: '/mascot/cyber-cat-smug.png',
    alt: 'Glowing Heart Loving Kira',
  },
  demon: {
    src: '/mascot/cyber-cat-psycho.png',
    fallback: '/mascot/cyber-cat-psycho.png',
    alt: 'Sinister Grinning Demon Kira',
  },
  error: {
    src: '/mascot/cyber-cat-panic.png',
    fallback: '/mascot/cyber-cat-panic.png',
    alt: 'ERROR Screen Defeated Kira',
  },
  shocked: {
    src: '/mascot/cyber-cat-panic.png',
    fallback: '/mascot/cyber-cat-panic.png',
    alt: 'Floating Shocked Exclamation Kira',
  },
  fire: {
    src: '/mascot/cyber-cat-panic.png',
    fallback: '/mascot/cyber-cat-panic.png',
    alt: 'Burning Routine Fire Kira',
  },
  stargaze: {
    src: '/mascot/cyber-cat-smug.png',
    fallback: '/mascot/cyber-cat-smug.png',
    alt: 'Stargazing Reaching Kira',
  },
  crush: {
    src: '/mascot/cyber-cat-smug.png',
    fallback: '/mascot/cyber-cat-smug.png',
    alt: 'Cute Confident Kira',
  },
  bride: {
    src: '/mascot/cyber-cat-smug.png',
    fallback: '/mascot/cyber-cat-smug.png',
    alt: 'Dream Goal Kira',
  },
  anya: {
    src: '/mascot/cyber-cat-happy.png',
    fallback: '/mascot/cyber-cat-happy.png',
    alt: 'Smiling Kira',
  },
  studying: {
    src: '/mascot/cyber-cat-sleepy.png',
    fallback: '/mascot/cyber-cat-sleepy.png',
    alt: 'Late Night Laptop Studying Kira',
  },
  // Legacy fallbacks:
  jealous: {
    src: '/mascot/cyber-cat-smug.png',
    fallback: '/mascot/cyber-cat-smug.png',
    alt: 'Jealous Cat',
  },
  roast: {
    src: '/mascot/cyber-cat-exhausted.png',
    fallback: '/mascot/cyber-cat-exhausted.png',
    alt: 'Roasting Cat',
  },
  doodie: {
    src: '/mascot/cyber-cat-panic.png',
    fallback: '/mascot/cyber-cat-panic.png',
    alt: 'Midnight Panic Cat',
  },
};

export const MascotCharacter: React.FC<MascotCharacterProps> = ({
  mood = 'sassy',
  size = 'md',
  className = '',
  animate = true,
}) => {
  const pixelSizes = {
    sm: 64,
    md: 96,
    lg: 140,
    xl: 180,
  };

  const dim = pixelSizes[size];

  // Mood configuration: theme colors, ambient glows, and aura styling
  const moodConfig = {
    sassy: {
      themeColor: '#00F0FF',
      auraBorder: 'border-cyan-400/60 shadow-[0_0_24px_rgba(0,240,255,0.45)]',
      glow: 'from-cyan-500 via-sky-600 to-blue-500',
    },
    psycho: {
      themeColor: '#FF1744',
      auraBorder: 'border-red-500/80 shadow-[0_0_30px_rgba(255,23,68,0.7)]',
      glow: 'from-red-600 via-rose-500 to-amber-500',
    },
    crying: {
      themeColor: '#60A5FA',
      auraBorder: 'border-blue-400/70 shadow-[0_0_24px_rgba(96,165,250,0.5)]',
      glow: 'from-blue-600 via-indigo-600 to-sky-400',
    },
    smug: {
      themeColor: '#38BDF8',
      auraBorder: 'border-sky-400/70 shadow-[0_0_24px_rgba(56,189,248,0.55)]',
      glow: 'from-sky-500 via-blue-500 to-cyan-400',
    },
    panic: {
      themeColor: '#E11D48',
      auraBorder: 'border-rose-500/90 shadow-[0_0_32px_rgba(225,29,72,0.8)]',
      glow: 'from-rose-600 via-red-600 to-amber-600',
    },
    exhausted: {
      themeColor: '#FBBF24',
      auraBorder: 'border-amber-400/70 shadow-[0_0_24px_rgba(251,191,36,0.5)]',
      glow: 'from-amber-500 via-orange-500 to-rose-500',
    },
    sleepy: {
      themeColor: '#818CF8',
      auraBorder: 'border-indigo-400/70 shadow-[0_0_24px_rgba(129,140,248,0.5)]',
      glow: 'from-indigo-600 via-violet-600 to-purple-500',
    },
    happy: {
      themeColor: '#22D3EE',
      auraBorder: 'border-cyan-300/80 shadow-[0_0_28px_rgba(34,211,238,0.6)]',
      glow: 'from-cyan-400 via-teal-400 to-sky-400',
    },
    pleading: {
      themeColor: '#38BDF8',
      auraBorder: 'border-sky-400/80 shadow-[0_0_28px_rgba(56,189,248,0.6)]',
      glow: 'from-sky-500 via-blue-500 to-indigo-500',
    },
    heart: {
      themeColor: '#F43F5E',
      auraBorder: 'border-rose-400/90 shadow-[0_0_32px_rgba(244,63,94,0.7)]',
      glow: 'from-rose-500 via-pink-500 to-purple-500',
    },
    demon: {
      themeColor: '#A855F7',
      auraBorder: 'border-purple-500/90 shadow-[0_0_32px_rgba(168,85,247,0.75)]',
      glow: 'from-purple-600 via-fuchsia-600 to-indigo-600',
    },
    error: {
      themeColor: '#EF4444',
      auraBorder: 'border-red-500/90 shadow-[0_0_30px_rgba(239,68,68,0.8)]',
      glow: 'from-red-600 via-rose-600 to-slate-800',
    },
    shocked: {
      themeColor: '#00F0FF',
      auraBorder: 'border-cyan-400/90 shadow-[0_0_30px_rgba(0,240,255,0.7)]',
      glow: 'from-cyan-400 via-sky-500 to-blue-600',
    },
    fire: {
      themeColor: '#F97316',
      auraBorder: 'border-amber-500/90 shadow-[0_0_32px_rgba(249,115,22,0.8)]',
      glow: 'from-orange-500 via-red-500 to-amber-500',
    },
    stargaze: {
      themeColor: '#818CF8',
      auraBorder: 'border-indigo-400/80 shadow-[0_0_28px_rgba(129,140,248,0.6)]',
      glow: 'from-indigo-600 via-purple-600 to-sky-400',
    },
    crush: {
      themeColor: '#38BDF8',
      auraBorder: 'border-sky-400/80 shadow-[0_0_28px_rgba(56,189,248,0.6)]',
      glow: 'from-sky-400 via-teal-400 to-blue-500',
    },
    bride: {
      themeColor: '#F472B6',
      auraBorder: 'border-pink-400/80 shadow-[0_0_30px_rgba(244,114,182,0.65)]',
      glow: 'from-pink-500 via-rose-400 to-purple-400',
    },
    anya: {
      themeColor: '#FB7185',
      auraBorder: 'border-rose-300/80 shadow-[0_0_28px_rgba(251,113,133,0.6)]',
      glow: 'from-rose-400 via-pink-400 to-amber-300',
    },
    studying: {
      themeColor: '#F59E0B',
      auraBorder: 'border-amber-400/80 shadow-[0_0_26px_rgba(245,158,11,0.55)]',
      glow: 'from-amber-500 via-yellow-500 to-orange-400',
    },
    // Legacy fallbacks
    jealous: {
      themeColor: '#38BDF8',
      auraBorder: 'border-sky-400/70 shadow-[0_0_24px_rgba(56,189,248,0.5)]',
      glow: 'from-sky-500 via-teal-500 to-emerald-500',
    },
    roast: {
      themeColor: '#FBBF24',
      auraBorder: 'border-amber-400/70 shadow-[0_0_24px_rgba(251,191,36,0.5)]',
      glow: 'from-amber-500 via-orange-500 to-rose-500',
    },
    doodie: {
      themeColor: '#E11D48',
      auraBorder: 'border-rose-500/90 shadow-[0_0_32px_rgba(225,29,72,0.8)]',
      glow: 'from-red-600 via-rose-600 to-amber-600',
    },
  };

  const cfg = moodConfig[mood] || moodConfig.sassy;
  const moodImg = MOOD_IMAGE_MAP[mood] || MOOD_IMAGE_MAP.sassy;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: dim, height: dim }}
    >
      {/* Outer Cyber Aura Radiation */}
      <div
        aria-hidden="true"
        className={`absolute -inset-1 rounded-3xl opacity-60 blur-md transition-all duration-500 ${cfg.glow} ${
          animate && (mood === 'psycho' || mood === 'panic' || mood === 'doodie')
            ? 'animate-pulse'
            : ''
        }`}
      />

      {/* Floating Holographic Cyber Diamonds */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1.5 -right-1.5 w-3 h-3 border border-cyan-400 rotate-45 animate-pulse"
        style={{ borderColor: cfg.themeColor }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1 -left-1 w-2.5 h-2.5 border border-sky-300/80 rotate-45"
      />

      {/* Main Character Container - Framed, Clean, NEVER with blocking text across face */}
      <div
        className={`relative w-full h-full rounded-2xl sm:rounded-3xl border-2 ${cfg.auraBorder} overflow-hidden bg-[#070A14] transition-all duration-300 group`}
      >
        {/* Dynamic Emotional Mascot Artwork */}
        <img
          key={mood}
          src={moodImg.src}
          alt={moodImg.alt}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== moodImg.fallback) {
              target.src = moodImg.fallback;
            }
          }}
          className="w-full h-full object-cover object-center scale-[1.02] transition-transform duration-300 group-hover:scale-105"
          loading="eager"
        />

        {/* Ambient Subtle Tech Scanline Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent opacity-40 mix-blend-screen"
        />

        {/* Top-Right Active Status Indicator Dot */}
        <div className="absolute top-1.5 right-1.5 pointer-events-none flex items-center justify-center">
          <span
            className="w-2 h-2 rounded-full shadow-xs"
            style={{ backgroundColor: cfg.themeColor }}
          />
          {animate && (
            <span
              className="absolute w-3 h-3 rounded-full opacity-75 animate-ping"
              style={{ backgroundColor: cfg.themeColor }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
