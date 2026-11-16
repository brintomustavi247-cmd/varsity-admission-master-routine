import * as webpush from 'web-push';

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BNfQOVho312R5IsfD6bz-dh0L3j3_MYERmWt1tbtGu0GUpVQqFKlf8UQ720MUAgiubkQkYH7N6bSRZ0N-10oxuQ';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'nJ2uOUOIfFgA4cVfpIjBiSlKVU6zBCfhZgbd1SpO4GM';
const VAPID_SUBJECT = 'mailto:brintomustavi2410@gmail.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, title, body, mood, delaySeconds, tag, url } =
      req.body || {};

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Missing subscription endpoint' });
    }

    // Delay up to 8 seconds so user can lock screen and witness background wake-up
    const waitSec = Math.min(Math.max(Number(delaySeconds) || 0, 0), 8);
    if (waitSec > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
    }

    const moodMap = {
      pleading: '/mascot/cyber-cat-crying.png',
      crying: '/mascot/cyber-cat-crying.png',
      sleepy: '/mascot/cyber-cat-sleepy.png',
      exhausted: '/mascot/cyber-cat-sleepy.png',
      panic: '/mascot/cyber-cat-panic.png',
      shocked: '/mascot/cyber-cat-panic.png',
      error: '/mascot/cyber-cat-panic.png',
      fire: '/mascot/cyber-cat-panic.png',
      smug: '/mascot/cyber-cat-smug.png',
      happy: '/mascot/cyber-cat-happy.png',
      heart: '/mascot/cyber-cat-smug.png',
      crush: '/mascot/cyber-cat-smug.png',
      bride: '/mascot/cyber-cat-smug.png',
      stargaze: '/mascot/cyber-cat-smug.png',
      anya: '/mascot/cyber-cat-happy.png',
      studying: '/mascot/cyber-cat-sleepy.png',
      psycho: '/mascot/cyber-cat-psycho.png',
      demon: '/mascot/cyber-cat-psycho.png',
      sassy: '/mascot/cyber-cat-sassy.png',
    };

    const host = 'https://varsity-admission-master-routine.vercel.app';
    const relativeIcon = moodMap[mood] || '/mascot/cyber-cat-sassy.png';
    const absoluteIcon = `${host}${relativeIcon}`;
    const absoluteBadge = `${host}/icons/badge-cyber-cat.png`;

    const payload = JSON.stringify({
      title: title || 'কিরা (KIRA) 😼',
      body: body || 'আজকের মিশন সম্পূর্ণ করতে টেবিলে বসো!',
      icon: absoluteIcon,
      image: absoluteIcon,
      badge: absoluteBadge,
      tag: tag || `server-push-${Date.now()}`,
      data: { url: url || '/?tab=routine' },
    });

    const result = await webpush.sendNotification(subscription, payload);
    return res.status(200).json({ success: true, statusCode: result.statusCode });
  } catch (err) {
    console.error('Failed to send webpush:', err);
    return res.status(500).json({
      error: err.message || 'Push delivery failed',
      statusCode: err.statusCode || 500,
    });
  }
}
