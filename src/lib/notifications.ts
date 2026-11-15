import {
  getContextualSavageNotification,
  getRandomSavageNotification,
  type SavageNotification,
  type MascotMood,
} from '../data/savageNotifications';

export function getMascotReactionIcon(mood?: MascotMood): string {
  switch (mood) {
    case 'psycho':
      return '/mascot/cyber-cat-psycho.png';
    case 'crying':
      return '/mascot/cyber-cat-crying.png';
    case 'smug':
    case 'jealous':
      return '/mascot/cyber-cat-smug.png';
    case 'panic':
    case 'doodie':
      return '/mascot/cyber-cat-panic.png';
    case 'exhausted':
    case 'roast':
      return '/mascot/cyber-cat-exhausted.png';
    case 'sleepy':
      return '/mascot/cyber-cat-sleepy.png';
    case 'happy':
      return '/mascot/cyber-cat-happy.png';
    case 'sassy':
    default:
      return '/mascot/cyber-cat-sassy.png';
  }
}

export function isNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  );
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerPeriodicBackgroundSync();
      await sendPhoneNotification({
        title: '🔔 দৈনিক নোটিফিকেশন চালু হয়েছে!',
        body: 'আজকের পড়ার কোনো টাস্ক বাকি থাকলে প্রতিদিন ফোনে সরাসরি রিমাইন্ডার পৌঁছে যাবে।',
        tag: 'welcome-notification',
        mood: 'happy',
      });
    }
    return permission;
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return 'denied';
  }
}

export async function registerPeriodicBackgroundSync(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    if ('periodicSync' in reg) {
      const periodicSync = (reg as unknown as { periodicSync: { getTags: () => Promise<string[]>; register: (tag: string, options: { minInterval: number }) => Promise<void> } }).periodicSync;
      const tags = await periodicSync.getTags();
      if (!tags.includes('routine-check')) {
        await periodicSync.register('routine-check', {
          minInterval: 60 * 60 * 1000,
        });
      }
      return true;
    }
  } catch (err) {
    console.debug('Periodic background sync not supported or failed:', err);
  }
  return false;
}

export function syncRoutineStateToSW(dayNumber: number, remainingTasks: number): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.active) {
        reg.active.postMessage({
          type: 'SYNC_ROUTINE_STATE',
          dayNumber,
          remainingTasks,
          timestamp: Date.now(),
        });
      }
    });
  } catch {
    // ignore
  }
}

interface NotificationPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  icon?: string;
  image?: string;
  mood?: MascotMood;
}

export async function sendPhoneNotification({
  title,
  body,
  tag = 'admission-routine-alert',
  url = '/?tab=routine',
  icon,
  image,
  mood,
}: NotificationPayload): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const reactionIcon =
    icon || (mood ? getMascotReactionIcon(mood) : '/mascot/cyber-cat-sassy.png');
  const reactionImage = image || reactionIcon;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const absoluteIcon = origin && !reactionIcon.startsWith('http') ? new URL(reactionIcon, origin).href : reactionIcon;
  const absoluteImage = origin && !reactionImage.startsWith('http') ? new URL(reactionImage, origin).href : reactionImage;
  const absoluteBadge = origin ? new URL('/icons/badge-cyber-cat.png', origin).href : '/icons/badge-cyber-cat.png';

  const options: NotificationOptions & { renotify?: boolean; image?: string } = {
    body,
    icon: absoluteIcon,
    image: absoluteImage,
    badge: absoluteBadge,
    tag,
    renotify: true,
    data: { url },
  };

  // Add vibration pattern if supported
  if ('vibrate' in navigator) {
    (options as Record<string, unknown>).vibrate = [200, 100, 200];
  }

  try {
    let sent = false;

    if ('serviceWorker' in navigator) {
      try {
        const swPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 1200)
        );
        const registration = await Promise.race([swPromise, timeoutPromise]);

        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, options);
          sent = true;
        }
      } catch {
        // Fallback to Notification constructor
      }
    }

    if (!sent && typeof Notification !== 'undefined') {
      new Notification(title, options);
      sent = true;
    }

    return sent;
  } catch (err) {
    console.warn('Failed to display native notification:', err);
    return false;
  }
}

export async function checkAndSendDailyReminder(
  dayNumber: number,
  remainingTasks: number,
  force: boolean = false
): Promise<boolean> {
  if (remainingTasks <= 0) return false;
  if (getNotificationPermission() !== 'granted') return false;

  const todayISO = new Date().toLocaleDateString('en-CA');
  const alertKey = `daily_phone_alert_${todayISO}`;

  if (!force && localStorage.getItem(alertKey) === 'sent') {
    return false;
  }

  // Pick one of the 30 context-aware Duolingo-style savage notifications!
  const savage = getContextualSavageNotification();
  const title = savage.title;
  const body = `${savage.body} (Day ${String(dayNumber).padStart(2, '0')}-এর ${remainingTasks}টি টাস্ক বাকি!)`;

  const sent = await sendPhoneNotification({
    title,
    body,
    tag: `daily-mission-${todayISO}`,
    url: '/?tab=routine',
    mood: savage.mood,
  });

  if (sent) {
    localStorage.setItem(alertKey, 'sent');
  }

  return sent;
}

