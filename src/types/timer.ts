export type TimerMode = 'pomodoro' | 'stopwatch';
export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';
export type AmbientSoundType = 'none' | 'rain' | 'waves' | 'cafe' | 'ticking';

export interface StudySession {
  id: string;
  date: string; // ISO date 'YYYY-MM-DD'
  startTime: number;
  endTime: number;
  durationMinutes: number; // e.g. 25
  durationSeconds: number; // total seconds studied
  subject: string; // e.g. 'পদার্থবিজ্ঞান', 'উচ্চতর গণিত', 'ইংরেজি', 'জীববিজ্ঞান', 'রসায়ন', 'স্পেসড রিভিশন'
  taskName?: string; // e.g. 'Day 01 মূল অধ্যায়'
  mode: TimerMode;
  auraEarned: number;
  notes?: string;
}

export interface DailyStudyLog {
  date: string; // 'YYYY-MM-DD'
  totalMinutes: number;
  sessionCount: number;
  sessions: StudySession[];
  subjectsSummary: Record<string, number>; // subject -> minutes
}

export interface MonthStudySummary {
  year: number;
  month: number; // 0-indexed (0 = Jan, 10 = Nov)
  totalMinutes: number;
  activeDaysCount: number;
  bestDayMinutes: number;
  bestDayDate: string;
  dailyAverageMinutes: number;
  logsByDate: Record<string, DailyStudyLog>;
}
