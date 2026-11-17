import type {
  StudySession,
  DailyStudyLog,
  MonthStudySummary,
} from '../types/timer';

const STORAGE_KEY = 'varsity_study_sessions_v1';

export function loadStudySessions(): StudySession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('Failed to parse study sessions from localStorage:', err);
    return [];
  }
}

export function saveStudySessions(sessions: StudySession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to save study sessions to localStorage:', err);
  }
}

export function addStudySession(session: StudySession): StudySession[] {
  const current = loadStudySessions();
  const next = [session, ...current];
  saveStudySessions(next);
  return next;
}

export function deleteStudySession(id: string): StudySession[] {
  const current = loadStudySessions();
  const next = current.filter((s) => s.id !== id);
  saveStudySessions(next);
  return next;
}

export function getTodayStudyMinutes(sessions: StudySession[]): number {
  const todayISO = new Date().toLocaleDateString('en-CA');
  return sessions
    .filter((s) => s.date === todayISO)
    .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
}

export function getTodayStudyAura(sessions: StudySession[]): number {
  const todayISO = new Date().toLocaleDateString('en-CA');
  return sessions
    .filter((s) => s.date === todayISO)
    .reduce((sum, s) => sum + (s.auraEarned || 0), 0);
}

export function getStudyLogByDate(
  sessions: StudySession[],
  date: string
): DailyStudyLog {
  const daySessions = sessions.filter((s) => s.date === date);
  const totalMinutes = daySessions.reduce(
    (sum, s) => sum + (s.durationMinutes || 0),
    0
  );

  const subjectsSummary: Record<string, number> = {};
  for (const s of daySessions) {
    const subj = s.subject || 'সাধারণ স্টাডি';
    subjectsSummary[subj] = (subjectsSummary[subj] || 0) + (s.durationMinutes || 0);
  }

  return {
    date,
    totalMinutes,
    sessionCount: daySessions.length,
    sessions: daySessions,
    subjectsSummary,
  };
}

export function getMonthStudySummary(
  sessions: StudySession[],
  year: number,
  month: number
): MonthStudySummary {
  const logsByDate: Record<string, DailyStudyLog> = {};
  let totalMinutes = 0;
  let bestDayMinutes = 0;
  let bestDayDate = '';

  // Get total days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateISO = `${year}-${mm}-${dd}`;
    const log = getStudyLogByDate(sessions, dateISO);
    logsByDate[dateISO] = log;

    if (log.totalMinutes > 0) {
      totalMinutes += log.totalMinutes;
      if (log.totalMinutes > bestDayMinutes) {
        bestDayMinutes = log.totalMinutes;
        bestDayDate = dateISO;
      }
    }
  }

  const activeDaysCount = Object.values(logsByDate).filter(
    (l) => l.totalMinutes > 0
  ).length;

  const dailyAverageMinutes =
    activeDaysCount > 0 ? Math.round(totalMinutes / activeDaysCount) : 0;

  return {
    year,
    month,
    totalMinutes,
    activeDaysCount,
    bestDayMinutes,
    bestDayDate,
    dailyAverageMinutes,
    logsByDate,
  };
}

export function formatDurationBangla(minutes: number): string {
  if (minutes <= 0) return '০ মিনিট';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  const toBn = (n: number) =>
    String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);

  if (h > 0 && m > 0) {
    return `${toBn(h)} ঘণ্টা ${toBn(m)} মিনিট`;
  }
  if (h > 0) {
    return `${toBn(h)} ঘণ্টা`;
  }
  return `${toBn(m)} মিনিট`;
}

export function formatDurationShort(minutes: number): string {
  if (minutes <= 0) return '০ মি.';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  const toBn = (n: number) =>
    String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);

  if (h > 0 && m > 0) {
    return `${toBn(h)}ঘ ${toBn(m)}মি`;
  }
  if (h > 0) {
    return `${toBn(h)} ঘণ্টা`;
  }
  return `${toBn(m)} মিনিট`;
}
