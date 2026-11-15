export type StudyTrack = 'english' | 'biology';
export type StoredStudyTrack = 'unset' | StudyTrack;

export type DayType =
  | 'normal'
  | 'test'
  | 'buffer'
  | 'revision'
  | 'solve'
  | 'model'
  | 'final';

export type RoutineTaskField = 'main' | 'eng' | 'rev';
export type SyllabusStepField = 't' | 'b' | 'r1' | 'r2';

export interface RoutineDay {
  d: number;
  iso: string;
  date: string;
  main: string;
  eng: string;
  rev: string;
  type: DayType;
}

export interface SquadMemberProgress {
  uid: string;
  displayName: string;
  photoURL: string;
  studyTrack: StudyTrack;
  routine: Record<string, boolean>;
  syllabus: Record<string, boolean>;
  daysDone: number;
  chapsDone: number;
  xp: number;
  streak: number;
  isPublicSquadMember: boolean;
}

export interface UserPrivateSettings {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  studyTrack: StoredStudyTrack;
}

export interface CelebrationPayload {
  id: string;
  kind: 'day' | 'chapter' | 'subject';
  title: string;
  subtitle: string;
  secondaryLabel?: string;
  xpEarned: number;
  totalXp: number;
  streak: number;
  daysDone: number;
  rankTitle: string;
}

export interface RankInfo {
  level: number;
  title: string;
  minXp: number;
  nextXp: number;
  progressPct: number;
}
