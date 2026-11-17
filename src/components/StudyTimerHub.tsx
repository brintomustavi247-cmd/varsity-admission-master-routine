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
import { sendPhoneNotification } from '../lib/notifications';
import { MascotCharacter } from './MascotCharacter';
import { StudyCalendarView } from './StudyCalendarView';

interface StudyTimerHubProps {
  currentUid: string;
  userDisplayName: string;
  onSessionCompleteAura?: (aura: number) => void;
  onActiveTimerChange?: (active: boolean, remainingSec: number, subject: string) => void;
}

const POMODORO_PRESETS = [
  { label: '25m Focus', minutes: 25, desc: 'স্ট্যান্ডার্ড' },
  { label: '45m Deep', minutes: 45, desc: 'ডিপ স্টাডি' },
  { label: '60m Marathon', minutes: 60, desc: 'আল্টিমেট' },
  { label: '90m Exam', minutes: 90, desc: 'মডেল টেস্ট' },
];

const SUBJECTS = [
  'পদার্থবিজ্ঞান',
  'উচ্চতর গণিত',
  'ইংরেজি',
  'জীববিজ্ঞান',
  'রসায়ন',
  'স্পেসড রিভিশন',
  'প্রশ্ন ব্যাংক অনুশীলন',
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
  // Main Hub Sub-Tab: 'timer' | 'calendar'
  const [hubTab, setHubTab] = useState<'timer' | 'calendar'>('timer');

  // Timer Configuration
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [phase, setPhase] = useState<PomodoroPhase>('focus');
  const [selectedSubject, setSelectedSubject] = useState('পদার্থবিজ্ঞান');

  // Live Timer State
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchLaps, setStopwatchLaps] = useState<StopwatchLap[]>([]);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Ambient sound
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [ambientVolume, setAmbientVolume] = useState(0.4);

  // Fullscreen / Zen Mode
  const [isZenMode, setIsZenMode] = useState(false);

  // Custom minute modal / input
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMinInput, setCustomMinInput] = useState(30);

  // Stored Study Sessions
  const [sessions, setSessions] = useState<StudySession[]>(() => loadStudySessions());

  // Today totals
  const todayMinutes = getTodayStudyMinutes(sessions);
  const todayAura = getTodayStudyAura(sessions);

  // Notify parent of active timer state for floating pill
  useEffect(() => {
    if (onActiveTimerChange) {
      const active = isRunning;
      const sec = mode === 'pomodoro' ? secondsLeft : stopwatchSeconds;
      onActiveTimerChange(active, sec, selectedSubject);
    }
  }, [isRunning, secondsLeft, stopwatchSeconds, mode, selectedSubject, onActiveTimerChange]);

  // Audio effect management
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

  // Handle Session Completion
  const handleCompleteSession = useCallback(
    (studiedMinutes: number, studiedSeconds: number) => {
      if (studiedMinutes <= 0 && studiedSeconds < 30) return;

      const effectiveMinutes = Math.max(1, studiedMinutes);
      const earnedAura = Math.min(60, Math.round((effectiveMinutes / 25) * 15));
      const todayISO = new Date().toLocaleDateString('en-CA');
      const now = Date.now();

      const newSession: StudySession = {
        id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: todayISO,
        startTime: sessionStartTimeRef.current,
        endTime: now,
        durationMinutes: effectiveMinutes,
        durationSeconds: studiedSeconds,
        subject: selectedSubject,
        taskName: mode === 'pomodoro' ? `পোমোডোরো (${phase === 'focus' ? 'ফোকাস' : 'ব্রেক'})` : 'স্টপওয়াচ স্টাডি',
        mode,
        auraEarned: earnedAura,
      };

      const updated = addStudySession(newSession);
      setSessions(updated);

      if (onSessionCompleteAura && earnedAura > 0) {
        onSessionCompleteAura(earnedAura);
      }

      // Play completion fanfare
      playTimerFinishFanfare();

      // Trigger phone notification
      sendPhoneNotification({
        title: 'স্টাডি সেশন সম্পন্ন! 🏆✨',
        body: `সাবাশ! ${effectiveMinutes} মিনিট ${selectedSubject} পড়া শেষ হয়েছে! +${earnedAura} Aura অর্জিত!`,
        mood: 'ice-bear',
      });
    },
    [selectedSubject, mode, phase, onSessionCompleteAura]
  );

  // Main countdown / countup tick loop
  useEffect(() => {
    let timer: number | null = null;
    if (isRunning) {
      timer = window.setInterval(() => {
        if (mode === 'pomodoro') {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              setIsRunning(false);
              const finishedMinutes = pomodoroMinutes;
              handleCompleteSession(finishedMinutes, finishedMinutes * 60);

              // Auto switch to break if focus, or back to focus
              if (phase === 'focus') {
                setPhase('shortBreak');
                return 5 * 60; // 5 min break
              } else {
                setPhase('focus');
                return pomodoroMinutes * 60;
              }
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [isRunning, mode, pomodoroMinutes, phase, handleCompleteSession]);

  // Start / Pause
  const toggleStart = () => {
    if (!isRunning) {
      sessionStartTimeRef.current = Date.now();
    }
    setIsRunning((prev) => !prev);
  };

  // Reset
  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      const mins = phase === 'focus' ? pomodoroMinutes : phase === 'shortBreak' ? 5 : 15;
      setSecondsLeft(mins * 60);
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

  // Preset click
  const selectPreset = (mins: number) => {
    setPomodoroMinutes(mins);
    setPhase('focus');
    setIsRunning(false);
    setSecondsLeft(mins * 60);
  };

  // Switch to Break
  const switchToPhase = (newPhase: PomodoroPhase) => {
    setIsRunning(false);
    setPhase(newPhase);
    if (newPhase === 'focus') {
      setSecondsLeft(pomodoroMinutes * 60);
    } else if (newPhase === 'shortBreak') {
      setSecondsLeft(5 * 60);
    } else {
      setSecondsLeft(15 * 60);
    }
  };

  // Finish stopwatch manually
  const finishStopwatch = () => {
    if (stopwatchSeconds < 30) return;
    setIsRunning(false);
    const mins = Math.floor(stopwatchSeconds / 60);
    handleCompleteSession(mins, stopwatchSeconds);
    setStopwatchSeconds(0);
    setStopwatchLaps([]);
  };

  // Display calculations
  const totalPhaseSec =
    mode === 'pomodoro'
      ? (phase === 'focus' ? pomodoroMinutes : phase === 'shortBreak' ? 5 : 15) * 60
      : Math.max(3600, stopwatchSeconds);

  const currentSec = mode === 'pomodoro' ? secondsLeft : stopwatchSeconds;
  const progressRatio =
    mode === 'pomodoro'
      ? (totalPhaseSec - secondsLeft) / totalPhaseSec
      : (stopwatchSeconds % 3600) / 3600;

  // The primary clock string formatted strictly in English numbers
  const displayClockString =
    mode === 'pomodoro'
      ? formatTimeEnglish(secondsLeft)
      : formatTimeEnglish(stopwatchSeconds, stopwatchSeconds >= 3600);

  // Kira Companion speech based on timer state
  const getKiraMoodAndQuote = () => {
    if (!isRunning) {
      if (currentSec === totalPhaseSec && mode === 'pomodoro') {
        return {
          mood: 'fist' as const,
          quote: 'পড়া শুরু করতে প্রস্তুত তো? মোবাইল সাইলেন্ট করে প্লে বাটনে চাপ দাও!',
        };
      }
      return {
        mood: 'tsundere' as const,
        quote: 'পজ দিয়ে বসে আছো কেন? সময় কিন্তু বয়ে যাচ্ছে, দ্রুত ফোকাস শুরু করো!',
      };
    }
    if (phase !== 'focus') {
      return {
        mood: 'chill-cat' as const,
        quote: 'একটু চোখ বন্ধ করো, গভীর শ্বাস নাও বা এক চুমুক পানি খাও। ব্রেন ফ্রেশ হচ্ছে!',
      };
    }
    if (currentSec <= totalPhaseSec * 0.2) {
      return {
        mood: 'burning-cat' as const,
        quote: 'দারুণ! আর মাত্র কয়েকটা মিনিট বাকি! শেষ অব্দি ফুল ফোকাস ধরে রাখো! 🔥',
      };
    }
    return {
      mood: 'studying' as const,
      quote: 'নো সোশ্যাল মিডিয়া, নো ডিস্ট্র্যাকশন! টেবিল কাঁপিয়ে পড়া চালিয়ে যাও! 📖',
    };
  };

  const kira = getKiraMoodAndQuote();

  // Circular SVG Chronograph Bezel & Ring Constants
  const dialSize = 280;
  const strokeWidth = 12;
  const radius = (dialSize - strokeWidth - 36) / 2; // leaves space for precision bezel tick marks
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progressRatio)));

  // Bezel 60 ticks generator
  const bezelTicks = Array.from({ length: 60 }).map((_, i) => {
    const isMajor = i % 5 === 0;
    const angle = (i * 6) * (Math.PI / 180);
    const rOuter = dialSize / 2 - 3;
    const rInner = rOuter - (isMajor ? 8 : 4);
    const x1 = dialSize / 2 + rInner * Math.sin(angle);
    const y1 = dialSize / 2 - rInner * Math.cos(angle);
    const x2 = dialSize / 2 + rOuter * Math.sin(angle);
    const y2 = dialSize / 2 - rOuter * Math.cos(angle);
    return { id: i, x1, y1, x2, y2, isMajor };
  });

  return (
    <div
      className={`space-y-6 ${
        isZenMode
          ? 'fixed inset-0 z-50 bg-[#060913] text-slate-100 p-6 sm:p-10 flex flex-col justify-between overflow-y-auto select-none'
          : ''
      }`}
    >
      {/* Zen Mode Header with Close Button */}
      {isZenMode && (
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-black font-aura tracking-widest text-cyan-400 uppercase">
              Zen Focus Mode · পূর্ণ মনোযোগ
            </span>
            <span className="text-xs text-slate-400">· {selectedSubject}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            className="px-3 py-1.5 rounded-xl border border-cyan-400/40 bg-cyan-950/40 text-cyan-300 text-xs font-bold hover:bg-cyan-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>ফুলস্ক্রিন থেকে বের হন</span>
          </button>
        </div>
      )}

      {/* Top Dual Tab Switcher: Focus Timer vs Study Calendar */}
      {!isZenMode && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-xs">
            <button
              type="button"
              onClick={() => setHubTab('timer')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                hubTab === 'timer'
                  ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TimerIcon className="w-4 h-4" />
              <span>স্টাডি টাইমার ও ক্লক</span>
            </button>
            <button
              type="button"
              onClick={() => setHubTab('calendar')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                hubTab === 'calendar'
                  ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>স্টাডি ক্যালেন্ডার ও ইতিহাস</span>
            </button>
          </div>

          {/* Today's Quick Summary Pill */}
          <div className="flex items-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">আজকের মোট পড়া:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono-num font-black">
                {formatDurationBangla(todayMinutes)}
              </span>
              {todayAura > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black font-aura flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" />
                  +{todayAura} Aura
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsZenMode(true)}
              aria-label="Zen মোড অন করুন"
              title="Zen ফুলস্ক্রিন ফোকাস মোড"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: FOCUS TIMER */}
      {hubTab === 'timer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Dial & Chronograph Column */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-sm space-y-6 flex flex-col items-center relative overflow-hidden">
            {/* Ambient subtle cyber gradient background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl"
            />

            {/* Mode Switcher: Pomodoro vs Stopwatch */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setMode('pomodoro');
                  setIsRunning(false);
                  setSecondsLeft(pomodoroMinutes * 60);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'pomodoro'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TimerIcon className="w-4 h-4" />
                <span>পোমোডোরো (Pomodoro)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('stopwatch');
                  setIsRunning(false);
                  setStopwatchSeconds(0);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'stopwatch'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>স্টপওয়াচ (Stopwatch)</span>
              </button>
            </div>

            {/* Pomodoro Presets & Phase Buttons */}
            {mode === 'pomodoro' ? (
              <div className="space-y-3 w-full flex flex-col items-center">
                {/* Phase Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => switchToPhase('focus')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      phase === 'focus'
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    🎯 Focus ({pomodoroMinutes}m)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchToPhase('shortBreak')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      phase === 'shortBreak'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ☕ Short Break (5m)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchToPhase('longBreak')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      phase === 'longBreak'
                        ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    🌴 Long Break (15m)
                  </button>
                </div>

                {/* Preset Chips */}
                {phase === 'focus' && (
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {POMODORO_PRESETS.map((p) => (
                      <button
                        key={p.minutes}
                        type="button"
                        onClick={() => selectPreset(p.minutes)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          pomodoroMinutes === p.minutes
                            ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-400/80 shadow-xs'
                            : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowCustomModal(true)}
                      className="px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Custom</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Stopwatch Header Sub-bar */
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>PRECISION CHRONOGRAPH · কাউন্ট-আপ ফ্রি স্টাডি মোড</span>
              </div>
            )}

            {/* UPGRADED CHRONOGRAPH BEZEL & DIAL */}
            <div className="relative my-2 sm:my-4 flex items-center justify-center select-none">
              {/* Outer Ambient Glow Ring */}
              <div
                aria-hidden="true"
                className={`absolute inset-4 rounded-full blur-2xl opacity-40 transition-all duration-700 ${
                  isRunning
                    ? phase === 'focus'
                      ? 'bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600'
                      : 'bg-gradient-to-tr from-emerald-400 via-teal-500 to-sky-500'
                    : 'bg-slate-300 dark:bg-slate-800'
                }`}
              />

              <svg width={dialSize} height={dialSize} className="relative z-10 overflow-visible">
                {/* 60 Precision Chronograph Bezel Tick Marks */}
                <g className="bezel-ticks">
                  {bezelTicks.map((t) => (
                    <line
                      key={t.id}
                      x1={t.x1}
                      y1={t.y1}
                      x2={t.x2}
                      y2={t.y2}
                      stroke="currentColor"
                      strokeWidth={t.isMajor ? 2.5 : 1.2}
                      className={
                        t.isMajor
                          ? 'text-indigo-400 dark:text-cyan-400 opacity-90'
                          : 'text-slate-300 dark:text-slate-700 opacity-50'
                      }
                    />
                  ))}
                </g>

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
                    stroke="url(#chronographGradient)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-linear"
                    fill="transparent"
                  />
                </g>

                <defs>
                  <linearGradient id="chronographGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop
                      offset="0%"
                      stopColor={phase === 'focus' ? '#00F0FF' : '#10B981'}
                    />
                    <stop
                      offset="50%"
                      stopColor={phase === 'focus' ? '#4F46E5' : '#06B6D4'}
                    />
                    <stop
                      offset="100%"
                      stopColor={phase === 'focus' ? '#EC4899' : '#3B82F6'}
                    />
                  </linearGradient>
                </defs>
              </svg>

              {/* Digital Time Center Display (STRICTLY IN ENGLISH NUMBERS) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
                {/* Status Pill Indicator */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-[10px] font-black tracking-widest font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isRunning
                        ? 'bg-emerald-400 animate-ping'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>
                    {isRunning
                      ? mode === 'pomodoro'
                        ? phase === 'focus'
                          ? 'FOCUS'
                          : 'BREAK'
                        : 'RUNNING'
                      : 'PAUSED'}
                  </span>
                </div>

                {/* English Digital Clock Digits */}
                <div className="font-mono font-black text-5xl sm:text-6xl tracking-wider text-slate-900 dark:text-slate-50 drop-shadow-md select-none tabular-nums my-1">
                  {displayClockString}
                </div>

                {/* Subject Subtitle Chip */}
                <div className="mt-1 px-3 py-0.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-bold text-indigo-700 dark:text-cyan-300 max-w-[170px] truncate">
                  {selectedSubject}
                </div>

                {/* Progress Percentage for Pomodoro */}
                {mode === 'pomodoro' && (
                  <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mt-1">
                    {Math.round(progressRatio * 100)}% COMPLETED
                  </div>
                )}
              </div>
            </div>

            {/* Play, Pause, Lap & Reset Action Controls Bar */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                aria-label="রিসেট করুন"
                title="টাইমার রিসেট করুন"
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={toggleStart}
                className={`px-8 py-3.5 rounded-2xl text-sm sm:text-base font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
                    : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pause (পজ)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Focus (শুরু)</span>
                  </>
                )}
              </button>

              {/* Stopwatch Lap Button */}
              {mode === 'stopwatch' && isRunning && (
                <button
                  type="button"
                  onClick={recordLap}
                  title="ল্যাপ / মাইলস্টোন মার্ক করুন"
                  className="p-3.5 rounded-2xl border border-cyan-400/50 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Flag className="w-5 h-5" />
                </button>
              )}

              {/* Finish & Save Button for Stopwatch */}
              {mode === 'stopwatch' && stopwatchSeconds >= 60 && (
                <button
                  type="button"
                  onClick={finishStopwatch}
                  title="সেশন শেষ করুন ও Aura সেভ করুন"
                  className="px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish & Save</span>
                </button>
              )}
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
                      <span className="font-black text-indigo-600 dark:text-cyan-400">
                        {lap.formatted}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Tag Selector Chips */}
            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>কোন বিষয়টি পড়ছেন নির্বাচন করুন:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SUBJECTS.map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSubject === subj
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Side Column: Ambient Sound + Kira Focus Companion */}
          <div className="lg:col-span-4 space-y-5">
            {/* Ambient Sound / White Noise Deck */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 font-display">
                      অ্যাম্বিয়েন্ট সাউন্ড (White Noise)
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      মনোযোগ বাড়ানোর ব্যাকগ্রাউন্ড মিউজিক
                    </p>
                  </div>
                </div>

                {ambientSound !== 'none' && (
                  <button
                    type="button"
                    onClick={() => setAmbientSound('none')}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sound Option Chips */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'rain', label: '🌧️ বৃষ্টি', desc: 'শান্ত বৃষ্টির শব্দ' },
                  { id: 'waves', label: '🌊 সাগরের ঢেউ', desc: 'রিফ্রেশিং ওয়েভস' },
                  { id: 'cafe', label: '☕ ক্যাফে ভাইব', desc: 'ওয়ার্ম ব্রাউন নয়েজ' },
                  { id: 'ticking', label: '⏰ ঘড়ির টিকটিক', desc: 'ফোকাস ট্র্যাকিং' },
                ].map((snd) => (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => {
                      const next =
                        ambientSound === snd.id ? 'none' : (snd.id as AmbientSoundType);
                      setAmbientSound(next);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      ambientSound === snd.id
                        ? 'border-cyan-400 dark:border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-950 dark:text-cyan-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{snd.label}</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {snd.desc}
                    </div>
                  </button>
                ))}
              </div>

              {/* Volume Slider */}
              {ambientSound !== 'none' && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>ভলিউম</span>
                    <span className="font-mono">{Math.round(ambientVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={ambientVolume}
                    onChange={(e) => setAmbientVolume(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Kira Focus Companion Card */}
            <div className="rounded-3xl border border-sky-300/80 dark:border-sky-500/30 bg-white/95 dark:bg-[#091830]/90 p-4 shadow-sm flex items-start gap-3">
              <div className="shrink-0 text-center">
                <MascotCharacter mood={kira.mood} size="sm" />
                <div className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 font-aura tracking-widest mt-1">
                  কিরা 😼
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 font-aura mb-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>লাইভ স্টাডি পার্টনার</span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium italic">
                  &quot;{kira.quote}&quot;
                </div>
              </div>
            </div>

            {/* Quick Study Rules / Tips */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-500" />
                <span>পোমোডোরো স্টাডি রুল:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                <li>২৫ মিনিট ফুল ফোকাসে পড়ুন (কোনো নোটিফিকেশন নয়)।</li>
                <li>প্রতি সেশনের পর ৫ মিনিটের শর্ট ব্রেক নিন।</li>
                <li>প্রতি ৪টি সেশনের পর ১৫-২০ মিনিটের লং ব্রেক নিন।</li>
                <li>প্রতি ২৫ মিনিট স্টাডিতে +১৫ Aura অর্জিত হবে!</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STUDY CALENDAR & LOGS */}
      {hubTab === 'calendar' && (
        <StudyCalendarView
          sessions={sessions}
          onDeleteSession={(id) => {
            const next = deleteStudySession(id);
            setSessions(next);
          }}
          onAddManualSession={(newSess) => {
            const next = addStudySession(newSess);
            setSessions(next);
            if (onSessionCompleteAura && newSess.auraEarned > 0) {
              onSessionCompleteAura(newSess.auraEarned);
            }
          }}
        />
      )}

      {/* Custom Minutes Pomodoro Modal */}
      {showCustomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setShowCustomModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4"
          >
            <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm font-display">
              Custom Focus Time (মিনিট)
            </h4>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinInput}
              onChange={(e) => setCustomMinInput(Math.max(1, Math.min(180, Number(e.target.value))))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-lg font-mono font-bold text-center text-slate-900 dark:text-slate-100"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  selectPreset(customMinInput);
                  setShowCustomModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm"
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
