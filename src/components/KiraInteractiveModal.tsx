import { useState } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Coffee,
  HeartHandshake,
  Dices,
  Target,
  Volume2,
} from 'lucide-react';
import { MascotCharacter } from './MascotCharacter';
import type { MascotMood } from '../data/savageNotifications';
import { playTaskChime, playMissionFanfare } from '../lib/sound';

interface KiraInteractiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled?: boolean;
  displayName: string;
}

interface KiraDialogue {
  mood: MascotMood;
  title: string;
  body: string;
}

const DIALOGUES = {
  sleepy: [
    {
      mood: 'psycho' as MascotMood,
      title: 'বিছানায় গড়াগড়ি খাওয়ার নোবেল প্রাইজ!',
      body: 'ওরে আমার নবাবজাদা! তোমার ক্রাশ অলরেডি ফিজিক্স চ্যাপ্টার শেষ করে লিডারবোর্ডের শীর্ষে, আর তুমি চোখ ডলছো? তোমার আঙুল কি ফেসবুকে আঠা দিয়ে লাগানো? জলদি টেবিলে যাও!',
    },
    {
      mood: 'sassy' as MascotMood,
      title: 'চান্স না পেলে কে সান্ত্বনা দেবে?',
      body: 'ঘুম পাচ্ছে? পরীক্ষার রেজাল্টের দিন যখন দেখবে ফ্রেন্ডরা ক্যাম্পাসে সেলফি তুলছে আর তুমি সেকেন্ড টাইমের গ্রুপ খুঁজছো, তখন এই ঘুম কোথায় যাবে? এখনই ১০ মিনিট পড়তে বসো!',
    },
  ],
  worried: [
    {
      mood: 'happy' as MascotMood,
      title: 'আরে পাগলা! ভয় পাওয়ার কিচ্ছু নেই!',
      body: 'ভয় তো তাদেরই লাগে যারা কিছু জয় করতে চায়! এই যে তুমি প্রতিদিন রুটিনের সাথে লড়াই করছো, এটাই তোমাকে হাজার জনের চেয়ে এগিয়ে রাখছে। নিজের ওপর বিশ্বাস রাখো, বিজয় তোমারই হবে!',
    },
    {
      mood: 'flirty' as MascotMood,
      title: 'আমি আছি তো তোমার পাশে...',
      body: 'তুমি একা নও, অ্যাডমিশনের পুরো জার্নিতে আমি তোমার সাথে লেগে থাকবো। শুধু আজকের তিনটা টাস্ক শেষ করো, বাকিটা আমি দেখে নেবো!',
    },
  ],
  proud: [
    {
      mood: 'smug' as MascotMood,
      title: 'সাবাশ! এই তো আমার চ্যাম্পিয়ন!',
      body: 'ফাটিয়ে দিয়েছো আজকে! তোমার Aura-র উজ্জ্বলতায় আমার চোখ ধাঁধিয়ে যাচ্ছে! এই আগুনটা যেন কালকেও নিভে না যায়, মনে রেখো ধারাবাহিকতাই আসল কিং!',
    },
    {
      mood: 'fist' as MascotMood,
      title: 'ভার্সিটির গেট তোমার অপেক্ষায়!',
      body: 'আজকের মিশন কমপ্লিট! তুমি প্রমাণ করেছো তুমি অজুহাত দাও না, অ্যাকশন নাও। কালকের জন্য এনার্জি রিচার্জ করে নাও!',
    },
  ],
  random: [
    {
      mood: 'sassy' as MascotMood,
      title: 'উঁকি মেরে দেখলাম, এখনো স্ক্রল করছো! 👀',
      body: 'হ্যাঁ, ইনবক্সের মেসেজ আর ট্রল পেজ আমি সব দেখতে পাচ্ছি! তোমার পড়ার টেবিল কিন্তু তোমায় মিস করছে, দ্রুত অ্যাপে ব্যাক করো!',
    },
    {
      mood: 'exhausted' as MascotMood,
      title: 'তোমার Aura-তে জং ধরে যাচ্ছে! 📉',
      body: 'আজকে রিভিশন মিস করলে আগের সব পড়া ভুলে যাবে। মাত্র ১৫ মিনিট স্পেসড রিভিশন দাও, কিরা-র ইজ্জতটা বাঁচাও!',
    },
    {
      mood: 'panic' as MascotMood,
      title: 'ডিসেম্বর ৩০ কি কোনো রূপকথা? 🗓️',
      body: 'ব্যাকলগের পাহাড় জমতে জমতে এভারেস্ট হওয়ার আগেই নিভিয়ে ফেলো! অন্তত একটা টাস্কে টিক দিয়ে যাও প্লিজ!',
    },
  ],
};

export function KiraInteractiveModal({
  isOpen,
  onClose,
  soundEnabled = true,
  displayName,
}: KiraInteractiveModalProps) {
  const [currentDialogue, setCurrentDialogue] = useState<KiraDialogue>({
    mood: 'smug',
    title: `হেই ${displayName}! আমি কিরা!`,
    body: 'পড়ার টেবিলে ফাঁকিবাজি করলে কিন্তু খবর আছে! আজকে তোমার মুড কেমন? নিচের যেকোনো একটা বাটনে চাপ দিয়ে আমার সাথে কথা বলো!',
  });

  if (!isOpen) return null;

  const handleSelectDialogue = (type: 'sleepy' | 'worried' | 'proud' | 'random') => {
    if (navigator.vibrate) navigator.vibrate(15);
    const pool = DIALOGUES[type];
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setCurrentDialogue(picked);

    if (type === 'proud') {
      playMissionFanfare(soundEnabled);
    } else {
      playTaskChime(soundEnabled);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-indigo-300/60 dark:border-indigo-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-cyan-500/15 blur-2xl"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot Avatar with current dynamic mood */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 relative">
            <MascotCharacter
              mood={currentDialogue.mood}
              size="lg"
              className="w-full h-full drop-shadow-xl"
            />
          </div>
          <span className="mt-1 px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-cyan-400 font-mono text-[11px] font-bold">
            KIRA THE ADMISSION COMPANION
          </span>
        </div>

        {/* Speech Bubble Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700/80 text-left space-y-1.5 shadow-xs">
          <h4 className="font-display text-sm sm:text-base font-black text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{currentDialogue.title}</span>
          </h4>
          <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            {currentDialogue.body}
          </p>
        </div>

        {/* Action Talk Buttons */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            কিরা-কে কিছু বলো:
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleSelectDialogue('sleepy')}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition-all flex items-center gap-2 cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
            >
              <Coffee className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">ঘুম আসছে / পড়বো না</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDialogue('worried')}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/40 dark:hover:text-sky-300 transition-all flex items-center gap-2 cursor-pointer border border-transparent hover:border-sky-200 dark:hover:border-sky-900"
            >
              <HeartHandshake className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="truncate">খুব ভয় লাগছে...</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDialogue('proud')}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-all flex items-center gap-2 cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900"
            >
              <Flame className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate">আজ ফাটিয়ে পড়েছি!</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDialogue('random')}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 transition-all flex items-center gap-2 cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900"
            >
              <Dices className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">র‍্যান্ডম রোস্ট দাও</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
