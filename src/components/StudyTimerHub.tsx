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
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  Bell,
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

export type PresetKey =
  | 'start'
  | 'break'
  | 'quick'
  | 'pomodoro'
  | 'deep'
  | 'custom'
  | 'infinity';

interface PresetConfig {
  key: PresetKey;
  label: string;
  sub: string;
  minutes: number;
  mode: TimerMode;
  themeColor: string; // Tailwind color class or hex
  gradient: string;
  accentHex: string;
  glowClass: string;
}

const PRESET_CONFIGS: PresetConfig[] = [
  {
    key: 'start',
    label: '2',
    sub: 'START',
    minutes: 2,
    mode: 'pomodoro',
    themeColor: 'amber',
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    accentHex: '#F59E0B',
    glowClass: 'shadow-amber-500/30',
  },
  {
    key: 'break',
    label: '5',
    sub: 'BREAK',
    minutes: 5,
    mode: 'pomodoro',
    themeColor: 'emerald',
    gradient: 'from-emerald-500 via-teal-500 to-green-500',
    accentHex: '#10B981',
    glowClass: 'shadow-emerald-500/30',
  },
  {
    key: 'quick',
    label: '15',
    sub: 'QUICK',
    minutes: 15,
    mode: 'pomodoro',
    themeColor: 'orange',
    gradient: 'from-orange-500 via-amber-600 to-red-500',
    accentHex: '#EA580C',
    glowClass: 'shadow-orange-500/30',
  },
  {
    key: 'pomodoro',
    label: '25',
    sub: 'POMODORO',
    minutes: 25,
    mode: 'pomodoro',
    themeColor: 'cyan',
    gradient: 'from-cyan-500 via-sky-500 to-blue-600',
    accentHex: '#06B6D4',
    glowClass: 'shadow-cyan-500/30',
  },
  {
    key: 'deep',
    label: '50',
    sub: 'DEEP',
    minutes: 50,
    mode: 'pomodoro',
    themeColor: 'purple',
    gradient: 'from-purple-500 via-indigo-600 to-violet-600',
    accentHex: '#8B5CF6',
    glowClass: 'shadow-purple-500/30',
  },
  {
    key: 'custom',
    label: '∞',
    sub: 'CUSTOM',
    minutes: 30,
    mode: 'pomodoro',
    themeColor: 'fuchsia',
    gradient: 'from-fuchsia-500 via-pink-600 to-rose-600',
    accentHex: '#D946EF',
    glowClass: 'shadow-fuchsia-500/30',
  },
  {
    key: 'infinity',
    label: '∞',
    sub: 'INFINITY',
    minutes: 0,
    mode: 'stopwatch',
    themeColor: 'rose',
    gradient: 'from-rose-500 via-red-500 to-pink-600',
    accentHex: '#F43F5E',
    glowClass: 'shadow-rose-500/30',
  },
];

