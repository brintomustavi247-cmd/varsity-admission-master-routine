import { useMemo } from 'react';
import { Award, Lock, Sparkles, CheckCircle2, Trophy, Star } from 'lucide-react';
import { computeBadges, type BadgeEvaluationInput } from '../data/achievementBadges';

interface BadgesMilestonesProps {
  input: BadgeEvaluationInput;
}

export function BadgesMilestonesView({ input }: BadgesMilestonesProps) {
  const badges = useMemo(() => computeBadges(input), [input]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 text-xs font-bold font-mono">
            <Trophy className="w-3.5 h-3.5" />
            <span>HALL OF AURA & MILESTONES</span>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
            {unlockedCount} / {badges.length} আনলকড
          </span>
        </div>

        <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
          আপনার অর্জিত মেডেল ও অ্যাচিভমেন্ট
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          প্রতিদিনের রুটিন সম্পন্ন, স্ট্রিক ধরে রাখা এবং অধ্যবসায়ের স্বীকৃতিস্বরূপ এই ব্যাজগুলো আপনার জন্য প্রস্তুত!
        </p>

        {/* Total Progress Bar */}
        <div className="pt-2">
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-500"
              style={{ width: `${Math.round((unlockedCount / badges.length) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {badges.map((badge) => {
          const pct = Math.min(
            100,
            Math.round((badge.currentCount / badge.requiredCount) * 100)
          );

          return (
            <div
              key={badge.id}
              className={`rounded-2xl border p-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                badge.unlocked
                  ? 'border-amber-300 dark:border-amber-700/80 bg-gradient-to-br from-amber-50/50 to-orange-50/20 dark:from-amber-950/20 dark:to-slate-900 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-75'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                      badge.unlocked
                        ? 'bg-amber-100 dark:bg-amber-900/60 ring-2 ring-amber-400/50'
                        : 'bg-slate-200 dark:bg-slate-800 grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  {badge.unlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>অর্জিত</span>
                    </span>
                  ) : (
                    <span className="p-1 rounded-full text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Progress Bar for Locked */}
              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className="text-slate-400">অগ্রগতি:</span>
                  <span
                    className={
                      badge.unlocked
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }
                  >
                    {badge.currentCount} / {badge.requiredCount} ({pct}%)
                  </span>
                </div>
                {!badge.unlocked && (
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
