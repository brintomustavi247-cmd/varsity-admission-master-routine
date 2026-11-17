import { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  BookOpen,
  FileText,
  Search,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Video,
} from 'lucide-react';

interface CustomAllowedApp {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

const DEFAULT_ALLOWED_LINKS: CustomAllowedApp[] = [
  {
    id: 'desmos',
    name: 'Desmos গ্রাফিং ক্যালকুলেটর',
    url: 'https://www.desmos.com/calculator',
    icon: '📊',
  },
  {
    id: 'wikipedia',
    name: 'উইকিপিডিয়া স্টাডি আর্টিকেলে',
    url: 'https://bn.wikipedia.org',
    icon: '🌐',
  },
  {
    id: 'google-drive',
    name: 'গুগল ড্রাইভ স্টাডি নোটস',
    url: 'https://drive.google.com',
    icon: '📁',
  },
];

const FORMULA_CHEAT_SHEET = [
  {
    category: 'পদার্থবিজ্ঞান',
    items: [
      { name: 'গতিবিদ্যা', formula: 'v = u + at | s = ut + ½at² | v² = u² + 2as' },
      { name: 'কাজ-শক্তি', formula: 'W = F·s·cosθ | E_k = ½mv² | E_p = mgh' },
      { name: 'মহাকর্ষ', formula: 'F = G(m₁m₂)/r² | g = GM/R² | v_e = √(2gR)' },
      { name: 'তরঙ্গ ও শব্দ', formula: 'v = fλ | T = 1/f | I ∝ A²' },
      { name: 'তড়িৎ', formula: 'V = IR | P = VI = I²R | C = Q/V' },
    ],
  },
  {
    category: 'উচ্চতর গণিত',
    items: [
      { name: 'ত্রিকোণমিতি', formula: 'sin²θ + cos²θ = 1 | sin(A±B) = sinA·cosB ± cosA·sinB' },
      { name: 'ডিফারেন্সিয়েশন', formula: 'd/dx(xⁿ) = n·xⁿ⁻¹ | d/dx(sin x) = cos x | d/dx(eˣ) = eˣ' },
      { name: 'ইন্টিগ্রেশন', formula: '∫ xⁿ dx = (xⁿ⁺¹)/(n+1) | ∫ 1/x dx = ln|x|' },
      { name: 'কনিক্স', formula: 'বৃত্ত: x² + y² = r² | পরাবৃত্ত: y² = 4ax' },
    ],
  },
  {
    category: 'রসায়ন ধ্রুবক',
    items: [
      { name: 'গ্যাস ধ্রুবক (R)', formula: 'R = 8.314 J·mol⁻¹·K⁻¹ | 0.0821 L·atm·mol⁻¹·K⁻¹' },
      { name: 'অ্যাভোগাড্রো সংখ্যা', formula: 'N_A = 6.022 × 10²³ mol⁻¹' },
      { name: 'প্ল্যাঙ্ক ধ্রুবক', formula: 'h = 6.626 × 10⁻³⁴ J·s' },
      { name: 'আদর্শ গ্যাস', formula: 'PV = nRT | P₁V₁/T₁ = P₂V₂/T₂' },
    ],
  },
];

const VOCAB_DATABASE = [
  { word: 'Ubiquitous', meaning: 'সর্বব্যাপী, যা সব জায়গায় পাওয়া যায়', syn: 'Omnipresent, Pervasive' },
  { word: 'Equilibrium', meaning: 'সাম্যাবস্থা, স্থিতাবস্থা', syn: 'Balance, Stability, Poise' },
  { word: 'Momentum', meaning: 'ভরবেগ, গতিশক্তি বা কাজের প্রেরণা', syn: 'Impetus, Drive, Thrust' },
  { word: 'Viscosity', meaning: 'সান্দ্রতা, তরলের অভ্যন্তরীণ ঘর্ষণ', syn: 'Thickness, Stickiness' },
  { word: 'Resonance', meaning: 'অনুনাদ, কম্পাঙ্কের সামঞ্জস্যে বিস্তার বৃদ্ধি', syn: 'Echo, Reverberation' },
  { word: 'Pragmatic', meaning: 'বাস্তবধর্মী, প্রায়োগিক', syn: 'Practical, Realistic' },
  { word: 'Proactive', meaning: 'আগাম প্রস্তুতিমূলক, অগ্রবর্তী', syn: 'Forward-looking, Dynamic' },
  { word: 'Dormant', meaning: 'সুপ্ত, নিষ্ক্রিয় অবস্থায় থাকা', syn: 'Inactive, Latent, Sleeping' },
];

interface AllowedAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSubject?: string;
  remainingTimeSec?: number;
}

