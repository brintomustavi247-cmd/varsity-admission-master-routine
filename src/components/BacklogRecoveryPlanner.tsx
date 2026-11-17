import { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Zap,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { ROUTINE_DATA, routineTaskKey, getSecondaryTaskInfo } from '../data/routineData';
import type { StudyTrack } from '../types/study';

interface BacklogRecoveryPlannerProps {
  myRoutine: Record<string, boolean>;
  activeTrack: StudyTrack;
  onNavigateToDay?: (dayNum: number) => void;
}

export function BacklogRecoveryPlanner({
  myRoutine,
  activeTrack,
  onNavigateToDay,
}: BacklogRecoveryPlannerProps) {
  // Identify past days and their pending tasks
  const backlogData = useMemo(() => {
    // Current day in 61-day routine cycle
    // Day 1 starts Nov 16, 2026
    const startDate = new Date('2026-11-16T00:00:00+06:00');
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );
    const currentRoutineDay = Math.min(61, Math.max(1, diffDays + 1));

    interface BacklogDayItem {
      dayNum: number;
      date: string;
      mainTopic: string;
      secondaryTopic: string;
      revTopic: string;
      pendingTasks: ('main' | 'eng' | 'rev')[];
      completedCount: number;
    }

    const backloggedDays: BacklogDayItem[] = [];
    let totalPendingTasks = 0;

    // Check from Day 1 up to currentRoutineDay (inclusive)
    for (let d = 1; d <= currentRoutineDay; d++) {
      const dayDef = ROUTINE_DATA.find((item) => item.d === d);
      if (!dayDef) continue;

      const mainDone = Boolean(myRoutine[routineTaskKey(d, 'main')]);
      const engDone = Boolean(myRoutine[routineTaskKey(d, 'eng')]);
      const revDone = Boolean(myRoutine[routineTaskKey(d, 'rev')]);

      const pendingTasks: ('main' | 'eng' | 'rev')[] = [];
      if (!mainDone) pendingTasks.push('main');
      if (!engDone) pendingTasks.push('eng');
      if (!revDone) pendingTasks.push('rev');

      const completedCount = 3 - pendingTasks.length;

      if (pendingTasks.length > 0) {
        totalPendingTasks += pendingTasks.length;
        backloggedDays.push({
          dayNum: d,
          date: dayDef.date,
          mainTopic: dayDef.main,
          secondaryTopic: getSecondaryTaskInfo(dayDef, activeTrack).desc,
          revTopic: dayDef.rev,
          pendingTasks,
          completedCount,
        });
      }
    }

    const estimatedHoursNeeded = Math.round(totalPendingTasks * 1.5 * 10) / 10;

    return {
      currentRoutineDay,
      backloggedDays,
      totalPendingTasks,
      estimatedHoursNeeded,
    };
  }, [myRoutine, activeTrack]);

  const hasBacklog = backlogData.totalPendingTasks > 0;

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div
        className={`rounded-3xl border p-5 sm:p-6 shadow-sm transition-all ${
          hasBacklog
            ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
            : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono">
              {hasBacklog ? (
                <span className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>BACKLOG ALERT</span>
                </span>
              ) : (
                <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% ON TRACK</span>
                </span>
              )}
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
              {hasBacklog
                ? `আপনার ${backlogData.totalPendingTasks}টি ব্যাকলগ টাস্ক রয়েছে`
                : 'অভিনন্দন! আপনার কোনো ব্যাকলগ নেই!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              {hasBacklog
                ? `আজকের রুটিন ডে ${backlogData.currentRoutineDay} পর্যন্ত জমে থাকা অসমাপ্ত টাস্কগুলো উদ্ধার করার স্মার্ট গাইড। হতাশার কিছু নেই, সিস্টেম্যাটিক প্ল্যানে মাত্র কয়েক দিনেই কভার সম্ভব!`
                : 'আপনি আজকের তারিখ অনুযায়ী রুটিনের সাথে সম্পূর্ণ তাল মিলিয়ে চলছেন। এই আগুন ধরে রাখুন!'}
            </p>
          </div>

          {hasBacklog && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-center shrink-0 min-w-[140px] shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                প্রয়োজনীয় সময়
              </div>
              <div className="font-mono-num text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                ~{backlogData.estimatedHoursNeeded} ঘণ্টা
              </div>
              <div className="text-[10px] text-slate-400">মোট অতিরিক্ত ফোকাস</div>
            </div>
          )}
        </div>
      </div>

      {/* Structured Recovery Plans */}
      {hasBacklog && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 3-Day Speed Rescue Mode */}
          <div className="rounded-2xl border-2 border-indigo-400 dark:border-indigo-700/80 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>প্ল্যান A: স্পিড রিকভারি</span>
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                ৩ দিনে শেষ
              </span>
            </div>

            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              দৈনিক +১ ঘণ্টা অতিরিক্ত ফোকাস
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              আজকের নিয়মিত পড়ার পর রাত বা সকালে মাত্র ১ ঘণ্টা আলাদা সময় নিয়ে প্রতিদিন{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {Math.ceil(backlogData.totalPendingTasks / 3)}টি
              </strong>{' '}
              করে ব্যাকলগ টাস্ক কভার করুন। ৩ দিনেই আপনি ব্যাকলগমুক্ত হবেন!
            </p>

            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 text-xs font-medium text-slate-700 dark:text-slate-300">
              🎯 <strong>কৌশল:</strong> শুধু মূল সূত্র ও বিগত ৫ বছরের ভার্সিটি প্রশ্ন সলভ করো, অপ্রয়োজনীয় বিস্তারিত এড়িয়ে যাও।
            </div>
          </div>

          {/* 7-Day Smooth Catch-up Mode */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>প্ল্যান B: স্মুথ ব্যালান্সড</span>
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ৭ দিনে শেষ
              </span>
            </div>

            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              দৈনিক +৩০ মিনিট অতিরিক্ত ফোকাস
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              চাপ না নিয়ে প্রতিদিন নিয়মিত রুটিনের সাথে মাত্র আধা ঘণ্টা অতিরিক্ত দিয়ে প্রতিদিন{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">১-২টি</strong> করে
              পেন্ডিং টাস্ক শেষ করুন। শুক্রবারের কাভার-আপ ডে-তে বাকিটুকু ফিনিশ করুন।
            </p>

            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 text-xs font-medium text-slate-700 dark:text-slate-300">
              💡 <strong>কৌশল:</strong> কোনো চাপ ছাড়া স্পেসড রিভিশন স্লটে ব্যাকলগ ঢুকিয়ে দিন।
            </div>
          </div>
        </div>
      )}

      {/* List of Backlog Days */}
      {hasBacklog && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>যেসব দিনের কাজ এখনো বাকি আছে ({backlogData.backloggedDays.length} দিন)</span>
            </h3>
          </div>

          <div className="space-y-2.5 pt-1">
            {backlogData.backloggedDays.map((item) => (
              <div
                key={item.dayNum}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                      Day {String(item.dayNum).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      • {item.date}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      {item.completedCount}/3 সম্পন্ন
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {item.pendingTasks.includes('main') && (
                      <span className="mr-2 text-rose-600 dark:text-rose-400">
                        • মূল: {item.mainTopic}
                      </span>
                    )}
                    {item.pendingTasks.includes('eng') && (
                      <span className="mr-2 text-sky-600 dark:text-sky-400">
                        • ইংরেজি/বায়ো: {item.secondaryTopic}
                      </span>
                    )}
                    {item.pendingTasks.includes('rev') && (
                      <span className="text-violet-600 dark:text-violet-400">
                        • রিভিশন: {item.revTopic}
                      </span>
                    )}
                  </div>
                </div>

                {onNavigateToDay && (
                  <button
                    type="button"
                    onClick={() => onNavigateToDay(item.dayNum)}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <span>টাস্কে যান</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
