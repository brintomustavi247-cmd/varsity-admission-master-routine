import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  BookMarked,
  Brain,
  CalendarCheck2,
  Dna,
  Download,
  Flame,
  Globe,
  LogOut,
  Search,
  Trash2,
  Upload,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from './lib/firebase';
import { playMissionFanfare, playTaskChime } from './lib/sound';
import {
  computeMetrics,
  getRankInfo,
  isDayCompleted,
  ROUTINE_DATA,
  routineTaskKey,
  syllabusStepKey,
  TOTAL_CHAPTERS,
} from './data/routineData';
import type {
  CelebrationPayload,
  RoutineDay,
  RoutineTaskField,
  SquadMemberProgress,
  StoredStudyTrack,
  StudyTrack,
  SyllabusStepField,
} from './types/study';
import { LoginGate } from './components/LoginGate';
import { TrackSelectorModal } from './components/TrackSelectorModal';
import { ProfileSettingsSheet } from './components/ProfileSettingsSheet';
import { EveningReminderBanner } from './components/EveningReminderBanner';
import { UserAvatar } from './components/AvatarStack';
import {
  CelebrationModal,
  FloatingXpToast,
  triggerSmallConfetti,
} from './components/CelebrationModal';
import { RoutineView } from './components/RoutineView';
import { SyllabusView } from './components/SyllabusView';
import { SquadView } from './components/SquadView';
import { StrategyView } from './components/StrategyView';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { checkAndSendDailyReminder } from './lib/notifications';

type TabId = 'routine' | 'syllabus' | 'squad' | 'strategy';

const LOCAL_LEGACY_KEY = 'admission_revised_v3';

function sanitizeDisplayName(user: User): string {
  const raw =
    user.displayName?.trim() ||
    user.email?.split('@')[0]?.trim() ||
    'Student';
  return raw.slice(0, 100);
}

function sanitizePhotoURL(user: User): string {
  return (user.photoURL ?? '').slice(0, 500);
}

