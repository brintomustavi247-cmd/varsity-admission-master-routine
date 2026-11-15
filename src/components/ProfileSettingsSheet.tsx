import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellOff,
  BellRing,
  Dna,
  Download,
  Flame,
  Globe,
  LogOut,
  Moon,
  Send,
  Sun,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { StudyTrack } from '../types/study';
import { UserAvatar } from './AvatarStack';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendPhoneNotification,
} from '../lib/notifications';

interface ProfileSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  displayName: string;
  email: string;
  photoURL: string;
  studyTrack: StudyTrack;
  onSelectTrack: (track: StudyTrack) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPreviewCelebration: () => void;
  reminderEnabled: boolean;
  onToggleReminder: () => void;
  onPreviewReminder: () => void;
  metrics: {
    daysDone: number;
    chapsDone: number;
    totalChapters: number;
    xp: number;
    streak: number;
    overallPct: number;
  };
  rankLevel: number;
  rankTitle: string;
  onExportData: () => void;
  onImportClick: () => void;
  onRequestReset: () => void;
  onSignOut: () => void;
}

export function ProfileSettingsSheet({
  open,
  onClose,
  displayName,
  email,
  photoURL,
  studyTrack,
  onSelectTrack,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onPreviewCelebration,
  reminderEnabled,
  onToggleReminder,
  onPreviewReminder,
  metrics,
  rankLevel,
  rankTitle,
  onExportData,
  onImportClick,
  onRequestReset,
  onSignOut,
}: ProfileSettingsSheetProps) {
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => getNotificationPermission());
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (open) {
      setNotifPermission(getNotificationPermission());
    }
  }, [open]);

  const handleEnableNotification = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted' && !reminderEnabled) {
      onToggleReminder();
    }
  };

  const handleSendTestNotification = async () => {
    setTestSent(true);
    await sendPhoneNotification({
      title: '📚 টেস্ট নোটিফিকেশন সফল!',
      body: 'আপনার ফোনে অ্যাডমিশন রুটিন নোটিফিকেশন সক্রিয় আছে। প্রতিদিন টাস্ক বাকি থাকলে সরাসরি রিমাইন্ডার পাবেন। 🔥',
      tag: 'test-notification',
    });
    setTimeout(() => setTestSent(false), 3000);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/55 backdrop-blur-xs sm:p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="প্রোফাইল ও সেটিংস"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Profile Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    displayName={displayName}
                    photoURL={photoURL}
                    size="lg"
                    ringClassName="ring-2 ring-indigo-500/80"
                  />
                  <div className="min-w-0">
                    <div className="font-display font-extrabold text-base text-slate-900 dark:text-slate-50 truncate">
                      {displayName}
                    </div>
                    {email && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {email}
                      </div>
                    )}
                    <div className="mt-0.5 text-xs font-bold text-[#4F46E5] dark:text-[#818CF8] font-mono-num">
                      Lv.{rankLevel} · {rankTitle} · {metrics.xp} XP
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="বন্ধ করুন"
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Compact Progress Summary */}
              <div className="grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-3 text-center">
                <div>
                  <div className="font-mono-num text-sm font-extrabold text-[#4F46E5] dark:text-[#818CF8]">
                    {metrics.daysDone}/61
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    দিন
                  </div>
                </div>
                <div>
                  <div className="font-mono-num text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    {metrics.chapsDone}/{metrics.totalChapters}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    অধ্যায়
                  </div>
                </div>
                <div>
                  <div className="font-mono-num text-sm font-extrabold text-amber-600 dark:text-amber-400 inline-flex items-center justify-center gap-0.5">
                    <Flame className="w-3.5 h-3.5" />
                    {metrics.streak}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    স্ট্রিক
                  </div>
                </div>
                <div>
                  <div className="font-mono-num text-sm font-extrabold text-violet-600 dark:text-violet-400">
                    {metrics.overallPct}%
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    মোট
                  </div>
                </div>
              </div>

              {/* Study Track Selector */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                  রুটিন ও সিলেবাস বিষয়
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (studyTrack !== 'english') onSelectTrack('english');
                    }}
                    className={`min-h-[44px] px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      studyTrack === 'english'
                        ? 'border-transparent bg-gradient-to-r from-[#4F46E5] to-blue-600 text-white shadow-sm shadow-indigo-500/25'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>ইংরেজি</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (studyTrack !== 'biology') onSelectTrack('biology');
                    }}
                    className={`min-h-[44px] px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      studyTrack === 'biology'
                        ? 'border-transparent bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-500/25'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <Dna className="w-4 h-4" />
                    <span>জীববিজ্ঞান</span>
                  </button>
                </div>
              </div>

              {/* Preferences & Notification Controls */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                  সেটিংস ও নোটিফিকেশন
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="w-full min-h-[48px] px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 text-sm font-bold text-slate-800 dark:text-slate-100">
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Moon className="w-4 h-4 text-indigo-600" />
                      )}
                      থিম মোড
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </button>

                  <div className="min-h-[48px] px-4 py-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={onToggleSound}
                      className="flex-1 flex items-center justify-between text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5 text-sm font-bold text-slate-800 dark:text-slate-100">
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-400" />
                        )}
                        সেলিব্রেশন সাউন্ড
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {soundEnabled ? 'চালু' : 'বন্ধ'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onPreviewCelebration();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[11px] font-bold text-[#4F46E5] dark:text-[#818CF8] hover:bg-indigo-100 dark:hover:bg-indigo-900/60 whitespace-nowrap cursor-pointer"
                    >
                      প্রিভিউ
                    </button>
                  </div>

                  <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {reminderEnabled ? (
                          <BellRing className="w-4 h-4 text-amber-500" />
                        ) : (
                          <BellOff className="w-4 h-4 text-slate-400" />
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            দৈনিক ফোন নোটিফিকেশন
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            পড়া বাকি থাকলে রাত ৮টায় সরাসরি ফোনে অ্যালার্ট
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={onToggleReminder}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          reminderEnabled
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {reminderEnabled ? 'চালু' : 'বন্ধ'}
                      </button>
                    </div>

                    {/* Notification Permission / Action Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/80 gap-2">
                      {notifPermission === 'granted' ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>ফোনে পুশ সক্রিয়</span>
                        </div>
                      ) : notifPermission === 'denied' ? (
                        <span className="text-[11px] font-bold text-rose-500">
                          ব্রাউজারে ব্লক করা (সাইট সেটিংসে Allow করুন)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleEnableNotification}
                          className="text-xs font-bold text-[#4F46E5] dark:text-[#818CF8] hover:underline cursor-pointer"
                        >
                          🔔 ফোনের নোটিফিকেশন পারমিশন দিন
                        </button>
                      )}

                      <div className="flex items-center gap-1.5">
                        {notifPermission === 'granted' && (
                          <button
                            type="button"
                            onClick={handleSendTestNotification}
                            disabled={testSent}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-60"
                          >
                            <Send className="w-3 h-3" />
                            <span>{testSent ? 'পাঠানো হয়েছে!' : 'টেস্ট পাঠান'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            onPreviewReminder();
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[11px] font-bold text-[#4F46E5] dark:text-[#818CF8] hover:bg-indigo-100 dark:hover:bg-indigo-900/60 whitespace-nowrap cursor-pointer"
                        >
                          ব্যানার প্রিভিউ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backup / Import / Reset */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                  ডাটা ব্যাকআপ ও রিসেট
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onExportData();
                      onClose();
                    }}
                    className="min-h-[44px] px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Backup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onImportClick();
                      onClose();
                    }}
                    className="min-h-[44px] px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Import</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequestReset();
                    }}
                    className="min-h-[44px] px-2.5 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100/70 dark:hover:bg-red-950/40 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Sign Out */}
              <button
                type="button"
                onClick={onSignOut}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>লগ আউট</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
