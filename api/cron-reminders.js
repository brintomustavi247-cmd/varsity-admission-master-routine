import * as webpush from 'web-push';

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
    // 14:00 UTC = 20:00 BST (8:00 PM Bangladesh Time)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();

    const isUltimatum =
      req.query?.type === 'ultimatum' ||
      (utcHours === 17 && utcMinutes >= 35 && utcMinutes <= 55);

    const title = isUltimatum
      ? 'রাত ১১টা ৪০ বাজার আলটিমেটাম! 🕛⏰'
      : 'পড়ার টেবিলে যাওয়ার সময় হয়ে গেছে! 📚';
    const body = isUltimatum
      ? 'রাত ১২টা বাজতে আর মাত্র ২০ মিনিট বাকি! আজকের টাস্ক এখনো শেষ করোনি? ১২টা বাজলেই আজকের AURA ধুলোয় মিশে যাবে! জলদি টেবিলে বসো! 😼'
      : 'আজকের পড়ার কোনো টাস্ক বাকি থাকলে এখনই শেষ করে ফেলো। ফ্রেন্ডরা অলরেডি এগিয়ে যাচ্ছে!';
    const mood = isUltimatum ? 'panic' : 'exhausted';
    const reactionIcon = `/mascot/cyber-cat-${mood}.png`;

    const payload = JSON.stringify({
      title,
      body,
      icon: reactionIcon,
      image: reactionIcon,
      badge: '/icons/badge-cyber-cat.png',
      tag: isUltimatum ? `ultimatum-1140-${Date.now()}` : `evening-8pm-${Date.now()}`,
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
      total: documents.length,
      reminderType: isUltimatum ? 'ultimatum-1140' : 'evening-8pm',
    });
  } catch (err) {
    console.error('Cron reminder failed:', err);
    return res.status(500).json({ error: err.message });
  }
}
