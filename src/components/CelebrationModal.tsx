import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Flame,
  RotateCcw,
  X,
  Zap,
} from 'lucide-react';
import type { CelebrationPayload } from '../types/study';
import { getRankInfo } from '../data/routineData';

interface CelebrationModalProps {
  celebration: CelebrationPayload | null;
  onClose: () => void;
  onReplay?: () => void;
}

// Mobile-optimized lightweight no-ops to prevent canvas particle lag
export function triggerSmallConfetti(_originEl?: HTMLElement | null) {
  // Disabled heavy canvas confetti for butter-smooth mobile performance
}

export function triggerGrandCelebration() {
  // Disabled heavy canvas confetti for butter-smooth mobile performance
}

export function CelebrationModal({
  celebration,
  onClose,
  onReplay,
}: CelebrationModalProps) {
  useEffect(() => {
    if (!celebration) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [celebration, onClose]);

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
          key={celebration.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs"
          onClick={onClose}
        >
          {/* Aesthetic Crimson Aura Ascension Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-red-500/35 bg-gradient-to-b from-[#1f070c] via-[#140508] to-[#070b18] p-6 sm:p-7 text-center text-white shadow-[0_20px_60px_rgba(220,20,60,0.35)]"
          >
            {/* Top Sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/80 to-transparent"
            />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Luminous Crimson Aura Emblem */}
            <div className="relative mx-auto mb-4 w-20 h-20 flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-red-600/40 via-rose-600/30 to-amber-500/40 blur-md animate-pulse"
              />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 p-[2px] shadow-[0_0_30px_rgba(255,23,68,0.6)]">
                <div className="w-full h-full rounded-[14px] bg-[#120407] flex items-center justify-center text-red-400">
                  <Zap className="w-8 h-8 stroke-[2.2] text-[#FF1744] fill-[#FF1744]" />
                </div>
              </div>
            </div>

            {/* Aesthetic Aura Header Pill */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-[11px] font-aura text-[#FF2A55] shadow-[0_0_15px_rgba(255,23,68,0.35)]">
                <Zap className="w-3.5 h-3.5 text-[#FF1744] fill-[#FF1744]" />
                <span>
                  {celebration.kind === 'day'
                    ? 'AURA UNLOCKED'
                    : 'AURA SURGE'}
                </span>
              </div>

              <h2 className="mt-2.5 font-display text-xl sm:text-2xl font-black tracking-tight text-white [text-wrap:balance]">
                {celebration.title}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-red-200/80 max-w-xs mx-auto leading-relaxed">
                {celebration.subtitle}
              </p>
            </div>

            {/* Milestone Steps Completed */}
            <div
              className={`mt-4 grid gap-2 ${
                milestoneSteps.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {milestoneSteps.map((step) => (
                <div
                  key={step.num}
                  className="rounded-xl border border-violet-400/20 bg-white/5 px-2.5 py-2.5 text-left"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono-num font-bold text-violet-300/80 mb-1">
                    <span>{step.num}</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-400/20 text-cyan-300 inline-flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-white truncate">
                    {step.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Key Aura Metrics Strip */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-red-500/25 bg-gradient-to-b from-red-600/15 to-transparent p-2.5 shadow-[0_4px_16px_rgba(220,20,60,0.15)]">
                <div className="font-aura text-base sm:text-lg font-black text-[#FF1744] flex items-center justify-center gap-1 drop-shadow-[0_0_8px_rgba(255,23,68,0.6)]">
                  +{celebration.xpEarned}
                </div>
                <div className="text-[10px] font-bold text-red-200/80 mt-0.5 font-aura tracking-wider">
                  EARNED AURA
                </div>
              </div>

              <div className="rounded-xl border border-red-500/25 bg-gradient-to-b from-rose-500/15 to-transparent p-2.5">
                <div className="font-mono-num text-base sm:text-lg font-black text-[#FF4D6D] flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#FF4D6D]" />
                  {celebration.streak}
                </div>
                <div className="text-[10px] font-bold text-red-200/80 mt-0.5 font-aura tracking-wider">
                  STREAK 🔥
                </div>
              </div>

              <div className="rounded-xl border border-red-500/25 bg-gradient-to-b from-red-500/15 to-transparent p-2.5">
                <div className="font-mono-num text-base sm:text-lg font-black text-rose-200">
                  {celebration.daysDone}/61
                </div>
                <div className="text-[10px] font-bold text-red-200/80 mt-0.5 font-aura tracking-wider">
                  DAYS DONE
                </div>
              </div>
            </div>

            {/* Aura Rank & Level Progress */}
            <div className="mt-4 rounded-xl border border-red-500/25 bg-[#0d0306]/90 p-3 text-left">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-red-100 font-medium">
                  Level {rank.level} · {rank.title}
                </span>
                <span className="font-aura text-[#FF1744] font-black flex items-center gap-1 drop-shadow-[0_0_8px_rgba(255,23,68,0.5)]">
                  {celebration.totalXp} AURA
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(0, rank.progressPct))}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_12px_rgba(255,23,68,0.7)] transition-all duration-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center gap-2">
              {onReplay && (
                <button
                  type="button"
                  onClick={onReplay}
                  title="অ্যানিমেশন আবার দেখুন"
                  aria-label="অ্যানিমেশন আবার দেখুন"
                  className="px-3.5 py-2.5 rounded-xl border border-red-500/25 bg-white/10 hover:bg-white/15 text-red-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-[0_8px_25px_rgba(220,20,60,0.4)] transition-all cursor-pointer active:scale-[0.98]"
              >
                পরবর্তী মিশনে চলুন
              </button>
            </div>
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
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 rounded-2xl border border-red-500/40 bg-gradient-to-r from-[#21050b] via-[#2d0710] to-[#0f172a] px-4 py-2.5 shadow-[0_10px_30px_rgba(220,20,60,0.35)] flex items-center gap-2.5 text-sm font-black text-white pointer-events-none"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
          </div>
          <span className="font-aura tracking-wider text-[#FF2A55] drop-shadow-[0_0_8px_rgba(255,42,85,0.6)]">
            {xpToast.text}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
