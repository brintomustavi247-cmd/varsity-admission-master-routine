import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Dna, Globe } from 'lucide-react';
import type { StudyTrack } from '../types/study';

interface TrackSelectorModalProps {
  displayName: string;
  onSelectTrack: (track: StudyTrack) => Promise<void>;
}

export function TrackSelectorModal({
  displayName,
  onSelectTrack,
}: TrackSelectorModalProps) {
  const [selected, setSelected] = useState<StudyTrack | null>(null);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!selected || saving) return;
    setSaving(true);
    await onSelectTrack(selected);
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl rounded-[24px] border border-indigo-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-[0_18px_45px_rgba(79,70,229,0.1)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
      >
        <div className="text-xs font-extrabold tracking-wide text-[#4F46E5] dark:text-[#818CF8]">
          স্বাগতম, {displayName}
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 [text-wrap:balance]">
          আপনার রুটিন বিষয় বেছে নিন
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          পদার্থ, রসায়ন ও উচ্চতর গণিতের পাশাপাশি প্রতিদিন রাতে কোন বিষয় পড়বেন? পরে চাইলে ওপরের বাটন থেকে যেকোনো সময় পরিবর্তন করতে পারবেন।
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSelected('english')}
            className={`text-left rounded-2xl border-2 p-5 transition-all cursor-pointer ${
              selected === 'english'
                ? 'border-[#4F46E5] bg-indigo-50/70 dark:bg-indigo-950/40 shadow-md shadow-indigo-500/15'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 hover:border-indigo-300 dark:hover:border-indigo-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              {selected === 'english' && (
                <CheckCircle2 className="w-5 h-5 text-[#4F46E5] dark:text-[#818CF8]" />
              )}
            </div>
            <div className="font-display text-lg font-extrabold text-slate-900 dark:text-slate-50">
              ইংরেজি (English)
            </div>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              প্রতিদিনের রুটিনে ইংরেজি গ্রামার, ভোকাবুলারি ও প্রশ্নব্যাংক + ৫১টি PCM অধ্যায় থাকবে।
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelected('biology')}
            className={`text-left rounded-2xl border-2 p-5 transition-all cursor-pointer ${
              selected === 'biology'
                ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/35 shadow-md shadow-emerald-500/15'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 hover:border-emerald-300 dark:hover:border-emerald-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Dna className="w-5 h-5" />
              </div>
              {selected === 'biology' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div className="font-display text-lg font-extrabold text-slate-900 dark:text-slate-50">
              জীববিজ্ঞান (Biology)
            </div>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              ইংরেজির জায়গায় উদ্ভিদবিজ্ঞান (১২) ও প্রাণিবিজ্ঞানের (১২) মোট ২৪টি অধ্যায় বাংলা নামসহ যুক্ত হবে।
            </p>
          </button>
        </div>

        <button
          type="button"
          disabled={!selected || saving}
          onClick={handleConfirm}
          className="mt-6 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#4F46E5] to-blue-600 hover:opacity-95 disabled:opacity-45 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-opacity cursor-pointer"
        >
          {saving ? 'সেভ হচ্ছে...' : 'রুটিন শুরু করুন'}
        </button>
      </motion.div>
    </div>
  );
}
