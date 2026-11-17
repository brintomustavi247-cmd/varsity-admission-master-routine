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
import { AllowedAppsModal } from './AllowedAppsModal';

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
  { id: 'p25', label: '২৫ মি. ফোকাস', minutes: 25, mode: 'pomodoro', phase: 'focus', badge: 'জনপ্রিয়', icon: '🎯' },
  { id: 'p45', label: '৪৫ মি. ডিপ স্টাডি', minutes: 45, mode: 'pomodoro', phase: 'focus', icon: '⚡' },
  { id: 'p60', label: '৬০ মি. ম্যারাথন', minutes: 60, mode: 'pomodoro', phase: 'focus', icon: '🔥' },
  { id: 'b5', label: '৫ মি. ব্রেক', minutes: 5, mode: 'pomodoro', phase: 'shortBreak', icon: '☕' },
  { id: 'b15', label: '১৫ মি. লং ব্রেক', minutes: 15, mode: 'pomodoro', phase: 'longBreak', icon: '🌴' },
  { id: 'stopwatch', label: 'স্টপওয়াচ', minutes: 0, mode: 'stopwatch', icon: '⏱️' },
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

  // Fullscreen / Zen Mode
  const [isZenMode, setIsZenMode] = useState(false);

  // Custom minute modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMinInput, setCustomMinInput] = useState(30);

  // Allowed Apps Hub Modal
  const [showAllowedApps, setShowAllowedApps] = useState(false);

  // Anti-Distraction Lock
  const [focusLockActive, setFocusLockActive] = useState(true);
  const [showDistractionWarning, setShowDistractionWarning] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);

  // Stored Study Sessions
  const [sessions, setSessions] = useState<StudySession[]>(() => loadStudySessions());

  // Broadcast remaining time to parent
  useEffect(() => {
    onActiveTimerChange?.(
      isRunning,
      mode === 'pomodoro' ? secondsLeft : stopwatchSeconds,
      selectedSubject
    );
  }, [isRunning, secondsLeft, stopwatchSeconds, mode, selectedSubject, onActiveTimerChange]);

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

  // Anti-Distraction Tab Switch & Blur Detector
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && focusLockActive) {
        playWarningAlertSound(true);
        setShowDistractionWarning(true);
        setDistractionCount((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, focusLockActive]);

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
      if (studiedSeconds < 30) return;

      const effectiveMinutes = Math.max(1, studiedMinutes);
      // Study awards 1 Aura per minute studied + 20 Aura pomodoro completion bonus
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

  // Handle Play / Pause Toggle
  const handleTogglePlay = () => {
    if (!isRunning) {
      sessionStartTimeRef.current = Date.now();
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  // Handle Reset
  const handleReset = () => {
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

  const dialSize = 310;
  const strokeWidth = 14;
  const radius = (dialSize - strokeWidth - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const displayClockString =
    mode === 'pomodoro'
      ? formatTimeEnglish(secondsLeft)
      : formatTimeEnglish(stopwatchSeconds);

  return (
    <div
      className={`space-y-5 ${
        isZenMode
          ? 'fixed inset-0 z-50 bg-slate-950 text-slate-100 p-6 sm:p-10 flex flex-col justify-between overflow-y-auto select-none'
          : ''
      }`}
    >
      {/* Zen Mode Header with Exit Button */}
      {isZenMode && (
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-black font-aura tracking-widest text-blue-400 uppercase">
              ZEN FOCUS MODE · পূর্ণ মনোযোগ
            </span>
            <span className="text-xs text-slate-400">· {selectedSubject}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            className="px-3.5 py-1.5 rounded-xl border border-blue-400/40 bg-blue-950/40 text-blue-300 text-xs font-bold hover:bg-blue-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>ফুলস্ক্রিন বন্ধ করুন</span>
          </button>
        </div>
      )}

      {/* Top Controls Bar: Tab Switcher & Today Summary */}
      {!isZenMode && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Dual Tab Switcher */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-xs">
            <button
              type="button"
              onClick={() => setHubTab('timer')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                hubTab === 'timer'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md'
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
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>স্টাডি ক্যালেন্ডার ও ইতিহাস</span>
            </button>
          </div>

          {/* Today's Quick Summary & Utility Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <div className="px-3.5 py-1.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">আজকের মোট পড়া:</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono-num font-black">
                {formatDurationBangla(todayMinutes)}
              </span>
              {todayAura > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black font-aura flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" />
                  +{todayAura} Aura
                </span>
              )}
            </div>

            {/* Allowed Apps Hub Trigger Button */}
            <button
              type="button"
              onClick={() => setShowAllowedApps(true)}
              className="px-3 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="অনুমোদিত স্টাডি টুলস ও ক্যালকুলেটর"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>অনুমোদিত অ্যাপস</span>
            </button>

            {/* Strict Focus Lock Pill */}
            <button
              type="button"
              onClick={() => setFocusLockActive(!focusLockActive)}
              className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                focusLockActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
              title={focusLockActive ? 'স্ট্রিক্ট ফোকাস লক সক্রিয়' : 'লক নিষ্ক্রিয়'}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Ambient Sound Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSoundMenu(!showSoundMenu)}
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
              onClick={() => setIsZenMode(true)}
              className="p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer shadow-xs"
              title="ফুলস্ক্রিন জেন মোড"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: COHESIVE OCEAN BLUE FOCUS TIMER */}
      {hubTab === 'timer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Timer Dial Card */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-[0_8px_24px_rgba(37,99,235,0.06)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)] space-y-6 flex flex-col items-center relative overflow-hidden">
            {/* Subtle Aurora Ambient Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl"
            />

            {/* Horizontal Preset Chips Bar */}
            <div className="w-full flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 select-none">
              {PRESETS.map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
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

              {/* Custom Min Button */}
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="px-3 py-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>কাস্টম</span>
              </button>
            </div>

            {/* Subject Selector Pill Bar */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center pt-1">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>বিষয়:</span>
              </span>
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSubject(s)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSubject === s
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-400 shadow-xs'
                      : 'border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* THE CIRCULAR FOCUS GAUGE */}
            <div className="relative my-3 sm:my-5 flex items-center justify-center select-none">
              {/* Outer Glowing Background Ring */}
              <div
                aria-hidden="true"
                className={`absolute inset-4 rounded-full blur-2xl opacity-30 transition-all duration-700 ${
                  isRunning
                    ? phase === 'focus'
                      ? 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-400'
                      : 'bg-gradient-to-tr from-emerald-400 to-teal-500'
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
                    stroke="url(#oceanBlueTimerGradient)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-linear"
                    fill="transparent"
                  />
                </g>

                <defs>
                  <linearGradient id="oceanBlueTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={phase === 'focus' ? '#2563EB' : '#10B981'} />
                    <stop offset="50%" stopColor={phase === 'focus' ? '#4F46E5' : '#06B6D4'} />
                    <stop offset="100%" stopColor={phase === 'focus' ? '#06B6D4' : '#3B82F6'} />
                  </linearGradient>
                </defs>
              </svg>

              {/* Digital Time Center Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
                {/* Status Badge */}
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
                          ? 'FOCUS'
                          : 'BREAK'
                        : 'RUNNING'
                      : 'PAUSED'}
                  </span>
                </div>

                {/* Big Clean English Digital Clock Digits */}
                <div className="font-mono font-black text-5xl sm:text-6xl tracking-wider text-slate-900 dark:text-slate-50 drop-shadow-sm select-none tabular-nums my-1">
                  {displayClockString}
                </div>

                {/* Subject Subtitle Chip */}
                <div className="mt-1 px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-xs font-bold text-blue-700 dark:text-blue-300 max-w-[180px] truncate shadow-xs">
                  {selectedSubject}
                </div>

                {/* Progress Percentage for Pomodoro */}
                {mode === 'pomodoro' && (
                  <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 mt-1">
                    {Math.round(progressRatio * 100)}% COMPLETED
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: Play/Pause, Reset, Lap, Finish */}
            <div className="flex items-center gap-3 pt-2">
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

              {/* Primary Play/Pause Button: Large Ocean Blue Gradient Pill */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-white text-sm sm:text-base font-black transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-2 select-none ${
                  isRunning
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-orange-500/25'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/30'
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

          {/* Right Column: Kira Mascot Encouragement & Daily Stats */}
          <div className="lg:col-span-4 space-y-5">
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
                    {isRunning ? 'ফোকাস মোডে পাশে আছে' : 'টেবিলে অপেক্ষা করছে'}
                  </div>
                </div>
              </div>

              {/* Speech Bubble */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs relative">
                {isRunning ? (
                  <span>
                    &ldquo;মনোযোগ দিয়ে পড়া চালিয়ে যাও! প্রতিটি মিনিট তোমার জন্য <strong>+১ Aura</strong> আনছে এবং স্কোয়াডে র্যাংক বাড়াচ্ছে! 🚀&rdquo;
                  </span>
                ) : distractionCount > 0 ? (
                  <span>
                    &ldquo;উঁকি মেরে কিন্তু দেখতে পাচ্ছি! স্ক্রিন থেকে দূরে না গিয়ে তাড়াতাড়ি স্টাডি শুরু করো! 😼&rdquo;
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
                  <span>স্কোয়াডে লাইভ আপডেট:</span>
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
      />

      {/* ANTI-DISTRACTION PENALTY ALERT MODAL */}
      {showDistractionWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border-2 border-rose-500 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-white shadow-2xl shadow-rose-950/40 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-600 dark:text-rose-400 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-lg font-black text-rose-600 dark:text-rose-400">
                🚨 ফোকাস ভঙ্গ সতর্কবার্তা!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bangla">
                পড়ার সেশন চলাকালীন অন্য কোনো ব্রাউজার ট্যাব বা অ্যাপে যাওয়া নিষিদ্ধ!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <div className="font-bold">কিরা রেগে গেছে! 😼🔥</div>
              <div>&ldquo;ফেসবুক বা রিলস স্ক্রল করা বন্ধ করে দ্রুত পড়ার টেবিলে ফিরো!&rdquo;</div>
            </div>

            <div className="text-[11px] font-mono text-slate-500">
              ফোকাস লঙ্ঘন সংখ্যা: <strong className="text-rose-600 dark:text-rose-400 font-bold">{distractionCount}</strong> বার
            </div>

            <button
              type="button"
              onClick={() => setShowDistractionWarning(false)}
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
