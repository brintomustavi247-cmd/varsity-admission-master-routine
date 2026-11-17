import { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Bookmark,
  BookmarkCheck,
  Zap,
  Lightbulb,
  BookOpen,
  Filter,
} from 'lucide-react';
import { ADMISSION_FORMULAS } from '../data/admissionFormulas';
import type { FormulaCard, SubjectCategory } from '../types/masterTools';

const BOOKMARK_STORAGE_KEY = 'varsity_bookmarked_formulas_v1';

export function FormulaPocketBook() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  const toggleBookmark = (id: string) => {
    const updated = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((b) => b !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    try {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const filteredFormulas = useMemo(() => {
    return ADMISSION_FORMULAS.filter((f) => {
      if (selectedSubject !== 'all' && f.subject !== selectedSubject) return false;
      if (showOnlyBookmarks && !bookmarkedIds.includes(f.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          f.title.toLowerCase().includes(q) ||
          f.chapterName.toLowerCase().includes(q) ||
          f.formula.toLowerCase().includes(q) ||
          f.explanation.toLowerCase().includes(q) ||
          f.importantFor.some((u) => u.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [selectedSubject, showOnlyBookmarks, bookmarkedIds, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-900/60 text-cyan-700 dark:text-cyan-400 text-xs font-bold font-mono">
          <Zap className="w-3.5 h-3.5" />
          <span>ADMISSION FORMULA VAULT</span>
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
          ভার্সিটি হট-ফর্মুলা ও শর্টকাট পকেট-বুক
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          ঢাকা বিশ্ববিদ্যালয় ও অন্যান্য ভার্সিটির ভর্তি পরীক্ষায় সবচেয়ে বেশি আসা হাই-ইল্ড সূত্র, দ্রুত হ্যান্ড ক্যালকুলেশন ট্রিক এবং টপার্স হ্যাকস।
        </p>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সূত্র, অধ্যায় বা বিশ্ববিদ্যালয়ের নাম লিখে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowOnlyBookmarks((prev) => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              showOnlyBookmarks
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {showOnlyBookmarks ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            <span>বুকমার্ক করা ({bookmarkedIds.length})</span>
          </button>
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { id: 'all', label: 'সকল সূত্র' },
              { id: 'physics', label: 'পদার্থবিজ্ঞান' },
              { id: 'chemistry', label: 'রসায়ন' },
              { id: 'math', label: 'উচ্চতর গণিত' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedSubject(tab.id as SubjectCategory | 'all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFormulas.length === 0 ? (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              কোনো সূত্র খুঁজে পাওয়া যায়নি
            </div>
          </div>
        ) : (
          filteredFormulas.map((item) => {
            const isBookmarked = bookmarkedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                        {item.chapterName} ({item.paper === '1st' ? '১ম পত্র' : '২য় পত্র'})
                      </span>

                      <div className="flex items-center gap-1">
                        {item.importantFor.map((u) => (
                          <span
                            key={u}
                            className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {u}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(item.id)}
                      className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                          : 'text-slate-400 hover:text-amber-500'
                      }`}
                      title="বুকমার্ক করুন"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>

                  {/* Formula Banner */}
                  <div className="p-3 rounded-xl bg-slate-900 text-cyan-300 dark:bg-slate-950/80 border border-slate-800 font-mono text-xs sm:text-sm font-black tracking-wide leading-relaxed overflow-x-auto select-all">
                    {item.formula}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>

                {item.hackTip && (
                  <div className="pt-2">
                    <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-[11px] sm:text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>হ্যাক টিপ:</strong> {item.hackTip}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
