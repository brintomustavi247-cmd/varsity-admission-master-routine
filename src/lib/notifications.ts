import {
  getContextualSavageNotification,
  getRandomSavageNotification,
  type SavageNotification,
} from '../data/savageNotifications';

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
      await sendPhoneNotification({
        title: '🔔 দৈনিক নোটিফিকেশন চালু হয়েছে!',
        body: 'আজকের পড়ার কোনো টাস্ক বাকি থাকলে প্রতিদিন ফোনে সরাসরি রিমাইন্ডার পৌঁছে যাবে।',
        tag: 'welcome-notification',
      });
    }
    return permission;
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return 'denied';
  }
}

interface NotificationPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

export async function sendPhoneNotification({
  title,
  body,
  tag = 'admission-routine-alert',
  url = '/?tab=routine',
}: NotificationPayload): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const options: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: '/icons/mascot-notification.png',
    badge: '/icons/badge-cyber-cat.png',
    tag,
    renotify: true,
    data: { url },
  };

  // Add vibration pattern if supported
  if ('vibrate' in navigator) {
    (options as Record<string, unknown>).vibrate = [200, 100, 200];
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        return true;
      }
    }

    // Fallback to desktop Notification constructor if service worker is not active
    new Notification(title, options);
    return true;
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
  });

  if (sent) {
    localStorage.setItem(alertKey, 'sent');
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
  });

  return sent ? savage : null;
}
