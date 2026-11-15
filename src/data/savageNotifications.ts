export type MascotMood =
  | 'sassy'
  | 'psycho'
  | 'jealous'
  | 'crying'
  | 'roast'
  | 'doodie';

export interface SavageNotification {
  id: number;
  category: 'ego' | 'unhinged' | 'jealousy' | 'guilt' | 'roast' | 'deadline';
  categoryLabel: string;
  mood: MascotMood;
  title: string;
  body: string;
}

export const SAVAGE_NOTIFICATIONS: SavageNotification[] = [
  // ১. ব্যক্তিগত খোঁচা ও অহংবোধে আঘাত (Ego & Sarcasm)
  {
    id: 1,
    category: 'ego',
    categoryLabel: 'ব্যক্তিগত খোঁচা',
    mood: 'sassy',
    title: 'স্ট্যাটাস দিয়ে কামব্যাক হয় না ভাই! 🤡',
    body: 'ফেসবুকে তো ভালোই মোটিভেশন দিচ্ছিলা, এখন পড়ার টেবিলে বসতে গিয়ে হাত কাঁপছে কেন?',
  },
  {
    id: 2,
    category: 'ego',
    categoryLabel: 'ব্যক্তিগত খোঁচা',
    mood: 'sassy',
    title: 'রিলসে কি এডমিশন টেস্টের প্রশ্ন আসবে? 📱',
    body: 'গত ১ ঘণ্টা ধরে যে স্ক্রল করতেছো, ওখান থেকে কোনো কমন পড়বে না। অ্যাপে আসো, টাস্ক বাকি!',
  },
  {
    id: 3,
    category: 'ego',
    categoryLabel: 'ব্যক্তিগত খোঁচা',
    mood: 'sassy',
    title: 'তোমার কম্পিটিটর কিন্তু তোমায় থ্যাঙ্ক ইউ বলছে! 😉',
    body: 'তুমি না পড়লে ওর চান্স পাওয়া আরও সহজ হয়ে যাচ্ছে। গিফট হিসেবে সিটটা কি ছেড়েই দিচ্ছ?',
  },
  {
    id: 4,
    category: 'ego',
    categoryLabel: 'ব্যক্তিগত খোঁচা',
    mood: 'sassy',
    title: 'এক্স-এর বিয়েতে কি ব্যাকবেঞ্চার হয়ে যাবা? 💀',
    body: 'একটু নিজের ফিউচারের কথা ভাবো! আজকের চ্যাপ্টারটা শেষ না করলে রেজাল্টের দিন মুখ লুকাবা কোথায়?',
  },
  {
    id: 5,
    category: 'ego',
    categoryLabel: 'ব্যক্তিগত খোঁচা',
    mood: 'sassy',
    title: 'শুধু মুখে বড় বড় কথা? 🥱',
    body: '"ডিসেম্বরে সব শেষ করবো" বলে চিল করার সাহস পাও কই? অ্যাপে ঢুকে প্রোগ্রেস বাড়াও!',
  },

  // ২. ডুওলিঙ্গো স্টাইল সাইকো/ড্রামাটিক ভয় দেখানো (Unhinged & Dramatic)
  {
    id: 6,
    category: 'unhinged',
    categoryLabel: 'সাইকো ডুওলিঙ্গো পুশ',
    mood: 'psycho',
    title: 'আমি কিন্তু তোমার দরজার ওপাশেই দাঁড়িয়ে আছি... 👁️',
    body: 'ফোন রেখে টেবিলে না বসলে রাতে ঘুমানোর সময় তোমার কানে এসে সূত্র আওড়াবো!',
  },
  {
    id: 7,
    category: 'unhinged',
    categoryLabel: 'সাইকো ডুওলিঙ্গো পুশ',
    mood: 'psycho',
    title: 'শেষবারের মতো সাবধান করছি! 🔪',
    body: 'আজ যদি টাস্ক ফাঁকি দাও, আমি কিন্তু নিজের স্টোরেজ নিজে থেকেই ডিলিট করে দিয়ে চলে যাব। তখন কে ট্র্যাক করবে?',
  },
  {
    id: 8,
    category: 'unhinged',
    categoryLabel: 'সাইকো ডুওলিঙ্গো পুশ',
    mood: 'psycho',
    title: 'স্ক্রিনের দিকে এভাবে হাঁ করে তাকিয়ো না! 🧟‍♂️',
    body: 'হ্যাঁ, তোমাকেই বলছি! আমি দেখতে পাচ্ছি তুমি ফাঁকিবাজি করছো। এখনই বই খোল।',
  },
  {
    id: 9,
    category: 'unhinged',
    categoryLabel: 'সাইকো ডুওলিঙ্গো পুশ',
    mood: 'crying',
    title: 'আমার চোখের পানি মুছে দেওয়ার মতো কেউ নেই... 😭',
    body: 'এত সুন্দর রুটিন আর ডার্ক থিম বানালাম তোমার জন্য, আর তুমি আমাকে ইগনোর করছো? কষ্ট পেলাম খুব।',
  },
  {
    id: 10,
    category: 'unhinged',
    categoryLabel: 'সাইকো ডুওলিঙ্গো পুশ',
    mood: 'psycho',
    title: 'তোমার বইগুলো আত্মহত্যার হুমকি দিচ্ছে! ⚰️',
    body: 'এত দিন ধরে না ছুঁলে তো ওদের দম আটকে যাবেই। একটু হাত বোলাও, অন্তত ১০ মিনিট পড়ো!',
  },

  // ৩. বন্ধুদের নিয়ে জেলাসি ও কম্পিটিশন (Peer Pressure & Jealousy)
  {
    id: 11,
    category: 'jealousy',
    categoryLabel: 'ফ্রেন্ড কম্পিটিশন',
    mood: 'jealous',
    title: 'তোমার ফ্রেন্ড অলরেডি লেভেল আপ করে ফেললো! 🚀',
    body: 'সে তো AURA বাড়িয়ে লিডারবোর্ডের শীর্ষে। তুমি কি ওর সাকসেস পোস্ট শেয়ার দেওয়ার প্রস্তুতি নিচ্ছ?',
  },
  {
    id: 12,
    category: 'jealousy',
    categoryLabel: 'ফ্রেন্ড কম্পিটিশন',
    mood: 'jealous',
    title: 'স্কোয়াডের বাকিরা কিন্তু হাসাহাসি করছে! 👥',
    body: 'সবাই দেখে ফেলেছে তুমি আজকে ১টা টাস্কেও টিক দাওনি। একটু ইজ্জত বাঁচাতে হলেও টেবিলে বসো!',
  },
  {
    id: 13,
    category: 'jealousy',
    categoryLabel: 'ফ্রেন্ড কম্পিটিশন',
    mood: 'jealous',
    title: 'লিডারবোর্ড থেকে তোমার নাম গায়েব হয়ে গেছে! 🕳️',
    body: 'তলানিতে পড়ে থাকার চেয়ে অ্যাপটা খুলে আজকের মূল অধ্যায়টা শেষ করে একটা জাম্প দাও!',
  },
  {
    id: 14,
    category: 'jealousy',
    categoryLabel: 'ফ্রেন্ড কম্পিটিশন',
    mood: 'sassy',
    title: 'নিজের সাথে আর কত চিটিং করবা? 🪞',
    body: 'আয়নায় তাকিয়ে বলতে পারবা তো যে আজকের দিনটা তুমি নষ্ট করোনি? এখনও ২ ঘণ্টা আছে, সেভ করো!',
  },
  {
    id: 15,
    category: 'jealousy',
    categoryLabel: 'ফ্রেন্ড কম্পিটিশন',
    mood: 'sassy',
    title: 'রেজাল্টের দিন কী বলবা সবাইকে? 🎤',
    body: '"একটু জন্য হয়নি" ডায়লগ রেডি রাখছো? নাকি শেষ কামব্যাকটা সত্যি সত্যি দিবা?',
  },

  // ৪. গভীর রাতের ইমোশনাল রিয়েলিটি চেক (Midnight Guilt-Trip)
  {
    id: 16,
    category: 'guilt',
    categoryLabel: 'মিডনাইট গিল্ট চেক',
    mood: 'crying',
    title: 'আরামের ঘুম হারাম হতে আর বেশি দিন বাকি নেই! ⏰',
    body: 'এখন যদি ঘুমাতে যাও, কাল সকালে চোখ মেলেই গিল্ট ফিলিংয়ে মরবা। অন্তত স্পেসড রিভিশনটা দিয়ে যাও!',
  },
  {
    id: 17,
    category: 'guilt',
    categoryLabel: 'মিডনাইট গিল্ট চেক',
    mood: 'crying',
    title: 'মা-বাবার মুখের দিকে তাকাতে পারবা তো? 🥺',
    body: 'তোমার ওপর কত মানুষের স্বপ্ন ঝুলে আছে। আর তুমি মাত্র ৩টা টাস্ক শেষ করতে পারছো না?',
  },
  {
    id: 18,
    category: 'guilt',
    categoryLabel: 'মিডনাইট গিল্ট চেক',
    mood: 'roast',
    title: 'ঘুম তোমাকে ডাকছে না, ফাঁকি ডাকছে! 🛌',
    body: 'ঘুমানোর ভান করো না, তুমি এখনো ফোন টিপছো! উঠে জাস্ট ইংরেজি পার্টটুকু সলভ করো।',
  },
  {
    id: 19,
    category: 'guilt',
    categoryLabel: 'মিডনাইট গিল্ট চেক',
    mood: 'roast',
    title: 'কাল সকালে নিজেকে কী সান্ত্বনা দিবা? 🌅',
    body: '"আজকে সারাদিন পড়ে ফাটায় ফেলবো"—এই মিথ্যা আর কত বলবা? আজকের কাজ আজকেই শেষ করো!',
  },
  {
    id: 20,
    category: 'guilt',
    categoryLabel: 'মিডনাইট গিল্ট চেক',
    mood: 'doodie',
    title: 'রাত ১২টা বাজার আগেই মিশন শেষ করো! 🕛',
    body: '১২টা বাজলেই আজকের AURA ধুলোয় মিশে যাবে। তোমার এত কষ্টের স্ট্রিক কি এতই সস্তা?',
  },

  // ৫. ফানি, ফ্রেন্ডলি ও সরাসরি খোঁচা (Playful & Roasting)
  {
    id: 21,
    category: 'roast',
    categoryLabel: 'ফ্রেন্ডলি রোস্টিং',
    mood: 'roast',
    title: 'ওস্তাদ, হাতপাখা দিয়ে বাতাস করবো নাকি পড়তে বসবা? 🪭',
    body: 'পড়ার মুড হওয়ার অপেক্ষা করতে করতে তো ডিসেম্বর চলে আসবে! মুড অফ থাকলে অফ মুডেই পড়ো।',
  },
  {
    id: 22,
    category: 'roast',
    categoryLabel: 'ফ্রেন্ডলি রোস্টিং',
    mood: 'roast',
    title: 'চা খেয়ে আসো, কিন্তু পড়তে বসো! ☕',
    body: 'মাথা কাজ করছে না? এক কাপ চা খাও, মুখে ঠান্ডা পানি দাও আর চ্যাপ্টারটার ওপর ঝাঁপিয়ে পড়ো!',
  },
  {
    id: 23,
    category: 'roast',
    categoryLabel: 'ফ্রেন্ডলি রোস্টিং',
    mood: 'crying',
    title: 'তোমার অলসতা দেখে আমি ডিপ্রেশনে চলে যাচ্ছি! 😩',
    body: 'এত সুন্দর রুটিন সাজিয়ে দেওয়ার পরেও যদি না পড়ো, আমি কিন্তু নোটিফিকেশন দেওয়া বন্ধ করে দেব!',
  },
  {
    id: 24,
    category: 'roast',
    categoryLabel: 'ফ্রেন্ডলি রোস্টিং',
    mood: 'roast',
    title: 'রিডিং টেবিল কি ভূত দেখেছে? 👻',
    body: 'টেবিলের কাছে গেলেই তোমার গায়ে জ্বর আসে কেন শুনি? বসো টেবিলে, মাত্র আধা ঘণ্টার খেলা!',
  },
  {
    id: 25,
    category: 'roast',
    categoryLabel: 'ফ্রেন্ডলি রোস্টিং',
    mood: 'sassy',
    title: 'নেট প্যাকের টাকা কি এভাবে নষ্ট করবা? 💸',
    body: 'ডাটা অন রেখে সোশ্যাল মিডিয়ায় চ্যাট না করে একটু অ্যাপে এসে প্র্যাকটিস করো। টাকাটা কাজে লাগাও!',
  },

  // ৬. ডেডলাইন ও লাস্ট ওয়ার্নিং (Do-or-Die Push)
  {
    id: 26,
    category: 'deadline',
    categoryLabel: 'লাস্ট ওয়ার্নিং',
    mood: 'doodie',
    title: '৩০ ডিসেম্বরের ক্যালেন্ডার লাল হয়ে যাচ্ছে! 🩸',
    body: 'আজকের ব্যাকলগ কালকের ওপর চাপলে কোনো শুক্রবারও তোমাকে বাঁচাতে পারবে না!',
  },
  {
    id: 27,
    category: 'deadline',
    categoryLabel: 'লাস্ট ওয়ার্নিং',
    mood: 'doodie',
    title: 'পরাজয় স্বীকার করে নিচ্ছ নাকি? 🏳️',
    body: 'এখনো লড়াই শেষ হয়নি বস! অ্যাপে এসে অন্তত একটা চ্যাপ্টারের এমসিকিউ সলভ করে ঘুমাও।',
  },
  {
    id: 28,
    category: 'deadline',
    categoryLabel: 'লাস্ট ওয়ার্নিং',
    mood: 'doodie',
    title: 'AURA 0 দেখতে একদম ভালো লাগছে না! ⚡',
    body: 'তোমার প্রোফাইলে AURA মাইনাস খাওয়ার মতো অবস্থা! জলদি এসে +৭০ AURA ক্লেইম করো।',
  },
  {
    id: 29,
    category: 'deadline',
    categoryLabel: 'লাস্ট ওয়ার্নিং',
    mood: 'doodie',
    title: 'কালকের দিনটা আরও কঠিন হতে যাচ্ছে... 🧗',
    body: 'কারণ আজকের ৩টা টাস্ক কালকের সাথে যোগ হবে। এই বিপদ এড়াতে এখনই শেষ করো!',
  },
  {
    id: 30,
    category: 'deadline',
    categoryLabel: 'লাস্ট ওয়ার্নিং',
    mood: 'sassy',
    title: 'প্রমিজ করছি, আর মাত্র ১৫ মিনিট! ⏳',
    body: 'আজকের দিনের ছোট টাস্কটা শেষ করো, এরপর আমি সারারাত আর বিরক্ত করব না। ডিল?',
  },
];

