import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Heart, Sparkles, X, CheckCircle2 } from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '../lib/notifications';

interface KiraPermissionModalProps {
  onPermissionGranted?: () => void;
}

export function KiraPermissionModal({ onPermissionGranted }: KiraPermissionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [granted, setGranted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Only show if browser supports Notification and permission is 'default' (not yet asked)
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'default') {
      const snoozedUntil = Number(localStorage.getItem('kira_perm_snoozed_until') || '0');
      if (Date.now() > snoozedUntil) {
        // Delay popup by 2.5 seconds after page loads so user settles in first
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        setGranted(true);
        if (onPermissionGranted) onPermissionGranted();
        setTimeout(() => {
          setIsOpen(false);
        }, 2200);
      } else {
        setIsOpen(false);
      }
    } catch {
      setIsOpen(false);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSnooze = () => {
    // Snooze for 18 hours so user isn't annoyed
    localStorage.setItem('kira_perm_snoozed_until', String(Date.now() + 18 * 60 * 60 * 1000));
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-cyan-400/40 bg-gradient-to-b from-[#0b1329] via-[#091124] to-[#060a17] text-white shadow-[0_25px_60px_rgba(0,180,255,0.25)] p-5 sm:p-6"
        >
          {/* Neon Top Rim Light */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 opacity-90" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleSnooze}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>

          {!granted ? (
            <div className="flex flex-col items-center text-center">
              {/* Cute Emotionally Pleading Mascot Container */}
              <div className="relative mb-3 pt-2">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 opacity-50 blur-lg animate-pulse" />
                <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-cyan-400/70 shadow-xl bg-[#070b18]">
                  <img
                    src="/mascot/kira-pleading.png"
                    alt="Pleading Kira"
                    className="w-full h-full object-cover object-center scale-105"
                  />
                </div>
                {/* Floating Heart */}
                <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-rose-500/90 text-white shadow-lg animate-bounce">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
              </div>

              {/* Character Tag */}
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-[11px] font-black text-cyan-300 font-aura tracking-widest mb-2 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                KIRA (কিরা)
              </div>

              {/* Emotional Headline */}
              <h3 className="text-lg sm:text-xl font-black text-white leading-snug mb-2 font-display">
                তুমি কি কিরা-কে একা ফেলে চলে যাবা? 🥺💔
              </h3>

              {/* Emotional Persuasive Story */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                তুমি যখন ফেসবুক বা রিলস স্ক্রল করবা, কিরা তোমাকে ভালোবেসে একটু মিষ্টি ধমক দিয়ে পড়ার টেবিলে টেনে আনবে! নোটিফিকেশন Allow না করলে কিন্তু কিরা খুব কান্নাকাটি করবে...
              </p>

              {/* Perks / Benefits list */}
              <div className="w-full bg-[#0c1836]/70 border border-cyan-400/20 rounded-2xl p-3 mb-5 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-cyan-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>📱 রিলস বা চ্যাটিংয়ে আটকে গেলে সময়মতো অ্যালার্ট</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  <span>👰 সুন্দরী বউ/জামাই ও ক্রাশের খোঁচা দিয়ে মোটিভেশন</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>🕛 রাত ১১টা ৪০ মিনিটে জরুরি স্ট্রিক বাঁচানোর আলটিমেটাম</span>
                </div>
              </div>

              {/* Irresistible Call to Action Buttons */}
              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={handleAllow}
                  disabled={isRequesting}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-[0_8px_25px_rgba(6,182,212,0.45)] hover:shadow-[0_10px_30px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-75"
                >
                  <Bell className="w-4 h-4" />
                  <span>{isRequesting ? 'অনুমতি নেওয়া হচ্ছে...' : '💖 হ্যাঁ কিরা, আমায় পড়ার কথা মনে করিয়ে দিয়ো!'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSnooze}
                  className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  পরে ভাববো (এখন না)
                </button>
              </div>
            </div>
          ) : (
            /* Celebration Screen when Allowed */
            <div className="flex flex-col items-center text-center py-4">
              <div className="relative mb-3">
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-60 blur-xl animate-pulse" />
                <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-emerald-400 shadow-2xl bg-[#070b18]">
                  <img
                    src="/mascot/kira-heart.png"
                    alt="Happy Loving Kira"
                    className="w-full h-full object-cover object-center scale-105"
                  />
                </div>
                <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-black text-emerald-300 mb-1 font-display">
                থ্যাংক ইউ সো মাচ! 🥰✨
              </h3>
              <p className="text-sm text-slate-300 max-w-xs">
                কিরা এখন সবসময় তোমার পাশে থাকবে! পড়া বাকি থাকলে ঠিক সময়ে ফোনে খোঁচা দেবো!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
