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
    fallback: '/mascot/cyber-cat.png',
    alt: 'Sassy Aura Cat',
  },
  psycho: {
    src: '/mascot/cyber-cat-psycho.png',
    fallback: '/mascot/cyber-cat.png',
    alt: 'Psycho Threat Cat',
  },
  jealous: {
    src: '/mascot/cyber-cat-jealous.png',
    fallback: '/mascot/cyber-cat.png',
    alt: 'Jealous Rivalry Cat',
  },
  crying: {
    src: '/mascot/cyber-cat-crying.png',
    fallback: '/mascot/cyber-cat.png',
    alt: 'Guilt Trip Crying Cat',
  },
  roast: {
    src: '/mascot/cyber-cat-roast.png',
    fallback: '/mascot/cyber-cat.png',
    alt: 'Playful Roasting Cat',
  },
  doodie: {
    src: '/mascot/cyber-cat-doodie.png',
    fallback: '/mascot/cyber-cat.png',
    alt: 'Do or Die Midnight Cat',
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
    jealous: {
      themeColor: '#38BDF8',
      auraBorder: 'border-sky-400/70 shadow-[0_0_24px_rgba(56,189,248,0.5)]',
      glow: 'from-sky-500 via-teal-500 to-emerald-500',
    },
    crying: {
      themeColor: '#60A5FA',
      auraBorder: 'border-blue-400/70 shadow-[0_0_24px_rgba(96,165,250,0.5)]',
      glow: 'from-blue-600 via-indigo-600 to-sky-400',
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
          animate && (mood === 'psycho' || mood === 'doodie') ? 'animate-pulse' : ''
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
