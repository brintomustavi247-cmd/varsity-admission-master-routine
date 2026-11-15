import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Check,
  Flame,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import type { CelebrationPayload } from '../types/study';
import { getRankInfo } from '../data/routineData';

interface CelebrationModalProps {
  celebration: CelebrationPayload | null;
  onClose: () => void;
  onReplay?: () => void;
}

const PREMIUM_BLUE_PALETTE = [
  '#38bdf8',
  '#60a5fa',
  '#818cf8',
  '#fb7185',
  '#e0f2fe',
];

export function triggerSmallConfetti(originEl?: HTMLElement | null) {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  let origin = { x: 0.5, y: 0.65 };
  if (originEl) {
    const rect = originEl.getBoundingClientRect();
    origin = {
      x: Math.min(0.95, Math.max(0.05, (rect.left + rect.width / 2) / window.innerWidth)),
      y: Math.min(0.95, Math.max(0.05, (rect.top + rect.height / 2) / window.innerHeight)),
    };
  }

  confetti({
    particleCount: 22,
    spread: 48,
    startVelocity: 24,
    gravity: 0.85,
    scalar: 0.78,
    origin,
    colors: PREMIUM_BLUE_PALETTE,
  });
}

export function triggerGrandCelebration() {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  confetti({
    particleCount: 55,
    angle: 60,
    spread: 58,
    startVelocity: 38,
    gravity: 0.78,
    ticks: 220,
    origin: { x: 0.08, y: 0.72 },
    colors: PREMIUM_BLUE_PALETTE,
  });
  confetti({
    particleCount: 55,
    angle: 120,
    spread: 58,
    startVelocity: 38,
    gravity: 0.78,
    ticks: 220,
    origin: { x: 0.92, y: 0.72 },
    colors: PREMIUM_BLUE_PALETTE,
  });
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 85,
      startVelocity: 30,
      gravity: 0.7,
      ticks: 200,
      origin: { x: 0.5, y: 0.42 },
      colors: PREMIUM_BLUE_PALETTE,
    });
  }, 320);
}

const AMBIENT_BUBBLES = [
  { left: '12%', size: 10, delay: 0, dur: 4.5 },
  { left: '24%', size: 6, delay: 0.6, dur: 5.2 },
  { left: '38%', size: 14, delay: 0.3, dur: 4.8 },
  { left: '54%', size: 8, delay: 0.9, dur: 5.5 },
  { left: '68%', size: 12, delay: 0.2, dur: 4.6 },
  { left: '82%', size: 7, delay: 0.7, dur: 5.0 },
  { left: '91%', size: 11, delay: 0.4, dur: 4.9 },
];

