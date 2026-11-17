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

const PRESETS = [
  { label: '২৫ মি. ফোকাস', minutes: 25 },
  { label: '৪৫ মি. ডিপ স্টাডি', minutes: 45 },
  { label: '৬০ মি. আল্টিমেট', minutes: 60 },
  { label: '৯০ মি. এক্সাম', minutes: 90 },
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

const toBnDigits = (val: string | number) =>
  String(val).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);

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
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Ambient sound
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [ambientVolume, setAmbientVolume] = useState(0.4);

  // Fullscreen / Zen Mode
  const [isZenMode, setIsZenMode] = useState(false);

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
        body: `সাবাশ! ${toBnDigits(effectiveMinutes)} মিনিট ${selectedSubject} পড়া শেষ হয়েছে! +${toBnDigits(earnedAura)} Aura অর্জিত!`,
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
        // Save whatever was studied before reset
        handleCompleteSession(Math.floor(stopwatchSeconds / 60), stopwatchSeconds);
      }
      setStopwatchSeconds(0);
    }
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

  const displayMinutes = Math.floor(currentSec / 60);
  const displaySeconds = currentSec % 60;
  const timeString = `${String(displayMinutes).padStart(2, '0')}:${String(
    displaySeconds
  ).padStart(2, '0')}`;

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

  // Circular SVG ring constants
  const size = 260;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progressRatio)));

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 bg-[#070A14] p-6 sm:p-10 flex flex-col justify-between overflow-y-auto' : ''}`}>
      {/* Zen Mode Header with Close Button */}
      {isZenMode && (
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-black font-aura tracking-widest text-cyan-400 uppercase">
              Zen Focus Mode · পূর্ণ মনোযোগ
            </span>
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
              <span>স্টাডি টাইমার</span>
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
                  +{toBnDigits(todayAura)} Aura
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
          {/* Main Dial & Controls Column */}
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
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMode('pomodoro');
                  setIsRunning(false);
                  setSecondsLeft(pomodoroMinutes * 60);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'pomodoro'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                পোমোডোরো (Pomodoro)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('stopwatch');
                  setIsRunning(false);
                  setStopwatchSeconds(0);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'stopwatch'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                স্টপওয়াচ (Count Up)
              </button>
            </div>

            {/* Pomodoro Presets & Phase Buttons */}
            {mode === 'pomodoro' && (
              <div className="space-y-3 w-full flex flex-col items-center">
                {/* Phase Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => switchToPhase('focus')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      phase === 'focus'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ফোকাস ({toBnDigits(pomodoroMinutes)} মি.)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchToPhase('shortBreak')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      phase === 'shortBreak'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    শর্ট ব্রেক (৫ মি.)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchToPhase('longBreak')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      phase === 'longBreak'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    লং ব্রেক (১৫ মি.)
                  </button>
                </div>

                {/* Preset Chips */}
                {phase === 'focus' && (
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    {PRESETS.map((p) => (
                      <button
                        key={p.minutes}
                        type="button"
                        onClick={() => selectPreset(p.minutes)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          pomodoroMinutes === p.minutes
                            ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-400/60'
                            : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Glowing Circular Progress SVG Dial */}
            <div className="relative my-4 flex items-center justify-center select-none">
              {/* Outer Ambient Glow Ring */}
              <div
                aria-hidden="true"
                className={`absolute inset-0 rounded-full blur-xl opacity-40 transition-all duration-700 ${
                  isRunning
                    ? phase === 'focus'
                      ? 'bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500'
                      : 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500'
                    : 'bg-slate-300 dark:bg-slate-800'
                }`}
              />

              <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Ring Track */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-slate-100 dark:text-slate-800/80"
                  fill="transparent"
                />

                {/* Animated Gradient Progress Stroke */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="url(#timerGradient)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-linear"
                  fill="transparent"
                />

                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop
                      offset="0%"
                      stopColor={
                        phase === 'focus' ? '#00F0FF' : '#10B981'
                      }
                    />
                    <stop
                      offset="50%"
                      stopColor={
                        phase === 'focus' ? '#4F46E5' : '#06B6D4'
                      }
                    />
                    <stop
                      offset="100%"
                      stopColor={
                        phase === 'focus' ? '#EC4899' : '#3B82F6'
                      }
                    />
                  </linearGradient>
                </defs>
              </svg>

              {/* Digital Time Center Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black font-aura tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1">
                  {mode === 'pomodoro'
                    ? phase === 'focus'
                      ? 'FOCUS'
                      : 'BREAK'
                    : 'STOPWATCH'}
                </span>
                <span className="font-mono-num font-black text-5xl sm:text-6xl tracking-tight text-slate-900 dark:text-slate-50 drop-shadow-sm">
                  {toBnDigits(timeString)}
                </span>
                <span className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 max-w-[170px] truncate px-2">
                  {selectedSubject}
                </span>
              </div>
            </div>

            {/* Play, Pause & Reset Controls Bar */}
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
                    <span>পজ করুন</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>পড়া শুরু করুন</span>
                  </>
                )}
              </button>

              {mode === 'stopwatch' && stopwatchSeconds >= 60 && (
                <button
                  type="button"
                  onClick={finishStopwatch}
                  title="সেশন শেষ করুন ও Aura সেভ করুন"
                  className="px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>সম্পন্ন</span>
                </button>
              )}
            </div>

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
                    <span className="font-mono-num">{Math.round(ambientVolume * 100)}%</span>
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
    </div>
  );
}
