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
    const {
      completerUid,
      completerName = 'স্কোয়াড মেম্বার',
      taskTitle = 'আজকের মূল টাস্ক',
      taskType = 'মূল অধ্যায়',
      countdownMinutes = 2,
    } = req.body || {};

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

    const host = 'https://varsity-admission-master-routine.vercel.app';
    const icon = `${host}/mascot/kira-ice-bear.png`;
    const image = `${host}/mascot/kira-ice-bear.png`;
    const badge = `${host}/icons/badge-cyber-cat.png`;

    const title = `স্কোয়াড অ্যালার্ট: ${completerName} এগিয়ে গেছে! 🚀`;
    const body = `${completerName} এইমাত্র ${taskType} (${taskTitle}) সম্পন্ন করেছে! তোমার জন্য ${countdownMinutes} মিনিটের কাউন্টডাউন—তুমি কি পিছিয়ে থাকবা? এখনই টেবিলে বসো! 😼`;

    const payload = JSON.stringify({
      title,
      body,
      icon,
      image,
      badge,
      tag: `squad-task-${Date.now()}`,
      renotify: true,
      vibrate: [200, 100, 200, 100, 200],
      data: { url: '/?tab=routine' },
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const doc of documents) {
      try {
        const subStr = doc.fields?.subscription?.stringValue;
        if (!subStr) continue;

        // Skip the completer's own device if uid matches
        const docUid = doc.fields?.uid?.stringValue;
        if (completerUid && docUid && docUid === completerUid) {
          continue;
        }

        const subscription = JSON.parse(subStr);
        await webpush.sendNotification(subscription, payload);
        sentCount++;
      } catch (err) {
        failedCount++;
        // Clean up expired subscriptions (404/410)
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await fetch(`${FIRESTORE_BASE}/${doc.name}?key=${API_KEY}`, {
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
      sentCount,
      failedCount,
      total: documents.length,
    });
  } catch (err) {
    console.error('Failed to send squad push notification:', err);
    return res.status(500).json({
      error: err.message || 'Squad notification failed',
    });
  }
}
