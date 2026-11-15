import { Check, Download, Monitor, Smartphone, X } from 'lucide-react';

interface DesktopInstallModalProps {
  open: boolean;
  onClose: () => void;
  onNativePrompt?: () => void;
  hasNativePrompt?: boolean;
}

export function DesktopInstallModal({
  open,
  onClose,
  onNativePrompt,
  hasNativePrompt = false,
}: DesktopInstallModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="desktop-install-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl border border-sky-400/30 bg-gradient-to-b from-[#18236B] via-[#121B59] to-[#0D1443] p-6 sm:p-7 text-white shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Logo */}
        <div className="flex items-center gap-3.5 mb-5">
          <img
            src="/icons/icon-192.png"
            alt="অ্যাপ লোগো"
            className="w-12 h-12 rounded-2xl border border-sky-400/40 shadow-lg object-cover shrink-0"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-200 text-[11px] font-bold uppercase tracking-wider">
              <Monitor className="w-3 h-3" />
              <span>Desktop & Mobile App</span>
            </div>
            <h2 id="desktop-install-modal-title" className="text-lg sm:text-xl font-display font-black text-white mt-0.5">
              সরাসরি ডেস্কটপে আইকন আনার নিয়ম
            </h2>
          </div>
        </div>

        {hasNativePrompt && (
          <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-400/30 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-sky-100">
              আপনার ব্রাউজার প্রস্তুত! সরাসরি ইনস্টল ডায়ালগ খুলতে চাপুন:
            </span>
            <button
              type="button"
              onClick={onNativePrompt}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B8B] to-[#F45B7A] hover:from-[#FF5C7F] hover:to-[#E8486B] text-white font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer active:scale-95"
            >
              এখনই ইনস্টল
            </button>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="space-y-3">
          {/* PC / Laptop Guide */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
            <div className="flex items-center gap-2 font-bold text-sm text-sky-300 mb-2">
              <Monitor className="w-4 h-4 shrink-0 text-sky-400" />
              <span>কম্পিউটার (Chrome / Edge / Windows / Mac):</span>
            </div>
            <ol className="text-xs space-y-2 text-slate-200 leading-relaxed pl-1">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  ১
                </span>
                <span>
                  ব্রাউজারের <strong>অ্যাড্রেস বারের (URL Bar) ডানপাশে</strong> থাকা{' '}
                  <strong className="text-amber-300 bg-white/10 px-1.5 py-0.5 rounded">
                    Install (📥 ডাউনলোড চিহ্ন)
                  </strong>{' '}
                  আইকনে ক্লিক করুন।
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  ২
                </span>
                <span>
                  <strong>অথবা:</strong> ব্রাউজারের ৩-ডট (<strong>⋮</strong>) মেনুতে গিয়ে{' '}
                  <strong>&quot;Save and share&quot;</strong> (বা <strong>&quot;More tools&quot;</strong>) →{' '}
                  <strong>&quot;Install Varsity Admission...&quot;</strong> অথবা{' '}
                  <strong>&quot;Create shortcut...&quot;</strong> (Open as window সিলেক্ট করে) দিন।
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-emerald-300 font-semibold">
                  সাথে সাথে আপনার কম্পিউটারের Desktop ও Start Menu-তে অ্যাপ আইকন চলে আসবে!
                </span>
              </li>
            </ol>
          </div>

          {/* Mobile Guide */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-300 mb-1.5">
              <Smartphone className="w-4 h-4 shrink-0 text-amber-400" />
              <span>মোবাইল ফোন (Android / iPhone):</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              মোবাইল Chrome-এর ৩-ডট (<strong>⋮</strong>) মেনু থেকে{' '}
              <strong>&quot;Install app&quot;</strong> অথবা{' '}
              <strong>&quot;Add to Home screen&quot;</strong> চাপলেই হোম স্ক্রিনে অ্যাপ আইকন চলে আসবে।
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            বুঝেছি, বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
