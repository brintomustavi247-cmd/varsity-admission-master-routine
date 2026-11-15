import React from 'react';
import type { MascotMood } from '../data/savageNotifications';

interface MascotCharacterProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const MascotCharacter: React.FC<MascotCharacterProps> = ({
  mood = 'sassy',
  size = 'md',
  className = '',
  animate = true,
}) => {
  const pixelSizes = {
    sm: 52,
    md: 82,
    lg: 120,
    xl: 160,
  };

  const dim = pixelSizes[size];

  // Neon theme colors based on savage mood
  const moodStyles = {
    sassy: {
      ring: 'border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.45)]',
      glow: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      tag: 'NEO CHILL',
    },
    psycho: {
      ring: 'border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.65)]',
      glow: 'from-red-600/30 via-rose-500/20 to-transparent',
      badge: 'bg-red-500/25 text-red-300 border-red-400/50',
      tag: 'PSYCHO PUSH',
    },
    jealous: {
      ring: 'border-sky-400/70 shadow-[0_0_20px_rgba(56,189,248,0.5)]',
      glow: 'from-sky-500/25 via-indigo-500/15 to-transparent',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      tag: 'SQUAD PRESSURE',
    },
    crying: {
      ring: 'border-blue-400/70 shadow-[0_0_20px_rgba(96,165,250,0.5)]',
      glow: 'from-blue-600/25 via-sky-500/15 to-transparent',
      badge: 'bg-blue-500/20 text-blue-200 border-blue-400/40',
      tag: 'GUILT CHECK',
    },
    roast: {
      ring: 'border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.45)]',
      glow: 'from-amber-500/25 via-orange-500/15 to-transparent',
      badge: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
      tag: 'ROAST MODE',
    },
    doodie: {
      ring: 'border-rose-500/85 shadow-[0_0_30px_rgba(244,63,94,0.7)]',
      glow: 'from-rose-600/35 via-red-600/20 to-transparent',
      badge: 'bg-rose-500/25 text-rose-200 border-rose-400/50',
      tag: 'DO OR DIE',
    },
  };

  const style = moodStyles[mood] || moodStyles.sassy;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: dim, height: dim }}
    >
      {/* Outer ambient holographic cyber glow */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr ${
          style.glow
        } blur-md ${animate ? 'animate-pulse' : ''}`}
      />

      {/* Futuristic Floating Holographic Cyber Diamonds (matching artwork) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1 -right-1 w-3 h-3 border border-cyan-400/80 rotate-45 animate-pulse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 -left-1 w-2.5 h-2.5 border border-sky-400/60 rotate-45"
      />

      {/* Cyber Mascot Frame */}
      <div
        className={`relative w-full h-full rounded-2xl sm:rounded-3xl border-2 ${
          style.ring
        } overflow-hidden bg-[#0A0D1A] transition-all duration-300 ${
          animate ? 'hover:scale-105' : ''
        }`}
      >
        <img
          src="/mascot/cyber-cat.png"
          alt="Aura Cyber Cat"
          className="w-full h-full object-cover object-center scale-[1.05]"
          loading="eager"
        />

        {/* High-tech glass glare sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-white/20"
        />

        {/* Dynamic Glowing Energy Orb indicator */}
        <div
          aria-hidden="true"
          className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF] border border-white/60 animate-ping opacity-75"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#00F0FF] border border-white"
        />
      </div>
    </div>
  );
};
