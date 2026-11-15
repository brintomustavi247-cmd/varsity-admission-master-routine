# ভার্সিটি অ্যাডমিশন মাস্টার রুটিন ২০২৬–২৭

Vite + React 19 + TypeScript + Tailwind CSS v4 + Firebase (Auth & Firestore) দিয়ে তৈরি রিয়েল-টাইম ৬১ দিনের ভার্সিটি অ্যাডমিশন রুটিন, সিলেবাস ট্র্যাকার ও স্কোয়াড লিডারবোর্ড।

## VS Code / Antigravity-তে সরাসরি ওপেন করা

১. প্রজেক্ট ফোল্ডার এক্সট্র্যাক্ট করে সরাসরি **`admission-routine.code-workspace`** ফাইলটি **VS Code** বা **Antigravity**-তে ওপেন করুন (অথবা টার্মিনাল থেকে `code .` / `antigravity .` চালান)।
২. টার্মিনালে ডিপেনডেন্সি ইন্সটল করে ডেভ সার্ভার চালু করুন:

```bash
npm install
npm run dev
```

অ্যাপটি `http://localhost:3000`-এ চালু হবে।

## প্রোডাকশন বিল্ড ও টাইপচেক

```bash
npm run lint
npm run build
```

## GitHub ও Vercel ডেপ্লয়মেন্ট

১. GitHub-এ পুশ করে Vercel-এ ইম্পোর্ট করুন (`vercel.json` ইতিমধ্যে যুক্ত আছে)।
২. ডেপ্লয়ের পর **Firebase Console → Authentication → Settings → Authorized domains**-এ আপনার `.vercel.app` ডোমেইনটি যোগ করুন যাতে Google Sign-In সঠিকভাবে কাজ করে।
