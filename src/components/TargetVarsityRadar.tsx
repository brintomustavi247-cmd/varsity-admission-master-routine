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
  RotateCcw,
  ExternalLink,
  Search,
  AlertOctagon,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Globe,
  Flame,
} from 'lucide-react';
import { TARGET_VARSITIES } from '../data/targetVarsities';
import type {
  TargetVarsityInfo,
  UserTargetVarsityGoal,
  VarsityCategory,
} from '../types/masterTools';

const GOAL_STORAGE_KEY = 'varsity_dream_target_v1';
const CUSTOM_DATES_STORAGE_KEY = 'varsity_custom_dates_v1';

function cleanVarsityName(name: string): string {
  return name.replace(/\(.*?\)/g, '').trim();
}

function getDefaultMottoForVarsity(varsityName: string): string {
  const clean = cleanVarsityName(varsityName);
  return `${clean} আমার রক্তে, কোনো ফাঁকিবাজি নয়!`;
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

const CATEGORY_LABELS: Record<VarsityCategory | 'all', string> = {
  all: 'সকল বিশ্ববিদ্যালয়',
  autonomous: 'স্বায়ত্তশাসিত ও সাধারণ',
  engineering: 'প্রকৌশল ও প্রযুক্তি',
  agri: 'কৃষি গুচ্ছ',
  gst: 'জিএসটি গুচ্ছ',
  medical: 'মেডিকেল ও ডেন্টাল',
  specialized: 'বিশেষায়িত',
};

// Official Clash Alert Highlights from official circulars (as of Nov 17, 2026)
const MAJOR_CLASHES = [
  {
    date: '৮ জানুয়ারি ২০২৭',
    conflict: 'কুয়েট (KUET) vs জগন্নাথ (JnU ই ইউনিট) vs বিইউপি (BUP FST)',
    desc: 'প্রকৌশল ও সাধারণ অনুষদের একই দিনে পরীক্ষা। কুয়েট ৩টি কেন্দ্রে হলেও জবি ও বিইউপি শুধু ঢাকায়।',
  },
  {
    date: '১৬ জানুয়ারি ২০২৭',
    conflict: 'বুয়েট (BUET লিখিত) vs বিইউপি (BUP অন্যান্য অনুষদ)',
    desc: 'বুয়েট সরাসরি লিখিত পরীক্ষা এবং বিইউপির সম্ভাব্য তারিখ কাছাকাছি সময়ে পড়ার তীব্র আশঙ্কা রয়েছে।',
  },
  {
    date: '২৯ জানুয়ারি ২০২৭',
    conflict: 'বুটেক্স (BUTEX) vs চট্টগ্রাম বিশ্ববিদ্যালয় (CU C ইউনিট)',
    desc: 'টেক্সটাইল ইঞ্জিনিয়ারিং ও বাণিজ্য অনুষদের পরীক্ষা একই তারিখে ঘোষিত।',
  },
  {
    date: '৫ – ৬ ফেব্রুয়ারি ২০২৭',
    conflict: 'মিস্ট (MIST) vs খুলনা বিশ্ববিদ্যালয় (KU) vs কুমিল্লা বিশ্ববিদ্যালয় (CoU)',
    desc: 'একই সপ্তাহান্তে মিস্ট, খুবি ও কুবির পরীক্ষা। বিভিন্ন জেলায় কেন্দ্র হলে যাতায়াতে ঝুঁকি সৃষ্টি হতে পারে।',
  },
  {
    date: '১৩ ফেব্রুয়ারি ২০২৭',
    conflict: 'রাজশাহী বিশ্ববিদ্যালয় (RU C ইউনিট বিজ্ঞান) vs চট্টগ্রাম বিশ্ববিদ্যালয় (CU B ইউনিট)',
    desc: 'বিজ্ঞানের পরীক্ষার্থীদের জন্য একই দিনে রাজশাহী ও চট্টগ্রামের শিফট সংঘাত হতে পারে।',
  },
];

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
      personalMotto: 'ঢাকা বিশ্ববিদ্যালয় আমার রক্তে, কোনো ফাঁকিবাজি নয়!',
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

  // Category filter & search query
  const [selectedCategory, setSelectedCategory] = useState<VarsityCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByDate, setSortByDate] = useState(true);
  const [showClashHub, setShowClashHub] = useState(false);

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
    // If auto-generated motto pattern
    if (
      goal.personalMotto.endsWith('আমার রক্তে, কোনো ফাঁকিবাজি নয়!') ||
      goal.personalMotto.endsWith('আমার রক্তে, কোনো ফাঁকিবাজি নয়!')
    ) {
      return getDefaultMottoForVarsity(activeVarsity.name);
    }
    // If motto mentions DU while target is RU or another university
    if (
      activeVarsity.id !== 'du_ka' &&
      (goal.personalMotto.includes('ঢাকা বিশ্ববিদ্যালয়') ||
        goal.personalMotto.includes('ঢাকা বিশ্ববিদ্যালয়'))
    ) {
      return getDefaultMottoForVarsity(activeVarsity.name);
    }
    return goal.personalMotto;
  }, [goal.personalMotto, activeVarsity]);

  // Clean up legacy localStorage mismatch if user previously had Dhaka motto for RU
  useEffect(() => {
    if (
      goal.varsityId !== 'du_ka' &&
      (goal.personalMotto.includes('ঢাকা বিশ্ববিদ্যালয়') ||
        goal.personalMotto.includes('ঢাকা বিশ্ববিদ্যালয়'))
    ) {
      const correctedMotto = getDefaultMottoForVarsity(activeVarsity.name);
      const updated = { ...goal, personalMotto: correctedMotto };
      setGoal(updated);
      try {
        localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  }, [goal, activeVarsity]);

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
      personalMotto: mottoInput.trim() || getDefaultMottoForVarsity(targetV.name),
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

  // Filtered and sorted universities list
  const filteredVarsities = useMemo(() => {
    let list = [...TARGET_VARSITIES];

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((v) => v.category === selectedCategory);
    }

    // Search query filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.shortName.toLowerCase().includes(q) ||
          v.unit.toLowerCase().includes(q) ||
          v.faculty.toLowerCase().includes(q)
      );
    }

    // Sort by exam date
    if (sortByDate) {
      list.sort((a, b) => {
        const dateA =
          (a.id === goal.varsityId && goal.customExamDate) ||
          customDatesMap[a.id] ||
          a.targetDateISO;
        const dateB =
          (b.id === goal.varsityId && goal.customExamDate) ||
          customDatesMap[b.id] ||
          b.targetDateISO;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
    }

    return list;
  }, [selectedCategory, searchQuery, sortByDate, goal.varsityId, goal.customExamDate, customDatesMap]);

  return (
    <div className="space-y-5">
      {/* Target Varsity Main Hero Card */}
      <div className="rounded-3xl border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/25 border border-indigo-400/30 text-indigo-200 text-xs font-bold font-mono tracking-wider">
                <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
                <span>DREAM TARGET RADAR</span>
              </div>

              {activeVarsity.category && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-semibold">
                  {CATEGORY_LABELS[activeVarsity.category]}
                </span>
              )}

              {activeVarsity.secondTimeAllowed !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    activeVarsity.secondTimeAllowed
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                  }`}
                >
                  {activeVarsity.secondTimeAllowed ? 'সেকেন্ড টাইম: অনুমোদিত' : 'সেকেন্ড টাইম: নেই'}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {activeVarsity.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold">
                  {activeVarsity.unit}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {activeVarsity.faculty}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm sm:text-base text-slate-200 font-medium">
                কাঙ্ক্ষিত বিষয়: <strong className="text-cyan-300 underline underline-offset-4">{goal.dreamSubject}</strong>
                {goal.targetRank && (
                  <span className="text-xs text-slate-400 font-normal ml-2">
                    (টার্গেট: {goal.targetRank})
                  </span>
                )}
              </p>
              <p className="text-xs text-cyan-200/90 italic font-medium flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>&ldquo;{displayMotto}&rdquo;</span>
              </p>
            </div>

            {/* Application Deadline & Official Website Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {activeVarsity.applicationDeadline && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-medium text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>আবেদন: <strong className="text-amber-300">{activeVarsity.applicationDeadline}</strong></span>
                </div>
              )}

              {activeVarsity.officialPortalUrl && (
                <a
                  href={activeVarsity.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-bold text-cyan-200 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>অফিসিয়াল পোর্টাল</span>
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                </a>
              )}
            </div>

            {/* Clash Alert for Active Varsity if exists */}
            {activeVarsity.clashAlert && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-start gap-2 text-xs text-amber-200">
                <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">তারিখ সংঘাতের সতর্কতা: </span>
                  <span>{activeVarsity.clashAlert}</span>
                </div>
              </div>
            )}
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
                      // Update motto automatically if it uses the template
                      setMottoInput(getDefaultMottoForVarsity(matching.name));
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
                  placeholder="যেমন: রাজশাহী বিশ্ববিদ্যালয় আমার রক্তে, কোনো ফাঁকিবাজি নয়!"
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

      {/* Selected Varsity Key Intel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Calculator Policy */}
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

        {/* 2. Mark Distribution */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              নম্বর বণ্টন ও ধরন
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
              {activeVarsity.marksBreakdown}
            </div>
          </div>
        </div>

        {/* 3. Negative Marking & Pass Marks */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              নেগেটিভ মার্কিং ও পাস নম্বর
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
              {activeVarsity.negativeMarking || 'ভুল উত্তরে ০.২৫ কাটা (পাস নম্বর ৪০)'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {activeVarsity.secondTimeAllowed ? '২য় বার ভর্তি পরীক্ষা দেওয়ার সুযোগ আছে।' : 'সেকেন্ড টাইমের সুযোগ নেই।'}
            </div>
          </div>
        </div>

        {/* 4. Pro Tip */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              টপার্স সিক্রেট টিপ
            </div>
            <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
              {activeVarsity.tips}
            </div>
          </div>
        </div>
      </div>

      {/* Official Clash Warning Banner Hub */}
      <div className="rounded-2xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 shadow-xs">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowClashHub(!showClashHub)}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold shrink-0">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>২০২৬-২৭ শিক্ষাবর্ষের প্রধান তারিখ সংঘাত (Clash Alerts)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold">
                  ৫টি প্রধান সংঘাত
                </span>
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                একই দিনে একাধিক বিশ্ববিদ্যালয়ের পরীক্ষার তারিখ পড়েছে—আবেদনের আগে সতর্ক থাকুন।
              </p>
            </div>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-900/50 text-slate-600 dark:text-slate-400 transition-colors"
          >
            {showClashHub ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showClashHub && (
          <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-900/50 grid grid-cols-1 md:grid-cols-2 gap-2.5 animate-in fade-in">
            {MAJOR_CLASHES.map((clash, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{clash.date}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                    তারিখ সংঘাত
                  </span>
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {clash.conflict}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {clash.desc}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Universities Filter, Search & Grid Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>৪৬+ পাবলিক বিশ্ববিদ্যালয়ের পূর্ণাঙ্গ সময়সূচি ও ভর্তি পোর্টাল</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ১৭ নভেম্বর ২০২৬ পর্যন্ত সরকারি ও বিশ্ববিদ্যালয় অনুমোদিত সর্বশেষ হালনাগাদকৃত তথ্য
            </p>
          </div>

          {/* Quick Search & Sort Toggle */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বিশ্ববিদ্যালয় বা ইউনিট খুঁজুন..."
                className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setSortByDate(!sortByDate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer ${
                sortByDate
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{sortByDate ? 'তারিখ অনুসারে সাজানো' : 'ডিফল্ট সাজানো'}</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {(['all', 'autonomous', 'engineering', 'agri', 'gst', 'medical', 'specialized'] as const).map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'all'
                ? TARGET_VARSITIES.length
                : TARGET_VARSITIES.filter((v) => v.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* University Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {filteredVarsities.map((v) => {
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
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                  isTarget
                    ? 'border-indigo-500 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                        {v.name}
                      </h4>
                      <div className="text-xs font-semibold text-indigo-600 dark:text-cyan-400 mt-0.5">
                        {v.shortName} • {v.unit}
                      </div>
                    </div>
                    {isTarget ? (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-indigo-600 text-white shrink-0">
                        প্রধান টার্গেট
                      </span>
                    ) : (
                      v.category && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                          {CATEGORY_LABELS[v.category]}
                        </span>
                      )
                    )}
                  </div>

                  {/* Exam Date & Countdown */}
                  <div className="mt-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span>পরীক্ষার তারিখ:</span>
                      </span>
                      <strong className="text-slate-900 dark:text-slate-100 font-mono-num text-[11px]">
                        {formatExamDateBangla(targetDateStr)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">বাকি সময়:</span>
                      <span
                        className={`font-mono-num font-black ${
                          diffDays > 0
                            ? diffDays <= 30
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-indigo-600 dark:text-cyan-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {diffDays > 0 ? `${diffDays} দিন বাকি` : 'পরীক্ষা সম্পন্ন'}
                      </span>
                    </div>
                  </div>

                  {/* Application Deadline & Second Time Badges */}
                  <div className="mt-2.5 space-y-1 text-[11px]">
                    {v.applicationDeadline && (
                      <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">আবেদন:</span>
                        <span className="truncate">{v.applicationDeadline}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          v.calculatorAllowed
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {v.calculatorAllowed ? 'ক্যালকুলেটর অনুমোদিত' : 'ক্যালকুলেটর নিষিদ্ধ'}
                      </span>

                      {v.secondTimeAllowed !== undefined && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {v.secondTimeAllowed ? '২য় বার সুযোগ আছে' : 'সেকেন্ড টাইম নেই'}
                        </span>
                      )}
                    </div>

                    {v.clashAlert && (
                      <div className="mt-1 px-2 py-1 rounded-lg bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[10px] text-amber-800 dark:text-amber-300 leading-tight flex items-start gap-1">
                        <AlertOctagon className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{v.clashAlert}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2">
                  {!isTarget ? (
                    <button
                      type="button"
                      onClick={() => {
                        const updated: UserTargetVarsityGoal = {
                          ...goal,
                          varsityId: v.id,
                          personalMotto: getDefaultMottoForVarsity(v.name),
                          customExamDate: customDatesMap[v.id] || undefined,
                          updatedAt: new Date().toISOString(),
                        };
                        setGoal(updated);
                        try {
                          localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updated));
                        } catch {}
                      }}
                      className="flex-1 py-1.5 text-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                    >
                      প্রধান টার্গেট করুন
                    </button>
                  ) : (
                    <div className="flex-1 py-1.5 text-center rounded-xl bg-indigo-600 text-white text-xs font-bold">
                      বর্তমানে সক্রিয় টার্গেট
                    </div>
                  )}

                  {v.officialPortalUrl && (
                    <a
                      href={v.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="অফিসিয়াল ভর্তি ওয়েবসাইট দেখুন"
                      className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredVarsities.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
            আপনার অনুসন্ধানের সাথে মিলে এমন কোনো বিশ্ববিদ্যালয় পাওয়া যায়নি।
          </div>
        )}
      </div>
    </div>
  );
}
