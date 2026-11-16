import * as webpush from 'web-push';
import { getRandomRoast } from './roasts-data.js';

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BNfQOVho312R5IsfD6bz-dh0L3j3_MYERmWt1tbtGu0GUpVQqFKlf8UQ720MUAgiubkQkYH7N6bSRZ0N-10oxuQ';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'nJ2uOUOIfFgA4cVfpIjBiSlKVU6zBCfhZgbd1SpO4GM';
const VAPID_SUBJECT = 'mailto:brintomustavi2410@gmail.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const FIRESTORE_BASE =
  'https://firestore.googleapis.com/v1/projects/varsity-admission-2026/databases/(default)/documents';
const API_KEY = 'AIzaSyBggHyuB4VJRBM-fO_F94QGSDrKNFitMos';

const HOST = 'https://varsity-admission-master-routine.vercel.app';

const MOOD_MAP = {
  pleading: '/mascot/kira-pleading.png',
  heart: '/mascot/kira-heart.png',
  demon: '/mascot/kira-demon.png',
  error: '/mascot/kira-error.png',
  shocked: '/mascot/kira-shocked.png',
  fire: '/mascot/kira-fire.png',
  stargaze: '/mascot/kira-stargaze.png',
  crush: '/mascot/kira-crush.png',
  bride: '/mascot/kira-bride.png',
  anya: '/mascot/kira-anya.png',
  flowers: '/mascot/kira-flowers.png',
  studying: '/mascot/kira-grumpy-desk.png',
  'grumpy-desk': '/mascot/kira-grumpy-desk.png',
  'late-night': '/mascot/kira-late-night.png',
  sprout: '/mascot/kira-sprout.png',
  'sad-floor': '/mascot/kira-sad-floor.png',
  fist: '/mascot/cyber-cat-fist.png',
  flirty: '/mascot/cyber-cat-flirty.png',
  happy: '/mascot/cyber-cat-happy.png',
  crying: '/mascot/cyber-cat-crying.png',
  sleepy: '/mascot/cyber-cat-sleepy.png',
  smug: '/mascot/cyber-cat-smug.png',
  panic: '/mascot/cyber-cat-panic.png',
  psycho: '/mascot/cyber-cat-psycho.png',
  exhausted: '/mascot/cyber-cat-exhausted.png',
  sassy: '/mascot/cyber-cat-sassy.png',
};

export default async function handler(req, res) {
  // Allow GET from Vercel Cron or POST from admin
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Fetch active push subscriptions from Firestore
    const fsRes = await fetch(
      `${FIRESTORE_BASE}/pushSubscriptions?key=${API_KEY}`
    );
    if (!fsRes.ok) {
      const errText = await fsRes.text();
      throw new Error(`Firestore fetch failed: ${fsRes.status} ${errText}`);
    }

    const data = await fsRes.json();
    const documents = data.documents || [];

    if (documents.length === 0) {
      return res.status(200).json({ message: 'No registered push subscriptions.' });
    }

    // Determine reminder type from current UTC time or query param
    // 17:40 UTC = 23:40 BST (11:40 PM Bangladesh Time)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();

    const isUltimatum =
      req.query?.type === 'ultimatum' ||
      (utcHours === 17 && utcMinutes >= 35 && utcMinutes <= 55);

    let title, body, mood;

    if (isUltimatum) {
      title = 'রাত ১১টা ৪০ বাজার আলটিমেটাম! 🕛⏰';
      body = 'রাত ১২টা বাজতে আর মাত্র ২০ মিনিট বাকি! আজকের টাস্ক এখনো শেষ করোনি? ১২টা বাজলেই আজকের AURA ধুলোয় মিশে যাবে! জলদি টেবিলে বসো! 😼';
      mood = 'panic';
    } else {
      // Pick a random roast from the 80 roasts list!
      const roast = getRandomRoast();
      title = roast.title;
      body = roast.body;
      mood = roast.mood || 'sassy';
    }

    const relIcon = MOOD_MAP[mood] || '/mascot/cyber-cat-sassy.png';
    const absoluteIcon = `${HOST}${relIcon}`;
    const absoluteBadge = `${HOST}/icons/badge-cyber-cat.png`;

    const payload = JSON.stringify({
      title,
      body,
      icon: absoluteIcon,
      image: absoluteIcon,
      badge: absoluteBadge,
      tag: isUltimatum ? `ultimatum-1140-${Date.now()}` : `random-roast-${Date.now()}`,
      data: { url: '/?tab=routine' },
    });

    let successCount = 0;
    let failedCount = 0;

    for (const doc of documents) {
      try {
        const fields = doc.fields || {};
        const subJson = fields.subscription?.stringValue;
        if (!subJson) continue;

        const sub = JSON.parse(subJson);
        await webpush.sendNotification(sub, payload);
        successCount++;
      } catch (sendErr) {
        failedCount++;
        // If subscription is expired (410 Gone / 404), clean it up from Firestore
        if (sendErr.statusCode === 410 || sendErr.statusCode === 404) {
          try {
            await fetch(`${FIRESTORE_BASE}/${doc.name.split('/documents/')[1]}?key=${API_KEY}`, {
              method: 'DELETE',
            });
          } catch {
            // Ignore delete error
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      sent: successCount,
      failed: failedCount,
      sampleTitle: title,
      totalRegistered: documents.length,
    });
  } catch (err) {
    console.error('Cron reminders failed:', err);
    return res.status(500).json({ error: err.message || 'Cron job failed' });
  }
}