export function AllowedAppsModal({
  isOpen,
  onClose,
  activeSubject = 'ফোকাস সেশন',
  remainingTimeSec,
}: AllowedAppsModalProps) {
  const [activeTab, setActiveTab] = useState<'calc' | 'notes' | 'formulas' | 'vocab' | 'apps'>('calc');

  // Scientific Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcSub, setCalcSub] = useState('');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  // Scratchpad State
  const [scratchText, setScratchText] = useState(() => {
    return localStorage.getItem('varsity_scratch_pad_v1') || '';
  });

  // Vocab Search
  const [vocabQuery, setVocabQuery] = useState('');

  // Custom allowed links
  const [customApps, setCustomApps] = useState<CustomAllowedApp[]>(() => {
    try {
      const raw = localStorage.getItem('varsity_custom_allowed_apps_v1');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_ALLOWED_LINKS;
  });
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [showAddApp, setShowAddApp] = useState(false);

  useEffect(() => {
    localStorage.setItem('varsity_scratch_pad_v1', scratchText);
  }, [scratchText]);

  useEffect(() => {
    localStorage.setItem('varsity_custom_allowed_apps_v1', JSON.stringify(customApps));
  }, [customApps]);

  if (!isOpen) return null;

  // Calculator Functions
  const handleCalcInput = (char: string) => {
    setCalcDisplay((prev) => {
      if (prev === '0' || prev === 'Error') return char;
      return prev + char;
    });
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcSub('');
  };

  const handleCalcDelete = () => {
    setCalcDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const handleCalcEvaluate = () => {
    try {
      // Safe math evaluation with Math functions
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

      // Auto close brackets
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

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppUrl.trim()) return;
    let url = newAppUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const newEntry: CustomAllowedApp = {
      id: `custom_${Date.now()}`,
      name: newAppName.trim(),
      url,
      icon: '🔗',
    };
    setCustomApps((prev) => [newEntry, ...prev]);
    setNewAppName('');
    setNewAppUrl('');
    setShowAddApp(false);
  };

  const handleDeleteApp = (id: string) => {
    setCustomApps((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredVocab = VOCAB_DATABASE.filter(
    (v) =>
      v.word.toLowerCase().includes(vocabQuery.toLowerCase()) ||
      v.meaning.includes(vocabQuery) ||
      v.syn.toLowerCase().includes(vocabQuery.toLowerCase())
  );

  const formatRemaining = (sec?: number) => {
    if (!sec || sec <= 0) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-700/80 bg-[#0F1420] text-slate-100 shadow-2xl overflow-hidden shadow-indigo-950/50"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm sm:text-base font-bold text-slate-50">
                  অনুমোদিত স্টাডি টুলস ও অ্যাপস হাব
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wide border border-emerald-500/30">
                  ফোকাস সুরক্ষিত
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                এই টুলস ব্যবহারে ফোকাস টাইমার বন্ধ হবে না এবং কোনো পেনাল্টি হবে না
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {remainingTimeSec !== undefined && remainingTimeSec > 0 && (
              <div className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>{formatRemaining(remainingTimeSec)}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-900/50 border-b border-slate-800/80 overflow-x-auto shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('calc')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'calc'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>সায়েন্টিফিক ক্যালকুলেটর</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>রাফ স্ক্র্যাচপ্যাড</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'formulas'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>সূত্রাবলি (Formula Sheet)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vocab')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'vocab'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ডিকশনারি ও শব্দার্থ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('apps')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'apps'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>অনুমোদিত ওয়েবসাইট ({customApps.length})</span>
          </button>
        </div>

        {/* Tab Body Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: SCIENTIFIC CALCULATOR */}
          {activeTab === 'calc' && (
            <div className="max-w-md mx-auto space-y-3">
              {/* Calculator Screen */}
              <div className="p-4 rounded-2xl bg-[#090D15] border border-slate-800/90 text-right space-y-1 shadow-inner">
                <div className="h-4 text-[11px] font-mono text-cyan-400 truncate">
                  {calcSub}
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider truncate tabular-nums">
                  {calcDisplay}
                </div>
              </div>

              {/* Calculator Button Grid */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {/* Advanced row 1 */}
                <button
                  type="button"
                  onClick={() => handleCalcInput('sin(')}
                  className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  sin
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('cos(')}
                  className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  cos
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('tan(')}
                  className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  tan
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('log(')}
                  className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  log
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('ln(')}
                  className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  ln
                </button>

                {/* Advanced row 2 */}
                <button
                  type="button"
                  onClick={() => handleCalcInput('√(')}
                  className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  √x
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('^2')}
                  className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  x²
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('π')}
                  className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  π
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('(')}
                  className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-amber-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  (
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput(')')}
                  className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-amber-300 font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  )
                </button>

                {/* Main keypad row 1 */}
                <button
                  type="button"
                  onClick={handleCalcClear}
                  className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 font-bold text-xs hover:bg-rose-900/60 cursor-pointer"
                >
                  AC
                </button>
                <button
                  type="button"
                  onClick={handleCalcDelete}
                  className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-300 font-bold text-xs hover:bg-amber-900/60 cursor-pointer"
                >
                  DEL
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('%')}
                  className="p-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('÷')}
                  className="p-2.5 rounded-xl bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 font-bold text-sm hover:bg-indigo-800/60 cursor-pointer"
                >
                  ÷
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('×')}
                  className="p-2.5 rounded-xl bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 font-bold text-sm hover:bg-indigo-800/60 cursor-pointer"
                >
                  ×
                </button>

                {/* Main keypad row 2: 7, 8, 9, -, + */}
                {['7', '8', '9'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleCalcInput(n)}
                    className="p-3 rounded-xl bg-slate-800/90 text-white font-mono text-base font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleCalcInput('-')}
                  className="p-3 rounded-xl bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 font-bold text-sm hover:bg-indigo-800/60 cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('+')}
                  className="p-3 rounded-xl bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 font-bold text-sm hover:bg-indigo-800/60 cursor-pointer"
                >
                  +
                </button>

                {/* Main keypad row 3: 4, 5, 6, 1, 2 */}
                {['4', '5', '6', '1', '2'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleCalcInput(n)}
                    className="p-3 rounded-xl bg-slate-800/90 text-white font-mono text-base font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    {n}
                  </button>
                ))}

                {/* Main keypad row 4: 3, 0, ., = */}
                <button
                  type="button"
                  onClick={() => handleCalcInput('3')}
                  className="p-3 rounded-xl bg-slate-800/90 text-white font-mono text-base font-bold hover:bg-slate-700 cursor-pointer"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('0')}
                  className="p-3 rounded-xl bg-slate-800/90 text-white font-mono text-base font-bold hover:bg-slate-700 cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleCalcInput('.')}
                  className="p-3 rounded-xl bg-slate-800/90 text-white font-mono text-base font-bold hover:bg-slate-700 cursor-pointer"
                >
                  .
                </button>
                <button
                  type="button"
                  onClick={handleCalcEvaluate}
                  className="col-span-2 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-lg shadow-md cursor-pointer"
                >
                  =
                </button>
              </div>

              {/* Recent History */}
              {calcHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60">
                  <div className="text-[11px] font-bold text-slate-500 mb-1">পূর্ববর্তী হিসাব:</div>
                  <div className="space-y-1">
                    {calcHistory.map((h, i) => (
                      <div
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/60 text-slate-400 font-mono text-xs flex justify-between"
                      >
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCRATCHPAD */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>দ্রুত রাফ ও নোটপ্যাড (অটো-সেভ হচ্ছে)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setScratchText('')}
                  className="text-slate-500 hover:text-rose-400 transition-colors text-[11px]"
                >
                  সব মুছুন
                </button>
              </div>
              <textarea
                value={scratchText}
                onChange={(e) => setScratchText(e.target.value)}
                placeholder="এখানে ম্যাথ রাফ, সূত্রের নোট বা গুরুত্বপূর্ণ পয়েন্ট লিখে রাখুন..."
                className="w-full h-72 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-200 text-sm font-mono focus:border-cyan-500/80 focus:outline-hidden resize-none"
              />
            </div>
          )}

          {/* TAB 3: FORMULA CHEAT SHEET */}
          {activeTab === 'formulas' && (
            <div className="space-y-4">
              {FORMULA_CHEAT_SHEET.map((cat) => (
                <div
                  key={cat.category}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2"
                >
                  <h4 className="text-xs font-black text-cyan-400 font-display tracking-wider uppercase">
                    {cat.category}
                  </h4>
                  <div className="space-y-1.5">
                    {cat.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-xl bg-slate-950/50 border border-slate-800/40 text-xs"
                      >
                        <span className="font-bold text-slate-300 shrink-0">{item.name}:</span>
                        <code className="font-mono text-indigo-300 text-[11px] sm:text-xs">
                          {item.formula}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: VOCAB SEARCH */}
          {activeTab === 'vocab' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vocabQuery}
                  onChange={(e) => setVocabQuery(e.target.value)}
                  placeholder="ইংরেজি শব্দ বা অর্থ দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredVocab.map((v) => (
                  <div
                    key={v.word}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-sm tracking-wide font-display">
                        {v.word}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono">Admission Vocab</span>
                    </div>
                    <div className="text-xs text-slate-300 font-bangla">{v.meaning}</div>
                    <div className="text-[11px] text-slate-400">
                      <strong>সমার্থক:</strong> {v.syn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOM ALLOWED APPS & WEBSITES */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  অনুমোদিত ওয়েবসাইটসমূহ নিরাপদ ট্যাবে ওপেন হবে:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddApp(!showAddApp)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন লিঙ্ক যোগ করুন</span>
                </button>
              </div>

              {/* Add form */}
              {showAddApp && (
                <form
                  onSubmit={handleAddApp}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-2.5 animate-in fade-in"
                >
                  <div className="text-xs font-bold text-indigo-300">
                    নতুন অনুমোদিত স্টাডি লিঙ্ক বা পোর্টাল যোগ করুন
                  </div>
                  <input
                    type="text"
                    required
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="নাম (যেমন: উদ্ভাস অনলাইন পোর্টাল / ঢাকা কলেজ)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    value={newAppUrl}
                    onChange={(e) => setNewAppUrl(e.target.value)}
                    placeholder="URL (যেমন: online.udvash.com বা drive.google.com)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddApp(false)}
                      className="px-3 py-1 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                    >
                      সেভ করুন
                    </button>
                  </div>
                </form>
              )}

              {/* List of custom apps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {customApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl">{app.icon || '🔗'}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-200 truncate">{app.name}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[170px]">
                          {app.url}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span>ওপেন</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Notice */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>লকডাউন স্টাডি সেশন সক্রিয়: {activeSubject}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}
