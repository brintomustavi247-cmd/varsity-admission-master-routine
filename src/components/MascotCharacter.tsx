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
    sm: 64,
    md: 96,
    lg: 140,
    xl: 180,
  };

  const dim = pixelSizes[size];

  // Mood configuration: theme colors, visor glow, and LED expression
  const moodConfig = {
    sassy: {
      themeColor: '#00F0FF',
      themeGlow: 'rgba(0, 240, 255, 0.6)',
      tagLabel: 'EGO ROAST',
      tagBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      auraBorder: 'border-cyan-400/60 shadow-[0_0_24px_rgba(0,240,255,0.45)]',
    },
    psycho: {
      themeColor: '#FF1744',
      themeGlow: 'rgba(255, 23, 68, 0.85)',
      tagLabel: 'PSYCHO DUO',
      tagBadge: 'bg-red-500/25 text-red-300 border-red-500/50',
      auraBorder: 'border-red-500/80 shadow-[0_0_30px_rgba(255,23,68,0.7)]',
    },
    jealous: {
      themeColor: '#38BDF8',
      themeGlow: 'rgba(56, 189, 248, 0.65)',
      tagLabel: 'PEER PRESSURE',
      tagBadge: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      auraBorder: 'border-sky-400/70 shadow-[0_0_24px_rgba(56,189,248,0.5)]',
    },
    crying: {
      themeColor: '#60A5FA',
      themeGlow: 'rgba(96, 165, 250, 0.7)',
      tagLabel: 'GUILT TRIP',
      tagBadge: 'bg-blue-500/20 text-blue-200 border-blue-400/40',
      auraBorder: 'border-blue-400/70 shadow-[0_0_24px_rgba(96,165,250,0.5)]',
    },
    roast: {
      themeColor: '#FBBF24',
      themeGlow: 'rgba(251, 191, 36, 0.65)',
      tagLabel: 'SAVAGE ROAST',
      tagBadge: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
      auraBorder: 'border-amber-400/70 shadow-[0_0_24px_rgba(251,191,36,0.5)]',
    },
    doodie: {
      themeColor: '#E11D48',
      themeGlow: 'rgba(225, 29, 72, 0.85)',
      tagLabel: 'DO OR DIE',
      tagBadge: 'bg-rose-500/30 text-rose-200 border-rose-500/60',
      auraBorder: 'border-rose-500/90 shadow-[0_0_32px_rgba(225,29,72,0.8)]',
    },
  };

  const cfg = moodConfig[mood] || moodConfig.sassy;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: dim, height: dim }}
    >
      {/* Outer Cyber Aura Radiation */}
      <div
        aria-hidden="true"
        className={`absolute -inset-1 rounded-3xl opacity-60 blur-md transition-all duration-500 ${
          mood === 'psycho' || mood === 'doodie'
            ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 animate-pulse'
            : 'bg-gradient-to-tr from-cyan-500 via-sky-600 to-blue-500'
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

      {/* Main Character Container */}
      <div
        className={`relative w-full h-full rounded-2xl sm:rounded-3xl border-2 ${cfg.auraBorder} overflow-hidden bg-[#070A14] transition-all duration-300`}
      >
        {/* Base Cyber-Cat Artwork */}
        <img
          src="/mascot/cyber-cat.png"
          alt="Aura Cyber Cat"
          className="w-full h-full object-cover object-center scale-[1.03]"
          loading="eager"
        />

        {/* Dynamic Interactive LED Visor Expression Layer (Positioned over the face visor) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            mixBlendMode: 'screen',
          }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="ledGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. SASSY (Smug, judging, unamused half-lidded digital slits + cat smirk) */}
            {mood === 'sassy' && (
              <g filter="url(#ledGlow)">
                {/* Left eye: arched judging slit */}
                <path
                  d="M 94 92 Q 106 82 116 88"
                  stroke="#00F0FF"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="106" cy="94" r="3.5" fill="#FFFFFF" />

                {/* Right eye: slightly tilted slit */}
                <path
                  d="M 132 94 Q 142 86 150 96"
                  stroke="#00F0FF"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="140" cy="99" r="3.5" fill="#FFFFFF" />

                {/* Smug cat mouth :3 */}
                <path
                  d="M 118 124 Q 123 129 127 125 Q 131 129 136 124"
                  stroke="#00F0FF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {/* 2. PSYCHO (Unhinged Duolingo red target reticles, glaring eyes, warning glitch) */}
            {mood === 'psycho' && (
              <g filter="url(#ledGlow)">
                {/* Ominous red scanlines across the visor */}
                <line x1="85" y1="80" x2="160" y2="80" stroke="#FF1744" strokeWidth="1" opacity="0.6" />
                <line x1="85" y1="105" x2="160" y2="105" stroke="#FF1744" strokeWidth="1" opacity="0.6" />
                <line x1="85" y1="130" x2="160" y2="130" stroke="#FF1744" strokeWidth="1" opacity="0.6" />

                {/* Left Eye: Blazing Red Target Reticle */}
                <circle cx="106" cy="94" r="11" fill="none" stroke="#FF1744" strokeWidth="2.5" />
                <circle cx="106" cy="94" r="5" fill="#FF1744" />
                <circle cx="106" cy="94" r="2" fill="#FFFFFF" />
                <line x1="93" y1="94" x2="119" y2="94" stroke="#FF1744" strokeWidth="1.5" />
                <line x1="106" y1="81" x2="106" y2="107" stroke="#FF1744" strokeWidth="1.5" />

                {/* Right Eye: Blazing Red Target Reticle */}
                <circle cx="142" cy="100" r="11" fill="none" stroke="#FF1744" strokeWidth="2.5" />
                <circle cx="142" cy="100" r="5" fill="#FF1744" />
                <circle cx="142" cy="100" r="2" fill="#FFFFFF" />
                <line x1="129" y1="100" x2="155" y2="100" stroke="#FF1744" strokeWidth="1.5" />
                <line x1="142" y1="87" x2="142" y2="113" stroke="#FF1744" strokeWidth="1.5" />

                {/* Sinister jagged digital grin */}
                <path
                  d="M 115 126 L 120 131 L 125 126 L 130 131 L 135 126"
                  stroke="#FF1744"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>
            )}

            {/* 3. JEALOUS (Suspicious side-eye glare, exclamation marks, looking at leaderboard) */}
            {mood === 'jealous' && (
              <g filter="url(#ledGlow)">
                {/* Left Eye: Suspicious narrowed slit */}
                <polygon points="98,88 114,92 112,98 96,94" fill="#38BDF8" />
                <circle cx="100" cy="92" r="2" fill="#FFFFFF" />

                {/* Right Eye: Suspicious narrowed slit */}
                <polygon points="132,94 148,98 146,104 130,100" fill="#38BDF8" />
                <circle cx="134" cy="98" r="2" fill="#FFFFFF" />

                {/* Exclamation marks above brow */}
                <text x="146" y="84" fill="#38BDF8" fontSize="14" fontWeight="900" fontFamily="monospace">!</text>

                {/* Tight straight mouth bar */}
                <line x1="116" y1="124" x2="134" y2="124" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {/* 4. CRYING (Midnight guilt trip: cascading digital cyan tear streams T_T) */}
            {mood === 'crying' && (
              <g filter="url(#ledGlow)">
                {/* Closed quivering eyes */}
                <path d="M 98 94 Q 106 88 114 94" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 132 98 Q 140 92 148 98" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" fill="none" />

                {/* Cascading LED tears streaming down visor */}
                <path
                  d="M 106 98 L 104 134 M 102 108 L 102 126"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.9"
                  className={animate ? 'animate-pulse' : ''}
                />
                <path
                  d="M 140 102 L 138 138 M 136 112 L 136 130"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.9"
                  className={animate ? 'animate-pulse' : ''}
                />

                {/* Trembling open sad mouth */}
                <path
                  d="M 118 126 Q 126 120 134 126"
                  stroke="#60A5FA"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            )}

            {/* 5. ROAST (Sassy winking digital eye ^_~ + tea roast) */}
            {mood === 'roast' && (
              <g filter="url(#ledGlow)">
                {/* Left Eye: Happy anime arch ^ */}
                <path d="M 96 95 Q 106 85 116 95" stroke="#FBBF24" strokeWidth="4.5" strokeLinecap="round" fill="none" />

                {/* Right Eye: Sassy wink ~ */}
                <path d="M 130 96 Q 138 92 142 98 Q 146 104 152 98" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" fill="none" />

                {/* Cheerful grinning cat mouth */}
                <path
                  d="M 117 122 Q 124 130 133 122"
                  stroke="#FBBF24"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Mini tea steam icon */}
                <circle cx="148" cy="80" r="2.5" fill="#FBBF24" opacity="0.8" />
              </g>
            )}

            {/* 6. DOODIE (Do-or-Die / Last Warning: Skull reticle, blazing red/amber danger LED) */}
            {mood === 'doodie' && (
              <g filter="url(#ledGlow)">
                {/* Left Eye: Sharp X / skull cross */}
                <line x1="98" y1="86" x2="114" y2="102" stroke="#FF1744" strokeWidth="4" strokeLinecap="round" />
                <line x1="114" y1="86" x2="98" y2="102" stroke="#FF1744" strokeWidth="4" strokeLinecap="round" />

                {/* Right Eye: Sharp X / skull cross */}
                <line x1="132" y1="92" x2="148" y2="108" stroke="#FF1744" strokeWidth="4" strokeLinecap="round" />
                <line x1="148" y1="92" x2="132" y2="108" stroke="#FF1744" strokeWidth="4" strokeLinecap="round" />

                {/* Intense battle teeth */}
                <line x1="115" y1="125" x2="135" y2="125" stroke="#FF1744" strokeWidth="4" strokeLinecap="round" />
                <line x1="120" y1="122" x2="120" y2="128" stroke="#FF1744" strokeWidth="2" />
                <line x1="125" y1="122" x2="125" y2="128" stroke="#FF1744" strokeWidth="2" />
                <line x1="130" y1="122" x2="130" y2="128" stroke="#FF1744" strokeWidth="2" />
              </g>
            )}
          </svg>
        </div>

        {/* Dynamic Holographic Mood Status Tag at bottom of avatar */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
          <span
            className={`px-1.5 py-0.5 rounded-md text-[8px] font-black font-aura tracking-widest uppercase border ${cfg.tagBadge} backdrop-blur-md shadow-xs`}
          >
            {cfg.tagLabel}
          </span>
          <div
            className="w-2.5 h-2.5 rounded-full border border-white/80 animate-ping"
            style={{ backgroundColor: cfg.themeColor }}
          />
        </div>
      </div>
    </div>
  );
};
