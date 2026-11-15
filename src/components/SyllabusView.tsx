import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { getSyllabusForTrack, syllabusStepKey } from '../data/routineData';
import type {
  SquadMemberProgress,
  StudyTrack,
  SyllabusStepField,
} from '../types/study';
import { TaskCompleterAvatars } from './AvatarStack';

interface SyllabusViewProps {
  studyTrack: StudyTrack;
  mySyllabus: Record<string, boolean>;
  squadMembers: SquadMemberProgress[];
  currentUid: string;
  onToggleStep: (
    subject: string,
    chapIndex: number,
    chapName: string,
    step: SyllabusStepField,
    buttonEl: HTMLElement | null
  ) => void;
}

const STEPS: Array<{ key: SyllabusStepField; label: string }> = [
  { key: 't', label: 'থিওরি' },
  { key: 'b', label: 'ব্যাংক' },
  { key: 'r1', label: 'রিভিশন ১' },
  { key: 'r2', label: 'রিভিশন ২' },
];

const SUBJECT_THEMES = [
  {
    headerBg: 'bg-indigo-50/60 dark:bg-indigo-950/25',
    border: 'border-indigo-200/80 dark:border-indigo-900/60',
    accent: 'text-indigo-600 dark:text-indigo-400',
    bar: 'from-indigo-600 to-sky-500',
  },
  {
    headerBg: 'bg-sky-50/60 dark:bg-sky-950/25',
    border: 'border-sky-200/80 dark:border-sky-900/60',
    accent: 'text-sky-600 dark:text-sky-400',
    bar: 'from-sky-600 to-cyan-500',
  },
  {
    headerBg: 'bg-emerald-50/60 dark:bg-emerald-950/25',
    border: 'border-emerald-200/80 dark:border-emerald-900/60',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bar: 'from-emerald-600 to-teal-500',
  },
  {
    headerBg: 'bg-teal-50/60 dark:bg-teal-950/25',
    border: 'border-teal-200/80 dark:border-teal-900/60',
    accent: 'text-teal-600 dark:text-teal-400',
    bar: 'from-teal-600 to-emerald-500',
  },
  {
    headerBg: 'bg-violet-50/60 dark:bg-violet-950/25',
    border: 'border-violet-200/80 dark:border-violet-900/60',
    accent: 'text-violet-600 dark:text-violet-400',
    bar: 'from-violet-600 to-indigo-500',
  },
  {
    headerBg: 'bg-amber-50/60 dark:bg-amber-950/25',
    border: 'border-amber-200/80 dark:border-amber-900/60',
    accent: 'text-amber-600 dark:text-amber-400',
    bar: 'from-amber-500 to-orange-500',
  },
  {
    headerBg: 'bg-lime-50/60 dark:bg-lime-950/25',
    border: 'border-lime-200/80 dark:border-lime-900/60',
    accent: 'text-lime-700 dark:text-lime-400',
    bar: 'from-lime-600 to-emerald-500',
  },
  {
    headerBg: 'bg-cyan-50/60 dark:bg-cyan-950/25',
    border: 'border-cyan-200/80 dark:border-cyan-900/60',
    accent: 'text-cyan-700 dark:text-cyan-400',
    bar: 'from-cyan-600 to-blue-600',
  },
];