/**
 * Pick a smart savage notification based on current hour, streak, or random choice
 */
export function getContextualSavageNotification(hour?: number): SavageNotification {
  const currentHour = typeof hour === 'number' ? hour : new Date().getHours();

  let pool: SavageNotification[];

  // Late night (10 PM to 2 AM): Midnight Guilt-trip & Do-or-die
  if (currentHour >= 22 || currentHour < 3) {
    pool = SAVAGE_NOTIFICATIONS.filter(
      (n) => n.category === 'guilt' || n.category === 'deadline'
    );
  }
  // Evening prime reminder (8 PM - 10 PM): Unhinged, Ego, or Roasting
  else if (currentHour >= 19 && currentHour < 22) {
    pool = SAVAGE_NOTIFICATIONS.filter(
      (n) => n.category === 'unhinged' || n.category === 'ego' || n.category === 'jealousy'
    );
  }
  // Day / Afternoon: Roasting, Ego, Peer pressure
  else {
    pool = SAVAGE_NOTIFICATIONS;
  }

  if (pool.length === 0) pool = SAVAGE_NOTIFICATIONS;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Get random notification from any category
 */
export function getRandomSavageNotification(): SavageNotification {
  const randomIndex = Math.floor(Math.random() * SAVAGE_NOTIFICATIONS.length);
  return SAVAGE_NOTIFICATIONS[randomIndex];
}
