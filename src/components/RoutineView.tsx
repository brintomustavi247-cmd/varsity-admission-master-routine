import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Dna,
  Globe,
  RefreshCw,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  ROUTINE_DATA,
  getPhaseInfo,
  getSecondaryTaskInfo,
  getTypeMeta,
  getWeekday,
  isDayCompleted,
  routineTaskKey,
} from '../data/routineData';
import type {
  RoutineDay,
  RoutineTaskField,
  SquadMemberProgress,
  StudyTrack,
} from '../types/study';
import { TaskCompleterAvatars } from './AvatarStack';

interface RoutineViewProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  studyTrack: StudyTrack;
  todayISO: string;
  myRoutine: Record<string, boolean>;
  squadMembers: SquadMemberProgress[];
  currentUid: string;
  resumeDayNumber: number;
  mobileFiltersOpen?: boolean;
  jumpToDayRequest?: { day: number; nonce: number } | null;
  onToggleTask: (
    day: RoutineDay,
    field: RoutineTaskField,
    buttonEl: HTMLElement | null
  ) => void;
  onReplayCelebration?: (day: RoutineDay) => void;
}

type FilterMode = 'all' | 'pending' | 'tests' | 'done';

export function RoutineView({
  searchQuery,
  onSearchChange,
  studyTrack,
  todayISO,
  myRoutine,
  squadMembers,
  currentUid,
  resumeDayNumber,
  mobileFiltersOpen = false,
  jumpToDayRequest = null,
  onToggleTask,
  onReplayCelebration,
}: RoutineViewProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showEarlierDays, setShowEarlierDays] = useState(false);
  const [floatingXpKey, setFloatingXpKey] = useState<string | null>(null);
  const [justCompletedDay, setJustCompletedDay] = useState<number | null>(null);
  const dayRefs = useRef<Record<number, HTMLElement | null>>({});

  const todayDay = useMemo(
    () => ROUTINE_DATA.find((d) => d.iso === todayISO) ?? null,
    [todayISO]
  );

  const focusDayNumber = useMemo(() => {
    if (todayDay) return todayDay.d;
    const firstPending = ROUTINE_DATA.find(
      (d) => !isDayCompleted(myRoutine, d.d)
    );
    return firstPending?.d ?? 1;
  }, [todayDay, myRoutine]);

  const pivotDayNumber = todayDay ? todayDay.d : resumeDayNumber;

  const scrollToDay = (dayNum: number) => {
    setFilterMode('all');
    if (dayNum < pivotDayNumber) {
      setShowEarlierDays(true);
    }
    window.setTimeout(() => {
      const el = dayRefs.current[dayNum];
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 70);
  };

  useEffect(() => {
    if (!jumpToDayRequest) return;
    scrollToDay(jumpToDayRequest.day);
  }, [jumpToDayRequest]);

  const isDefaultAllFeed = filterMode === 'all' && !searchQuery.trim();

  const earlierDays = useMemo(() => {
    if (!isDefaultAllFeed || pivotDayNumber <= 1) return [];
    return ROUTINE_DATA.filter((d) => d.d < pivotDayNumber);
  }, [isDefaultAllFeed, pivotDayNumber]);

  const earlierPendingCount = useMemo(
    () => earlierDays.filter((d) => !isDayCompleted(myRoutine, d.d)).length,
    [earlierDays, myRoutine]
  );

  const upcomingDays = useMemo(() => {
    if (!isDefaultAllFeed) return [];
    if (todayDay) {
      return ROUTINE_DATA.filter((d) => d.d > todayDay.d);
    }
    return ROUTINE_DATA.filter((d) => d.d >= pivotDayNumber);
  }, [isDefaultAllFeed, todayDay, pivotDayNumber]);

  const filteredDays = useMemo(() => {
    if (isDefaultAllFeed) return [];
    const q = searchQuery.trim().toLowerCase();
    return ROUTINE_DATA.filter((day) => {
      if (q) {
        const secondary = getSecondaryTaskInfo(day, studyTrack);
        const hay = `${day.main} ${secondary.desc} ${day.rev} ${day.date} day ${day.d}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const dayDone = isDayCompleted(myRoutine, day.d);
      if (filterMode === 'done' && !dayDone) return false;
      if (filterMode === 'pending' && dayDone) return false;
      if (
        filterMode === 'tests' &&
        day.type !== 'test' &&
        day.type !== 'model' &&
        day.type !== 'buffer'
      ) {
        return false;
      }
      return true;
    });
  }, [isDefaultAllFeed, searchQuery, studyTrack, myRoutine, filterMode]);

  const getCompleters = (dayId: number, field: RoutineTaskField) => {
    const key = routineTaskKey(dayId, field);
    return squadMembers.filter((member) => Boolean(member.routine?.[key]));
  };

  const handleTaskClick = (
    day: RoutineDay,
    field: RoutineTaskField,
    buttonEl: HTMLElement | null
  ) => {
    const key = routineTaskKey(day.d, field);
    const wasDone = Boolean(myRoutine[key]);
    if (!wasDone) {
      setFloatingXpKey(`${key}_${Date.now()}`);
      const m =
        field === 'main' ? true : Boolean(myRoutine[routineTaskKey(day.d, 'main')]);
      const e =
        field === 'eng' ? true : Boolean(myRoutine[routineTaskKey(day.d, 'eng')]);
      const r =
        field === 'rev' ? true : Boolean(myRoutine[routineTaskKey(day.d, 'rev')]);
      if (m && e && r) {
        setJustCompletedDay(day.d);
        window.setTimeout(() => {
          setJustCompletedDay((prev) => (prev === day.d ? null : prev));
        }, 1400);
      }
    }
    onToggleTask(day, field, buttonEl);
  };

  const renderDayCard = (
    day: RoutineDay,
    options?: {
      showPhaseHeader?: boolean;
      isFirstInList?: boolean;
      phaseTracker?: { lastPhaseId: string };
    }
  ) => {
    const showPhaseHeader = Boolean(options?.showPhaseHeader);
    const phaseInfo = getPhaseInfo(day.d);
    let shouldRenderPhase = false;
    if (showPhaseHeader && options?.phaseTracker) {
      shouldRenderPhase = phaseInfo.id !== options.phaseTracker.lastPhaseId;
      if (shouldRenderPhase) {
        options.phaseTracker.lastPhaseId = phaseInfo.id;
      }
    }

    let phaseDoneCount = 0;
    const phaseTotalCount = phaseInfo.endDay - phaseInfo.startDay + 1;
    if (shouldRenderPhase) {
      for (let p = phaseInfo.startDay; p <= phaseInfo.endDay; p++) {
        if (isDayCompleted(myRoutine, p)) phaseDoneCount++;
      }
    }
    const phasePct = Math.round((phaseDoneCount / phaseTotalCount) * 100);

    const mainDone = Boolean(myRoutine[routineTaskKey(day.d, 'main')]);
    const engDone = Boolean(myRoutine[routineTaskKey(day.d, 'eng')]);
    const revDone = Boolean(myRoutine[routineTaskKey(day.d, 'rev')]);
    const doneCount = [mainDone, engDone, revDone].filter(Boolean).length;
    const allDone = doneCount === 3;
    const isToday = day.iso === todayISO;
    const meta = getTypeMeta(day.type);
    const celebratingCard = justCompletedDay === day.d;

    const secondaryTask = getSecondaryTaskInfo(day, studyTrack);
    const isBio = studyTrack === 'biology';

    const tasks = [
      {
        field: 'main' as const,
        Icon: BookOpen,
        iconBoxCls:
          'bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
        titleCls: 'text-indigo-600 dark:text-indigo-400',
        title: 'মূল অধ্যায়',
        desc: day.main,
        done: mainDone,
      },
      {
        field: 'eng' as const,
        Icon: isBio ? Dna : Globe,
        iconBoxCls: isBio
          ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
          : 'bg-sky-100/80 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
        titleCls: isBio
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-sky-600 dark:text-sky-400',
        title: secondaryTask.title,
        desc: secondaryTask.desc,
        done: engDone,
      },
      {
        field: 'rev' as const,
        Icon: RefreshCw,
        iconBoxCls:
          'bg-rose-100/80 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
        titleCls: 'text-rose-600 dark:text-rose-400',
        title: 'স্পেসড রিভিশন (৩০ মিনিট)',
        desc: day.rev,
        done: revDone,
      },
    ];

    return (
      <div
        key={day.d}
        className="scroll-mt-16"
        ref={(el) => {
          dayRefs.current[day.d] = el;
        }}
      >
        {shouldRenderPhase && (
          <div
            className={`${
              options?.isFirstInList ? 'mt-0' : 'mt-5'
            } mb-3.5 rounded-2xl bg-gradient-to-r ${phaseInfo.gradientCls} px-5 py-3.5 text-white shadow-md shadow-indigo-500/15`}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="font-display font-extrabold text-sm sm:text-base tracking-tight">
                {phaseInfo.title}
              </div>
              <div className="font-mono-num text-xs font-bold text-white/90">
                {phaseDoneCount}/{phaseTotalCount} দিন সম্পন্ন ({phasePct}%)
              </div>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: `${phasePct}%` }}
              />
            </div>
          </div>
        )}

                <motion.article
                  animate={
                    celebratingCard ? { scale: [1, 1.012, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative overflow-hidden rounded-[22px] border bg-white dark:bg-slate-900 shadow-[0_8px_24px_rgba(37,99,235,0.06)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-colors ${
                    isToday
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : allDone
                      ? 'border-emerald-300 dark:border-emerald-800/80'
                      : meta.cardBorderCls
                  }`}
                >
                  {/* Silky Blue Aurora Shimmer Sweep when Day hits 3/3 */}
                  {celebratingCard && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-sky-300/35 dark:via-sky-400/25 to-transparent animate-celebration-shimmer z-20"
                    />
                  )}

                  {/* Colored Header Strip */}
                  <div
                    className={`px-4 sm:px-5 py-3.5 flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 dark:border-slate-800/80 ${
                      allDone
                        ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-sky-50/70 dark:from-emerald-950/45 dark:via-teal-950/30 dark:to-sky-950/30'
                        : meta.headerBgCls
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-wrap text-sm">
                      <span
                        className={`font-mono-num font-extrabold text-sm sm:text-base ${
                          allDone
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : meta.dayColorCls
                        }`}
                      >
                        Day {String(day.d).padStart(2, '0')}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-slate-300 dark:text-slate-700"
                      >
                        ·
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {day.date}, {getWeekday(day.iso)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-slate-300 dark:text-slate-700"
                      >
                        ·
                      </span>
                      <span className={`text-xs font-extrabold ${meta.textCls}`}>
                        {meta.label}
                      </span>
                      {isToday && (
                        <>
                          <span
                            aria-hidden="true"
                            className="text-slate-300 dark:text-slate-700"
                          >
                            ·
                          </span>
                          <span className="text-xs font-extrabold text-blue-600 dark:text-sky-400">
                            আজকের মিশন
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <AnimatePresence mode="wait">
                        {allDone ? (
                          <motion.button
                            key="done"
                            type="button"
                            onClick={() => onReplayCelebration?.(day)}
                            title="সেলিব্রেশন অ্যানিমেশন দেখুন"
                            initial={{ scale: 0.88, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.88, opacity: 0 }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 hover:text-blue-700 dark:hover:text-sky-300 cursor-pointer"
                          >
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <span>মিশন সম্পন্ন! +50 Bonus XP</span>
                          </motion.button>
                        ) : (
                          <motion.div
                            key="count"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-mono-num text-xs font-extrabold text-slate-500 dark:text-slate-400"
                          >
                            {doneCount}/3
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Per-Day Progress Bar */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 bg-gradient-to-r ${
                        allDone
                          ? 'from-emerald-500 via-teal-400 to-sky-500'
                          : meta.barGradientCls
                      }`}
                      style={{ width: `${Math.round((doneCount / 3) * 100)}%` }}
                    />
                  </div>

                  {/* 3 Color-Coded Daily Tasks */}
                  <div className="divide-y divide-dashed divide-slate-200/90 dark:divide-slate-800">
                    {tasks.map((task) => {
                      const taskKey = routineTaskKey(day.d, task.field);
                      const completers = getCompleters(day.d, task.field);
                      const showFloatXp =
                        floatingXpKey && floatingXpKey.startsWith(`${taskKey}_`);
                      const Icon = task.Icon;

                      return (
                        <div
                          key={task.field}
                          className={`px-4 sm:px-5 py-3.5 flex items-start gap-3.5 transition-colors ${
                            task.done
                              ? 'bg-gradient-to-r from-emerald-50/45 via-sky-50/25 to-transparent dark:from-emerald-950/20 dark:via-sky-950/10 dark:to-transparent'
                              : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              task.done
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : task.iconBoxCls
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-[11px] font-extrabold tracking-wide ${
                                task.done
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : task.titleCls
                              }`}
                            >
                              {task.title}
                            </div>
                            <div
                              className={`mt-0.5 text-sm sm:text-[15px] font-semibold leading-relaxed transition-colors ${
                                task.done
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {task.desc}
                            </div>
                          </div>

                          <div className="relative flex items-center gap-2.5 shrink-0 pt-0.5">
                            {showFloatXp && (
                              <span
                                key={floatingXpKey}
                                aria-hidden="true"
                                className="pointer-events-none absolute -top-6 right-0 z-20 inline-flex items-center gap-0.5 text-xs font-extrabold text-sky-600 dark:text-sky-400 whitespace-nowrap animate-float-xp"
                              >
                                <Sparkles className="w-3 h-3" />
                                +20 XP
                              </span>
                            )}

                            <TaskCompleterAvatars
                              completers={completers}
                              currentUid={currentUid}
                            />

                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.85 }}
                              onClick={(e) =>
                                handleTaskClick(day, task.field, e.currentTarget)
                              }
                              aria-label={`${day.date} - ${task.title} ${
                                task.done ? 'অসম্পন্ন করুন' : 'সম্পন্ন করুন'
                              }`}
                              aria-pressed={task.done}
                              className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                task.done
                                  ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 border-transparent text-white shadow-sm shadow-blue-500/30'
                                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-transparent hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </motion.button>
                          </div>
                        </div>
                      );
                    })}
          </div>
        </motion.article>
      </div>
    );
  };

  const upcomingPhaseTracker = { lastPhaseId: '' };

  return (
    <div className="space-y-3">
      {/* Mobile Expandable Search & Filter Drawer (only shown when toggled from top search icon) */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="sm:hidden space-y-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="অধ্যায় / টপিক সার্চ করুন..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              {(
                [
                  { id: 'all', label: 'সব' },
                  { id: 'pending', label: 'বাকি' },
                  { id: 'tests', label: 'টেস্ট' },
                  { id: 'done', label: 'সম্পন্ন' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilterMode(item.id)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap text-center cursor-pointer ${
                    filterMode === item.id
                      ? 'bg-gradient-to-r from-[#4F46E5] to-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Filter & Focus Jump Bar */}
      <div className="hidden sm:flex items-center justify-between gap-2 flex-wrap">
        <div
          role="group"
          aria-label="রুটিন ফিল্টার"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
        >
          {(
            [
              { id: 'all', label: 'সব' },
              { id: 'pending', label: 'বাকি' },
              { id: 'tests', label: 'টেস্ট' },
              { id: 'done', label: 'সম্পন্ন' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilterMode(item.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap text-center cursor-pointer ${
                filterMode === item.id
                  ? 'bg-gradient-to-r from-[#4F46E5] to-blue-600 text-white shadow-xs shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollToDay(focusDayNumber)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800/70 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/50 dark:to-indigo-950/50 text-xs font-bold text-blue-700 dark:text-sky-300 hover:border-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
        >
          <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Day {String(focusDayNumber).padStart(2, '0')} এ যান</span>
        </button>
      </div>

      {isDefaultAllFeed ? (
        <div className="space-y-4">
          {/* Today's Real-Time Matched Mission pinned right at the front */}
          {todayDay && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 px-1 text-xs font-extrabold text-blue-700 dark:text-sky-400">
                <span>
                  আজকের মিশন · {todayDay.date}, {getWeekday(todayDay.iso)}
                </span>
                <span className="font-mono-num text-slate-500 dark:text-slate-400">
                  Day {String(todayDay.d).padStart(2, '0')}
                </span>
              </div>
              {renderDayCard(todayDay)}
            </div>
          )}

          {/* Collapsible Earlier Days (already completed or before today) */}
          {earlierDays.length > 0 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowEarlierDays((prev) => !prev)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-2 min-w-0 truncate">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      earlierPendingCount === 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-500'
                    }`}
                  />
                  <span className="truncate">
                    পূর্ববর্তী {earlierDays.length}টি দিন (Day 01–
                    {String(earlierDays.length).padStart(2, '0')})
                    {earlierPendingCount > 0
                      ? ` · ${earlierPendingCount}টি বাকি`
                      : ' · সব সম্পন্ন'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 shrink-0 text-[11px] text-[#4F46E5] dark:text-[#818CF8]">
                  <span>{showEarlierDays ? 'লুকান' : 'দেখুন'}</span>
                  {showEarlierDays ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </span>
              </button>

              {showEarlierDays && (
                <div className="space-y-4">
                  {earlierDays.map((day, idx) =>
                    renderDayCard(day, {
                      showPhaseHeader: false,
                      isFirstInList: idx === 0,
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upcoming / Remaining Routine Days */}
          {upcomingDays.map((day, idx) =>
            renderDayCard(day, {
              showPhaseHeader: true,
              isFirstInList: !todayDay && idx === 0,
              phaseTracker: upcomingPhaseTracker,
            })
          )}
        </div>
      ) : filteredDays.length === 0 ? (
        <div className="rounded-[22px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          কোনো রুটিন খুঁজে পাওয়া যায়নি।
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDays.map((day) => renderDayCard(day))}
        </div>
      )}
    </div>
  );
}
