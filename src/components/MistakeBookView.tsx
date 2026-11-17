import { useState, useMemo } from 'react';
import {
  BookMarked,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Search,
  Filter,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  X,
  FileText,
  RotateCcw,
} from 'lucide-react';
import type { MistakeEntry, SubjectCategory, MistakeReason } from '../types/masterTools';

const STORAGE_KEY = 'varsity_mistake_book_v1';

const SUBJECT_LABELS: Record<SubjectCategory, { label: string; color: string; badgeBg: string }> = {
  physics: {
    label: 'পদার্থবিজ্ঞান',
    color: 'text-indigo-600 dark:text-indigo-400',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  chemistry: {
    label: 'রসায়ন',
    color: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  math: {
    label: 'উচ্চতর গণিত',
    color: 'text-sky-600 dark:text-sky-400',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
  biology: {
    label: 'জীববিজ্ঞান',
    color: 'text-teal-600 dark:text-teal-400',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  },
  english: {
    label: 'ইংরেজি',
    color: 'text-violet-600 dark:text-violet-400',
    badgeBg: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  },
};

const REASON_LABELS: Record<MistakeReason, { label: string; icon: string }> = {
  concept: { label: 'কনসেপ্ট বা বেসিক দুর্বলতা', icon: '🧠' },
  calculation: { label: 'ক্যালকুলেশন বা গণনা ভুল', icon: '🔢' },
  formula: { label: 'সূত্র মনে আসেনি বা ভুল প্রয়োগ', icon: '📐' },
  careless: { label: 'প্রশ্ন ঠিকমতো না পড়া / অসাবধানতা', icon: '⚠️' },
  time: { label: 'সময় সংকট / তাড়াহুড়ো', icon: '⏱️' },
};

const SAMPLE_INITIAL_MISTAKES: MistakeEntry[] = [
  {
    id: 'sample_1',
    subject: 'physics',
    chapterName: 'কাজ, শক্তি ও ক্ষমতা',
    questionText: 'কুয়া খালি করার ক্ষেত্রে অর্ধেক ভর্তি কুয়া খালি করতে কৃতকাজ কত?',
    wrongReason: 'formula',
    whatWentWrong: 'পানির ভরকেন্দ্রের সরণ L/4 ভেবেছিলাম।',
    correctSolution: 'অর্ধেক ভর্তি কুয়া খালি করতে ভারকেন্দ্রের সরণ h = L/2 + L/4 = 3L/4। তাই W = mg(3L/4)।',
    createdAt: new Date().toISOString(),
    isMastered: true,
  },
  {
    id: 'sample_2',
    subject: 'chemistry',
    chapterName: 'পরিমাণগত রসায়ন',
    questionText: 'অম্লীয় মাধ্যমে KMnO₄ এর তুল্য সংখ্যা কত?',
    wrongReason: 'careless',
    whatWentWrong: 'ক্ষারীয় মাধ্যমের তুল্য সংখ্যা ৩ মনে করে হিসাব করেছিলাম।',
    correctSolution: 'অম্লীয় মাধ্যমে KMnO₄ এর তুল্য সংখ্যা e = 5, ক্ষারীয় মাধ্যমে e = 1, প্রশম মাধ্যমে e = 3।',
    createdAt: new Date().toISOString(),
    isMastered: false,
  },
];

export function MistakeBookView() {
  const [mistakes, setMistakes] = useState<MistakeEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SAMPLE_INITIAL_MISTAKES;
  });

  const [filterSubject, setFilterSubject] = useState<SubjectCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'mastered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [formSubject, setFormSubject] = useState<SubjectCategory>('physics');
  const [formChapter, setFormChapter] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formReason, setFormReason] = useState<MistakeReason>('concept');
  const [formWhatWrong, setFormWhatWrong] = useState('');
  const [formCorrect, setFormCorrect] = useState('');

  const saveToStorage = (updated: MistakeEntry[]) => {
    setMistakes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) return;

    const newEntry: MistakeEntry = {
      id: `mistake_${Date.now()}`,
      subject: formSubject,
      chapterName: formChapter.trim() || 'সাধারণ প্রশ্ন',
      questionText: formQuestion.trim(),
      wrongReason: formReason,
      whatWentWrong: formWhatWrong.trim() || 'অসাবধানতা',
      correctSolution: formCorrect.trim() || 'সঠিক নিয়ম রিভিশন করতে হবে',
      createdAt: new Date().toISOString(),
      isMastered: false,
    };

    saveToStorage([newEntry, ...mistakes]);
    setIsAdding(false);
    setFormChapter('');
    setFormQuestion('');
    setFormWhatWrong('');
    setFormCorrect('');
  };

  const handleToggleMastered = (id: string) => {
    const updated = mistakes.map((m) =>
      m.id === id ? { ...m, isMastered: !m.isMastered } : m
    );
    saveToStorage(updated);
  };

  const handleDeleteMistake = (id: string) => {
    if (confirm('এই ভুলটি তালিকা থেকে মুছে ফেলতে চান?')) {
      const updated = mistakes.filter((m) => m.id !== id);
      saveToStorage(updated);
    }
  };

  const filteredMistakes = useMemo(() => {
    return mistakes.filter((m) => {
      if (filterSubject !== 'all' && m.subject !== filterSubject) return false;
      if (filterStatus === 'pending' && m.isMastered) return false;
      if (filterStatus === 'mastered' && !m.isMastered) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQ =
          m.questionText.toLowerCase().includes(q) ||
          m.chapterName.toLowerCase().includes(q) ||
          m.correctSolution.toLowerCase().includes(q);
        if (!matchesQ) return false;
      }
      return true;
    });
  }, [mistakes, filterSubject, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = mistakes.length;
    const mastered = mistakes.filter((m) => m.isMastered).length;
    const pending = total - mastered;
    return { total, mastered, pending };
  }, [mistakes]);

  return (
    <div className="space-y-4">
      {/* Header and Quick Stats */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs font-bold font-mono">
              <BookMarked className="w-3.5 h-3.5" />
              <span>TOPPER&apos;S MISTAKE VAULT</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
              ভুল খাতা (ব্যক্তিগত ভুল ও প্রশ্ন ডায়েরি)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              মডেল টেস্ট ও প্রশ্নব্যাংক সলভে যেসব প্রশ্নে ভুল হয়, তা এখানে টুকে রাখুন। পরীক্ষার আগে এখান থেকেই ১০০% রিভিশন হবে!
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding((v) => !v)}
            className="px-4 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ভুল যোগ করুন</span>
          </button>
        </div>

        {/* Quick Metric Pills */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
            <div className="font-mono-num text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
              {stats.total}
            </div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">মোট সংরক্ষিত</div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-center">
            <div className="font-mono-num text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
              {stats.pending}
            </div>
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">সংশোধন বাকি</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-center">
            <div className="font-mono-num text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.mastered}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">মাস্টারি অর্জিত</div>
          </div>
        </div>
      </div>

      {/* Add Mistake Form Modal / Box */}
      {isAdding && (
        <form
          onSubmit={handleAddMistake}
          className="rounded-3xl border-2 border-indigo-500/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>ভুল খাতায় নতুন এন্ট্রি</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিষয়
              </label>
              <select
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value as SubjectCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                <option value="physics">পদার্থবিজ্ঞান</option>
                <option value="chemistry">রসায়ন</option>
                <option value="math">উচ্চতর গণিত</option>
                <option value="biology">জীববিজ্ঞান</option>
                <option value="english">ইংরেজি</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                অধ্যায়ের নাম
              </label>
              <input
                type="text"
                value={formChapter}
                onChange={(e) => setFormChapter(e.target.value)}
                placeholder="যেমন: গতিবিদ্যা, পরিমাণগত রসায়ন"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ভুলের ধরন বা কারণ
              </label>
              <select
                value={formReason}
                onChange={(e) => setFormReason(e.target.value as MistakeReason)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                {Object.entries(REASON_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.icon} {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              প্রশ্ন বা সমস্যা (Problem Statement) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              placeholder="প্রশ্নের মূল অংশ বা যে অংশে ভুল হয়েছিল..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                কী ভুল করেছিলাম? (Why did I fail?)
              </label>
              <textarea
                rows={2}
                value={formWhatWrong}
                onChange={(e) => setFormWhatWrong(e.target.value)}
                placeholder="যেমন: সূত্রে প্লাসের জায়গায় মাইনাস দিয়েছিলাম, অথবা একক রূপান্তর করিনি..."
                className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                সঠিক কনসেপ্ট বা টেকনিক (The Right Solution)
              </label>
              <textarea
                rows={2}
                value={formCorrect}
                onChange={(e) => setFormCorrect(e.target.value)}
                placeholder="সঠিক নিয়ম, সূত্র বা শর্টকাট যা মনে রাখতে হবে..."
                className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ভুল প্রশ্ন বা অধ্যায় খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            {(
              [
                { id: 'all', label: 'সবগুলো' },
                { id: 'pending', label: 'সংশোধন বাকি' },
                { id: 'mastered', label: 'মাস্টারড' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilterStatus(st.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === st.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterSubject('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterSubject === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            সকল বিষয় ({mistakes.length})
          </button>
          {(['physics', 'chemistry', 'math', 'biology', 'english'] as SubjectCategory[]).map(
            (sub) => {
              const count = mistakes.filter((m) => m.subject === sub).length;
              const active = filterSubject === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setFilterSubject(sub)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {SUBJECT_LABELS[sub].label} ({count})
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Mistake Entries List */}
      <div className="space-y-3">
        {filteredMistakes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-2">
            <BookMarked className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              কোনো সংরক্ষিত ভুল খুঁজে পাওয়া যায়নি
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              পড়ার টেবিলে বা প্রশ্নব্যাংক সলভে যেসব প্রশ্নে খটকা বা ভুল হয়, তা উপরে &quot;নতুন ভুল যোগ করুন&quot; বাটনে ক্লিক করে তুলে রাখুন।
            </div>
          </div>
        ) : (
          filteredMistakes.map((entry) => {
            const subConfig = SUBJECT_LABELS[entry.subject];
            const reasonConfig = REASON_LABELS[entry.wrongReason];

            return (
              <div
                key={entry.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3 ${
                  entry.isMastered
                    ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/15'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                {/* Top Meta Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${subConfig.badgeBg}`}
                    >
                      {subConfig.label}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      • {entry.chapterName}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-[11px] font-medium flex items-center gap-1">
                      <span>{reasonConfig.icon}</span>
                      <span>{reasonConfig.label}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleMastered(entry.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        entry.isMastered
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      {entry.isMastered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>সংশোধিত</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5" />
                          <span>সংশোধন চিহ্নিত করুন</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMistake(entry.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {entry.questionText}
                </div>

                {/* What went wrong vs Correct concept breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/25 border border-rose-100 dark:border-rose-900/40 space-y-1">
                    <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>কী ভুল হয়েছিল:</span>
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {entry.whatWentWrong}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                    <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>সঠিক সমাধান ও শিক্ষা:</span>
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {entry.correctSolution}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
