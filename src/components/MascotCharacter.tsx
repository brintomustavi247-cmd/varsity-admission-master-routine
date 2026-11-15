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
    md: 80,
    lg: 120,
    xl: 160,
  };

  const dim = pixelSizes[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: dim, height: dim }}
    >
      <svg
        viewBox="0 0 160 160"
        width={dim}
        height={dim}
        className={`w-full h-full drop-shadow-md ${
          animate ? 'transition-transform duration-300 hover:scale-105' : ''
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fur Gradient - Warm Kawaii Calico/Ginger Cream */}
          <linearGradient id="catBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFDEB5" />
            <stop offset="50%" stop-color="#FDBA74" />
            <stop offset="100%" stop-color="#FB923C" />
          </linearGradient>

          {/* Calico Ear Patch */}
          <linearGradient id="patchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#EA580C" />
            <stop offset="100%" stop-color="#C2410C" />
          </linearGradient>

          {/* Crimson Aura Flames for 'doodie' and 'psycho' */}
          <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FF1744" stop-opacity="0.6" />
            <stop offset="60%" stop-color="#DC143C" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#FF1744" stop-opacity="0" />
          </radialGradient>

          {/* Headband Gradient */}
          <linearGradient id="headbandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#E11D48" />
            <stop offset="50%" stop-color="#FF1744" />
            <stop offset="100%" stop-color="#BE123C" />
          </linearGradient>

          {/* Cap Gradient */}
          <linearGradient id="miniCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1E293B" />
            <stop offset="100%" stop-color="#0F172A" />
          </linearGradient>
        </defs>

        {/* Aura Flame Effect for Do-or-Die / Psycho mood */}
        {(mood === 'doodie' || mood === 'psycho') && (
          <circle
            cx="80"
            cy="80"
            r="74"
            fill="url(#auraGlow)"
            className={animate ? 'animate-pulse' : ''}
          />
        )}

        {/* Back Ears */}
        {/* Left Ear */}
        <polygon
          points="32,62 18,18 64,38"
          fill="url(#patchGrad)"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <polygon
          points="34,56 26,26 56,40"
          fill="#FDA4AF"
          opacity="0.85"
        />

        {/* Right Ear */}
        <polygon
          points="128,62 142,18 96,38"
          fill="url(#catBodyGrad)"
          stroke="#F97316"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <polygon
          points="126,56 134,26 104,40"
          fill="#FDA4AF"
          opacity="0.85"
        />

        {/* Main Cute Round Cat Head */}
        <ellipse
          cx="80"
          cy="90"
          rx="58"
          ry="50"
          fill="url(#catBodyGrad)"
          stroke="#EA580C"
          strokeWidth="3.5"
        />

        {/* Cheek Fluffs */}
        <path
          d="M 23 96 Q 14 99 20 106 Q 13 109 25 116"
          fill="none"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 137 96 Q 146 99 140 106 Q 147 109 135 116"
          fill="none"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Blush Cheeks */}
        <ellipse cx="42" cy="104" rx="8" ry="4.5" fill="#FB7185" opacity="0.65" />
        <ellipse cx="118" cy="104" rx="8" ry="4.5" fill="#FB7185" opacity="0.65" />

        {/* Tiny Nose */}
        <polygon points="76,96 84,96 80,102" fill="#BE123C" />

        {/* Whiskers */}
        <line x1="28" y1="94" x2="10" y2="90" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
        <line x1="28" y1="102" x2="8" y2="104" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
        <line x1="132" y1="94" x2="150" y2="90" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
        <line x1="132" y1="102" x2="152" y2="104" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />

        {/* Mouth variants based on mood */}
        {mood === 'sassy' && (
          // Smug `:3` smirk
          <path
            d="M 72 104 Q 76 109 80 104 Q 84 109 88 104"
            fill="none"
            stroke="#7C2D12"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
        {mood === 'psycho' && (
          // Unhinged open grin
          <path
            d="M 71 103 Q 80 116 89 103 Z"
            fill="#881337"
            stroke="#7C2D12"
            strokeWidth="2"
          />
        )}
        {mood === 'crying' && (
          // Wobbly trembling open crying mouth
          <path
            d="M 72 105 Q 80 118 88 105 Q 80 102 72 105 Z"
            fill="#BE123C"
            stroke="#7C2D12"
            strokeWidth="2"
          />
        )}
        {mood === 'jealous' && (
          // Gritting teeth / determined mouth
          <path
            d="M 73 106 L 87 106"
            stroke="#7C2D12"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
        {mood === 'roast' && (
          // Deadpan straight flat line
          <line x1="74" y1="106" x2="86" y2="106" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {mood === 'doodie' && (
          // Fierce battle grimace
          <path
            d="M 72 108 Q 80 103 88 108"
            fill="none"
            stroke="#7C2D12"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* EYES VARIANTS BASED ON MOOD */}
        {mood === 'sassy' && (
          // Half-closed judging unamused eyes
          <g>
            <path
              d="M 44 86 Q 56 78 66 84"
              fill="none"
              stroke="#431407"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <ellipse cx="55" cy="88" rx="5" ry="3.5" fill="#1C1917" />
            <path
              d="M 94 84 Q 104 78 116 86"
              fill="none"
              stroke="#431407"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <ellipse cx="105" cy="88" rx="5" ry="3.5" fill="#1C1917" />
          </g>
        )}

        {mood === 'psycho' && (
          // Huge unblinking staring eyes with tiny pinpoint pupils (Duolingo psycho mode)
          <g>
            <circle cx="54" cy="84" r="14" fill="#FFFFFF" stroke="#431407" strokeWidth="3" />
            <circle cx="54" cy="84" r="4.5" fill="#FF1744" />
            <circle cx="54" cy="84" r="2" fill="#000000" />
            <circle cx="106" cy="84" r="14" fill="#FFFFFF" stroke="#431407" strokeWidth="3" />
            <circle cx="106" cy="84" r="4.5" fill="#FF1744" />
            <circle cx="106" cy="84" r="2" fill="#000000" />
            {/* Ominous shadow under eyes */}
            <path d="M 42 98 Q 54 102 66 98" stroke="#FF1744" strokeWidth="1.5" opacity="0.6" />
            <path d="M 94 98 Q 106 102 118 98" stroke="#FF1744" strokeWidth="1.5" opacity="0.6" />
          </g>
        )}

        {mood === 'crying' && (
          // Dramatic anime tear streams
          <g>
            <path d="M 46 86 Q 55 93 64 86" stroke="#431407" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 96 86 Q 105 93 114 86" stroke="#431407" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Massive tears streaming down */}
            <path
              d="M 53 90 C 50 105 45 125 43 140 C 49 140 55 125 57 105 Z"
              fill="#38BDF8"
              opacity="0.85"
            />
            <path
              d="M 107 90 C 105 105 111 125 113 140 C 119 140 115 125 111 105 Z"
              fill="#38BDF8"
              opacity="0.85"
            />
            <circle cx="50" cy="138" r="4" fill="#60A5FA" />
            <circle cx="110" cy="138" r="4" fill="#60A5FA" />
          </g>
        )}

        {mood === 'jealous' && (
          // Side-eye squinting / suspicious
          <g>
            <ellipse cx="54" cy="85" rx="10" ry="11" fill="#FFFFFF" stroke="#431407" strokeWidth="2.5" />
            <ellipse cx="49" cy="85" rx="6" ry="7" fill="#1E293B" />
            <circle cx="47" cy="82" r="2" fill="#FFFFFF" />
            <ellipse cx="106" cy="85" rx="10" ry="11" fill="#FFFFFF" stroke="#431407" strokeWidth="2.5" />
            <ellipse cx="101" cy="85" rx="6" ry="7" fill="#1E293B" />
            <circle cx="99" cy="82" r="2" fill="#FFFFFF" />
            {/* Angry angled eyebrows */}
            <line x1="42" y1="72" x2="64" y2="76" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
            <line x1="118" y1="72" x2="96" y2="76" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {mood === 'roast' && (
          // Sarcastic winking eye or deadpan
          <g>
            {/* Left Eye: Open deadpan */}
            <ellipse cx="54" cy="84" rx="9" ry="10" fill="#FFFFFF" stroke="#431407" strokeWidth="2.5" />
            <ellipse cx="54" cy="84" rx="5" ry="6" fill="#1C1917" />
            <circle cx="52" cy="81" r="2" fill="#FFFFFF" />
            {/* Right Eye: Sassy wink */}
            <path
              d="M 98 84 Q 106 76 114 84"
              fill="none"
              stroke="#431407"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        )}

        {mood === 'doodie' && (
          // Intense flaming red battle eyes
          <g>
            <ellipse cx="54" cy="85" rx="11" ry="12" fill="#FFFFFF" stroke="#431407" strokeWidth="2.5" />
            <circle cx="54" cy="85" r="7" fill="#DC143C" />
            <circle cx="54" cy="85" r="3.5" fill="#000000" />
            <circle cx="51" cy="82" r="2.5" fill="#FFFFFF" />
            <ellipse cx="106" cy="85" rx="11" ry="12" fill="#FFFFFF" stroke="#431407" strokeWidth="2.5" />
            <circle cx="106" cy="85" r="7" fill="#DC143C" />
            <circle cx="106" cy="85" r="3.5" fill="#000000" />
            <circle cx="103" cy="82" r="2.5" fill="#FFFFFF" />
            {/* Fierce furrowed eyebrows */}
            <line x1="42" y1="70" x2="65" y2="77" stroke="#431407" strokeWidth="4" strokeLinecap="round" />
            <line x1="118" y1="70" x2="95" y2="77" stroke="#431407" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* ACCESSORIES */}
        {/* Student Red Headband (Hachimaki) with knot */}
        <path
          d="M 28 64 Q 80 50 132 64 L 132 74 Q 80 60 28 74 Z"
          fill="url(#headbandGrad)"
          stroke="#9F1239"
          strokeWidth="1.5"
        />
        {/* Headband Center Emblem - AURA Flame / Lightning Bolt */}
        <circle cx="80" cy="63" r="6.5" fill="#FFFFFF" />
        <path d="M 80 58 L 77 64 L 81 64 L 79 69 L 84 63 L 80 63 Z" fill="#FF1744" />

        {/* Headband Tied Tails on the left */}
        <path d="M 28 66 Q 16 68 12 76" stroke="#E11D48" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M 28 68 Q 18 78 16 88" stroke="#BE123C" strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* Hand Accessories by mood */}
        {mood === 'psycho' && (
          // Holding a red exam correction pen like a dagger!
          <g transform="translate(112, 92) rotate(-25)">
            <rect x="0" y="0" width="8" height="34" rx="2" fill="#E11D48" stroke="#9F1239" strokeWidth="1.5" />
            <polygon points="0,0 8,0 4,-10" fill="#FFFFFF" stroke="#9F1239" strokeWidth="1" />
            {/* Kitty Paw holding it */}
            <circle cx="4" cy="18" r="8" fill="#FDBA74" stroke="#EA580C" strokeWidth="2" />
          </g>
        )}

        {mood === 'roast' && (
          // Holding a steaming cup of tea ☕
          <g transform="translate(108, 104)">
            <ellipse cx="14" cy="16" rx="10" ry="8" fill="#FFFFFF" stroke="#475569" strokeWidth="2" />
            <path d="M 23 12 C 29 12 29 20 23 20" stroke="#475569" strokeWidth="2" fill="none" />
            <ellipse cx="14" cy="12" rx="8" ry="4" fill="#B45309" />
            {/* Steam */}
            <path d="M 10 7 Q 12 2 10 -2" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 16 7 Q 14 2 16 -2" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Kitty Paw */}
            <circle cx="6" cy="18" r="7" fill="#FDBA74" stroke="#EA580C" strokeWidth="2" />
          </g>
        )}

        {mood === 'jealous' && (
          // Pointing paw at the user
          <g transform="translate(110, 102)">
            <ellipse cx="10" cy="10" rx="10" ry="7" fill="#FDBA74" stroke="#EA580C" strokeWidth="2" />
            <rect x="14" y="7" width="12" height="6" rx="3" fill="#FDBA74" stroke="#EA580C" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
};
