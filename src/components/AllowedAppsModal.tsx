import { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  RotateCcw,
  Check,
} from 'lucide-react';

export interface PhoneAllowedApp {
  id: string;
  name: string;
  category: string;
  icon: string;
  urlScheme: string; // URL or deep link
  isAllowed: boolean;
  isCustom?: boolean;
}

const DEFAULT_PHONE_APPS: PhoneAllowedApp[] = [
  {
    id: 'calculator',
    name: 'ক্যালকুলেটর (Calculator)',
    category: 'ম্যাথ ও বিজ্ঞান',
    icon: '🧮',
    urlScheme: '#inapp-calc',
    isAllowed: true,
  },
  {
    id: 'youtube',
    name: 'YouTube (লেকচার ও ক্লাস)',
    category: 'স্টাডি ভিডিও',
    icon: '🔴',
    urlScheme: 'https://youtube.com',
    isAllowed: true,
  },
  {
    id: 'gdrive',
    name: 'গুগল ড্রাইভ ও PDF নোটস',
    category: 'হ্যান্ডনোট ও ফাইল',
    icon: '📁',
    urlScheme: 'https://drive.google.com',
    isAllowed: true,
  },
  {
    id: 'chrome',
    name: 'গুগল ক্রোম / ব্রাউজার',
    category: 'তথ্য অনুসন্ধান',
    icon: '🌐',
    urlScheme: 'https://google.com',
    isAllowed: true,
  },
  {
    id: 'notes',
    name: 'নোটস / Keep Notes',
    category: 'নোট লেখা',
    icon: '📝',
    urlScheme: 'https://keep.google.com',
    isAllowed: true,
  },
  {
    id: 'telegram',
    name: 'টেলিগ্রাম স্টাডি গ্রুপ',
    category: 'কোচিং চ্যানেল',
    icon: '💬',
    urlScheme: 'https://web.telegram.org',
    isAllowed: false,
  },
  {
    id: 'zoom',
    name: 'Zoom / Google Meet',
    category: 'অনলাইন লাইভ ক্লাস',
    icon: '💻',
    urlScheme: 'https://meet.google.com',
    isAllowed: true,
  },
  {
    id: 'dictionary',
    name: 'অভিধান ও ডিকশনারি',
    category: 'শব্দার্থ ও ভোকাব',
    icon: '📚',
    urlScheme: 'https://bn.wikipedia.org',
    isAllowed: true,
  },
];

interface AllowedAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSubject?: string;
  remainingTimeSec?: number;
  onLaunchAllowedApp?: (app: PhoneAllowedApp) => void;
}

