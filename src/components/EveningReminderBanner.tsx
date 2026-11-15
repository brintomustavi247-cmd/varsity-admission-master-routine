import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight, BellRing, Clock, X } from 'lucide-react';
import type { RoutineDay } from '../types/study';

interface EveningReminderBannerProps {
  visible: boolean;
  day: RoutineDay | null;
  remainingTasks: number;
  isPreview?: boolean;
  onJumpToMission: () => void;
  onDismiss: () => void;
}

export function EveningReminderBanner({
  visible,
  day,
  remainingTasks,
  isPreview = false,
  onJumpToMission,
  onDismiss,
}: EveningReminderBannerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && day && (
        <motion.aside
          role="region"
          aria-label="রাত ৮টার ডেইলি মিশন রিমাইন্ডার"
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -14, scale: 0.98 }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -10, scale: 0.98 }
          }
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-amber-400/35 dark:border-amber-400/25 bg-gradient-to-r from-[#172554] via-[#1E3A8A] to-[#312E81] px-4 py-3.5 text-white shadow-[0_12px_30px_rgba(30,58,138,0.28)]"
        >
          {/* Subtle top sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/65 to-transparent"
          />

          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { rotate: [0, -10, 10, -6, 6, 0] }
                }
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  repeatDelay: 4.5,
                  ease: 'easeInOut',
                }}
                className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-200 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0"
              >
                <BellRing className="w-5 h-5" />
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-amber-200">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    রাত ৮টার রিমাইন্ডার
                  </span>
                  {isPreview && (
                    <span className="text-sky-200/80">· প্রিভিউ</span>
                  )}
                </div>

                <p className="mt-0.5 text-xs sm:text-sm font-semibold text-white/95 leading-snug">
                  Day {String(day.d).padStart(2, '0')} ({day.date})-এর{' '}
                  <strong className="font-mono-num text-amber-200">
                    {remainingTasks}টি
                  </strong>{' '}
                  টাস্ক এখনো বাকি! ঘুমানোর আগেই আজকের মিশন শেষ করুন।
                </p>

                <div className="mt-2.5 sm:hidden">
                  <button
                    type="button"
                    onClick={onJumpToMission}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <span>মিশন শুরু করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onJumpToMission}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs whitespace-nowrap transition-colors cursor-pointer"
              >
                <span>মিশন শুরু করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onDismiss}
                aria-label="রিমাইন্ডার বন্ধ করুন"
                className="min-w-[40px] min-h-[40px] rounded-xl bg-white/10 hover:bg-white/20 text-white/85 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