export function SyllabusView({
  studyTrack,
  mySyllabus,
  squadMembers,
  currentUid,
  onToggleStep,
}: SyllabusViewProps) {
  const subjects = Object.entries(getSyllabusForTrack(studyTrack));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [floatingXpKey, setFloatingXpKey] = useState<string | null>(null);

  const toggleCollapse = (subject: string) => {
    setCollapsed((prev) => ({ ...prev, [subject]: !prev[subject] }));
  };

  let runningIndex = 0;

  return (
    <div className="space-y-4">
      {subjects.map(([subject, chapters], subjectIdx) => {
        const startIndex = runningIndex;
        runningIndex += chapters.length;
        const theme = SUBJECT_THEMES[subjectIdx % SUBJECT_THEMES.length];

        let doneSteps = 0;
        chapters.forEach((_, offset) => {
          const idx = startIndex + offset;
          STEPS.forEach((st) => {
            if (mySyllabus[syllabusStepKey(idx, st.key)]) doneSteps++;
          });
        });

        const pct = Math.round((doneSteps / (chapters.length * 4)) * 100);
        const isClosed = Boolean(collapsed[subject]);

        return (
          <section
            key={subject}
            className={`rounded-[20px] border ${theme.border} bg-white dark:bg-slate-900 overflow-hidden shadow-[0_6px_22px_rgba(79,70,229,0.05)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]`}
          >
            <button
              type="button"
              onClick={() => toggleCollapse(subject)}
              className={`w-full px-5 py-4 flex items-center justify-between gap-4 text-left ${theme.headerBg} hover:opacity-95 transition-opacity cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span aria-hidden="true" className="text-lg shrink-0">
                  📖
                </span>
                <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-50 truncate">
                  {subject}
                </h3>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-mono-num text-sm font-extrabold ${theme.accent}`}>
                  {pct}%
                </span>
                {isClosed ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${theme.bar} transition-all duration-300`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {!isClosed && (
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                {chapters.map((chapName, offset) => {
                  const chapIndex = startIndex + offset;
                  const chapFullyDone = STEPS.every((st) =>
                    Boolean(mySyllabus[syllabusStepKey(chapIndex, st.key)])
                  );

                  const chapMasters = squadMembers.filter((m) =>
                    STEPS.every((st) =>
                      Boolean(m.syllabus?.[syllabusStepKey(chapIndex, st.key)])
                    )
                  );

                  return (
                    <div
                      key={chapIndex}
                      className={`rounded-2xl border p-3.5 transition-colors ${
                        chapFullyDone
                          ? 'border-emerald-300 dark:border-emerald-800/70 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {chapName}
                        </div>
                        <TaskCompleterAvatars
                          completers={chapMasters}
                          currentUid={currentUid}
                          compact
                        />
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {STEPS.map((st) => {
                          const sKey = syllabusStepKey(chapIndex, st.key);
                          const active = Boolean(mySyllabus[sKey]);
                          const stepCompleters = squadMembers.filter((m) =>
                            Boolean(m.syllabus?.[sKey])
                          );
                          const showFloatXp =
                            floatingXpKey && floatingXpKey.startsWith(`${sKey}_`);

                          return (
                            <div
                              key={st.key}
                              className="relative inline-flex items-center gap-1"
                            >
                              {showFloatXp && (
                                <span
                                  key={floatingXpKey}
                                  aria-hidden="true"
                                  className="pointer-events-none absolute -top-5 left-2 z-20 inline-flex items-center gap-0.5 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap animate-float-xp"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  +15 XP
                                </span>
                              )}

                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.92 }}
                                onClick={(e) => {
                                  if (!active) {
                                    setFloatingXpKey(`${sKey}_${Date.now()}`);
                                  }
                                  onToggleStep(
                                    subject,
                                    chapIndex,
                                    chapName,
                                    st.key,
                                    e.currentTarget
                                  );
                                }}
                                aria-pressed={active}
                                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                  active
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-xs shadow-emerald-500/25'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                                }`}
                              >
                                <span>{st.label}</span>
                                {stepCompleters.length > 0 && (
                                  <span
                                    className={`font-mono-num text-[10px] ${
                                      active
                                        ? 'text-emerald-100'
                                        : 'text-slate-400 dark:text-slate-500'
                                    }`}
                                  >
                                    ({stepCompleters.length})
                                  </span>
                                )}
                              </motion.button>
                              {stepCompleters.length > 0 && (
                                <TaskCompleterAvatars
                                  completers={stepCompleters}
                                  currentUid={currentUid}
                                  compact
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
