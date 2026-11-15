import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight, Dices, Flame, Smartphone, X } from 'lucide-react';
import type { RoutineDay } from '../types/study';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '../lib/notifications';
import {
  getContextualSavageNotification,
  getRandomSavageNotification,
  type SavageNotification,
} from '../data/savageNotifications';
import { MascotCharacter } from './MascotCharacter';

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
  const [perm, setPerm] = useState(() => getNotificationPermission());
  const [currentSavage, setCurrentSavage] = useState<SavageNotification>(() =>
    getContextualSavageNotification()
  );

  const handleRequestPush = async () => {
    const res = await requestNotificationPermission();
    setPerm(res);
  };

  const handleShuffleQuote = () => {
    let next = getRandomSavageNotification();
    while (next.id === currentSavage.id) {
      next = getRandomSavageNotification();
    }
    setCurrentSavage(next);
  };

  return (
    <AnimatePresence>
      {visible && day && (
        <motion.aside
          role="region"
          aria-label="মিমি ক্যাট আনহিঞ্জড রিমাইন্ডার"
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -16, scale: 0.98 }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -12, scale: 0.98 }
          }
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-red-500/40 bg-gradient-to-br from-[#1c080d] via-[#1a0a1e] to-[#0c0d24] p-4 sm:p-5 text-white shadow-[0_16px_40px_rgba(220,20,60,0.28)]"
        >
          {/* Subtle top sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/80 to-transparent"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Mascot + Speech Bubble */}
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1 w-full">
              {/* Cute Study Cat Mascot */}
              <div className="relative shrink-0 pt-1">
                <MascotCharacter
                  mood={currentSavage.mood}
                  size="md"
                  animate={!prefersReducedMotion}
                />
                <div className="text-[10px] text-center font-extrabold text-rose-300 font-aura tracking-wider mt-0.5">
                  MIMI 😼
                </div>
              </div>

              {/* Speech Bubble */}
              <div className="relative flex-1 min-w-0 bg-white/10 dark:bg-slate-900/80 border border-red-400/30 rounded-2xl p-3 sm:p-3.5 shadow-inner">
                {/* Speech Bubble Arrow */}
                <div
                  aria-hidden="true"
                  className="hidden sm:block absolute -left-2 top-6 w-0 h-0 border-y-6 border-y-transparent border-r-8 border-r-white/10"
                />

                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/40 text-[10px] font-black uppercase tracking-wider text-rose-300 font-aura">
                      {currentSavage.categoryLabel}
                    </span>
                    {isPreview && (
                      <span className="text-[10px] text-sky-200/80 font-bold">
                        · প্রিভিউ
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-bold text-amber-300 font-mono-num flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    Day {String(day.d).padStart(2, '0')}: {remainingTasks}টি টাস্ক বাকি
                  </span>
                </div>

                {/* Sarcastic/Duolingo Roast Title */}
                <h3 className="font-display font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug">
                  {currentSavage.title}
                </h3>

                {/* Sarcastic Body */}
                <p className="mt-1 text-xs text-rose-100/90 leading-relaxed">
                  {currentSavage.body}
                </p>

                {perm !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleRequestPush}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>ফোনের পুশ নোটিফিকেশন অন করুন</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
              {/* Shuffle Roast button */}
              <button
                type="button"
                onClick={handleShuffleQuote}
                title="অন্য খোঁচা শুনুন"
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-rose-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Dices className="w-4 h-4 text-amber-400" />
                <span>অন্য খোঁচা 🎲</span>
              </button>

              <button
                type="button"
                onClick={onJumpToMission}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs whitespace-nowrap shadow-[0_6px_20px_rgba(220,20,60,0.4)] transition-all cursor-pointer active:scale-95"
              >
                <span>পড়তে বসুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onDismiss}
                aria-label="রিমাইন্ডার বন্ধ করুন"
                className="min-w-[38px] min-h-[38px] rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
