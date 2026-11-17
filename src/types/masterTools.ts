export type SubjectCategory = 'physics' | 'chemistry' | 'math' | 'biology' | 'english';

export type MistakeReason =
  | 'concept' // কনসেপ্ট বা বেসিক দুর্বলতা
  | 'calculation' // ক্যালকুলেশন বা গণনা ভুল
  | 'formula' // সূত্র মনে আসেনি বা ভুল সূত্র প্রয়োগ
  | 'careless' // প্রশ্ন ঠিকমতো না পড়া / অসাবধানতা
  | 'time'; // সময় সংকট / তাড়াহুড়ো

export interface MistakeEntry {
  id: string;
  subject: SubjectCategory;
  chapterName: string;
  questionText: string;
  wrongReason: MistakeReason;
  whatWentWrong: string;
  correctSolution: string;
  createdAt: string; // ISO string
  isMastered: boolean; // রিভিশনে সমাধান হয়েছে কিনা
}

export interface TargetVarsityInfo {
  id: string;
  name: string;
  shortName: string;
  unit: string;
  faculty: string;
  examDateEstimate: string; // e.g. "মে ২০২৭" or ISO date
  targetDateISO: string; // YYYY-MM-DD for countdown
  calculatorAllowed: boolean;
  marksBreakdown: string;
  tips: string;
}

export interface UserTargetVarsityGoal {
  varsityId: string;
  dreamSubject: string;
  targetRank: string;
  personalMotto: string;
  customExamDate?: string; // YYYY-MM-DD
  updatedAt: string;
}

export interface FormulaCard {
  id: string;
  subject: SubjectCategory;
  paper: '1st' | '2nd' | 'general';
  chapterName: string;
  title: string;
  formula: string;
  explanation: string;
  hackTip?: string;
  importantFor: string[]; // e.g. ['DU', 'RU', 'GST', 'JU']
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'routine' | 'streak' | 'syllabus' | 'aura' | 'mistake';
  requiredCount: number;
  unlocked: boolean;
  currentCount: number;
  unlockedAt?: string;
}
