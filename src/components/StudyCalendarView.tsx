import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Sparkles,
  BookOpen,
  Trash2,
  Plus,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react';
import type { StudySession } from '../types/timer';
import {
  getMonthStudySummary,
  getStudyLogByDate,
  formatDurationBangla,
  formatDurationShort,
} from '../lib/studyTimerStorage';

interface StudyCalendarViewProps {
  sessions: StudySession[];
  onDeleteSession: (id: string) => void;
  onAddManualSession?: (session: StudySession) => void;
}

const MONTH_NAMES_BN = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const WEEKDAY_NAMES_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

const toBnDigits = (val: string | number) =>
  String(val).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);

export function StudyCalendarView({
  sessions,
  onDeleteSession,
  onAddManualSession,
}: StudyCalendarViewProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const todayISO = today.toLocaleDateString('en-CA');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);

  // Manual session modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualSubject, setManualSubject] = useState('পদার্থবিজ্ঞান');
  const [manualMinutes, setManualMinutes] = useState(30);
  const [manualNotes, setManualNotes] = useState('');

  const monthSummary = getMonthStudySummary(sessions, currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar calculations
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const selectedLog = getStudyLogByDate(sessions, selectedDate);

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualMinutes <= 0 || !onAddManualSession) return;

    const now = Date.now();
    const newSession: StudySession = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: selectedDate,
      startTime: now - manualMinutes * 60 * 1000,
      endTime: now,
      durationMinutes: manualMinutes,
      durationSeconds: manualMinutes * 60,
      subject: manualSubject,
      taskName: 'অফলাইন সেলফ স্টাডি',
      mode: 'stopwatch',
      auraEarned: Math.min(50, Math.round((manualMinutes / 25) * 10)),
      notes: manualNotes.trim() || undefined,
    };

    onAddManualSession(newSession);
    setShowManualModal(false);
    setManualNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Month Navigator & Summary Highlights Banner */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="আগের মাস"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-base sm:text-lg font-black font-display text-slate-900 dark:text-slate-100">
              {MONTH_NAMES_BN[currentMonth]} {toBnDigits(currentYear)}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="পরের মাস"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentYear(today.getFullYear());
              setCurrentMonth(today.getMonth());
              setSelectedDate(todayISO);
            }}
            className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
          >
            আজকে ফিরে যান
          </button>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
              মাসের মোট পড়া
            </div>
            <div className="mt-0.5 text-xs sm:text-sm md:text-base font-black text-indigo-600 dark:text-indigo-400 font-mono-num">
              {formatDurationBangla(monthSummary.totalMinutes)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
              দৈনিক গড় পড়া
            </div>
            <div className="mt-0.5 text-xs sm:text-sm md:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono-num">
              {formatDurationBangla(monthSummary.dailyAverageMinutes)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
              সক্রিয় স্টাডি ডে
            </div>
            <div className="mt-0.5 text-xs sm:text-sm md:text-base font-black text-amber-600 dark:text-amber-400 font-mono-num inline-flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {toBnDigits(monthSummary.activeDaysCount)}/{toBnDigits(daysInMonth)} দিন
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Monthly Calendar Grid */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-5 shadow-sm">
        {/* Weekday Header Row */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
          {WEEKDAY_NAMES_BN.map((dayName, idx) => (
            <div
              key={dayName}
              className={`text-[11px] sm:text-xs font-bold py-1 ${
                idx === 5
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[52px] sm:min-h-[72px]" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const mm = String(currentMonth + 1).padStart(2, '0');
            const dd = String(dayNum).padStart(2, '0');
            const dateISO = `${currentYear}-${mm}-${dd}`;
            const log = monthSummary.logsByDate[dateISO];
            const minutes = log?.totalMinutes || 0;

            const isSelected = selectedDate === dateISO;
            const isToday = todayISO === dateISO;

            // Heat levels
            let heatStyle =
              'border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300';
            if (minutes >= 120) {
              heatStyle =
                'border-purple-400 dark:border-purple-500/80 bg-gradient-to-br from-indigo-500/15 via-purple-500/20 to-pink-500/15 text-indigo-950 dark:text-indigo-200 shadow-[0_0_10px_rgba(168,85,247,0.25)]';
            } else if (minutes >= 45) {
              heatStyle =
                'border-emerald-400 dark:border-emerald-500/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
            } else if (minutes > 0) {
              heatStyle =
                'border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200';
            }

            return (
              <button
                key={dateISO}
                type="button"
                onClick={() => setSelectedDate(dateISO)}
                className={`min-h-[52px] sm:min-h-[72px] rounded-xl sm:rounded-2xl border p-1 sm:p-1.5 flex flex-col justify-between items-start transition-all cursor-pointer text-left relative overflow-hidden group ${heatStyle} ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 scale-[1.02] shadow-md z-10'
                    : 'hover:scale-[1.01] hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                {/* Date Top Row */}
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-black font-mono-num rounded-md px-1 ${
                      isToday
                        ? 'bg-indigo-600 text-white font-bold'
                        : ''
                    }`}
                  >
                    {toBnDigits(dayNum)}
                  </span>
                  {minutes >= 120 && (
                    <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
                  )}
                </div>

                {/* Duration Badge Bottom */}
                <div className="w-full mt-1">
                  {minutes > 0 ? (
                    <div className="text-[9px] sm:text-[11px] font-black font-aura tracking-tight truncate leading-tight">
                      {formatDurationShort(minutes)}
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-300 dark:text-slate-600 select-none">
                      -
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details Breakdown */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>নির্বাচিত তারিখের হিস্ট্রি</span>
            </div>
            <h3 className="text-base sm:text-lg font-black font-display text-slate-900 dark:text-slate-100 mt-0.5">
              {toBnDigits(selectedDate)} এর স্টাডি লগ
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {onAddManualSession && (
              <button
                type="button"
                onClick={() => setShowManualModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>অফলাইন পড়া যোগ করুন</span>
              </button>
            )}
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-400/40 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              মোট: {formatDurationBangla(selectedLog.totalMinutes)}
            </div>
          </div>
        </div>

        {/* Subject Breakdown Badges */}
        {Object.keys(selectedLog.subjectsSummary).length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
              বিষয়ভিত্তিক পড়ার সময়:
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(selectedLog.subjectsSummary).map(([subj, mins]) => (
                <div
                  key={subj}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <BookOpen className="w-3 h-3 text-indigo-500" />
                  <span>{subj}:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono-num font-black">
                    {formatDurationBangla(mins)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions List */}
        {selectedLog.sessions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            এই তারিখে কোনো স্টাডি সেশন রেকর্ড করা হয়নি। টাইমার চালু করে পড়া শুরু করুন! ⏱️
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            {selectedLog.sessions.map((sess) => {
              const startStr = new Date(sess.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const endStr = new Date(sess.endTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={sess.id}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3 flex items-center justify-between gap-3 group transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {sess.subject}{' '}
                        {sess.taskName && (
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            · {sess.taskName}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono-num">
                          {toBnDigits(startStr)} - {toBnDigits(endStr)}
                        </span>
                        <span>·</span>
                        <span className="font-black text-indigo-600 dark:text-indigo-400">
                          {formatDurationBangla(sess.durationMinutes)}
                        </span>
                        {sess.auraEarned > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-0.5">
                              <Sparkles className="w-3 h-3" />
                              +{toBnDigits(sess.auraEarned)} Aura
                            </span>
                          </>
                        )}
                      </div>
                      {sess.notes && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                          &quot;{sess.notes}&quot;
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteSession(sess.id)}
                    aria-label="সেশন মুছুন"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Study Session Modal */}
      {showManualModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setShowManualModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-display font-bold text-slate-900 dark:text-slate-50 text-base">
                অফলাইন পড়ার হিসাব যোগ করুন
              </h4>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিষয় / বিষয়বস্তু
                </label>
                <select
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                  <option value="উচ্চতর গণিত">উচ্চতর গণিত</option>
                  <option value="ইংরেজি">ইংরেজি</option>
                  <option value="জীববিজ্ঞান">জীববিজ্ঞান</option>
                  <option value="রসায়ন">রসায়ন</option>
                  <option value="স্পেসড রিভিশন">স্পেসড রিভিশন</option>
                  <option value="প্রশ্ন ব্যাংক অনুশীলন">প্রশ্ন ব্যাংক অনুশীলন</option>
                  <option value="মডেল টেস্ট">মডেল টেস্ট</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  কত মিনিট পড়েছেন?
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[25, 45, 60, 90].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setManualMinutes(m)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        manualMinutes === m
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {toBnDigits(m)} মি.
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ৩টি চ্যাপ্টারের প্রশ্ন সলভ করেছি..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