export function CelebrationModal({
  celebration,
  onClose,
  onReplay,
}: CelebrationModalProps) {
  const [replaySeed, setReplaySeed] = useState(0);
  const [displayXp, setDisplayXp] = useState(0);

  useEffect(() => {
    if (!celebration) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      setDisplayXp(celebration.xpEarned);
      return;
    }

    setDisplayXp(0);
    triggerGrandCelebration();

    const target = celebration.xpEarned;
    const duration = 700;
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayXp(Math.round(target * eased));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKey);
    };
  }, [celebration, replaySeed, onClose]);

  const rank = celebration ? getRankInfo(celebration.totalXp) : null;
  const milestoneSteps =
    celebration?.kind === 'day'
      ? [
          { num: '01', label: 'মূল অধ্যায়' },
          { num: '02', label: celebration.secondaryLabel ?? 'ইংরেজি' },
          { num: '03', label: 'রিভিশন' },
        ]
      : [
          { num: '01', label: 'থিওরি' },
          { num: '02', label: 'ব্যাংক' },
          { num: '03', label: 'রিভিশন ১' },
          { num: '04', label: 'রিভিশন ২' },
        ];

  return (
    <AnimatePresence>
      {celebration && rank && (
        <motion.div
          key={`${celebration.id}-${replaySeed}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#101857]/92 via-[#1D2B8F]/92 to-[#0E174A]/95 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Ambient Oceanic Light Rays & Rising Particles */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            {/* Diagonal volumetric blue light beams */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 0.45, x: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -top-32 -left-24 w-[480px] h-[900px] rotate-25 bg-gradient-to-b from-sky-300/30 via-indigo-400/10 to-transparent blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 0.35, x: 0 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -top-24 right-0 w-[380px] h-[820px] rotate-20 bg-gradient-to-b from-cyan-300/25 via-blue-400/10 to-transparent blur-2xl"
            />

            {/* Soft luminous horizon aura */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-radial from-sky-400/25 via-indigo-500/10 to-transparent blur-3xl"
            />

            {/* Gently rising ambient ocean/starlight particles */}
            {AMBIENT_BUBBLES.map((b, i) => (
              <motion.span
                key={i}
                style={{ left: b.left, width: b.size, height: b.size }}
                initial={{ y: '105vh', opacity: 0 }}
                animate={{
                  y: '-15vh',
                  opacity: [0, 0.55, 0.35, 0],
                }}
                transition={{
                  duration: b.dur,
                  delay: b.delay,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                className="absolute rounded-full bg-sky-200/50 border border-white/40 blur-[0.5px]"
              />
            ))}
          </div>

          {/* Premium Blue Glassmorphic Victory Card */}
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[28px] border border-white/20 bg-gradient-to-b from-[#2B3EC2]/90 via-[#22309C]/92 to-[#172172]/95 p-6 sm:p-8 text-center text-white shadow-[0_32px_80px_rgba(8,15,65,0.65)] backdrop-blur-xl"
          >
            {/* Subtle top glass sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/70 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-44 rounded-full bg-sky-400/20 blur-3xl"
            />

            <button
              type="button"
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Levitating 3D-feel Blue/Cyan Medallion */}
            <div className="relative mx-auto mb-5 w-24 h-24 flex items-center justify-center">
              {/* Outer soft orbital ring */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: 360 }}
                transition={{
                  scale: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.4 },
                  rotate: { duration: 18, repeat: Infinity, ease: 'linear' },
                }}
                className="absolute inset-0 rounded-full border border-sky-300/35"
              >
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_10px_#7dd3fc]" />
              </motion.div>

              <motion.div
                initial={{ y: 18, scale: 0.75, opacity: 0 }}
                animate={{
                  y: [0, -5, 0],
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.4 },
                  y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
                }}
                className="w-18 h-18 rounded-2xl bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-700 p-[2px] shadow-[0_14px_34px_rgba(56,189,248,0.45)]"
              >
                <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#2B3EC2] to-[#16206E] flex items-center justify-center text-sky-200">
                  <Award className="w-9 h-9 stroke-[2]" />
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-xs font-semibold tracking-widest uppercase text-sky-300">
                {celebration.kind === 'day'
                  ? 'Daily Milestone Achieved'
                  : 'Chapter Mastered'}
              </div>

              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white [text-wrap:balance]">
                {celebration.title}
              </h2>
              <p className="mt-2 text-sm text-sky-100/80 max-w-sm mx-auto leading-relaxed">
                {celebration.subtitle}
              </p>
            </motion.div>

            {/* Sliding Glassmorphic Sub-cards inspired by the blue showcase cards */}
            <div
              className={`mt-6 grid gap-2.5 ${
                milestoneSteps.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {milestoneSteps.map((step, idx) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.18 + idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-left backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono-num font-bold text-sky-200/80 mb-1.5">
                    <span>{step.num}</span>
                    <span className="w-4 h-4 rounded-full bg-sky-400/25 text-sky-200 inline-flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {step.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Key Metrics Strip */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 grid grid-cols-3 gap-2.5 text-center"
            >
              <div className="rounded-2xl border border-white/15 bg-white/8 p-3">
                <div className="font-mono-num text-lg font-extrabold text-sky-300 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" />+{displayXp}
                </div>
                <div className="text-[11px] font-semibold text-sky-100/75 mt-0.5">
                  মিশন XP
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/8 p-3">
                <div className="font-mono-num text-lg font-extrabold text-[#FF85A1] flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4" />
                  {celebration.streak}
                </div>
                <div className="text-[11px] font-semibold text-sky-100/75 mt-0.5">
                  দিনের স্ট্রিক
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/8 p-3">
                <div className="font-mono-num text-lg font-extrabold text-white">
                  {celebration.daysDone}/61
                </div>
                <div className="text-[11px] font-semibold text-sky-100/75 mt-0.5">
                  দিন সম্পন্ন
                </div>
              </div>
            </motion.div>

            {/* Sleek Rank Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 rounded-2xl border border-white/15 bg-[#121B63]/65 p-3.5 text-left"
            >
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-sky-100">
                  Level {rank.level} · {rank.title}
                </span>
                <span className="font-mono-num text-sky-300">
                  {celebration.totalXp} XP
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rank.progressPct}%` }}
                  transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-300 via-cyan-300 to-[#FF6B8B]"
                />
              </div>
            </motion.div>

            {/* Coral-Pink Primary CTA + Frosted Glass Replay */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex items-center gap-2.5"
            >
              <button
                type="button"
                onClick={() => {
                  setReplaySeed((s) => s + 1);
                  onReplay?.();
                }}
                title="অ্যানিমেশন আবার দেখুন"
                aria-label="অ্যানিমেশন আবার দেখুন"
                className="px-3.5 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-sky-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF6B8B] to-[#F45B7A] hover:from-[#FF5C7F] hover:to-[#E8486B] text-white font-bold text-sm shadow-[0_12px_28px_rgba(244,91,122,0.42)] transition-all cursor-pointer"
              >
                পরবর্তী মিশনে চলুন
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FloatingXpToastProps {
  xpToast: { id: number; text: string } | null;
}

export function FloatingXpToast({ xpToast }: FloatingXpToastProps) {
  return (
    <AnimatePresence>
      {xpToast && (
        <motion.div
          key={xpToast.id}
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 rounded-xl border border-sky-300/40 bg-gradient-to-r from-[#2434A6] to-[#0284C7] px-4 py-2.5 shadow-[0_12px_28px_rgba(29,43,143,0.35)] flex items-center gap-2 text-sm font-bold text-white backdrop-blur-md pointer-events-none"
        >
          <Sparkles className="w-4 h-4 text-sky-200" />
          <span>{xpToast.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
