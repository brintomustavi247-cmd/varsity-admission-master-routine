import { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    // Check if already running as installed PWA / standalone
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    setIsStandalone(Boolean(isStandaloneMode));

    // Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem('pwa_install_dismissed') === 'true';
    setIsDismissed(dismissed);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const isIos =
    typeof navigator !== 'undefined' &&
    /iPhone|iPad|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  if (isStandalone || isDismissed) {
    return null;
  }

  // If beforeinstallprompt hasn't fired yet and not iOS, keep ready
  if (!deferredPrompt && !isIos) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosTip(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  return (
    <aside
      aria-label="অ্যাপ ইনস্টলেশন"
      className="relative rounded-2xl border border-sky-400/30 bg-gradient-to-r from-[#16206E] via-[#1E2B8F] to-[#0D84C7] p-3 sm:p-4 text-white shadow-lg overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/icons/icon-192.png"
            alt="অ্যাপ লোগো"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-md shrink-0 border border-white/20 object-cover"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-white tracking-tight truncate">
              <span>হোম স্ক্রিনে ইনস্টল করুন</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 text-[10px] font-semibold uppercase">
                PWA
              </span>
            </div>
            <p className="text-xs text-sky-100/80 truncate">
              Chrome/Android থেকে সরাসরি অ্যাপ হিসেবে ব্যবহার করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF6B8B] to-[#F45B7A] hover:from-[#FF5C7F] hover:to-[#E8486B] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            {isIos ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>ইনস্টল</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="ইনস্টল ব্যানার বন্ধ করুন"
            className="p-1.5 rounded-xl text-sky-200/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIosTip && (
        <div className="mt-2.5 pt-2.5 border-t border-white/15 text-xs text-sky-100 flex items-center justify-between">
          <span>
            📱 iPhone-এ Safari-র <strong>Share</strong> (শেয়ার) বাটনে চাপ দিয়ে{' '}
            <strong>&quot;Add to Home Screen&quot;</strong> বেছে নিন।
          </span>
          <button
            type="button"
            onClick={() => setShowIosTip(false)}
            className="ml-2 underline text-white font-semibold cursor-pointer"
          >
            বুঝেছি
          </button>
        </div>
      )}
    </aside>
  );
}
