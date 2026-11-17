import type { AchievementBadge } from '../types/masterTools';

export interface BadgeEvaluationInput {
  daysDone: number;
  streak: number;
  xp: number;
  chapsDone: number;
  mistakesLoggedCount?: number;
  mistakesResolvedCount?: number;
}

export const BADGE_DEFINITIONS: Omit<AchievementBadge, 'unlocked' | 'currentCount'>[] = [
  {
    id: 'first_step',
    title: 'প্রথম পদক্ষেপ',
    description: 'রুটিনের প্রথম দিনের সব মিশন সফলভাবে সম্পন্ন করেছেন।',
    icon: '🚀',
    category: 'routine',
    requiredCount: 1,
  },
  {
    id: 'streak_fire_3',
    title: 'ধারাবাহিকতার স্ফুলিঙ্গ',
    description: 'টানা ৩ দিন স্ট্রিক ধরে রেখে টেবিলে নিয়মিত থেকেছেন।',
    icon: '🔥',
    category: 'streak',
    requiredCount: 3,
  },
  {
    id: 'streak_warrior_7',
    title: 'সপ্তাহ বিজয়ী যোদ্ধা',
    description: 'টানা ৭ দিনের স্ট্রিক বজায় রেখে পড়ার আগুনে জ্বলেছেন।',
    icon: '⚡',
    category: 'streak',
    requiredCount: 7,
  },
  {
    id: 'chap_conqueror_10',
    title: 'অধ্যায় জয়ী',
    description: 'অন্তত ১০টি অধ্যায়ের থিওরি ও প্রশ্নব্যাংক কভার করেছেন।',
    icon: '📚',
    category: 'syllabus',
    requiredCount: 10,
  },
  {
    id: 'half_century',
    title: 'হাফ সেঞ্চুরি মাস্টার',
    description: '৩০ দিনেরও বেশি রুটিন টাস্ক সফলভাবে পূরণ করেছেন।',
    icon: '🎯',
    category: 'routine',
    requiredCount: 30,
  },
  {
    id: 'aura_titan_500',
    title: 'অরা টাইটান (৫০০+)',
    description: '৫০০ এর বেশি Aura পয়েন্ট অর্জন করে লিডারবোর্ডে উঠেছেন।',
    icon: '🛡️',
    category: 'aura',
    requiredCount: 500,
  },
  {
    id: 'aura_legend_1000',
    title: 'অরা লিজেন্ড (১০০০+)',
    description: '১০০০ এর বেশি Aura অর্জন করে অনন্য উচ্চতায় পৌঁছেছেন।',
    icon: '👑',
    category: 'aura',
    requiredCount: 1000,
  },
  {
    id: 'mistake_hunter',
    title: 'ভুল খাতা শিকারী',
    description: 'ভুল খাতায় অন্তত ৩টি ভুল টুকে নিখুঁতভাবে সংশোধন করেছেন।',
    icon: '📝',
    category: 'mistake',
    requiredCount: 3,
  },
  {
    id: 'grandmaster_routine',
    title: 'গ্র্যান্ডমাস্টার অব রুটিন',
    description: 'সম্পূর্ণ ৬১ দিনের অ্যাডমিশন রুটিনের সিংহভাগ সফলভাবে সমাপ্ত।',
    icon: '🎓',
    category: 'routine',
    requiredCount: 55,
  },
];

export function computeBadges(input: BadgeEvaluationInput): AchievementBadge[] {
  return BADGE_DEFINITIONS.map((def) => {
    let currentCount = 0;
    switch (def.id) {
      case 'first_step':
      case 'half_century':
      case 'grandmaster_routine':
        currentCount = input.daysDone;
        break;
      case 'streak_fire_3':
      case 'streak_warrior_7':
        currentCount = input.streak;
        break;
      case 'chap_conqueror_10':
        currentCount = input.chapsDone;
        break;
      case 'aura_titan_500':
      case 'aura_legend_1000':
        currentCount = input.xp;
        break;
      case 'mistake_hunter':
        currentCount = (input.mistakesLoggedCount || 0) + (input.mistakesResolvedCount || 0);
        break;
      default:
        currentCount = 0;
    }

    const unlocked = currentCount >= def.requiredCount;
    return {
      ...def,
      currentCount,
      unlocked,
    };
  });
}
