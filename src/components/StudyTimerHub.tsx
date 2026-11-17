import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar as CalendarIcon,
  Timer as TimerIcon,
  Clock,
  BookOpen,
  Coffee,
  Flag,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  ChevronDown,
  Zap,
  Lightbulb,
  PictureInPicture2,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import type {
  StudySession,
  TimerMode,
  PomodoroPhase,
  AmbientSoundType,
} from '../types/timer';
import {
  loadStudySessions,
  addStudySession,
  deleteStudySession,
  getTodayStudyMinutes,
  getTodayStudyAura,
  formatDurationBangla,
} from '../lib/studyTimerStorage';
import {
  playAmbientSound,
  stopAmbientSound,
  playTimerFinishFanfare,
} from '../lib/ambientSound';
import { playWarningAlertSound } from '../lib/sound';
import { sendPhoneNotification } from '../lib/notifications';
import { MascotCharacter } from './MascotCharacter';
import { StudyCalendarView } from './StudyCalendarView';
import {
  AllowedAppsModal,
  type PhoneAllowedApp,
} from './AllowedAppsModal';

interface StudyTimerHubProps {
  currentUid: string;
  userDisplayName: string;
  onSessionCompleteAura?: (aura: number) => void;
  onActiveTimerChange?: (active: boolean, remainingSec: number, subject: string) => void;
}

interface TimerPreset {
  id: string;
  label: string;
  minutes: number;
  mode: TimerMode;
  phase?: PomodoroPhase;
  badge?: string;
  icon?: string;
}

const PRESETS: TimerPreset[] = [
  { id: 'p25', label: '25m Focus', minutes: 25, mode: 'pomodoro', phase: 'focus', badge: 'জনপ্রিয়', icon: '🎯' },
  { id: 'p45', label: '45m Deep', minutes: 45, mode: 'pomodoro', phase: 'focus', icon: '⚡' },
  { id: 'p60', label: '60m Marathon', minutes: 60, mode: 'pomodoro', phase: 'focus', icon: '🔥' },
  { id: 'b5', label: '5m Break', minutes: 5, mode: 'pomodoro', phase: 'shortBreak', icon: '☕' },
  { id: 'b15', label: '15m Break', minutes: 15, mode: 'pomodoro', phase: 'longBreak', icon: '🌴' },
  { id: 'stopwatch', label: 'Stopwatch', minutes: 0, mode: 'stopwatch', icon: '⏱️' },
];

const SUBJECTS = [
  'পদার্থবিজ্ঞান',
  'উচ্চতর গণিত',
  'রসায়ন',
  'জীববিজ্ঞান',
  'ইংরেজি',
  'স্পেসড রিভিশন',
  'প্রশ্ন ব্যাংক অনুশীলন',
];

const MOTIVATION_QUOTES = [
  'আজ ফোকাস, আগামীকাল উদযাপন।',
  'আজকের পরিশ্রম, আগামীকালের ঢাকা বিশ্ববিদ্যালয়!',
  'এক ঘণ্টার গভীর মনোযোগ, এক দিনের বিভ্রান্তির চেয়ে শ্রেষ্ঠ।',
  'প্রতিটি ফোকাস মিনিট তোমাকে তোমার ড্রিম ক্যাম্পাসের দিকে এগিয়ে নিচ্ছে!',
  'আধা ঘণ্টার লড়াই তোমাকে হাজার জনের চেয়ে এগিয়ে রাখবে।',
];

interface StopwatchLap {
  id: number;
  timeSec: number;
  formatted: string;
  splitSec: number;
}