function parseLegacyLocalProgress(): {
  routine: Record<string, boolean>;
  syllabus: Record<string, boolean>;
  theme?: 'light' | 'dark';
} {
  const routine: Record<string, boolean> = {};
  const syllabus: Record<string, boolean> = {};
  let theme: 'light' | 'dark' | undefined;
  try {
    const raw = localStorage.getItem(LOCAL_LEGACY_KEY);
    if (!raw) return { routine, syllabus };
    const parsed = JSON.parse(raw);
    if (parsed?.settings?.theme === 'dark') theme = 'dark';
    if (parsed?.settings?.theme === 'light') theme = 'light';
    if (parsed?.routine && typeof parsed.routine === 'object') {
      for (const [dayKey, val] of Object.entries(parsed.routine)) {
        const dayNum = Number(dayKey);
        if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 61) continue;
        const v = val as Record<string, unknown>;
        if (v?.main === true) routine[routineTaskKey(dayNum, 'main')] = true;
        if (v?.eng === true) routine[routineTaskKey(dayNum, 'eng')] = true;
        if (v?.rev === true) routine[routineTaskKey(dayNum, 'rev')] = true;
      }
    }
    if (parsed?.syllabus && typeof parsed.syllabus === 'object') {
      for (const [chapKey, val] of Object.entries(parsed.syllabus)) {
        const match = /^chap_(\d+)$/.exec(chapKey);
        if (!match) continue;
        const idx = Number(match[1]);
        if (idx < 0 || idx >= TOTAL_CHAPTERS) continue;
        const v = val as Record<string, unknown>;
        if (v?.t === true) syllabus[syllabusStepKey(idx, 't')] = true;
        if (v?.b === true) syllabus[syllabusStepKey(idx, 'b')] = true;
        if (v?.r1 === true) syllabus[syllabusStepKey(idx, 'r1')] = true;
        if (v?.r2 === true) syllabus[syllabusStepKey(idx, 'r2')] = true;
      }
    }
  } catch {
    // Ignore malformed legacy localStorage
  }
  return { routine, syllabus, theme };
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('routine');
  const [searchQuery, setSearchQuery] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('admission_theme');
      if (saved === 'dark') return 'dark';
      const legacy = JSON.parse(
        localStorage.getItem(LOCAL_LEGACY_KEY) || '{}'
      );
      if (legacy?.settings?.theme === 'dark') return 'dark';
    } catch {
      // Ignore
    }
    return 'light';
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [studyTrack, setStudyTrack] = useState<StoredStudyTrack | null>(null);
  const [squadMembers, setSquadMembers] = useState<SquadMemberProgress[]>([]);
  const [dataReady, setDataReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [celebration, setCelebration] = useState<CelebrationPayload | null>(
    null
  );
  const [xpToast, setXpToast] = useState<{ id: number; text: string } | null>(
    null
  );
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sessionResumeDay, setSessionResumeDay] = useState<number | null>(null);
  const [jumpToDayRequest, setJumpToDayRequest] = useState<{
    day: number;
    nonce: number;
  } | null>(null);

  // Real-time local clock state (live date & hour syncs across midnight, focus & tab switch)
  const [nowClock, setNowClock] = useState(() => {
    const now = new Date();
    return {
      todayISO: now.toLocaleDateString('en-CA'),
      hour: now.getHours(),
    };
  });
  const { todayISO, hour: currentHour } = nowClock;

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [reminderDismissedKey, setReminderDismissedKey] = useState<
    string | null
  >(null);
  const [forcePreviewReminder, setForcePreviewReminder] =
    useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const xpToastTimer = useRef<number | null>(null);
  const statusToastTimer = useRef<number | null>(null);

  const showXpToast = useCallback((text: string) => {
    if (xpToastTimer.current) window.clearTimeout(xpToastTimer.current);
    setXpToast({ id: Date.now(), text });
    xpToastTimer.current = window.setTimeout(() => setXpToast(null), 2000);
  }, []);

  const showStatusToast = useCallback((text: string) => {
    if (statusToastTimer.current) window.clearTimeout(statusToastTimer.current);
    setStatusToast(text);
    statusToastTimer.current = window.setTimeout(
      () => setStatusToast(null),
      3000
    );
  }, []);

  // Apply Tailwind dark class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('admission_theme', theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  // Mandatory boot Firestore connection check
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Real-time clock watcher for live date rollover & 8 PM daily mission reminder
  useEffect(() => {
    const syncClock = () => {
      const now = new Date();
      const nextISO = now.toLocaleDateString('en-CA');
      const nextHour = now.getHours();
      setNowClock((prev) =>
        prev.todayISO === nextISO && prev.hour === nextHour
          ? prev
          : { todayISO: nextISO, hour: nextHour }
      );
    };

    const id = window.setInterval(syncClock, 15_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncClock();
    };
    window.addEventListener('focus', syncClock);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', syncClock);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setStudyTrack(null);
        setSessionResumeDay(null);
        setSquadMembers([]);
        setDataReady(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setSessionResumeDay(null);
  }, [user?.uid]);

  // Bootstrap user profile & subscribe to Firestore when signed in
  useEffect(() => {
    if (!authReady || !user) return;

    let cancelled = false;
    let unsubUserDoc: (() => void) | undefined;
    let unsubSquad: (() => void) | undefined;

    const uid = user.uid;
    const displayName = sanitizeDisplayName(user);
    const photoURL = sanitizePhotoURL(user);
    const email = (user.email ?? '').slice(0, 256);

    async function initDocsAndListeners() {
      try {
        const userRef = doc(db, 'users', uid);
        const squadRef = doc(db, 'squadProgress', uid);

        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${uid}`);
        }

        const legacy = parseLegacyLocalProgress();

        let resolvedUserTrack: StoredStudyTrack = 'unset';

        if (!userSnap.exists()) {
          const initialTheme = legacy.theme ?? theme;
          try {
            await setDoc(userRef, {
              uid,
              email,
              displayName,
              photoURL,
              theme: initialTheme,
              soundEnabled: true,
              studyTrack: 'unset',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
          }
        } else {
          const existing = userSnap.data();
          resolvedUserTrack =
            existing.studyTrack === 'english' ||
            existing.studyTrack === 'biology' ||
            existing.studyTrack === 'unset'
              ? existing.studyTrack
              : 'unset';

          if (
            existing.displayName !== displayName ||
            existing.photoURL !== photoURL ||
            existing.email !== email ||
            existing.studyTrack !== resolvedUserTrack
          ) {
            try {
              await updateDoc(userRef, {
                displayName,
                photoURL,
                email,
                studyTrack: resolvedUserTrack,
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
            }
          }
        }

        if (!cancelled) {
          setStudyTrack(resolvedUserTrack);
        }

        const initialSquadTrack: StudyTrack =
          resolvedUserTrack === 'biology' ? 'biology' : 'english';

        let squadSnap;
        try {
          squadSnap = await getDoc(squadRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `squadProgress/${uid}`);
        }

        if (!squadSnap.exists()) {
          const metrics = computeMetrics(
            legacy.routine,
            legacy.syllabus,
            initialSquadTrack
          );
          try {
            await setDoc(squadRef, {
              uid,
              displayName,
              photoURL,
              studyTrack: initialSquadTrack,
              routine: legacy.routine,
              syllabus: legacy.syllabus,
              daysDone: metrics.daysDone,
              chapsDone: metrics.chapsDone,
              xp: metrics.xp,
              streak: metrics.streak,
              isPublicSquadMember: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            handleFirestoreError(
              err,
              OperationType.CREATE,
              `squadProgress/${uid}`
            );
          }
        } else {
          const existing = squadSnap.data();
          const resolvedSquadTrack: StudyTrack =
            existing.studyTrack === 'biology'
              ? 'biology'
              : existing.studyTrack === 'english'
              ? 'english'
              : initialSquadTrack;

          if (
            existing.displayName !== displayName ||
            existing.photoURL !== photoURL ||
            existing.studyTrack !== resolvedSquadTrack
          ) {
            try {
              await updateDoc(squadRef, {
                displayName,
                photoURL,
                studyTrack: resolvedSquadTrack,
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(
                err,
                OperationType.UPDATE,
                `squadProgress/${uid}`
              );
            }
          }
        }

        if (cancelled) return;

        unsubUserDoc = onSnapshot(
          userRef,
          (snap) => {
            if (!snap.exists()) return;
            const d = snap.data();
            if (d.theme === 'dark' || d.theme === 'light') {
              setTheme(d.theme);
            }
            if (typeof d.soundEnabled === 'boolean') {
              setSoundEnabled(d.soundEnabled);
            }
            if (
              d.studyTrack === 'unset' ||
              d.studyTrack === 'english' ||
              d.studyTrack === 'biology'
            ) {
              setStudyTrack(d.studyTrack);
            } else {
              setStudyTrack('unset');
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${uid}`);
          }
        );

        const squadQuery = query(
          collection(db, 'squadProgress'),
          where('isPublicSquadMember', '==', true)
        );
        unsubSquad = onSnapshot(
          squadQuery,
          (snapshot) => {
            const members: SquadMemberProgress[] = [];
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              members.push({
                uid: String(d.uid ?? docSnap.id),
                displayName: String(d.displayName ?? 'Student'),
                photoURL: String(d.photoURL ?? ''),
                studyTrack:
                  d.studyTrack === 'biology' ? 'biology' : 'english',
                routine:
                  d.routine && typeof d.routine === 'object'
                    ? (d.routine as Record<string, boolean>)
                    : {},
                syllabus:
                  d.syllabus && typeof d.syllabus === 'object'
                    ? (d.syllabus as Record<string, boolean>)
                    : {},
                daysDone: Number(d.daysDone ?? 0),
                chapsDone: Number(d.chapsDone ?? 0),
                xp: Number(d.xp ?? 0),
                streak: Number(d.streak ?? 0),
                isPublicSquadMember: Boolean(d.isPublicSquadMember),
              });
            });
            setSquadMembers(members);
            setDataReady(true);
            setSyncError(null);
          },
          (err) => {
            setSyncError('ক্লাউড সিঙ্কে সমস্যা হয়েছে।');
            handleFirestoreError(err, OperationType.LIST, 'squadProgress');
          }
        );
      } catch (err) {
        if (!cancelled) {
          setSyncError(
            err instanceof Error
              ? err.message
              : 'Firestore সংযোগে সমস্যা হয়েছে।'
          );
          setDataReady(true);
        }
      }
    }

    initDocsAndListeners();

    return () => {
      cancelled = true;
      unsubUserDoc?.();
      unsubSquad?.();
    };
  }, [authReady, user]);

  const myProgress = useMemo(() => {
    if (!user) return null;
    return squadMembers.find((m) => m.uid === user.uid) ?? null;
  }, [squadMembers, user]);

  const myRoutine = useMemo(
    () => myProgress?.routine ?? {},
    [myProgress?.routine]
  );
  const mySyllabus = useMemo(
    () => myProgress?.syllabus ?? {},
    [myProgress?.syllabus]
  );

  const activeTrack: StudyTrack =
    studyTrack === 'biology' ? 'biology' : 'english';

  const myMetrics = useMemo(
    () => computeMetrics(myRoutine, mySyllabus, activeTrack),
    [myRoutine, mySyllabus, activeTrack]
  );
  const myRank = useMemo(() => getRankInfo(myMetrics.xp), [myMetrics.xp]);

  // Capture where the user left off once per login session so routine opens directly there
  useEffect(() => {
    if (!dataReady || !user || sessionResumeDay !== null) return;
    const firstPending = ROUTINE_DATA.find(
      (d) => !isDayCompleted(myRoutine, d.d)
    );
    setSessionResumeDay(firstPending?.d ?? 1);
  }, [dataReady, user, sessionResumeDay, myRoutine]);

  // Format live Bangla date & compute daily mission & 8 PM reminder state
  const todayBanglaShort = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('bn-BD', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(`${todayISO}T00:00:00`));
    } catch {
      return todayISO;
    }
  }, [todayISO]);

  const dailyMissionDay = useMemo(() => {
    const todayMatch = ROUTINE_DATA.find((d) => d.iso === todayISO);
    if (todayMatch) return todayMatch;
    return ROUTINE_DATA.find((d) => !isDayCompleted(myRoutine, d.d)) ?? null;
  }, [todayISO, myRoutine]);

  const dailyMissionRemaining = useMemo(() => {
    if (!dailyMissionDay) return 0;
    let done = 0;
    if (myRoutine[routineTaskKey(dailyMissionDay.d, 'main')]) done++;
    if (myRoutine[routineTaskKey(dailyMissionDay.d, 'eng')]) done++;
    if (myRoutine[routineTaskKey(dailyMissionDay.d, 'rev')]) done++;
    return 3 - done;
  }, [dailyMissionDay, myRoutine]);

  const currentAlertKey = dailyMissionDay
    ? `${todayISO}_${dailyMissionDay.d}`
    : null;
  const isAfter8PM = currentHour >= 20;
  const showEveningReminder =
    dataReady &&
    reminderEnabled &&
    dailyMissionRemaining > 0 &&
    (forcePreviewReminder ||
      (isAfter8PM && reminderDismissedKey !== currentAlertKey));

  // Trigger native phone notification when tasks are not solved and it is after 8 PM (or user tests reminder)
  useEffect(() => {
    if (
      dataReady &&
      reminderEnabled &&
      dailyMissionRemaining > 0 &&
      dailyMissionDay &&
      (isAfter8PM || forcePreviewReminder)
    ) {
      checkAndSendDailyReminder(
        dailyMissionDay.d,
        dailyMissionRemaining,
        forcePreviewReminder
      );
    }
  }, [
    dataReady,
    reminderEnabled,
    dailyMissionRemaining,
    dailyMissionDay,
    isAfter8PM,
    forcePreviewReminder,
  ]);

  const persistProgress = useCallback(
    async (
      nextRoutine: Record<string, boolean>,
      nextSyllabus: Record<string, boolean>,
      trackOverride?: StudyTrack
    ) => {
      if (!user) return;
      const targetTrack = trackOverride ?? activeTrack;
      const metrics = computeMetrics(nextRoutine, nextSyllabus, targetTrack);
      const squadRef = doc(db, 'squadProgress', user.uid);
      try {
        await updateDoc(squadRef, {
          displayName: sanitizeDisplayName(user),
          photoURL: sanitizePhotoURL(user),
          studyTrack: targetTrack,
          routine: nextRoutine,
          syllabus: nextSyllabus,
          daysDone: metrics.daysDone,
          chapsDone: metrics.chapsDone,
          xp: metrics.xp,
          streak: metrics.streak,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `squadProgress/${user.uid}`
        );
      }
    },
    [user, activeTrack]
  );

  const handleSelectTrack = useCallback(
    async (nextTrack: StudyTrack) => {
      if (!user) return;
      setStudyTrack(nextTrack);
      const userRef = doc(db, 'users', user.uid);
      const squadRef = doc(db, 'squadProgress', user.uid);
      const metrics = computeMetrics(myRoutine, mySyllabus, nextTrack);

      try {
        await updateDoc(userRef, {
          studyTrack: nextTrack,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }

      try {
        await updateDoc(squadRef, {
          studyTrack: nextTrack,
          chapsDone: metrics.chapsDone,
          xp: metrics.xp,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `squadProgress/${user.uid}`
        );
      }

      showStatusToast(
        nextTrack === 'biology'
          ? 'রুটিন ও সিলেবাসে জীববিজ্ঞান যুক্ত হয়েছে'
          : 'রুটিনে ইংরেজি সেট করা হয়েছে'
      );
    },
    [user, myRoutine, mySyllabus, showStatusToast]
  );

  const handleToggleRoutineTask = useCallback(
    async (
      day: RoutineDay,
      field: RoutineTaskField,
      buttonEl: HTMLElement | null
    ) => {
      if (!user) return;
      const key = routineTaskKey(day.d, field);
      const wasDone = Boolean(myRoutine[key]);
      const wasDayDone = isDayCompleted(myRoutine, day.d);

      const nextRoutine = { ...myRoutine };
      if (wasDone) {
        delete nextRoutine[key];
      } else {
        nextRoutine[key] = true;
      }

      const nowDayDone = isDayCompleted(nextRoutine, day.d);
      const nextMetrics = computeMetrics(nextRoutine, mySyllabus, activeTrack);
      const secondaryLabel =
        activeTrack === 'biology' ? 'জীববিজ্ঞান' : 'ইংরেজি';

      if (!wasDone) {
        if (!wasDayDone && nowDayDone) {
          playMissionFanfare(soundEnabled);
          setCelebration({
            id: `day_${day.d}_${Date.now()}`,
            kind: 'day',
            title: `Day ${String(day.d).padStart(2, '0')} মিশন সম্পন্ন!`,
            subtitle: `${day.date}-এর সবগুলো টাস্ক (মূল অধ্যায়, ${secondaryLabel} ও রিভিশন) শেষ হয়েছে।`,
            secondaryLabel,
            xpEarned: 70,
            totalXp: nextMetrics.xp,
            streak: nextMetrics.streak,
            daysDone: nextMetrics.daysDone,
            rankTitle: getRankInfo(nextMetrics.xp).title,
          });
        } else {
          playTaskChime(soundEnabled);
          triggerSmallConfetti(buttonEl);
          showXpToast('+20 AURA অর্জিত!');
        }
      }

      await persistProgress(nextRoutine, mySyllabus);
    },
    [
      user,
      myRoutine,
      mySyllabus,
      activeTrack,
      soundEnabled,
      persistProgress,
      showXpToast,
    ]
  );

  const handleToggleSyllabusStep = useCallback(
    async (
      _subject: string,
      chapIndex: number,
      chapName: string,
      step: SyllabusStepField,
      buttonEl: HTMLElement | null
    ) => {
      if (!user) return;
      const key = syllabusStepKey(chapIndex, step);
      const wasDone = Boolean(mySyllabus[key]);

      const steps: SyllabusStepField[] = ['t', 'b', 'r1', 'r2'];
      const wasChapDone = steps.every((s) =>
        Boolean(mySyllabus[syllabusStepKey(chapIndex, s)])
      );

      const nextSyllabus = { ...mySyllabus };
      if (wasDone) {
        delete nextSyllabus[key];
      } else {
        nextSyllabus[key] = true;
      }

      const nowChapDone = steps.every((s) =>
        Boolean(nextSyllabus[syllabusStepKey(chapIndex, s)])
      );
      const nextMetrics = computeMetrics(myRoutine, nextSyllabus, activeTrack);

      if (!wasDone) {
        if (!wasChapDone && nowChapDone) {
          playMissionFanfare(soundEnabled);
          setCelebration({
            id: `chap_${chapIndex}_${Date.now()}`,
            kind: 'chapter',
            title: `${chapName} মাস্টার্ড!`,
            subtitle: 'থিওরি, ব্যাংক ও ২ বার রিভিশন — ৪টি ধাপই সম্পন্ন হয়েছে।',
            xpEarned: 40,
            totalXp: nextMetrics.xp,
            streak: nextMetrics.streak,
            daysDone: nextMetrics.daysDone,
            rankTitle: getRankInfo(nextMetrics.xp).title,
          });
        } else {
          playTaskChime(soundEnabled);
          triggerSmallConfetti(buttonEl);
          showXpToast('+15 AURA অর্জিত!');
        }
      }

      await persistProgress(myRoutine, nextSyllabus);
    },
    [
      user,
      myRoutine,
      mySyllabus,
      activeTrack,
      soundEnabled,
      persistProgress,
      showXpToast,
    ]
  );

  const handleToggleTheme = useCallback(async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, {
          theme: nextTheme,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  }, [theme, user]);

  const handleToggleSound = useCallback(async () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, {
          soundEnabled: nextSound,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  }, [soundEnabled, user]);

  const handleExportData = useCallback(() => {
    const routineExport: Record<
      number,
      { main: boolean; eng: boolean; rev: boolean }
    > = {};
    for (const day of ROUTINE_DATA) {
      const m = Boolean(myRoutine[routineTaskKey(day.d, 'main')]);
      const e = Boolean(myRoutine[routineTaskKey(day.d, 'eng')]);
      const r = Boolean(myRoutine[routineTaskKey(day.d, 'rev')]);
      if (m || e || r) {
        routineExport[day.d] = { main: m, eng: e, rev: r };
      }
    }
    const syllabusExport: Record<
      string,
      { t: boolean; b: boolean; r1: boolean; r2: boolean }
    > = {};
    for (let i = 0; i < TOTAL_CHAPTERS; i++) {
      const t = Boolean(mySyllabus[syllabusStepKey(i, 't')]);
      const b = Boolean(mySyllabus[syllabusStepKey(i, 'b')]);
      const r1 = Boolean(mySyllabus[syllabusStepKey(i, 'r1')]);
      const r2 = Boolean(mySyllabus[syllabusStepKey(i, 'r2')]);
      if (t || b || r1 || r2) {
        syllabusExport[`chap_${i}`] = { t, b, r1, r2 };
      }
    }
    const payload = {
      routine: routineExport,
      syllabus: syllabusExport,
      settings: { theme },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admission-routine-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showStatusToast('ব্যাকআপ ফাইল ডাউনলোড হয়েছে');
  }, [myRoutine, mySyllabus, theme, showStatusToast]);

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object') {
          showStatusToast('সঠিক JSON ফাইল নয়');
          return;
        }
        const nextRoutine: Record<string, boolean> = {};
        const nextSyllabus: Record<string, boolean> = {};

        if (parsed.routine && typeof parsed.routine === 'object') {
          for (const [dayKey, val] of Object.entries(parsed.routine)) {
            const dayNum = Number(dayKey);
            if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 61) continue;
            const v = val as Record<string, unknown>;
            if (v?.main === true) nextRoutine[routineTaskKey(dayNum, 'main')] = true;
            if (v?.eng === true) nextRoutine[routineTaskKey(dayNum, 'eng')] = true;
            if (v?.rev === true) nextRoutine[routineTaskKey(dayNum, 'rev')] = true;
          }
        }
        if (parsed.syllabus && typeof parsed.syllabus === 'object') {
          for (const [chapKey, val] of Object.entries(parsed.syllabus)) {
            const match = /^chap_(\d+)$/.exec(chapKey);
            if (!match) continue;
            const idx = Number(match[1]);
            if (idx < 0 || idx >= TOTAL_CHAPTERS) continue;
            const v = val as Record<string, unknown>;
            if (v?.t === true) nextSyllabus[syllabusStepKey(idx, 't')] = true;
            if (v?.b === true) nextSyllabus[syllabusStepKey(idx, 'b')] = true;
            if (v?.r1 === true) nextSyllabus[syllabusStepKey(idx, 'r1')] = true;
            if (v?.r2 === true) nextSyllabus[syllabusStepKey(idx, 'r2')] = true;
          }
        }

        await persistProgress(nextRoutine, nextSyllabus);
        showStatusToast('ডাটা সফলভাবে ইমপোর্ট হয়েছে');
      } catch {
        showStatusToast('দুঃখিত, ফাইলটি সঠিক JSON নয়');
      }
    },
    [persistProgress, showStatusToast]
  );

  const handleConfirmReset = useCallback(async () => {
    setConfirmResetOpen(false);
    await persistProgress({}, {});
    showStatusToast('আপনার প্রগ্রেস রিসেট করা হয়েছে');
  }, [persistProgress, showStatusToast]);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 animate-pulse">
          <div className="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-11 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginGate theme={theme} onToggleTheme={handleToggleTheme} />;
  }

  const displayName = sanitizeDisplayName(user);
  const photoURL = sanitizePhotoURL(user);

  if (studyTrack === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 animate-pulse">
          <div className="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-11 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (studyTrack === 'unset') {
    return (
      <TrackSelectorModal
        displayName={displayName}
        onSelectTrack={handleSelectTrack}
      />
    );
  }

  const mobileTabTitle: Record<TabId, string> = {
    routine: 'রুটিন',
    syllabus: 'সিলেবাস',
    squad: `স্কোয়াড (${squadMembers.length})`,
    strategy: 'কৌশল',
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 pb-24 sm:pb-14">
      {/* Mobile Minimal Top Bar: Left Profile Avatar (Settings/Track/Logout) · Center Title · Optional Search */}
      <header className="sm:hidden sticky top-0 z-30 h-13 bg-white/92 dark:bg-slate-900/92 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setProfileSheetOpen(true)}
          aria-label="প্রোফাইল ও সেটিংস খুলুন"
          className="min-w-[44px] min-h-[44px] -ml-1 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
        >
          <UserAvatar
            displayName={displayName}
            photoURL={photoURL}
            size="sm"
            ringClassName="ring-2 ring-indigo-500/80"
          />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <div className="font-display font-extrabold text-sm text-slate-900 dark:text-slate-50 truncate">
            {mobileTabTitle[activeTab]}
          </div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono-num truncate">
            {todayBanglaShort} · {myMetrics.daysDone}/61 · {myMetrics.overallPct}%
          </div>
        </div>

        {activeTab === 'routine' ? (
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            aria-label={mobileFiltersOpen ? 'সার্চ বন্ধ করুন' : 'সার্চ ও ফিল্টার'}
            aria-expanded={mobileFiltersOpen}
            className={`min-w-[44px] min-h-[44px] -mr-1 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              mobileFiltersOpen
                ? 'text-[#4F46E5] dark:text-[#818CF8] bg-indigo-50 dark:bg-indigo-950/50'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {mobileFiltersOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        ) : (
          <div className="w-10 shrink-0" aria-hidden="true" />
        )}
      </header>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 space-y-3">
        {/* PWA Chrome / Add to Home Screen Banner */}
        <PwaInstallBanner />

        {/* Desktop Top Header */}
        <header className="hidden sm:flex rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 items-center justify-between gap-2 shadow-[0_6px_20px_rgba(79,70,229,0.05)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setProfileSheetOpen(true)}
              aria-label="প্রোফাইল ও সেটিংস খুলুন"
              className="flex items-center gap-2 rounded-xl pr-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <UserAvatar
                displayName={displayName}
                photoURL={photoURL}
                size="sm"
                ringClassName="ring-2 ring-indigo-500/70"
              />
              <span className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-50 truncate">
                অ্যাডমিশন রুটিন
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleSound}
              title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
              aria-label={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleTheme}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              aria-label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              title="লগ আউট"
              aria-label="লগ আউট"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Desktop Compact Progress, Track Switcher & Squad Strip */}
        <section className="hidden sm:block rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 space-y-2.5 shadow-[0_6px_20px_rgba(79,70,229,0.05)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div
              role="group"
              aria-label="রুটিন বিষয় পরিবর্তন"
              className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80"
            >
              <button
                type="button"
                onClick={() => {
                  if (activeTrack !== 'english') handleSelectTrack('english');
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTrack === 'english'
                    ? 'bg-gradient-to-r from-[#4F46E5] to-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ইংরেজি</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeTrack !== 'biology') handleSelectTrack('biology');
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTrack === 'biology'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <Dna className="w-3.5 h-3.5" />
                <span>জীববিজ্ঞান</span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="font-mono-num">{todayBanglaShort} · Lv.{myRank.level} ·</span>
                <span className="font-aura text-xs font-black text-[#FF1744] dark:text-[#FF2A55] tracking-wider drop-shadow-[0_0_8px_rgba(255,23,68,0.55)]">
                  {myMetrics.xp} AURA
                </span>
              </span>
              <div className="flex items-center -space-x-1.5">
                {squadMembers.map((m) => (
                  <UserAvatar
                    key={m.uid}
                    displayName={m.displayName}
                    photoURL={m.photoURL}
                    size="xs"
                    ringClassName={
                      m.uid === user.uid
                        ? 'ring-2 ring-indigo-500'
                        : 'ring-2 ring-white dark:ring-slate-900'
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap text-sm font-bold">
            <div className="flex items-center gap-5 flex-wrap">
              <span className="font-mono-num text-[#4F46E5] dark:text-[#818CF8]">
                {myMetrics.daysDone}/61{' '}
                <span className="font-sans font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                  দিন
                </span>
              </span>
              <span className="font-mono-num text-emerald-600 dark:text-emerald-400">
                {myMetrics.chapsDone}/{myMetrics.totalChapters}{' '}
                <span className="font-sans font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                  অধ্যায়
                </span>
              </span>
              <span className="font-mono-num text-amber-600 dark:text-amber-400 inline-flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5" />
                {myMetrics.streak}
              </span>
            </div>
            <span className="font-mono-num text-violet-600 dark:text-violet-400">
              {myMetrics.overallPct}%
            </span>
          </div>

          <div className="h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] via-violet-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${myMetrics.overallPct}%` }}
            />
          </div>
        </section>

        {/* Desktop 4-Column Navigation Tabs */}
        <nav
          aria-label="প্রধান নেভিগেশন"
          className="hidden sm:grid rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 grid-cols-4 gap-1 shadow-[0_6px_20px_rgba(79,70,229,0.05)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)]"
        >
          {(
            [
              { id: 'routine', label: 'রুটিন', icon: '📅' },
              { id: 'syllabus', label: 'সিলেবাস', icon: '📚' },
              {
                id: 'squad',
                label: `স্কোয়াড (${squadMembers.length})`,
                icon: '🏆',
              },
              { id: 'strategy', label: 'কৌশল', icon: '🧠' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap text-center truncate cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#4F46E5] text-white shadow-[0_6px_14px_rgba(79,70,229,0.28)]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-indigo-50/70 dark:hover:bg-slate-800'
              }`}
            >
              <span aria-hidden="true" className="mr-1">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Desktop Search & Backup/Reset Bar */}
        <div className="hidden sm:flex relative items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'routine') setActiveTab('routine');
              }}
              placeholder="অধ্যায় / টপিক সার্চ করুন..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50/60 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Backup</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50/60 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Import</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFile}
        />

        {/* Local State 8 PM Daily Mission Reminder Banner */}
        <EveningReminderBanner
          visible={showEveningReminder}
          day={dailyMissionDay}
          remainingTasks={dailyMissionRemaining}
          isPreview={forcePreviewReminder && !isAfter8PM}
          onJumpToMission={() => {
            if (!dailyMissionDay) return;
            setActiveTab('routine');
            setJumpToDayRequest({ day: dailyMissionDay.d, nonce: Date.now() });
          }}
          onDismiss={() => {
            setForcePreviewReminder(false);
            if (currentAlertKey) {
              setReminderDismissedKey(currentAlertKey);
            }
          }}
        />

        {syncError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium"
          >
            {syncError}
          </div>
        )}

        {/* Main Content Area */}
        <main>
          {!dataReady ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-36 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'routine' && (
                <RoutineView
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  studyTrack={activeTrack}
                  todayISO={todayISO}
                  myRoutine={myRoutine}
                  squadMembers={squadMembers}
                  currentUid={user.uid}
                  resumeDayNumber={sessionResumeDay ?? 1}
                  mobileFiltersOpen={mobileFiltersOpen}
                  jumpToDayRequest={jumpToDayRequest}
                  onToggleTask={handleToggleRoutineTask}
                  onReplayCelebration={(day) => {
                    const secondaryLabel =
                      activeTrack === 'biology' ? 'জীববিজ্ঞান' : 'ইংরেজি';
                    playMissionFanfare(soundEnabled);
                    setCelebration({
                      id: `day_${day.d}_${Date.now()}`,
                      kind: 'day',
                      title: `Day ${String(day.d).padStart(2, '0')} মিশন সম্পন্ন!`,
                      subtitle: `${day.date}-এর সবগুলো টাস্ক (মূল অধ্যায়, ${secondaryLabel} ও রিভিশন) শেষ হয়েছে।`,
                      secondaryLabel,
                      xpEarned: 70,
                      totalXp: myMetrics.xp,
                      streak: myMetrics.streak,
                      daysDone: myMetrics.daysDone,
                      rankTitle: myRank.title,
                    });
                  }}
                />
              )}

              {activeTab === 'syllabus' && (
                <SyllabusView
                  studyTrack={activeTrack}
                  mySyllabus={mySyllabus}
                  squadMembers={squadMembers}
                  currentUid={user.uid}
                  onToggleStep={handleToggleSyllabusStep}
                />
              )}

              {activeTab === 'squad' && (
                <SquadView
                  squadMembers={squadMembers}
                  currentUid={user.uid}
                />
              )}

              {activeTab === 'strategy' && <StrategyView />}
            </>
          )}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav
        aria-label="মোবাইল নেভিগেশন"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 items-center px-1"
      >
        {(
          [
            { id: 'routine', label: 'রুটিন', Icon: CalendarCheck2 },
            { id: 'syllabus', label: 'সিলেবাস', Icon: BookMarked },
            {
              id: 'squad',
              label: `স্কোয়াড (${squadMembers.length})`,
              Icon: Users,
            },
            { id: 'strategy', label: 'কৌশল', Icon: Brain },
          ] as const
        ).map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                if (id !== 'routine') setMobileFiltersOpen(false);
              }}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors cursor-pointer ${
                active
                  ? 'text-[#4F46E5] dark:text-[#818CF8]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.4]' : 'stroke-[1.9]'}`} />
              <span className="text-[11px] font-bold tracking-tight whitespace-nowrap truncate max-w-full px-1">
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Profile & Settings Bottom Sheet / Modal */}
      <ProfileSettingsSheet
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        displayName={displayName}
        email={user.email ?? ''}
        photoURL={photoURL}
        studyTrack={activeTrack}
        onSelectTrack={handleSelectTrack}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onPreviewCelebration={() => {
          const targetDay = dailyMissionDay ?? ROUTINE_DATA[0];
          const secondaryLabel =
            activeTrack === 'biology' ? 'জীববিজ্ঞান' : 'ইংরেজি';
          playMissionFanfare(soundEnabled);
          setCelebration({
            id: `preview_${targetDay.d}_${Date.now()}`,
            kind: 'day',
            title: `Day ${String(targetDay.d).padStart(2, '0')} মিশন সম্পন্ন!`,
            subtitle: `${targetDay.date}-এর সবগুলো টাস্ক (মূল অধ্যায়, ${secondaryLabel} ও রিভিশন) শেষ হয়েছে।`,
            secondaryLabel,
            xpEarned: 70,
            totalXp: myMetrics.xp,
            streak: myMetrics.streak,
            daysDone: myMetrics.daysDone,
            rankTitle: myRank.title,
          });
        }}
        reminderEnabled={reminderEnabled}
        onToggleReminder={() => setReminderEnabled((prev) => !prev)}
        onPreviewReminder={() => {
          setReminderEnabled(true);
          setForcePreviewReminder(true);
          if (dailyMissionRemaining === 0) {
            showStatusToast('আজকের সব টাস্ক ইতিমধ্যে সম্পন্ন হয়েছে!');
          }
        }}
        metrics={myMetrics}
        rankLevel={myRank.level}
        rankTitle={myRank.title}
        onExportData={handleExportData}
        onImportClick={() => fileInputRef.current?.click()}
        onRequestReset={() => setConfirmResetOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Gamified Celebration Overlay & Toasts */}
      <CelebrationModal
        celebration={celebration}
        onClose={() => setCelebration(null)}
        onReplay={() => playMissionFanfare(soundEnabled)}
      />
      <FloatingXpToast xpToast={xpToast} />

      {statusToast && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-lg whitespace-nowrap">
          {statusToast}
        </div>
      )}

      {/* In-App Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setConfirmResetOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl"
          >
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
              প্রগ্রেস রিসেট করবেন?
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              আপনার সব রুটিন ও সিলেবাসের টিক মুছে যাবে। স্কোয়াডের অন্য বন্ধুদের প্রগ্রেস অপরিবর্তিত থাকবে।
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white cursor-pointer"
              >
                হ্যাঁ, রিসেট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
