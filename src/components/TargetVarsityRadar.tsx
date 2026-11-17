import { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Calendar,
  AlertTriangle,
  Award,
  Sparkles,
  Edit3,
  Check,
  Calculator,
  Ban,
  Clock,
  BookOpen,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { TARGET_VARSITIES } from '../data/targetVarsities';
import type { TargetVarsityInfo, UserTargetVarsityGoal } from '../types/masterTools';

const GOAL_STORAGE_KEY = 'varsity_dream_target_v1';
const CUSTOM_DATES_STORAGE_KEY = 'varsity_custom_dates_v1';

function getDefaultMottoForVarsity(varsityName: string): string {
  return `${varsityName} আমার রক্তে, কোনো ফাঁকিবাজি নয়!`;
}

function formatExamDateBangla(isoString: string): string {
  try {
    const d = new Date(`${isoString}T00:00:00`);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function TargetVarsityRadar() {
  const [goal, setGoal] = useState<UserTargetVarsityGoal>(() => {
    try {
      const saved = localStorage.getItem(GOAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      varsityId: 'du_ka',
      dreamSubject: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (CSE)',
      targetRank: 'শীর্ষ ১০০ (Top 100)',
      personalMotto: 'ঢাকা বিশ্ববিদ্যালয় আমার রক্তে, কোনো ফাঁকিবাজি নয়!',
      updatedAt: new Date().toISOString(),
    };
  });

  const [customDatesMap, setCustomDatesMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_DATES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(goal.varsityId);
  const [dreamSubInput, setDreamSubInput] = useState(goal.dreamSubject);
  const [targetRankInput, setTargetRankInput] = useState(goal.targetRank);
  const [mottoInput, setMottoInput] = useState(goal.personalMotto);
  const [examDateInput, setExamDateInput] = useState('');

  // Live countdown state
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeVarsity: TargetVarsityInfo = useMemo(() => {
    return (
      TARGET_VARSITIES.find((v) => v.id === goal.varsityId) || TARGET_VARSITIES[0]
    );
  }, [goal.varsityId]);

  // Dynamic contextual motto matching the active university
  const displayMotto = useMemo(() => {
    if (!goal.personalMotto) {
      return getDefaultMottoForVarsity(activeVarsity.name);
    }
    // If the motto is an auto-generated motto containing a university name, make sure it matches activeVarsity
    if (goal.personalMotto.endsWith('আমার রক্তে, কোনো ফাঁকিবাজি নয়!')) {
      return getDefaultMottoForVarsity(activeVarsity.name);
    }
    // If the motto is from a different university (e.g. DU while looking at RU), adapt to activeVarsity
    if (activeVarsity.id !== 'du_ka' && goal.personalMotto.includes('ঢাকা বিশ্ববিদ্যালয়')) {
      return getDefaultMottoForVarsity(activeVarsity.name);
    }
    return goal.personalMotto;
  }, [goal.personalMotto, activeVarsity]);

  // Resolve effective exam date for the active varsity
  const effectiveDateISO = useMemo(() => {
    if (goal.customExamDate) return goal.customExamDate;
    if (customDatesMap[goal.varsityId]) return customDatesMap[goal.varsityId];
    return activeVarsity.targetDateISO;
  }, [goal.customExamDate, customDatesMap, goal.varsityId, activeVarsity.targetDateISO]);

  const hasCustomDate = Boolean(
    goal.customExamDate || customDatesMap[goal.varsityId]
  );

  // Calculate days, hours, mins remaining
  const countdown = useMemo(() => {
    const targetTime = new Date(`${effectiveDateISO}T09:00:00+06:00`).getTime();
    const diffMs = Math.max(0, targetTime - now);
    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / (24 * 3600));
    const hours = Math.floor((totalSec % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return { days, hours, minutes, seconds, diffMs };
  }, [effectiveDateISO, now]);

  const handleOpenEdit = () => {
    setSelectedId(goal.varsityId);
    setDreamSubInput(goal.dreamSubject);
    setTargetRankInput(goal.targetRank);
    setMottoInput(displayMotto);
    setExamDateInput(effectiveDateISO);
    setIsEditing(true);
  };

  const handleSaveGoal = () => {
    const targetV = TARGET_VARSITIES.find((v) => v.id === selectedId) || TARGET_VARSITIES[0];
    const finalDate = examDateInput.trim() || targetV.targetDateISO;

    const updated: UserTargetVarsityGoal = {
      varsityId: selectedId,
      dreamSubject: dreamSubInput.trim() || 'বিজ্ঞান অনুষদ',
      targetRank: targetRankInput.trim() || 'শীর্ষ ৫০০',
      personalMotto: mottoInput.trim() || 'আমি পারবোই!',
      customExamDate: finalDate !== targetV.targetDateISO ? finalDate : undefined,
      updatedAt: new Date().toISOString(),
    };
    setGoal(updated);
    try {
      localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Update custom dates map
    const updatedMap = { ...customDatesMap };
    if (finalDate !== targetV.targetDateISO) {
      updatedMap[selectedId] = finalDate;
    } else {
      delete updatedMap[selectedId];
    }
    setCustomDatesMap(updatedMap);
    try {
      localStorage.setItem(CUSTOM_DATES_STORAGE_KEY, JSON.stringify(updatedMap));
    } catch {}

    setIsEditing(false);
  };

  const handleResetToOfficialDate = () => {
    const targetV = TARGET_VARSITIES.find((v) => v.id === selectedId) || TARGET_VARSITIES[0];
    setExamDateInput(targetV.targetDateISO);
  };

  return (
    <div className="space-y-5">
      {/* Target Varsity Main Hero Card */}
      <div className="rounded-3xl border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-900/95 via-slate-900 to-slate-950 p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/25 border border-indigo-400/30 text-indigo-200 text-xs font-bold font-mono tracking-wider">
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>DREAM TARGET RADAR</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
                {activeVarsity.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold">
                {activeVarsity.unit}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 font-medium">
              কাঙ্ক্ষিত বিষয়: <strong className="text-cyan-300 underline underline-offset-4">{goal.dreamSubject}</strong>
            </p>
            <p className="text-xs text-slate-400 italic">
              &ldquo;{displayMotto}&rdquo;
            </p>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold text-slate-300">
                পরীক্ষার তারিখ:{' '}
                <strong className="text-cyan-300 underline underline-offset-2">
                  {formatExamDateBangla(effectiveDateISO)}
                </strong>
              </span>
              {hasCustomDate && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-400/40">
                  কাস্টম তারিখ
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 backdrop-blur-xs min-w-[65px] sm:min-w-[72px]">
                <div className="font-mono-num text-xl sm:text-2xl font-black text-cyan-300">
                  {String(countdown.days).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">দিন</div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 backdrop-blur-xs min-w-[65px] sm:min-w-[72px]">
                <div className="font-mono-num text-xl sm:text-2xl font-black text-white">
                  {String(countdown.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ঘণ্টা</div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 backdrop-blur-xs min-w-[65px] sm:min-w-[72px]">
                <div className="font-mono-num text-xl sm:text-2xl font-black text-white">
                  {String(countdown.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">মিনিট</div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 backdrop-blur-xs min-w-[65px] sm:min-w-[72px]">
                <div className="font-mono-num text-xl sm:text-2xl font-black text-amber-400">
                  {String(countdown.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">সেকেন্ড</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenEdit}
              className="mt-1 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-300" />
              <span>লক্ষ্য ও পরীক্ষার তারিখ পরিবর্তন করুন</span>
            </button>
          </div>
        </div>

        {/* Goal Edit Drawer */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 animate-in fade-in">
            <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>আপনার টার্গেট বিশ্ববিদ্যালয় ও সুনির্দিষ্ট পরীক্ষার তারিখ সেট করুন</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  টার্গেট ভার্সিটি বেছে নিন
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedId(newId);
                    const matching = TARGET_VARSITIES.find((v) => v.id === newId);
                    if (matching) {
                      setExamDateInput(customDatesMap[newId] || matching.targetDateISO);
                      if (
                        !mottoInput ||
                        mottoInput.endsWith('আমার রক্তে, কোনো ফাঁকিবাজি নয়!') ||
                        mottoInput.includes('বিশ্ববিদ্যালয়')
                      ) {
                        setMottoInput(getDefaultMottoForVarsity(matching.name));
                      }
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                >
                  {TARGET_VARSITIES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>পরীক্ষার নির্দিষ্ট তারিখ (Exam Date)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleResetToOfficialDate}
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>অফিসিয়াল তারিখে রিসেট</span>
                  </button>
                </div>
                <input
                  type="date"
                  value={examDateInput}
                  onChange={(e) => setExamDateInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  কাঙ্ক্ষিত ডিপার্টমেন্ট / বিষয়
                </label>
                <input
                  type="text"
                  value={dreamSubInput}
                  onChange={(e) => setDreamSubInput(e.target.value)}
                  placeholder="যেমন: CSE, Pharmacy, Genetic Eng, ইত্যাদি"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  টার্গেট পজিশন / র‍্যাংক
                </label>
                <input
                  type="text"
                  value={targetRankInput}
                  onChange={(e) => setTargetRankInput(e.target.value)}
                  placeholder="যেমন: শীর্ষ ১০০, প্রথম ৫০০, ইত্যাদি"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ব্যক্তিগত প্রতিজ্ঞা / আত্মবিশ্বাস স্লোগান
                </label>
                <input
                  type="text"
                  value={mottoInput}
                  onChange={(e) => setMottoInput(e.target.value)}
                  placeholder="যেমন: কোনো অজুহাত চলবে না, চান্স পেতেই হবে!"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>লক্ষ্য ও তারিখ সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Varsity Key Intel Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calculator Policy */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              activeVarsity.calculatorAllowed
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
            }`}
          >
            {activeVarsity.calculatorAllowed ? (
              <Calculator className="w-5 h-5" />
            ) : (
              <Ban className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              ক্যালকুলেটর নীতিমালা
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {activeVarsity.calculatorAllowed
                ? 'অনুমোদিত (নন-প্রোগ্রামেবল)'
                : 'সম্পূর্ণ নিষিদ্ধ (হ্যান্ড ক্যালকুলেশন)'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {activeVarsity.calculatorAllowed
                ? 'অনুমোদিত মডেল (fx-991EX/MS) দিয়ে দ্রুত গণনা প্র্যাকটিস করো।'
                : 'রাফ স্পেসে কাটাকাটি ও শর্টকাট টেকনিকে হিসাব করো।'}
            </div>
          </div>
        </div>

        {/* Mark Distribution */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              নম্বর বণ্টন ও ধরন
            </div>
            <div className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
              {activeVarsity.marksBreakdown}
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              টপার্স সিক্রেট টিপ
            </div>
            <div className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
              {activeVarsity.tips}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Compare All Universities Accordion Grid */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>অন্যান্য প্রধান বিশ্ববিদ্যালয়সমূহের সঠিক তারিখ ও সময়সূচি</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono font-bold">
            {TARGET_VARSITIES.length}টি ইউনিট
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {TARGET_VARSITIES.map((v) => {
            const isTarget = v.id === goal.varsityId;
            const targetDateStr =
              (isTarget && goal.customExamDate) ||
              customDatesMap[v.id] ||
              v.targetDateISO;

            const diffDays = Math.ceil(
              (new Date(`${targetDateStr}T09:00:00+06:00`).getTime() - now) /
                (1000 * 3600 * 24)
            );

            return (
              <div
                key={v.id}
                className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                  isTarget
                    ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {v.name}
                    </span>
                    {isTarget && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                        প্রধান টার্গেট
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-indigo-600 dark:text-cyan-400">
                    {v.shortName} • {v.unit}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>তারিখ: {formatExamDateBangla(targetDateStr)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">পরীক্ষার বাকি:</span>
                  <span className="font-mono-num font-black text-indigo-600 dark:text-cyan-400">
                    {diffDays > 0 ? `${diffDays} দিন` : 'পরীক্ষা সম্পন্ন'}
                  </span>
                </div>

                {!isTarget && (
                  <button
                    type="button"
                    onClick={() => {
                      const isAutoMotto =
                        !goal.personalMotto ||
                        goal.personalMotto.endsWith('আমার রক্তে, কোনো ফাঁকিবাজি নয়!') ||
                        goal.personalMotto.includes('ঢাকা বিশ্ববিদ্যালয়') ||
                        goal.personalMotto.includes('বিশ্ববিদ্যালয়');

                      const nextMotto = isAutoMotto
                        ? getDefaultMottoForVarsity(v.name)
                        : goal.personalMotto;

                      const updated: UserTargetVarsityGoal = {
                        ...goal,
                        varsityId: v.id,
                        personalMotto: nextMotto,
                        customExamDate: customDatesMap[v.id] || undefined,
                        updatedAt: new Date().toISOString(),
                      };
                      setGoal(updated);
                      try {
                        localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updated));
                      } catch {}
                    }}
                    className="mt-2.5 w-full py-1.5 text-center rounded-xl bg-slate-200/80 dark:bg-slate-700/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    প্রধান টার্গেট করুন
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