export function StudyTimerHub({
  currentUid: _currentUid,
  userDisplayName: _userDisplayName,
  onSessionCompleteAura,
  onActiveTimerChange,
}: StudyTimerHubProps) {
  // Main Dual Hub Tab: 'timer' | 'calendar'
  const [hubTab, setHubTab] = useState<'timer' | 'calendar'>('timer');

  // Selected Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('p25');
  const activePreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  // Subject
  const [selectedSubject, setSelectedSubject] = useState('পদার্থবিজ্ঞান');

  // Live Timer State
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [phase, setPhase] = useState<PomodoroPhase>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchLaps, setStopwatchLaps] = useState<StopwatchLap[]>([]);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Ambient sound
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const [showSoundMenu, setShowSoundMenu] = useState(false);

  // Screen Wake Lock API
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockSentinelRef = useRef<any>(null);

  // Fullscreen / Zen Mode
  const [isZenMode, setIsZenMode] = useState(false);

  // Custom minute modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMinInput, setCustomMinInput] = useState(30);

  // Allowed Apps Hub Modal
  const [showAllowedApps, setShowAllowedApps] = useState(false);
  const [allowedAppsList, setAllowedAppsList] = useState<PhoneAllowedApp[]>(() => {
    try {
      const raw = localStorage.getItem('varsity_phone_allowed_apps_v3');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  // Anti-Distraction Lock & Penalty Tracking
  const [focusLockActive, setFocusLockActive] = useState(true);
  const [showDistractionWarning, setShowDistractionWarning] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [lastPenaltySec, setLastPenaltySec] = useState(0);
  const exitTimestampRef = useRef<number | null>(null);
  const isTemporaryAllowedExitRef = useRef<boolean>(false);

  // Dynamic Motivation Quote
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Hidden Video & Canvas for Picture-in-Picture (PiP) Floating Widget
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPipActive, setIsPipActive] = useState(false);

  // Stored Study Sessions
  const [sessions, setSessions] = useState<StudySession[]>(() => loadStudySessions());

  // Haptic feedback helper
  const triggerHaptic = (ms = 20) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {}
    }
  };

  // Broadcast remaining time to parent
  useEffect(() => {
    onActiveTimerChange?.(
      isRunning,
      mode === 'pomodoro' ? secondsLeft : stopwatchSeconds,
      selectedSubject
    );
  }, [isRunning, secondsLeft, stopwatchSeconds, mode, selectedSubject, onActiveTimerChange]);

  // ANDROID BACK BUTTON & SWIPE GESTURE LOCK (Popstate Trap)
  useEffect(() => {
    if (!isRunning || !focusLockActive) return;

    // Push barrier entry into browser history to trap Android back key / gesture
    window.history.pushState({ varsityStudyLock: true }, '', window.location.href);

    const handlePopState = () => {
      if (isRunning && focusLockActive) {
        // Prevent exiting! Push barrier again
        window.history.pushState({ varsityStudyLock: true }, '', window.location.href);

        // Immediately trigger dramatic exit warning
        setShowDistractionWarning(true);
        setDistractionCount((prev) => prev + 1);
        setLastPenaltySec(1);
        playWarningAlertSound(true);
        triggerHaptic(350);

        sendPhoneNotification({
          title: '🚨 ফোকাস লক সক্রিয়! বের হওয়া যাবে না!',
          body: `তোমার ${selectedSubject} পড়ার সেশন চলছে! ব্যাক বাটন চেপে বের হওয়া নিষেধ!`,
          mood: 'panic',
        });

        // Deduct penalty
        onSessionCompleteAura?.(-25);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isRunning, focusLockActive, selectedSubject, onSessionCompleteAura]);

  // BROWSER TAB CLOSE & RELOAD LOCK (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning && focusLockActive) {
        e.preventDefault();
        e.returnValue = 'পড়ার সেশন চলছে! বের হলে Aura জরিমানা কাটা হবে!';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning, focusLockActive]);

  // Screen Wake Lock API Controller (keeps phone screen on while studying!)
  useEffect(() => {
    if (!isRunning) {
      if (wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current.release().catch(() => {});
        wakeLockSentinelRef.current = null;
        setWakeLockActive(false);
      }
      return;
    }

    let isSubscribed = true;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          const sentinel = await (navigator as any).wakeLock.request('screen');
          if (isSubscribed) {
            wakeLockSentinelRef.current = sentinel;
            setWakeLockActive(true);
            sentinel.addEventListener('release', () => {
              if (isSubscribed) setWakeLockActive(false);
            });
          }
        } catch (err) {
          console.warn('Wake Lock request error:', err);
        }
      }
    };

    requestWakeLock();
    return () => {
      isSubscribed = false;
      if (wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current.release().catch(() => {});
        wakeLockSentinelRef.current = null;
        setWakeLockActive(false);
      }
    };
  }, [isRunning]);

  // Ambient Sound Controller
  useEffect(() => {
    if (isRunning && ambientSound !== 'none') {
      playAmbientSound(ambientSound, ambientVolume);
    } else {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [isRunning, ambientSound, ambientVolume]);

  // INSTANT DISTRACTION & TAB EXIT DETECTION WITH REAL AURA PENALTY
  useEffect(() => {
    const triggerPenaltyAndAlert = (awaySec = 1) => {
      if (!isRunning || !focusLockActive) return;
      if (isTemporaryAllowedExitRef.current) {
        // Allowed study app was launched; suppress warning
        isTemporaryAllowedExitRef.current = false;
        return;
      }

      // 1. Immediate native phone notification on lockscreen / status shade
      sendPhoneNotification({
        title: '🚨 ফোকাস ভঙ্গ! দ্রুত টেবিলে আসো!',
        body: `তোমার ${selectedSubject} ফোকাস টাইমার কিন্তু চলছে! এখনই না ফিরলে AURA জরিমানা কাটা হবে!`,
        mood: 'panic',
      });

      // 2. Alarm sound & phone vibration
      playWarningAlertSound(true);
      triggerHaptic(400);

      // 3. Trigger immediate distraction overlay
      setShowDistractionWarning(true);
      setLastPenaltySec(Math.max(1, awaySec));
      setDistractionCount((prev) => prev + 1);

      // 4. Deduct real Aura from squad progress
      onSessionCompleteAura?.(-25);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isRunning && focusLockActive) {
          exitTimestampRef.current = Date.now();
          triggerPenaltyAndAlert(1);
        }
      } else {
        if (exitTimestampRef.current && isRunning && focusLockActive) {
          const awayDurationMs = Date.now() - exitTimestampRef.current;
          const awaySec = Math.round(awayDurationMs / 1000);
          exitTimestampRef.current = null;

          triggerPenaltyAndAlert(awaySec);
        }
      }
    };

    const handleWindowBlur = () => {
      if (isRunning && focusLockActive) {
        triggerPenaltyAndAlert(1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isRunning, focusLockActive, selectedSubject, onSessionCompleteAura]);

  // Format seconds to English digits HH:MM:SS or MM:SS
  const formatTimeEnglish = (totalSec: number, showHoursAlways = false) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    if (h > 0 || showHoursAlways) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Picture-in-Picture (PiP) Floating Widget Renderer
  const updatePipCanvas = useCallback(() => {
    const canvas = pipCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark sleek background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, w, h);

    // Cyan/Blue header bar
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(0, 0, w, 8);

    // Subject
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ ${selectedSubject.slice(0, 18)}`, w / 2, 38);

    // Time display
    const timeText =
      mode === 'pomodoro'
        ? formatTimeEnglish(secondsLeft)
        : formatTimeEnglish(stopwatchSeconds);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 48px monospace';
    ctx.fillText(timeText, w / 2, 94);

    // Status footer
    ctx.fillStyle = isRunning ? '#10B981' : '#F59E0B';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(
      isRunning ? '● ফোকাস চলছে · কিরা সাথে আছে' : '⏸ বিরতি',
      w / 2,
      130
    );
  }, [selectedSubject, mode, secondsLeft, stopwatchSeconds, isRunning]);

  useEffect(() => {
    updatePipCanvas();
  }, [updatePipCanvas]);

  // Toggle Picture-in-Picture Floating Mode
  const handleTogglePip = async () => {
    triggerHaptic(25);
    const video = pipVideoRef.current;
    const canvas = pipCanvasRef.current;
    if (!video || !canvas) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else {
        updatePipCanvas();
        if (!video.srcObject) {
          const stream = (canvas as any).captureStream(10);
          video.srcObject = stream;
        }
        await video.play();
        await video.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (err) {
      console.warn('PiP request error:', err);
    }
  };

  // Handle Session Completion
  const handleCompleteSession = useCallback(
    (studiedMinutes: number, studiedSeconds: number) => {
      if (studiedSeconds < 30) return;

      const effectiveMinutes = Math.max(1, studiedMinutes);
      const earnedAura = effectiveMinutes + 20;

      const newSession: StudySession = {
        id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        date: new Date().toLocaleDateString('en-CA'),
        startTime: sessionStartTimeRef.current,
        endTime: Date.now(),
        durationMinutes: effectiveMinutes,
        durationSeconds: studiedSeconds,
        subject: selectedSubject,
        taskName: `${selectedSubject} ফোকাস স্টাডি`,
        mode,
        auraEarned: earnedAura,
      };

      const updated = addStudySession(newSession);
      setSessions(updated);
      onSessionCompleteAura?.(earnedAura);
      playTimerFinishFanfare();

      sendPhoneNotification({
        title: 'স্টাডি সেশন সম্পন্ন! 🏆✨',
        body: `সাবাশ! ${effectiveMinutes} মিনিট ${selectedSubject} পড়া শেষ হয়েছে! +${earnedAura} Aura স্কোয়াডে যুক্ত হয়েছে!`,
        mood: 'happy',
      });
    },
    [selectedSubject, mode, onSessionCompleteAura]
  );

  // Timer Tick Interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (mode === 'pomodoro') {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            handleCompleteSession(activePreset.minutes, activePreset.minutes * 60);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setStopwatchSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, activePreset.minutes, handleCompleteSession]);

  // Handle Play / Pause Toggle with Haptics
  const handleTogglePlay = () => {
    triggerHaptic(30);
    if (!isRunning) {
      sessionStartTimeRef.current = Date.now();
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  // Handle Reset with Haptics
  const handleReset = () => {
    triggerHaptic(20);
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setSecondsLeft(activePreset.minutes * 60);
    } else {
      if (stopwatchSeconds >= 60) {
        handleCompleteSession(Math.floor(stopwatchSeconds / 60), stopwatchSeconds);
      }
      setStopwatchSeconds(0);
      setStopwatchLaps([]);
    }
  };

  // Record a Lap in Stopwatch Mode
  const recordLap = () => {
    triggerHaptic(15);
    if (stopwatchSeconds === 0) return;
    const lastLapTime = stopwatchLaps.length > 0 ? stopwatchLaps[0].timeSec : 0;
    const splitSec = stopwatchSeconds - lastLapTime;
    const newLap: StopwatchLap = {
      id: stopwatchLaps.length + 1,
      timeSec: stopwatchSeconds,
      formatted: formatTimeEnglish(stopwatchSeconds),
      splitSec,
    };
    setStopwatchLaps((prev) => [newLap, ...prev]);
  };

  // Select Preset Handler
  const handleSelectPreset = (p: TimerPreset) => {
    triggerHaptic(15);
    setSelectedPresetId(p.id);
    setIsRunning(false);
    if (p.mode === 'stopwatch') {
      setMode('stopwatch');
      setStopwatchSeconds(0);
      setStopwatchLaps([]);
    } else {
      setMode('pomodoro');
      setPhase(p.phase || 'focus');
      setSecondsLeft(p.minutes * 60);
    }
  };

  // Launch Allowed App Without Penalty
  const handleLaunchAllowedApp = (app: PhoneAllowedApp) => {
    isTemporaryAllowedExitRef.current = true;
  };

  // Delete session handler
  const handleDeleteSession = (id: string) => {
    const updated = deleteStudySession(id);
    setSessions(updated);
  };

  // Calculate Metrics
  const todayMinutes = getTodayStudyMinutes(sessions);
  const todayAura = getTodayStudyAura(sessions);

  // Circular Dial Gauge Calculations
  const totalDurationSec =
    mode === 'pomodoro' ? Math.max(1, activePreset.minutes * 60) : 3600;
  const currentElapsedSec =
    mode === 'pomodoro' ? totalDurationSec - secondsLeft : stopwatchSeconds;
  const progressRatio = Math.min(1, Math.max(0, currentElapsedSec / totalDurationSec));

  const dialSize = 290;
  const strokeWidth = 14;
  const radius = (dialSize - strokeWidth - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Position of Glowing Orb Dot on Tip of Progress Arc
  const currentAngle = progressRatio * 2 * Math.PI - Math.PI / 2;
  const orbX = dialSize / 2 + radius * Math.cos(currentAngle);
  const orbY = dialSize / 2 + radius * Math.sin(currentAngle);

  const displayClockString =
    mode === 'pomodoro'
      ? formatTimeEnglish(secondsLeft)
      : formatTimeEnglish(stopwatchSeconds);

  // Filter allowed phone apps for quick bar
  const activeAllowedPhoneApps = allowedAppsList.filter((a) => a.isAllowed);

  return (
    <div
      className={`space-y-4 sm:space-y-5 ${
        isZenMode
          ? 'fixed inset-0 z-50 bg-slate-950 text-slate-100 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto select-none'
          : ''
      }`}
    >
      {/* Hidden Canvas & Video for Floating Picture-in-Picture Widget */}
      <div className="hidden" aria-hidden="true">
        <canvas ref={pipCanvasRef} width={340} height={160} />
        <video ref={pipVideoRef} muted playsInline />
      </div>

      {/* Zen Mode Header */}
      {isZenMode && (
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-black font-aura tracking-widest text-blue-400 uppercase">
              ZEN FOCUS MODE · {selectedSubject}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            className="px-3 py-1.5 rounded-xl border border-blue-400/40 bg-blue-950/40 text-blue-300 text-xs font-bold hover:bg-blue-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>ফুলস্ক্রিন বন্ধ</span>
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      {!isZenMode && (
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          {/* Dual Tab Switcher */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-xs">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                setHubTab('timer');
              }}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                hubTab === 'timer'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TimerIcon className="w-3.5 h-3.5" />
              <span>স্টাডি টাইমার</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                setHubTab('calendar');
              }}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                hubTab === 'calendar'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>ক্যালেন্ডার ও লগ</span>
            </button>
          </div>

          {/* Quick Utility Tools Pill Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Screen Wake Lock Indicator */}
            {wakeLockActive && (
              <div
                className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-bold flex items-center gap-1 shadow-xs animate-pulse"
                title="পড়ার সময় ফোন স্ক্রিন অফ হবে না"
              >
                <Lightbulb className="w-3 h-3" />
                <span className="hidden sm:inline">স্ক্রিন অন</span>
              </div>
            )}

            {/* Floating Picture-in-Picture (PiP) Button */}
            <button
              type="button"
              onClick={handleTogglePip}
              className={`px-2.5 sm:px-3 py-1.5 rounded-2xl border transition-all flex items-center gap-1 text-xs font-bold cursor-pointer shadow-xs ${
                isPipActive
                  ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400'
              }`}
              title="ফোনের অন্য যেকোনো অ্যাপের ওপর ফ্লোটিং টাইমার উইজেট চালান"
            >
              <PictureInPicture2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ফ্লোটিং উইজেট</span>
            </button>

            {/* Allowed Apps Manager Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                setShowAllowedApps(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="অনুমোদিত অ্যাপস তালিকা ও ক্যালকুলেটর"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>অনুমোদিত অ্যাপস</span>
            </button>

            {/* Ambient Sound Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setShowSoundMenu(!showSoundMenu);
                }}
                className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                  ambientSound !== 'none'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="ব্যাকগ্রাউন্ড অ্যাম্বিয়েন্ট সাউন্ড"
              >
                {ambientSound !== 'none' ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {showSoundMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl z-30 space-y-2">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    স্টাডি অ্যাম্বিয়েন্ট সাউন্ড:
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {(['none', 'rain', 'waves', 'cafe', 'ticking'] as AmbientSoundType[]).map((snd) => (
                      <button
                        key={snd}
                        type="button"
                        onClick={() => {
                          setAmbientSound(snd);
                          setShowSoundMenu(false);
                        }}
                        className={`px-2 py-1.5 rounded-xl font-bold transition-all text-center ${
                          ambientSound === snd
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {snd === 'none' && 'অফ'}
                        {snd === 'rain' && '🌧️ বৃষ্টি'}
                        {snd === 'waves' && '🌊 সমুদ্র'}
                        {snd === 'cafe' && '☕ ক্যাফে'}
                        {snd === 'ticking' && '⏱️ টিকিং'}
                      </button>
                    ))}
                  </div>

                  {ambientSound !== 'none' && (
                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>ভলিউম</span>
                        <span>{Math.round(ambientVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={ambientVolume}
                        onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Zen Fullscreen Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                setIsZenMode(true);
              }}
              className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer shadow-xs"
              title="ফুলস্ক্রিন জেন মোড"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: FLAGSHIP $50M FOCUS TIMER */}
      {hubTab === 'timer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Main Dial & Interaction Panel */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-[0_8px_30px_rgba(37,99,235,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35)] space-y-5 flex flex-col items-center relative overflow-hidden">
            {/* Ambient Aurora Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl"
            />

            {/* Preset Selector Carousel */}
            <div className="w-full flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 select-none">
              {PRESETS.map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                    {p.badge && (
                      <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-black uppercase">
                        {p.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  setShowCustomModal(true);
                }}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>কাস্টম</span>
              </button>
            </div>

            {/* Subject Selector Chips */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center pt-0.5">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>বিষয়:</span>
              </span>
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setSelectedSubject(s);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSubject === s
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-400 shadow-xs'
                      : 'border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* THE CIRCULAR FOCUS GAUGE WITH ORBITING GLOW HEAD */}
            <div className="relative my-2 sm:my-4 flex items-center justify-center select-none">
              {/* Outer Pulsing Ambient Ring */}
              <div
                aria-hidden="true"
                className={`absolute inset-3 rounded-full blur-2xl opacity-35 transition-all duration-700 ${
                  isRunning
                    ? 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-400 animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />

              <svg width={dialSize} height={dialSize} className="relative z-10 overflow-visible">
                {/* Background Ring Track */}
                <circle
                  cx={dialSize / 2}
                  cy={dialSize / 2}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-slate-100 dark:text-slate-800/80"
                  fill="transparent"
                />

                {/* Animated Gradient Progress Stroke */}
                <g className="transform -rotate-90 origin-center">
                  <circle
                    cx={dialSize / 2}
                    cy={dialSize / 2}
                    r={radius}
                    stroke="url(#flagshipOceanGradient)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-linear"
                    fill="transparent"
                  />
                </g>

                {/* Orbiting Glowing Head Dot */}
                {isRunning && (
                  <circle
                    cx={orbX}
                    cy={orbY}
                    r={7}
                    fill="#06B6D4"
                    className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.9)] transition-all duration-500 ease-linear"
                  />
                )}

                <defs>
                  <linearGradient id="flagshipOceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="50%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Digital Time Center Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
                {/* Status Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-black tracking-widest font-mono uppercase text-slate-600 dark:text-slate-300 mb-1 shadow-xs">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRunning
                        ? 'bg-blue-500 animate-ping'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>
                    {isRunning
                      ? mode === 'pomodoro'
                        ? phase === 'focus'
                          ? 'FOCUSING'
                          : 'BREAK'
                        : 'RUNNING'
                      : 'PAUSED'}
                  </span>
                </div>

                {/* Big Clean English Digital Clock Digits */}
                <div className="font-mono font-black text-6xl sm:text-7xl tracking-tight text-slate-900 dark:text-slate-50 drop-shadow-sm select-none tabular-nums my-1">
                  {displayClockString}
                </div>

                {/* Subject Subtitle Chip */}
                <div className="mt-1 px-3.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-xs font-bold text-blue-700 dark:text-blue-300 max-w-[190px] truncate shadow-xs">
                  {selectedSubject}
                </div>

                {/* Live Aura Accumulator Pill */}
                {isRunning && (
                  <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    <span>প্রতি মিনিটে +১ Aura অর্জিত হচ্ছে</span>
                  </div>
                )}
              </div>
            </div>

            {/* DUOLINGO 3D TACTILE ACTION BUTTONS */}
            <div className="flex items-center gap-3 pt-1">
              {/* Reset Button */}
              <button
                type="button"
                onClick={handleReset}
                aria-label="রিসেট করুন"
                title="টাইমার রিসেট করুন"
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Primary 3D Start/Pause Button with Bevel Depth */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl text-white text-base font-black transition-all select-none cursor-pointer flex items-center gap-2 border-b-4 active:border-b-0 active:translate-y-1 ${
                  isRunning
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-700 shadow-lg shadow-orange-500/25'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 border-blue-800 shadow-xl shadow-blue-500/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-white" />
                    <span>একটু বিরতি নিন</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>পড়া শুরু করুন</span>
                  </>
                )}
              </button>

              {/* Lap Button for Stopwatch Mode */}
              {mode === 'stopwatch' && isRunning && (
                <button
                  type="button"
                  onClick={recordLap}
                  className="px-4 py-3.5 sm:py-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Flag className="w-4 h-4" />
                  <span>Lap</span>
                </button>
              )}

              {/* Finish & Save for Stopwatch Mode */}
              {mode === 'stopwatch' && stopwatchSeconds >= 60 && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(25);
                    handleCompleteSession(Math.floor(stopwatchSeconds / 60), stopwatchSeconds);
                    setStopwatchSeconds(0);
                    setIsRunning(false);
                  }}
                  className="px-4 py-3.5 sm:py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish & Save</span>
                </button>
              )}
            </div>

            {/* Quick Allowed Apps Drawer Bar Directly on Timer Screen */}
            <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                  <span>অনুমোদিত স্টাডি টুলস ও অ্যাপস:</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setShowAllowedApps(true);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>সব অ্যাপস ও ক্যালকুলেটর</span>
                  <Sliders className="w-3 h-3" />
                </button>
              </div>

              {/* Horizontal Allowed App Quick Launch Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {activeAllowedPhoneApps.slice(0, 5).map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(15);
                      handleLaunchAllowedApp(app);
                      if (app.urlScheme === '#inapp-calc') {
                        setShowAllowedApps(true);
                      } else if (app.urlScheme.startsWith('http')) {
                        window.open(app.urlScheme, '_blank');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>{app.icon}</span>
                    <span className="truncate max-w-[110px]">{app.name}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Stopwatch Laps Record View */}
            {mode === 'stopwatch' && stopwatchLaps.length > 0 && (
              <div className="w-full max-w-md pt-3 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between mb-1">
                  <span>রেকর্ড করা ল্যাপস (Laps):</span>
                  <span className="font-mono text-[11px]">{stopwatchLaps.length} Laps</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {stopwatchLaps.map((lap) => (
                    <div
                      key={lap.id}
                      className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 text-xs font-mono"
                    >
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        Lap #{lap.id}
                      </span>
                      <span className="font-black text-blue-600 dark:text-cyan-400">
                        {lap.formatted}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Kira Mascot & Daily Live Progress */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-5">
            {/* Mascot Kira Companion Speech Card */}
            <div className="rounded-3xl border border-blue-200/90 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <MascotCharacter
                  mood={isRunning ? 'happy' : distractionCount > 0 ? 'sassy' : 'smug'}
                  size="md"
                  animate={isRunning}
                />
                <div>
                  <div className="text-xs font-black text-blue-600 dark:text-blue-400 font-display">
                    স্টাডি বাডি কিরা (Kira)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRunning ? 'ফোকাস মোডে নজর রাখছে 👀' : 'টেবিলে অপেক্ষা করছে'}
                  </div>
                </div>
              </div>

              {/* Speech Bubble */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs">
                {isRunning ? (
                  <span>
                    &ldquo;মনোযোগ দিয়ে পড়া চালিয়ে যাও! প্রতিটি মিনিট তোমার জন্য <strong>+১ Aura</strong> আনছে এবং স্কোয়াডে র্যাংক বাড়াচ্ছে! 🚀&rdquo;
                  </span>
                ) : distractionCount > 0 ? (
                  <span>
                    &ldquo;উঁকি মেরে কিন্তু দেখতে পাচ্ছি! স্ক্রিন থেকে দূরে না গিয়ে তাড়াতাড়ি টেবিলে ফিরে পড়ায় বসো! 😼&rdquo;
                  </span>
                ) : (
                  <span>
                    &ldquo;আজকে কোন চ্যাপ্টার শেষ করার টার্গেট? উপরের প্রিসেট থেকে সময় বেছে নিয়ে <strong>শুরু</strong> বাটনে চাপ দাও!&rdquo;
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats & Aura Rewards Card */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-50">
                    আজকের স্টাডি সামারি
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    আজ পড়া হয়েছে
                  </div>
                  <div className="font-mono-num text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
                    {formatDurationBangla(todayMinutes)}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    স্টাডি Aura অর্জিত
                  </div>
                  <div className="font-aura text-lg font-black text-[#FF1744] dark:text-[#FF2A55] mt-0.5">
                    +{todayAura} Aura
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                  <Zap className="w-3.5 h-3.5" />
                  <span>লাইভ স্কোয়াড সিঙ্ক:</span>
                </div>
                <div>
                  টাইমারে পড়া শেষ করলেই সরাসরি আপনার স্কোয়াড লিডারবোর্ডে সময় ও Aura রিওয়ার্ড যুক্ত হবে।
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STUDY CALENDAR & LOGS */}
      {hubTab === 'calendar' && (
        <StudyCalendarView
          sessions={sessions}
          onDeleteSession={handleDeleteSession}
          onAddManualSession={(manualSession) => {
            const updated = addStudySession(manualSession);
            setSessions(updated);
            onSessionCompleteAura?.(manualSession.auraEarned);
          }}
        />
      )}

      {/* ALLOWED APPS HUB MODAL */}
      <AllowedAppsModal
        isOpen={showAllowedApps}
        onClose={() => setShowAllowedApps(false)}
        activeSubject={selectedSubject}
        remainingTimeSec={mode === 'pomodoro' ? secondsLeft : undefined}
        onLaunchAllowedApp={handleLaunchAllowedApp}
        onUpdateAllowedApps={(updated) => setAllowedAppsList(updated)}
      />

      {/* REAL DISTRACTION PENALTY ALERT MODAL */}
      {showDistractionWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border-2 border-rose-500 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-white shadow-2xl shadow-rose-950/40 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-600 dark:text-rose-400 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-lg font-black text-rose-600 dark:text-rose-400">
                🚨 ফোকাস ভঙ্গ! AURA জরিমানা কাটা হয়েছে!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bangla">
                অনুমোদিত স্টাডি অ্যাপ ছাড়া পড়ার সেশন ছেড়ে অন্য অ্যাপে যাওয়া নিষেধ!
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <div className="font-bold text-sm">
                তুমি {lastPenaltySec} সেকেন্ড পড়ার বাইরে ছিলে!
              </div>
              <div className="font-mono font-black text-rose-600 dark:text-rose-400 text-base">
                -25 AURA পেনাল্টি কাটা হয়েছে!
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                স্কোয়াড লিডারবোর্ডে আপনার অবস্থান নিচে নেমে গেছে। অবিলম্বে মনোযোগ ফিরিয়ে আনুন!
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                setShowDistractionWarning(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 cursor-pointer active:scale-95 transition-all"
            >
              পড়ায় ফিরে যাচ্ছি (আমি টেবিলে আছি)
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM MINUTES MODAL */}
      {showCustomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setShowCustomModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4 text-slate-900 dark:text-white"
          >
            <h4 className="font-bold text-sm font-display text-slate-900 dark:text-slate-50">
              কাস্টম ফোকাস টাইম (মিনিট)
            </h4>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinInput}
              onChange={(e) => setCustomMinInput(Math.max(1, Math.min(180, Number(e.target.value))))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-lg font-mono font-bold text-center text-slate-900 dark:text-slate-50"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  setSecondsLeft(customMinInput * 60);
                  setShowCustomModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm"
              >
                সেট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