export function AllowedAppsModal({
  isOpen,
  onClose,
  activeSubject = 'ফোকাস সেশন',
  remainingTimeSec,
  onLaunchAllowedApp,
}: AllowedAppsModalProps) {
  const [activeTab, setActiveTab] = useState<'apps' | 'calc'>('apps');

  // Phone Allowed Apps State
  const [phoneApps, setPhoneApps] = useState<PhoneAllowedApp[]>(() => {
    try {
      const raw = localStorage.getItem('varsity_phone_allowed_apps_v2');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_PHONE_APPS;
  });

  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Scientific Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcSub, setCalcSub] = useState('');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('varsity_phone_allowed_apps_v2', JSON.stringify(phoneApps));
  }, [phoneApps]);

  if (!isOpen) return null;

  // Toggle app permission
  const handleToggleApp = (id: string) => {
    setPhoneApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, isAllowed: !app.isAllowed } : app))
    );
  };

  // Add custom app
  const handleAddCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    let url = newAppUrl.trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const newEntry: PhoneAllowedApp = {
      id: `custom_${Date.now()}`,
      name: newAppName.trim(),
      category: 'কাস্টম অ্যাপ',
      icon: '📱',
      urlScheme: url || 'https://google.com',
      isAllowed: true,
      isCustom: true,
    };
    setPhoneApps((prev) => [newEntry, ...prev]);
    setNewAppName('');
    setNewAppUrl('');
    setShowAddForm(false);
  };

  const handleDeleteCustomApp = (id: string) => {
    setPhoneApps((prev) => prev.filter((a) => a.id !== id));
  };

  // Calculator Functions
  const handleCalcInput = (char: string) => {
    setCalcDisplay((prev) => {
      if (prev === '0' || prev === 'Error') return char;
      return prev + char;
    });
  };

  // COMPLETE CLEAR ALL - "সব মোছার বাটন"
  const handleCalcAllClear = () => {
    setCalcDisplay('0');
    setCalcSub('');
    setCalcHistory([]);
  };

  const handleCalcDelete = () => {
    setCalcDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const handleCalcEvaluate = () => {
    try {
      let expression = calcDisplay
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/√\(/g, 'Math.sqrt(');

      const openCount = (expression.match(/\(/g) || []).length;
      const closeCount = (expression.match(/\)/g) || []).length;
      for (let i = 0; i < openCount - closeCount; i++) {
        expression += ')';
      }

      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${expression})`)();
      const formatted = Number.isFinite(result)
        ? String(Math.round(result * 1000000) / 1000000)
        : 'Error';

      setCalcSub(`${calcDisplay} =`);
      setCalcHistory((prev) => [`${calcDisplay} = ${formatted}`, ...prev.slice(0, 4)]);
      setCalcDisplay(formatted);
    } catch {
      setCalcDisplay('Error');
    }
  };

  const handleLaunch = (app: PhoneAllowedApp) => {
    if (app.urlScheme === '#inapp-calc') {
      setActiveTab('calc');
      return;
    }
    onLaunchAllowedApp?.(app);
    if (app.urlScheme.startsWith('http')) {
      window.open(app.urlScheme, '_blank');
    }
    onClose();
  };

  const allowedCount = phoneApps.filter((a) => a.isAllowed).length;

  const formatRemaining = (sec?: number) => {
    if (!sec || sec <= 0) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50">
                  অনুমোদিত অ্যাপস ও টুলস
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-black tracking-wide border border-emerald-300 dark:border-emerald-800">
                  {allowedCount}টি অ্যাপ সক্রিয়
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                পড়ার সময় এই অ্যাপগুলো ব্যবহারে Aura জরিমানা কাটা হবে না
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {remainingTimeSec !== undefined && remainingTimeSec > 0 && (
              <div className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>{formatRemaining(remainingTimeSec)}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dual Tab: Allowed Phone Apps vs In-App Scientific Calculator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('apps')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'apps'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>ফোনের অনুমোদিত অ্যাপস ({allowedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calc')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'calc'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>সায়েন্টিফিক ক্যালকুলেটর</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: PHONE ALLOWED APPS WHITELIST */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  পড়ার সময় ব্যবহারের জন্য অ্যাপ অনুমতি দিন:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>কাস্টম অ্যাপ যোগ</span>
                </button>
              </div>

              {/* Add Custom App Form */}
              {showAddForm && (
                <form
                  onSubmit={handleAddCustomApp}
                  className="p-3.5 rounded-2xl bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 space-y-2.5 animate-in fade-in"
                >
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
                    নতুন অনুমোদিত অ্যাপ যোগ করুন
                  </div>
                  <input
                    type="text"
                    required
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="অ্যাপের নাম (যেমন: উদ্ভাস অ্যাপ / কলেজ পোর্টাল)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={newAppUrl}
                    onChange={(e) => setNewAppUrl(e.target.value)}
                    placeholder="ওয়েবসাইট বা লিঙ্ক (ঐচ্ছিক)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                    >
                      সেভ করুন
                    </button>
                  </div>
                </form>
              )}

              {/* List of Phone Apps */}
              <div className="space-y-2">
                {phoneApps.map((app) => (
                  <div
                    key={app.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      app.isAllowed
                        ? 'border-blue-200 dark:border-blue-900/70 bg-blue-50/40 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl">{app.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                          <span>{app.name}</span>
                          {app.isAllowed ? (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              (অনুমোদিত)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-500">
                              (লকড)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {app.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Launch Button */}
                      {app.isAllowed && (
                        <button
                          type="button"
                          onClick={() => handleLaunch(app)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>চালান</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      {/* Permission Toggle Checkbox Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleApp(app.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                          app.isAllowed
                            ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-transparent'
                        }`}
                        title={app.isAllowed ? 'অনুমতি বাতিল করুন' : 'অনুমতি দিন'}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {app.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomApp(app.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: IN-APP SCIENTIFIC CALCULATOR */}
          {activeTab === 'calc' && (
            <div className="max-w-md mx-auto space-y-3">
              {/* Screen */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right space-y-1 shadow-inner">
                <div className="h-4 text-[11px] font-mono text-blue-600 dark:text-cyan-400 truncate">
                  {calcSub}
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-white tracking-wider truncate tabular-nums">
                  {calcDisplay}
                </div>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {/* Advanced row 1 */}
                <button
                  type="button"
                  onClick={() => handleCalcInput('sin(')}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  sin
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('cos(')}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  cos
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('tan(')}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  tan
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('log(')}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  log
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('ln(')}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  ln
                </button>

                {/* Advanced row 2 */}
                <button
                  type="button"
                  onClick={() => handleCalcInput('√(')}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  √x
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('^2')}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  x²
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('π')}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  π
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('(')}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-amber-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  (
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput(')')}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-amber-300 font-mono text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  )
                </button>

                {/* PROMINENT "সব মুছুন" (ALL CLEAR - AC) BUTTON */}
                <button
                  type="button"
                  onClick={handleCalcAllClear}
                  className="col-span-2 p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>সব মুছুন (AC)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCalcDelete}
                  className="p-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  DEL
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('÷')}
                  className="p-3 rounded-xl bg-blue-100 dark:bg-indigo-950/60 border border-blue-200 dark:border-indigo-800 text-blue-700 dark:text-indigo-300 font-bold text-base hover:bg-blue-200 cursor-pointer"
                >
                  ÷
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('×')}
                  className="p-3 rounded-xl bg-blue-100 dark:bg-indigo-950/60 border border-blue-200 dark:border-indigo-800 text-blue-700 dark:text-indigo-300 font-bold text-base hover:bg-blue-200 cursor-pointer"
                >
                  ×
                </button>

                {/* Number Keypad */}
                {['7', '8', '9'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleCalcInput(n)}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-mono text-base font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleCalcInput('-')}
                  className="p-3 rounded-xl bg-blue-100 dark:bg-indigo-950/60 border border-blue-200 dark:border-indigo-800 text-blue-700 dark:text-indigo-300 font-bold text-base hover:bg-blue-200 cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('+')}
                  className="p-3 rounded-xl bg-blue-100 dark:bg-indigo-950/60 border border-blue-200 dark:border-indigo-800 text-blue-700 dark:text-indigo-300 font-bold text-base hover:bg-blue-200 cursor-pointer"
                >
                  +
                </button>

                {['4', '5', '6', '1', '2'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleCalcInput(n)}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-mono text-base font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {n}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handleCalcInput('3')}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-mono text-base font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('0')}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-mono text-base font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('.')}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-mono text-base font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  .
                </button>
                <button
                  type="button"
                  onClick={handleCalcEvaluate}
                  className="col-span-2 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg shadow-md cursor-pointer active:scale-95"
                >
                  =
                </button>
              </div>

              {/* History */}
              {calcHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-500 mb-1">পূর্ববর্তী হিসাব:</div>
                  <div className="space-y-1">
                    {calcHistory.map((h, i) => (
                      <div
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-mono text-xs flex justify-between"
                      >
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>লকডাউন স্টাডি সেশন সক্রিয়: {activeSubject}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
          >
            ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}