/**
 * Specifically triggered for the user's required 11:40 PM check
 */
export async function checkAndSend1140Notification(
  dayNumber: number,
  remainingTasks: number
): Promise<boolean> {
  if (remainingTasks <= 0) return false;
  if (getNotificationPermission() !== 'granted') return false;

  const now = new Date();
  const todayISO = now.toLocaleDateString('en-CA');
  const alertKey = `alert_1140_${todayISO}`;

  if (localStorage.getItem(alertKey) === 'sent') return false;

  const h = now.getHours();
  const m = now.getMinutes();

  // Trigger between 23:40 and 23:59
  if (h === 23 && m >= 40) {
    const title = 'রাত ১১টা ৪০ বাজার আলটিমেটাম! 🕛⏰';
    const body = `রাত ১২টা বাজতে আর মাত্র ২০ মিনিট বাকি! আজকের ${remainingTasks}টি টাস্ক এখনো শেষ করোনি? ১২টা বাজলেই আজকের AURA ধুলোয় মিশে যাবে! জলদি টেবিলে বসো! 😼`;

    const sent = await sendPhoneNotification({
      title,
      body,
      tag: `must-1140-${todayISO}`,
      url: '/?tab=routine',
      mood: 'panic',
    });

    if (sent) {
      localStorage.setItem(alertKey, 'sent');
    }
    return sent;
  }

  return false;
}

/**
 * Automate random moment notifications during the day when tasks are pending
 */
export async function checkAndSendRandomMomentRoast(
  dayNumber: number,
  remainingTasks: number
): Promise<boolean> {
  if (remainingTasks <= 0) return false;
  if (getNotificationPermission() !== 'granted') return false;

  const now = Date.now();
  const lastRoast = Number(localStorage.getItem('last_auto_roast_time') || '0');

  // Cooldown of at least 80 minutes between spontaneous roasts
  const MIN_COOLDOWN_MS = 80 * 60 * 1000;
  if (now - lastRoast < MIN_COOLDOWN_MS) return false;

  const hour = new Date().getHours();
  // Don't disturb during sleeping hours (2 AM to 8 AM)
  if (hour >= 2 && hour < 8) return false;

  // Pick contextual savage roast
  const savage = getContextualSavageNotification(hour);
  const sent = await sendPhoneNotification({
    title: savage.title,
    body: `${savage.body} (Day ${String(dayNumber).padStart(2, '0')}-এর পড়া বাকি!)`,
    tag: `auto-roast-${Date.now()}`,
    url: '/?tab=routine',
    mood: savage.mood,
  });

  if (sent) {
    localStorage.setItem('last_auto_roast_time', String(now));
  }

  return sent;
}

export async function sendSavageTestNotification(
  custom?: SavageNotification
): Promise<SavageNotification | null> {
  const savage = custom || getRandomSavageNotification();
  const sent = await sendPhoneNotification({
    title: savage.title,
    body: savage.body,
    tag: `test-savage-${Date.now()}`,
    url: '/?tab=routine',
    mood: savage.mood,
  });

  return sent ? savage : null;
}

/**
 * 60-Second Automated Countdown Test:
 * Allows user to lock screen or background app, and witness the auto notification fire in exactly 60 seconds!
 */
export function scheduleCountdownNotification(
  seconds: number,
  onTick?: (remaining: number) => void,
  onComplete?: (savage: SavageNotification) => void
): () => void {
  const savage = getRandomSavageNotification();
  const reactionIcon = getMascotReactionIcon(savage.mood);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const absoluteIcon = origin ? new URL(reactionIcon, origin).href : reactionIcon;

  // Arm service worker with persistent background countdown
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      try {
        const worker = reg.active || navigator.serviceWorker.controller;
        worker?.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          title: savage.title,
          delayMs: seconds * 1000,
          options: {
            body: savage.body,
            icon: absoluteIcon,
            image: absoluteIcon,
            badge: origin ? new URL('/icons/badge-cyber-cat.png', origin).href : '/icons/badge-cyber-cat.png',
            tag: `countdown-sw-${Date.now()}`,
            data: { url: '/?tab=routine' },
          },
        });
      } catch {
        // Ignore SW postMessage error
      }
    });
  }

  let remaining = seconds;
  const intervalId = window.setInterval(() => {
    remaining -= 1;
    if (onTick) onTick(remaining);

    if (remaining <= 0) {
      window.clearInterval(intervalId);
      sendPhoneNotification({
        title: savage.title,
        body: savage.body,
        tag: `countdown-${Date.now()}`,
        url: '/?tab=routine',
        mood: savage.mood,
      });
      if (onComplete) onComplete(savage);
    }
  }, 1000);

  return () => window.clearInterval(intervalId);
}
