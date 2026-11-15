import { useEffect } from 'react';
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80"
          onClick={onClose}
        >
          {/* Ultra-smooth mobile-optimized achievement modal (GPU accelerated, no canvas lag) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-sky-400/30 bg-gradient-to-b from-[#1b256d] via-[#151c57] to-[#0e1442] p-6 sm:p-7 text-center text-white shadow-2xl"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Victory Medallion */}
            <div className="relative mx-auto mb-4 w-20 h-20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-[2px] shadow-[0_8px_24px_rgba(56,189,248,0.4)]">
                <div className="w-full h-full rounded-[14px] bg-[#1a2364] flex items-center justify-center text-sky-200">
                  <Award className="w-8 h-8 stroke-[2.2]" />
                </div>
              </div>
            </div>

            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-400/15 border border-sky-400/30 text-[11px] font-bold tracking-wider uppercase text-sky-300">
                <Sparkles className="w-3 h-3" />
                {celebration.kind === 'day' ? 'মিশন সম্পন্ন! 🎉' : 'অধ্যায় সম্পন্ন! 🏆'}
              </div>

              <h2 className="mt-2.5 font-display text-xl sm:text-2xl font-black tracking-tight text-white">
                {celebration.title}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-sky-100/80 max-w-xs mx-auto leading-relaxed">
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
                  className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2.5 text-left"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono-num font-bold text-sky-200/80 mb-1">
                    <span>{step.num}</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-300 inline-flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-white truncate">
                    {step.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Key Metrics Strip */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <div className="font-mono-num text-base sm:text-lg font-black text-sky-300 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />+{celebration.xpEarned}
                </div>
                <div className="text-[10px] font-medium text-sky-100/70 mt-0.5">
                  মিশন XP
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <div className="font-mono-num text-base sm:text-lg font-black text-[#FF85A1] flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {celebration.streak}
                </div>
                <div className="text-[10px] font-medium text-sky-100/70 mt-0.5">
                  দিনের স্ট্রিক
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <div className="font-mono-num text-base sm:text-lg font-black text-white">
                  {celebration.daysDone}/61
                </div>
                <div className="text-[10px] font-medium text-sky-100/70 mt-0.5">
                  দিন সম্পন্ন
                </div>
              </div>
            </div>

            {/* Level & Rank Progress */}
            <div className="mt-4 rounded-xl border border-white/10 bg-[#0d143f]/60 p-3 text-left">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-sky-100">
                  Level {rank.level} · {rank.title}
                </span>
                <span className="font-mono-num text-sky-300">
                  {celebration.totalXp} XP
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(0, rank.progressPct))}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-[#FF6B8B] transition-all duration-500"
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
                  className="px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-sky-100 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#FF6B8B] to-[#F45B7A] hover:from-[#FF5C7F] hover:to-[#E8486B] text-white font-bold text-sm shadow-[0_8px_20px_rgba(244,91,122,0.35)] transition-all cursor-pointer active:scale-[0.98]"
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
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 rounded-xl border border-sky-400/30 bg-[#16206E] px-4 py-2.5 shadow-lg flex items-center gap-2 text-sm font-bold text-white pointer-events-none"
        >
          <Sparkles className="w-4 h-4 text-sky-300" />
          <span>{xpToast.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
