import { useEffect, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { motion } from 'motion/react';
import {
  Award,
  CheckCircle2,
  Download,
  Flame,
  Monitor,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { PwaInstallBanner } from './PwaInstallBanner';
import { DesktopInstallModal } from './DesktopInstallModal';
import {
  isAppInstalled,
  promptPwaInstall,
  subscribeDeferredPrompt,
} from '../lib/pwa';

interface LoginGateProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function LoginGate({ theme, onToggleTheme }: LoginGateProps) {
  const [signingIn, setSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isAppInstalled());
    return subscribeDeferredPrompt((prompt) => {
      setHasNativePrompt(Boolean(prompt));
    });
  }, []);

  const handleInstallClick = async () => {
    if (hasNativePrompt) {
      const outcome = await promptPwaInstall();
      if (outcome === 'manual') {
        setInstallModalOpen(true);
      }
    } else {
      setInstallModalOpen(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setErrorMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('সাইন-ইন পপআপ বন্ধ করা হয়েছে। আবার চেষ্টা করুন।');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg(
          'ব্রাউজার পপআপ ব্লক করেছে। অনুগ্রহ করে পপআপ Allow করে আবার চেষ্টা করুন।'
        );
      } else {
        setErrorMsg(
          'Google সাইন-ইন করতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'
        );
      }
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 flex flex-col">
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 font-display font-extrabold text-lg tracking-tight whitespace-nowrap shrink-0">
          <img src="/icons/icon-192.png" alt="লোগো" className="w-8 h-8 rounded-xl shadow-xs border border-sky-400/30 object-cover" />
          <span>ভার্সিটি অ্যাডমিশন রুটিন</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-sky-400/40 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Monitor className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">ডেস্কটপে ইনস্টল</span>
            <span className="sm:hidden">ইনস্টল</span>
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </header>

      <div className="w-full max-w-5xl mx-auto px-4 mb-2">
        <PwaInstallBanner />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-[24px] border border-indigo-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_14px_36px_rgba(79,70,229,0.09)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.45)]"
        >
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-extrabold text-[#4F46E5] dark:text-[#818CF8] tracking-wide mb-2">
                বিজ্ঞান ইউনিট · ১৬ নভেম্বর ২০২৬ – ১৫ জানুয়ারি ২০২৭ · ৬১ দিন
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight text-slate-900 dark:text-slate-50 [text-wrap:balance]">
                ভার্সিটি অ্যাডমিশন মাস্টার রুটিন ও স্কোয়াড ট্র্যাকার
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                প্রতিদিনের মিশন, ৫১টি অধ্যায়ের থিওরি-ব্যাংক-রিভিশন ট্র্যাকিং এবং বন্ধুদের সাথে রিয়েল-টাইম অগ্রগতি এক জায়গায়।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-[#818CF8] shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    টিম প্রোফাইল ট্র্যাকিং
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    কোন টাস্ক কোন বন্ধু সম্পন্ন করেছে, টাস্কের পাশেই তার প্রোফাইল ছবি দেখা যাবে।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    গেমিফাইড মিশন সেলিব্রেশন
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    প্রতিদিনের ৩টি মিশন শেষ করলেই AURA, র‍্যাংক ও এসথেটিক সেলিব্রেশন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    ৬১ দিন · ৫১ অধ্যায় সিঙ্ক
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    যে কোনো ডিভাইস থেকে লগইন করলেই রুটিন ও সিলেবাসের প্রগ্রেস সিঙ্ক থাকবে।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    স্কোয়াড লিডারবোর্ড
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ৩–৪ জন বন্ধুর মধ্যে কে কত দিন ও অধ্যায় এগিয়ে আছে লাইভ দেখুন।
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-10 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/40 dark:from-slate-950/60 dark:via-slate-900 dark:to-indigo-950/30 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
                শুরু করতে লগইন করুন
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                আপনার Google অ্যাকাউন্ট দিয়ে প্রবেশ করলে আপনার নাম ও প্রোফাইল ছবি স্কোয়াডে যুক্ত হবে।
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-60 transition-colors cursor-pointer shadow-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                />
              </svg>
              <span>{signingIn ? 'সাইন ইন হচ্ছে...' : 'Google দিয়ে সাইন ইন করুন'}</span>
            </button>

            {/* Permanent Dedicated Desktop & Mobile App Install Button */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                অথবা সরাসরি অ্যাপ হিসেবে চালান
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-indigo-500/35 dark:border-indigo-400/30 bg-gradient-to-r from-indigo-50/70 via-white to-sky-50/70 dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-800 text-slate-800 dark:text-slate-100 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-50 truncate">
                  <span>ডেস্কটপ / পিসিতে ইনস্টল করুন</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase">
                    Desktop App
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {isInstalled
                    ? '✅ ইতিমধ্যে ইনস্টল করা আছে (ওপেন করতে ট্যাপ করুন)'
                    : 'সরাসরি কম্পিউটার স্ক্রিন থেকে আইকন দিয়ে চালু করুন'}
                </div>
              </div>
              <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:translate-y-0.5 transition-transform" />
            </button>

            {errorMsg && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-300"
              >
                {errorMsg}
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>আপনার ইমেইল গোপন রাখা হবে, শুধু নাম ও প্রোফাইল ছবি স্কোয়াডে দেখা যাবে।</span>
            </div>
          </div>
        </motion.div>
      </main>

      <DesktopInstallModal
        open={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        onNativePrompt={handleInstallClick}
        hasNativePrompt={hasNativePrompt}
      />
    </div>
  );
}
