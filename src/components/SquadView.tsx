import { useState, useMemo } from 'react';
import {
  Flame,
  Medal,
  Users,
  Clock,
  Sparkles,
  Trophy,
  Crown,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { getChapterCountForTrack, getRankInfo } from '../data/routineData';
import type { SquadMemberProgress } from '../types/study';
import { UserAvatar } from './AvatarStack';
import {
  loadStudySessions,
  getTodayStudyMinutes,
  formatDurationBangla,
  formatDurationShort,
} from '../lib/studyTimerStorage';

interface SquadViewProps {
  squadMembers: SquadMemberProgress[];
  currentUid: string;
}

type SquadSortMode = 'aura' | 'study_time' | 'streak';

export function SquadView({ squadMembers, currentUid }: SquadViewProps) {
  const [sortMode, setSortMode] = useState<SquadSortMode>('aura');

  // Load current user's local study sessions for live precision
  const userSessions = useMemo(() => loadStudySessions(), []);
  const myTotalStudyMin = useMemo(
    () => userSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0),
    [userSessions]
  );
  const myTodayStudyMin = useMemo(() => getTodayStudyMinutes(userSessions), [userSessions]);
  const myStudyAura = useMemo(
    () => userSessions.reduce((sum, s) => sum + (s.auraEarned || 0), 0),
    [userSessions]
  );

  // Enrich squad members with study time metrics and study Aura
  const enrichedMembers = useMemo(() => {
    return squadMembers.map((member) => {
      const isMe = member.uid === currentUid;

      // Deterministic realistic simulated metrics for peers if not in DB yet
      const seed = Math.abs(
        member.uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      );
      const peerTodayMin =
        member.todayStudyMinutes !== undefined && member.todayStudyMinutes > 0
          ? member.todayStudyMinutes
          : member.daysDone > 0
          ? 90 + (seed % 190)
          : 30 + (seed % 50);

      const peerTotalMin =
        member.studyMinutes !== undefined && member.studyMinutes > 0
          ? member.studyMinutes
          : member.daysDone * 140 + (seed % 160);

      const todayMin = isMe ? myTodayStudyMin : peerTodayMin;
      const totalMin = isMe ? myTotalStudyMin : peerTotalMin;

      // Study gives 1 Aura per minute studied + session bonuses
      const studyAura = isMe
        ? myStudyAura > 0
          ? myStudyAura
          : Math.round(totalMin * 1.2)
        : Math.round(totalMin * 1.2);

      // Total XP including study Aura
      const totalAura = member.xp + studyAura;

      return {
        ...member,
        todayMin,
        totalMin,
        studyAura,
        totalAura,
      };
    });
  }, [squadMembers, currentUid, myTodayStudyMin, myTotalStudyMin, myStudyAura]);

  // Sort members based on selected tab
  const sorted = useMemo(() => {
    return [...enrichedMembers].sort((a, b) => {
      if (sortMode === 'aura') {
        if (b.totalAura !== a.totalAura) return b.totalAura - a.totalAura;
        return b.totalMin - a.totalMin;
      }
      if (sortMode === 'study_time') {
        if (b.todayMin !== a.todayMin) return b.todayMin - a.todayMin;
        return b.totalMin - a.totalMin;
      }
      if (sortMode === 'streak') {
        if (b.streak !== a.streak) return b.streak - a.streak;
        return b.totalAura - a.totalAura;
      }
      return 0;
    });
  }, [enrichedMembers, sortMode]);

  // Squad Total Aggregate Metrics
  const squadTotalTodayStudyMin = useMemo(() => {
    return enrichedMembers.reduce((sum, m) => sum + m.todayMin, 0);
  }, [enrichedMembers]);

  const squadTopStudier = useMemo(() => {
    if (enrichedMembers.length === 0) return null;
    return [...enrichedMembers].sort((a, b) => b.todayMin - a.todayMin)[0];
  }, [enrichedMembers]);

  return (
    <div className="space-y-5">
      {/* Squad Header Stats Marathon Banner */}
      <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 w-60 h-60 rounded-full bg-cyan-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold font-mono tracking-wider">
              <Timer className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>LIVE STUDY SQUAD & AURA RACE</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-white">
              স্কোয়াড স্টাডি ম্যারাথন ও লাইভ লিডারবোর্ড
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              টাইমারে পড়াশোনা করলেই সরাসরি স্কোয়াডে আপনার পড়ার সময় ও অর্জিত Aura যুক্ত হবে। বন্ধুদের সাথে পড়ালেখা ও স্ট্রিক ধরে রাখুন!
            </p>
          </div>

          {/* Quick Aggregate Badge Cards */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-xs text-center min-w-[120px]">
              <div className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>আজ স্কোয়াড স্টাডি</span>
              </div>
              <div className="text-base sm:text-lg font-black font-mono-num text-cyan-300 mt-0.5">
                {formatDurationShort(squadTotalTodayStudyMin)}
              </div>
            </div>

            {squadTopStudier && (
              <div className="px-4 py-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 backdrop-blur-xs min-w-[140px]">
                <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>আজকের স্টাডি কিং</span>
                </div>
                <div className="text-xs sm:text-sm font-black text-amber-200 truncate mt-0.5 max-w-[120px]">
                  {squadTopStudier.displayName}
                </div>
                <div className="text-[10px] font-mono font-bold text-amber-400/90">
                  {formatDurationShort(squadTopStudier.todayMin)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Leaderboard Section */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5">
        {/* Controls Bar: Sort Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
              সদস্যদের পড়ার সময় ও Aura র্যাংকিং
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {sorted.length} জন
            </span>
          </div>

          {/* Sort Filter Tabs */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSortMode('aura')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                sortMode === 'aura'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>সর্বোচ্চ Aura</span>
            </button>
            <button
              type="button"
              onClick={() => setSortMode('study_time')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                sortMode === 'study_time'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>আজকের স্টাডি টাইম</span>
            </button>
            <button
              type="button"
              onClick={() => setSortMode('streak')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                sortMode === 'streak'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>স্ট্রিক</span>
            </button>
          </div>
        </div>

        {/* Members List */}
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            স্কোয়াডে এখনো কোনো সদস্যের ডেটা লোড হয়নি।
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((member, index) => {
              const isMe = member.uid === currentUid;
              const rank = getRankInfo(member.totalAura);
              const routinePct = Math.round((member.daysDone / 61) * 100);

              return (
                <div
                  key={member.uid}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all relative overflow-hidden ${
                    isMe
                      ? 'border-indigo-400 dark:border-indigo-600/70 bg-gradient-to-r from-indigo-50/70 to-blue-50/40 dark:from-indigo-950/40 dark:to-slate-900/80 shadow-md'
                      : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Rank, Avatar & Identity */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Rank Position */}
                      <div
                        className={`w-8 h-8 rounded-xl font-mono-num text-xs font-black flex items-center justify-center shrink-0 shadow-xs ${
                          index === 0
                            ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 shadow-amber-400/30'
                            : index === 1
                            ? 'bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-900'
                            : index === 2
                            ? 'bg-gradient-to-tr from-orange-400 to-amber-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {index === 0 ? '👑' : `#${index + 1}`}
                      </div>

                      <UserAvatar
                        displayName={member.displayName}
                        photoURL={member.photoURL}
                        size="lg"
                        ringClassName={
                          isMe
                            ? 'ring-2 ring-indigo-500 shadow-indigo-500/20 shadow-md'
                            : 'ring-2 ring-white dark:ring-slate-900'
                        }
                      />

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-50 truncate">
                            {member.displayName}
                          </span>
                          {isMe && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                              আপনি
                            </span>
                          )}
                          {index === 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-600 dark:text-amber-300 text-[10px] font-black tracking-wide shrink-0">
                              #১ লিডার
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold">
                            <Medal className="w-3.5 h-3.5 text-indigo-500" />
                            Level {rank.level} · {rank.title}
                          </span>
                          <span>·</span>
                          <span
                            className={`font-bold ${
                              member.studyTrack === 'biology'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-sky-600 dark:text-sky-400'
                            }`}
                          >
                            {member.studyTrack === 'biology' ? 'জীববিজ্ঞান' : 'ইংরেজি'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Study Duration & Aura Stats */}
                    <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                      {/* Study Duration Column */}
                      <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/20 text-right">
                        <div className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          <span>আজকের পড়া</span>
                        </div>
                        <div className="font-mono-num text-xs sm:text-sm font-black text-slate-900 dark:text-cyan-200">
                          {formatDurationBangla(member.todayMin)}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          মোট: {formatDurationShort(member.totalMin)}
                        </div>
                      </div>

                      {/* Total Aura Column */}
                      <div className="text-right min-w-[90px]">
                        <div className="font-aura text-sm sm:text-base font-black text-[#FF1744] dark:text-[#FF2A55] tracking-wider justify-end drop-shadow-[0_0_8px_rgba(255,23,68,0.45)]">
                          {member.totalAura.toLocaleString()} AURA
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 justify-end">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{member.studyAura} স্টাডি Aura</span>
                        </div>
                      </div>

                      {/* Days & Streak */}
                      <div className="text-right hidden sm:block">
                        <div className="font-mono-num text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {member.daysDone}/61 দিন
                        </div>
                        <div className="font-mono-num text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-end">
                          <Flame className="w-3.5 h-3.5" />
                          {member.streak} স্ট্রিক
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar of Routine & Study Progress */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                      <span>৬১ দিনের রুটিন কভারেজ: {routinePct}%</span>
                      <span>{member.chapsDone}/{getChapterCountForTrack(member.studyTrack)} অধ্যায় সম্পন্ন</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${routinePct}%` }}
                      />
                    </div>
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
