import { useEffect, useState } from 'react';
import { Download, Monitor, Smartphone, X } from 'lucide-react';
import {
  isAppInstalled,
  promptPwaInstall,
  subscribeDeferredPrompt,
  type BeforeInstallPromptEvent,
} from '../lib/pwa';
import { DesktopInstallModal } from './DesktopInstallModal';

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setIsStandalone(isAppInstalled());
    const dismissed = sessionStorage.getItem('pwa_install_dismissed') === 'true';
    setIsDismissed(dismissed);

    return subscribeDeferredPrompt((prompt) => {
      setDeferredPrompt(prompt);
      if (isAppInstalled()) {
        setIsStandalone(true);
      }
    });
  }, []);

  const isIos =
    typeof navigator !== 'undefined' &&
    /iPhone|iPad|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  if (isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      const outcome = await promptPwaInstall();
      if (outcome === 'manual') {
        setModalOpen(true);
      }
    } else {
      setModalOpen(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  return (
    <>
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
                <span>ডেস্কটপ ও ফোনে ইনস্টল করুন</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 text-[10px] font-semibold uppercase">
                  Desktop App / PWA
                </span>
              </div>
              <p className="text-xs text-sky-100/80 truncate">
                Chrome/Edge থেকে সরাসরি কম্পিউটারের ডেস্কটপ স্ক্রিনে আইকন আনুন
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
                <Monitor className="w-4 h-4" />
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
      </aside>

      <DesktopInstallModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onNativePrompt={handleInstallClick}
        hasNativePrompt={Boolean(deferredPrompt)}
      />
    </>
  );
}
