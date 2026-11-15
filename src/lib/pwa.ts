export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((cb) => cb(globalDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    promptListeners.forEach((cb) => cb(null));
  });
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return globalDeferredPrompt;
}

export function subscribeDeferredPrompt(
  callback: (prompt: BeforeInstallPromptEvent | null) => void
): () => void {
  promptListeners.add(callback);
  callback(globalDeferredPrompt);
  return () => {
    promptListeners.delete(callback);
  };
}

export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export async function promptPwaInstall(): Promise<'accepted' | 'dismissed' | 'manual'> {
  if (globalDeferredPrompt) {
    try {
      await globalDeferredPrompt.prompt();
      const choice = await globalDeferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        globalDeferredPrompt = null;
        promptListeners.forEach((cb) => cb(null));
      }
      return choice.outcome;
    } catch {
      return 'manual';
    }
  }
  return 'manual';
}
