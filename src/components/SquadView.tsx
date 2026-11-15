import { Flame, Medal, Users } from 'lucide-react';
import { getChapterCountForTrack, getRankInfo } from '../data/routineData';
import type { SquadMemberProgress } from '../types/study';
import { UserAvatar } from './AvatarStack';

interface SquadViewProps {
  squadMembers: SquadMemberProgress[];
  currentUid: string;
}

export function SquadView({ squadMembers, currentUid }: SquadViewProps) {
  const sorted = [...squadMembers].sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    return b.daysDone - a.daysDone;
  });

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
              স্কোয়াড লিডারবোর্ড ও লাইভ অগ্রগতি
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            মোট সদস্য: <strong className="font-mono-num text-slate-800 dark:text-slate-200">{sorted.length}</strong> জন
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            স্কোয়াডে এখনো কোনো সদস্যের ডেটা লোড হয়নি।
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((member, index) => {
              const isMe = member.uid === currentUid;
              const rank = getRankInfo(member.xp);
              const routinePct = Math.round((member.daysDone / 61) * 100);

              return (
                <div
                  key={member.uid}
                  className={`rounded-xl border p-4 transition-colors ${
                    isMe
                      ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/25'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg font-mono-num text-xs font-bold flex items-center justify-center shrink-0 ${
                          index === 0
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                            : index === 1
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                            : index === 2
                            ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                            : 'bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <UserAvatar
                        displayName={member.displayName}
                        photoURL={member.photoURL}
                        size="lg"
                        ringClassName={
                          isMe
                            ? 'ring-2 ring-indigo-500'
                            : 'ring-2 ring-white dark:ring-slate-900'
                        }
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-50 truncate">
                            {member.displayName}
                          </span>
                          {isMe && (
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                              (আপনি)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <Medal className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>
                            Level {rank.level} · {rank.title} ·{' '}
                            <strong
                              className={
                                member.studyTrack === 'biology'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-sky-600 dark:text-sky-400'
                              }
                            >
                              {member.studyTrack === 'biology' ? 'জীববিজ্ঞান' : 'ইংরেজি'}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                      <div>
                        <div className="font-aura text-sm font-black text-[#FF1744] dark:text-[#FF2A55] tracking-wider justify-end drop-shadow-[0_0_8px_rgba(255,23,68,0.45)]">
                          {member.xp} AURA
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          মোট অরা
                        </div>
                      </div>

                      <div>
                        <div className="font-mono-num text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {member.daysDone}/61
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          দিন সম্পন্ন
                        </div>
                      </div>

                      <div>
                        <div className="font-mono-num text-sm font-bold text-slate-800 dark:text-slate-200">
                          {member.chapsDone}/{getChapterCountForTrack(member.studyTrack)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          অধ্যায়
                        </div>
                      </div>

                      <div>
                        <div className="font-mono-num text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-end">
                          <Flame className="w-3.5 h-3.5" />
                          {member.streak}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          স্ট্রিক
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-300"
                      style={{ width: `${routinePct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