const SUBJECTS = [
  'সাধারণ পড়া',
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
  // Main Hub Sub-Tab: 'timer' | 'calendar'
  const [hubTab, setHubTab] = useState<'timer' | 'calendar'>('timer');

  // Preset Selection
  const [selectedPresetKey, setSelectedPresetKey] = useState<PresetKey>('start');
  const activePreset = PRESET_CONFIGS.find((p) => p.key === selectedPresetKey) || PRESET_CONFIGS[0];

  // Subject
  const [selectedSubject, setSelectedSubject] = useState('সাধারণ পড়া');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  // Live Timer State
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(2 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchLaps, setStopwatchLaps] = useState<StopwatchLap[]>([]);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Ambient sound
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [ambientVolume, setAmbientVolume] = useState(0.4);
  const [showSoundMenu, setShowSoundMenu] = useState(false);

  // Fullscreen / Zen Mode
  const [isZenMode, setIsZenMode] = useState(false);

  // Custom minute modal / input
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMinInput, setCustomMinInput] = useState(30);

  // Allowed Apps Hub Modal
  const [showAllowedApps, setShowAllowedApps] = useState(false);

  // Anti-Distraction Lockout
  const [focusLockActive, setFocusLockActive] = useState(true);
  const [showDistractionWarning, setShowDistractionWarning] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [distractionPenaltySec, setDistractionPenaltySec] = useState(10);

  // Dynamic Motivation Quote
  const [quoteIndex, setQuoteIndex] = useState(0);

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
        // User switched tab or minimized during active focus session!
        playWarningAlertSound(true);
        setShowDistractionWarning(true);
        setDistractionCount((prev) => prev + 1);
        setDistractionPenaltySec(10);
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

  // Split MM:SS into individual digits for flip-card display: [M1, M2, S1, S2]
  const getDigits = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const mStr = String(m).padStart(2, '0');
    const sStr = String(s).padStart(2, '0');
    return [mStr[0] || '0', mStr[1] || '0', sStr[0] || '0', sStr[1] || '0'];
  };

  // Handle Session Completion
  const handleCompleteSession = useCallback(
    (studiedMinutes: number, studiedSeconds: number) => {
      if (studiedSeconds < 30) return; // ignore accidental micro taps

      const effectiveMinutes = Math.max(1, studiedMinutes);
      // Study gives 1 Aura per minute studied + 20 Aura bonus per completed pomodoro
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

      // Trigger phone notification
      sendPhoneNotification({
        title: 'স্টাডি সেশন সম্পন্ন! 🏆✨',
        body: `সাবাশ! ${effectiveMinutes} মিনিট ${selectedSubject} পড়া শেষ হয়েছে! +${earnedAura} Aura স্কোয়াডে যুক্ত হয়েছে!`,
        mood: 'ice-bear',
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
  const handleSelectPreset = (p: PresetConfig) => {
    setSelectedPresetKey(p.key);
    setIsRunning(false);
    if (p.mode === 'stopwatch') {
      setMode('stopwatch');
      setStopwatchSeconds(0);
      setStopwatchLaps([]);
    } else {
      setMode('pomodoro');
      if (p.key === 'custom') {
        setShowCustomModal(true);
      } else {
        setSecondsLeft(p.minutes * 60);
      }
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

  // Dial calculations
  const totalDurationSec =
    mode === 'pomodoro' ? Math.max(1, activePreset.minutes * 60) : 3600;
  const currentElapsedSec =
    mode === 'pomodoro' ? totalDurationSec - secondsLeft : stopwatchSeconds;
  const progressRatio = Math.min(1, Math.max(0, currentElapsedSec / totalDurationSec));

  const dialSize = 340;
  const strokeWidth = 10;
  const radius = (dialSize - strokeWidth - 28) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // 12 Numbers Trigonometric Positions (1, 2, ..., 12)
  const hourNumbers = Array.from({ length: 12 }).map((_, i) => {
    const num = i === 0 ? 12 : i;
    const angle = (num * 30) * (Math.PI / 180);
    const rNum = dialSize / 2 - 18;
    const x = dialSize / 2 + rNum * Math.sin(angle);
    const y = dialSize / 2 - rNum * Math.cos(angle);
    return { num, x, y };
  });

  // 60 Sub-Ticks generator
  const dialTicks = Array.from({ length: 60 }).map((_, i) => {
    const isMajor = i % 5 === 0;
    const angle = (i * 6) * (Math.PI / 180);
    const rOuter = dialSize / 2 - 4;
    const rInner = rOuter - (isMajor ? 7 : 3.5);
    const x1 = dialSize / 2 + rInner * Math.sin(angle);
    const y1 = dialSize / 2 - rInner * Math.cos(angle);
    const x2 = dialSize / 2 + rOuter * Math.sin(angle);
    const y2 = dialSize / 2 - rOuter * Math.cos(angle);
    return { id: i, x1, y1, x2, y2, isMajor };
  });

  // Current display digits [D1, D2, D3, D4]
  const currentActiveSec = mode === 'pomodoro' ? secondsLeft : stopwatchSeconds;
  const [d1, d2, d3, d4] = getDigits(currentActiveSec);

  return (
    <div
      className={`space-y-6 ${
        isZenMode
          ? 'fixed inset-0 z-50 bg-[#070A11] text-slate-100 p-6 sm:p-10 flex flex-col justify-between overflow-y-auto select-none'
          : ''
      }`}
    >
      {/* Zen Mode Header with Close Button */}
      {isZenMode && (
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-black font-aura tracking-widest text-cyan-400 uppercase">
              CAMPUS 6.0 · ZEN FOCUS LOCK
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

      {/* Top Header: Campus 6.0 Precision Chronometer & Controls */}
      {!isZenMode && (
        <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900/90 dark:bg-[#0C1019] border border-slate-800/90 p-4 sm:p-5 rounded-3xl text-white shadow-lg relative overflow-hidden">
          {/* Subtle Cyber Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -left-12 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl"
          />

          {/* Left Title with 6.0 Badge */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center font-mono font-black text-sm text-white shadow-md shadow-orange-500/30">
              6.0
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-black tracking-widest text-amber-400/90 font-mono uppercase">
                PRECISION CHRONOMETER
              </div>
              <h2 className="font-display text-lg sm:text-xl font-black text-white tracking-wide">
                ফোকাস টাইমার
              </h2>
            </div>
          </div>

          {/* Right Action Icons: Hub Tab, Sound, Bell, Allowed Apps, Zen */}
          <div className="flex items-center gap-2 sm:gap-2.5 relative z-10 flex-wrap">
            {/* Dual Tab: Timer vs Calendar */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-800/80 border border-slate-700/70 text-xs font-bold">
              <button
                type="button"
                onClick={() => setHubTab('timer')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  hubTab === 'timer'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                টাইমার
              </button>
              <button
                type="button"
                onClick={() => setHubTab('calendar')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  hubTab === 'calendar'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ক্যালেন্ডার
              </button>
            </div>

            {/* Allowed Apps Launcher Button */}
            <button
              type="button"
              onClick={() => setShowAllowedApps(true)}
              className="px-3 py-1.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="অনুমোদিত স্টাডি টুলস ও ক্যালকুলেটর"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>অনুমোদিত অ্যাপস</span>
            </button>

            {/* Sound Toggle Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSoundMenu(!showSoundMenu)}
                aria-label="সাউন্ড কন্ট্রোল"
                className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                  ambientSound !== 'none'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {ambientSound !== 'none' ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Sound Dropdown Menu */}
              {showSoundMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl z-30 space-y-2">
                  <div className="text-xs font-bold text-slate-400">স্টাডি ব্যাকগ্রাউন্ড সাউন্ড:</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {(['none', 'rain', 'waves', 'cafe', 'ticking'] as AmbientSoundType[]).map((snd) => (
                      <button
                        key={snd}
                        type="button"
                        onClick={() => {
                          setAmbientSound(snd);
                          setShowSoundMenu(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
                          ambientSound === snd
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
                    <div className="space-y-1 pt-1 border-t border-slate-800">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
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
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Strict Focus Lock Pill */}
            <button
              type="button"
              onClick={() => setFocusLockActive(!focusLockActive)}
              className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                focusLockActive
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title={focusLockActive ? 'স্ট্রিক্ট ফোকাস লক সক্রিয়' : 'লক নিষ্ক্রিয়'}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Zen Fullscreen */}
            <button
              type="button"
              onClick={() => setIsZenMode(true)}
              className="p-2 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="ফুলস্ক্রিন জেন মোড"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: FOCUS TIMER */}
      {hubTab === 'timer' && (
        <div className="rounded-3xl border border-slate-800/90 bg-[#0B0E17] text-slate-100 p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col items-center relative overflow-hidden">
          {/* Subtle Glow Backdrops */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-orange-500/5 blur-3xl"
          />

          {/* 1. HORIZONTAL PRESET CAROUSEL (Exact items & colors from the video) */}
          <div className="w-full max-w-xl overflow-x-auto pb-1 select-none flex items-center justify-start sm:justify-center gap-2">
            {PRESET_CONFIGS.map((p) => {
              const isSelected = p.key === selectedPresetKey;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'border-amber-400/80 bg-amber-500/10 text-white shadow-lg shadow-amber-500/20'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: `${p.accentHex}AA`,
                          backgroundColor: `${p.accentHex}15`,
                          color: '#FFFFFF',
                        }
                      : {}
                  }
                >
                  <span
                    className="font-bold text-sm"
                    style={{ color: isSelected ? p.accentHex : undefined }}
                  >
                    {p.label}
                  </span>
                  <span className="tracking-widest uppercase text-[11px] font-bold">
                    {p.sub}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Thin Progress line under preset carousel */}
          <div className="w-full max-w-xl h-1 rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressRatio * 100}%`,
                backgroundColor: activePreset.accentHex,
              }}
            />
          </div>

          {/* 2. CURRENT FOCUS CARD (Clickable to switch subject) */}
          <div className="w-full max-w-sm space-y-1">
            <div className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase text-center sm:text-left">
              CURRENT FOCUS
            </div>
            <div
              onClick={() => setShowSubjectPicker(!showSubjectPicker)}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer group shadow-inner"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activePreset.accentHex }}
                />
                <span className="font-bold text-sm sm:text-base text-white">
                  {selectedSubject}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform" />
            </div>

            {/* Subject Picker Dropdown Chips */}
            {showSubjectPicker && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 animate-in fade-in">
                <div className="text-xs font-bold text-slate-400 mb-1">বিষয় নির্বাচন করুন:</div>
                <div className="flex flex-wrap gap-1.5">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSelectedSubject(s);
                        setShowSubjectPicker(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSubject === s
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. THE 12-HOUR CHRONOMETER DIAL & FLIP CLOCK (Exact match from the video!) */}
          <div className="relative my-2 sm:my-4 flex items-center justify-center select-none">
            {/* Outer Ambient Glow */}
            <div
              aria-hidden="true"
              className="absolute inset-4 rounded-full blur-3xl opacity-30 transition-all duration-700"
              style={{
                backgroundColor: isRunning ? activePreset.accentHex : 'transparent',
              }}
            />

            <svg width={dialSize} height={dialSize} className="relative z-10 overflow-visible">
              {/* 12 Hour Numbers (12, 1, 2, ..., 11) */}
              <g className="hour-numbers">
                {hourNumbers.map((h) => (
                  <text
                    key={h.num}
                    x={h.x}
                    y={h.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="currentColor"
                    className="text-slate-500 font-mono text-[10px] sm:text-[11px] font-bold select-none opacity-60"
                  >
                    {h.num}
                  </text>
                ))}
              </g>

              {/* 60 Sub-Tick Marks */}
              <g className="sub-ticks">
                {dialTicks.map((t) => (
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
                        ? 'text-slate-400 opacity-80'
                        : 'text-slate-700 opacity-40'
                    }
                  />
                ))}
              </g>

              {/* 12-O'clock Major Accent Indicator */}
              <circle
                cx={dialSize / 2}
                cy={15}
                r={3}
                fill={activePreset.accentHex}
                className="animate-pulse"
              />

              {/* Circular Track Background */}
              <circle
                cx={dialSize / 2}
                cy={dialSize / 2}
                r={radius}
                stroke="#1B2232"
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              {/* Dynamic Neon Glowing Progress Arc */}
              <g className="transform -rotate-90 origin-center">
                <circle
                  cx={dialSize / 2}
                  cy={dialSize / 2}
                  r={radius}
                  stroke={activePreset.accentHex}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-linear"
                  fill="transparent"
                />
              </g>
            </svg>

            {/* INNER DIAL OVERLAY: READY / STATUS + 4 FLIP-CLOCK CARDS */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
              {/* Status Badge */}
              <div
                className="text-[10px] sm:text-[11px] font-black tracking-widest font-mono uppercase mb-2"
                style={{ color: activePreset.accentHex }}
              >
                {isRunning
                  ? mode === 'pomodoro'
                    ? 'FOCUSING'
                    : 'INFINITY'
                  : 'READY'}
              </div>

              {/* 4 DIGITAL FLIP-CLOCK TILES: [ 0 ] [ 2 ] : [ 0 ] [ 0 ] */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Digit 1 */}
                <div className="w-11 sm:w-13 h-16 sm:h-18 rounded-2xl bg-[#111622] border border-slate-700/80 shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-black/40 z-10" />
                  <span className="font-mono font-black text-3xl sm:text-4xl text-white tracking-tight tabular-nums select-none drop-shadow-sm">
                    {d1}
                  </span>
                </div>

                {/* Digit 2 */}
                <div className="w-11 sm:w-13 h-16 sm:h-18 rounded-2xl bg-[#111622] border border-slate-700/80 shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-black/40 z-10" />
                  <span className="font-mono font-black text-3xl sm:text-4xl text-white tracking-tight tabular-nums select-none drop-shadow-sm">
                    {d2}
                  </span>
                </div>

                {/* Colon Separator */}
                <div
                  className="font-mono font-black text-2xl sm:text-3xl px-0.5 select-none animate-pulse"
                  style={{ color: activePreset.accentHex }}
                >
                  :
                </div>

                {/* Digit 3 */}
                <div className="w-11 sm:w-13 h-16 sm:h-18 rounded-2xl bg-[#111622] border border-slate-700/80 shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-black/40 z-10" />
                  <span className="font-mono font-black text-3xl sm:text-4xl text-white tracking-tight tabular-nums select-none drop-shadow-sm">
                    {d3}
                  </span>
                </div>

                {/* Digit 4 */}
                <div className="w-11 sm:w-13 h-16 sm:h-18 rounded-2xl bg-[#111622] border border-slate-700/80 shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-black/40 z-10" />
                  <span className="font-mono font-black text-3xl sm:text-4xl text-white tracking-tight tabular-nums select-none drop-shadow-sm">
                    {d4}
                  </span>
                </div>
              </div>

              {/* Subtitle Under Digits: Lightning Icon + Preset Sub */}
              <div className="flex items-center gap-1 mt-2 text-xs font-mono font-bold text-slate-400">
                <Zap className="w-3.5 h-3.5" style={{ color: activePreset.accentHex }} />
                <span>{activePreset.sub}</span>
              </div>
            </div>
          </div>

          {/* 4. MOTIVATION QUOTE BAR (Clickable to cycle quotes) */}
          <div
            onClick={() => setQuoteIndex((prev) => (prev + 1) % MOTIVATION_QUOTES.length)}
            className="w-full max-w-md p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-3 cursor-pointer group shadow-sm select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Zap className="w-4 h-4 fill-orange-400" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
              {MOTIVATION_QUOTES[quoteIndex]}
            </div>
          </div>

          {/* 5. PRIMARY ACTION BUTTONS: START/PAUSE PILL & RESET */}
          <div className="flex items-center gap-3 pt-2">
            {/* Primary Action Button: Large Gradient Pill */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-slate-950 text-sm sm:text-base font-black transition-all shadow-xl active:scale-95 cursor-pointer flex items-center gap-2 select-none ${
                isRunning
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-orange-500/30'
                  : 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 hover:from-amber-300 hover:to-orange-400 shadow-amber-500/30'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-slate-950" />
                  <span>থামুন</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>শুরু</span>
                </>
              )}
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              aria-label="রিসেট করুন"
              title="টাইমার রিসেট করুন"
              className="p-3.5 sm:p-4 rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Lap Button for Stopwatch / Infinity Mode */}
            {mode === 'stopwatch' && isRunning && (
              <button
                type="button"
                onClick={recordLap}
                className="px-4 py-3.5 sm:py-4 rounded-2xl border border-rose-500/50 bg-rose-950/40 text-rose-300 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
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
            <div className="w-full max-w-md pt-3 space-y-1.5 border-t border-slate-800/80">
              <div className="text-xs font-bold text-slate-400 flex items-center justify-between mb-1">
                <span>রেকর্ড করা ল্যাপস (Laps):</span>
                <span className="font-mono text-[11px]">{stopwatchLaps.length} Laps</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {stopwatchLaps.map((lap) => (
                  <div
                    key={lap.id}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono"
                  >
                    <span className="font-bold text-slate-300">Lap #{lap.id}</span>
                    <span className="font-black text-cyan-400">{lap.formatted}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* 6. ALLOWED APPS HUB MODAL */}
      <AllowedAppsModal
        isOpen={showAllowedApps}
        onClose={() => setShowAllowedApps(false)}
        activeSubject={selectedSubject}
        remainingTimeSec={mode === 'pomodoro' ? secondsLeft : undefined}
      />

      {/* 7. ANTI-DISTRACTION PENALTY ALERT MODAL */}
      {showDistractionWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border-2 border-rose-500 bg-[#120B10] p-6 text-white shadow-2xl shadow-rose-950/60 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-lg font-black text-rose-400">
                🚨 ফোকাস ভঙ্গ সতর্কবার্তা!
              </h3>
              <p className="text-xs text-slate-300 font-bangla">
                পড়ার সেশন চলাকালীন অন্য অ্যাপ বা ব্রাউজার ট্যাবে যাওয়া নিষিদ্ধ!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-200 space-y-1">
              <div className="font-bold">কিরা রেগে আগুন! 😤🔥</div>
              <div>&ldquo;ফেসবুক বা রিলস স্ক্রল করা বন্ধ করে দ্রুত টেবিলে ফিরো!&rdquo;</div>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              ফোকাস লঙ্ঘন সংখ্যা: <strong className="text-rose-400 font-bold">{distractionCount}</strong> বার
            </div>

            <button
              type="button"
              onClick={() => setShowDistractionWarning(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all"
            >
              পড়ায় ফিরে যাচ্ছি (আমি টেবিলে আছি)
            </button>
          </div>
        </div>
      )}

      {/* 8. CUSTOM MINUTES MODAL */}
      {showCustomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setShowCustomModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl space-y-4 text-white"
          >
            <h4 className="font-bold text-white text-sm font-display">
              Custom Focus Time (মিনিট)
            </h4>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinInput}
              onChange={(e) => setCustomMinInput(Math.max(1, Math.min(180, Number(e.target.value))))}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-lg font-mono font-bold text-center text-white"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  setSecondsLeft(customMinInput * 60);
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
