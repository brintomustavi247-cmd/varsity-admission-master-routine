import type { FormulaCard } from '../types/masterTools';

export const ADMISSION_FORMULAS: FormulaCard[] = [
  // --- পদার্থবিজ্ঞান ---
  {
    id: 'phy_01',
    subject: 'physics',
    paper: '1st',
    chapterName: 'গতিবিদ্যা',
    title: 'প্রক্ষেপকের পাল্লা ও সর্বোচ্চ উচ্চতা',
    formula: 'R = (v₀² sin 2θ) / g  |  H = (v₀² sin²θ) / (2g)',
    explanation:
      'সর্বোচ্চ পাল্লার জন্য θ = 45° এবং তখন R_max = 4H হয়। দুটি কোণ θ এবং (90°-θ) এর জন্য একই অনুভূমিক পাল্লা (R) পাওয়া যায়।',
    hackTip: 'যদি R = nH বলে, তবে tan θ = 4/n শর্টকাট সরাসরি প্রয়োগ করো।',
    importantFor: ['DU', 'RU', 'GST', 'JU'],
  },
  {
    id: 'phy_02',
    subject: 'physics',
    paper: '1st',
    chapterName: 'নিউটনিয়ান বলবিদ্যা',
    title: 'রাস্তার ব্যাংকিং কোণ ও নিরাপদ বেগ',
    formula: 'tan θ = v² / (rg) = h / √(w² - h²)',
    explanation:
      'ব্যাংকিং কোণ রাস্তার উচ্চতা (h), প্রস্থ (w) এবং বাঁকের ব্যাসার্ধ (r) এর সাথে সম্পর্কিত। ছোট কোণের জন্য tan θ ≈ sin θ ≈ h/w।',
    hackTip: 'হ্যান্ড ক্যালকুলেশনে g = 9.8 কে 10 ধরে কাছাকাছি মান বের করে অপশন এলিমিনেট করো।',
    importantFor: ['DU', 'RU', 'CU', 'GST'],
  },
  {
    id: 'phy_03',
    subject: 'physics',
    paper: '1st',
    chapterName: 'কাজ, শক্তি ও ক্ষমতা',
    title: 'কুয়া ও পাম্পের ক্ষমতা শর্টকাট',
    formula: 'W = m g h_effective  |  P = W / t = (m g h_effective) / t',
    explanation:
      'সম্পূর্ণ ভর্তি কুয়া খালি করতে h_effective = L/2। অর্ধেক ভর্তি কুয়া খালি করতে h_effective = L/2 + L/4 = 3L/4।',
    hackTip: 'খালি করার ক্ষেত্রে পানির ভারকেন্দ্রের সরণ মনে রাখলে কখনো ভুল হবে না।',
    importantFor: ['DU', 'JU', 'RU', 'BUTEX'],
  },
  {
    id: 'phy_04',
    subject: 'physics',
    paper: '1st',
    chapterName: 'মহাকর্ষ ও অভিকর্ষ',
    title: 'মুক্তিবেগ ও উপগ্রহের বেগ',
    formula: 'v_e = √(2gR) = √(2GM/R) ≈ 11.2 km/s  |  v_orbit = √(gR) = v_e / √2',
    explanation:
      'মুক্তিবেগ বস্তুর ভরের ওপর নির্ভর করে না, গ্রহের ভর ও ব্যাসার্ধের ওপর নির্ভর করে। উপগ্রহের বেগ মুক্তিবেগের 1/√2 গুণ (প্রায় 7.9 km/s)।',
    hackTip: 'যদি পৃথিবীর ব্যাসার্ধ অপরিবর্তিত রেখে ভর দ্বিগুণ করা হয়, মুক্তিবেগ √2 গুণ হবে।',
    importantFor: ['DU', 'RU', 'GST', 'Agri'],
  },
  {
    id: 'phy_05',
    subject: 'physics',
    paper: '1st',
    chapterName: 'আদর্শ গ্যাস ও গতিতত্ত্ব',
    title: 'গ্যাস অণুর আরএমএস বেগ ও গতিশক্তি',
    formula: 'c_rms = √(3RT/M) = √(3P/ρ)  |  E_k = (3/2) k_B T (প্রতি অণু)',
    explanation:
      'c_rms পরম তাপমাত্রার বর্গমূলের সমানুপাতিক (c ∝ √T)। M কে অবশ্যই কেজিতে (kg/mol) নিতে হবে। ১ মোলের গতিশক্তি = (3/2)RT।',
    hackTip: 'অক্সিজেন ও হাইড্রোজেন গ্যাসের গতিবেগ অনুপাত বের করার ক্ষেত্রে √M অনুপাত উল্টো হবে।',
    importantFor: ['DU', 'RU', 'CU', 'GST'],
  },
  {
    id: 'phy_06',
    subject: 'physics',
    paper: '2nd',
    chapterName: 'তাপগতিবিদ্যা',
    title: 'কার্নো ইঞ্জিনের কর্মদক্ষতা ও এনট্রপি',
    formula: 'η = 1 - (T₂ / T₁) = (W / Q₁)  |  dS = dQ / T',
    explanation:
      'T₁ উৎসের তাপমাত্রা এবং T₂ গ্রাহকের তাপমাত্রা (উভয়ই কেলভিনে নিতে হবে)। প্রত্যাবর্তী প্রক্রিয়ায় মোট এনট্রপি পরিবর্তন dS = 0।',
    hackTip: 'যদি কর্মদক্ষতা ৫০% হয়, তবে T₂ = T₁/2। কেলভিনে নিতে সেলসিয়াসের সাথে ২৭৩ যোগ করতে ভুলবে না।',
    importantFor: ['DU', 'RU', 'JU', 'GST'],
  },

  // --- রসায়ন ---
  {
    id: 'chem_01',
    subject: 'chemistry',
    paper: '1st',
    chapterName: 'গুণগত রসায়ন',
    title: 'রিডবার্গ সমীকরণ ও বর্ণালী সিরিজ',
    formula: '1 / λ = R_H · Z² · (1/n₁² - 1/n₂²)',
    explanation:
      'লাইম্যান (n₁=1, UV), বামার (n₁=2, দৃশ্যমান), প্যাসচেন (n₁=3, IR), ব্র্যাকেট (n₁=4, IR), ফুন্ড (n₁=5, দূর IR)।',
    hackTip: 'বামার সিরিজই কেবল মানুষের চোখে দৃশ্যমান আলো নির্গমন করে। R_H ≈ 1.097 × 10⁷ m⁻¹।',
    importantFor: ['DU', 'RU', 'GST', 'Agri'],
  },
  {
    id: 'chem_02',
    subject: 'chemistry',
    paper: '1st',
    chapterName: 'রাসায়নিক পরিবর্তন',
    title: 'pH ও বাফার দ্রবণ (হ্যান্ডারসন সমীকরণ)',
    formula: 'pH = -log[H⁺]  |  pH = pKa + log([লবণ] / [অম্ল])',
    explanation:
      'যদি [লবণ] = [অম্ল] হয়, তবে pH = pKa (সর্বোচ্চ বাফার ক্ষমতা)। মানুষের রক্তের pH = 7.35 - 7.45 (বাইকার্বোনেট বাফার)।',
    hackTip: 'লগ মান মুখস্থ রাখো: log 2 ≈ 0.3, log 3 ≈ 0.48, log 5 ≈ 0.7, log 7 ≈ 0.85। ক্যালকুলেটর ছাড়া ১ সেকেন্ডে pH মিলবে।',
    importantFor: ['DU', 'RU', 'JU', 'CU', 'GST'],
  },
  {
    id: 'chem_03',
    subject: 'chemistry',
    paper: '2nd',
    chapterName: 'পরিমাণগত রসায়ন',
    title: 'মোলারিটি, শতকরা ও টাইট্রেশন ট্রিক',
    formula: 'S = (1000 · w) / (M · V_ml) = (10 · x · d) / M  |  V₁S₁e₁ = V₂S₂e₂',
    explanation:
      'শতকরা ঘনত্ব x% এবং আপেক্ষিক গুরুত্ব d থাকলে সরাসরি S = 10xd/M। তুল্য সংখ্যা (e): HCl-এর 1, H₂SO₄-এর 2, KMnO₄-এর অম্লীয় মাধ্যমে 5।',
    hackTip: 'অ্যাসিড-ক্ষার প্রশমনে সরাসরি তুল্য সংখ্যা দিয়ে গুণ করবে, কোনো সমীকরণ ব্যালান্সের সময় নষ্ট হবে না।',
    importantFor: ['DU', 'RU', 'GST', 'BUTEX'],
  },
  {
    id: 'chem_04',
    subject: 'chemistry',
    paper: '2nd',
    chapterName: 'জৈব রসায়ন',
    title: 'মারকনিকভ ও সায়জেফ নীতি',
    formula: 'অপ্রতিসম অ্যালকিন + H-X ➔ "তেলে মাথায় তেল দেওয়া"',
    explanation:
      'মারকনিকভ নীতি: যে কার্বনে হাইড্রোজেন বেশি, বিকারকের হাইড্রোজেন পরমাণু সেখানেই যুক্ত হবে। সায়জেফ নীতি: অপসারণ বিক্রিয়ায় কম হাইড্রোজেনযুক্ত কার্বন থেকে হাইড্রোজেন অপসারিত হবে (বেশি প্রতিস্থাপিত অ্যালকিন উৎপন্ন হবে)।',
    hackTip: 'হ্যালোফর্ম টেস্ট কেবল CH₃-CH(OH)- এবং CH₃-C(=O)- মূলকযুক্ত যৌগ দেয়।',
    importantFor: ['DU', 'JU', 'RU', 'Agri'],
  },

  // --- উচ্চতর গণিত ---
  {
    id: 'math_01',
    subject: 'math',
    paper: '1st',
    chapterName: 'সরলরেখা',
    title: 'সমান্তরাল ও লম্ব রেখার দূরত্ব এবং ছেদবিন্দু',
    formula: 'd_parallel = |c₁ - c₂| / √(a² + b²)  |  d_point = |ax₁ + by₁ + c| / √(a² + b²)',
    explanation:
      'দুটি সমান্তরাল রেখা ax + by + c₁ = 0 এবং ax + by + c₂ = 0 এর মধ্যবর্তী লম্ব দূরত্ব। সমদ্বিখণ্ডকের সমীকরণ ও প্রতিবিম্ব নির্ণয়ে এটি কাজে লাগে।',
    hackTip: 'যদি রেখা দুটিতে x ও y-এর সহগ ভিন্ন থাকে, আগে সহগ সমান করে তারপর সূত্র প্রয়োগ করো।',
    importantFor: ['DU', 'RU', 'CU', 'GST', 'JU'],
  },
  {
    id: 'math_02',
    subject: 'math',
    paper: '1st',
    chapterName: 'বৃত্ত',
    title: 'বৃত্তের কেন্দ্র, ব্যাসার্ধ ও স্পর্শকের শর্ত',
    formula: 'x² + y² + 2gx + 2fy + c = 0 ➔ কেন্দ্র (-g, -f), ব্যাসার্ধ r = √(g² + f² - c)',
    explanation:
      'y = mx + c সরলরেখাটি x² + y² = a² বৃত্তের স্পর্শক হওয়ার শর্ত: c = ± a√(1 + m²)। বৃত্তের কেন্দ্র থেকে রেখার লম্ব দূরত্ব ব্যাসার্ধের সমান হতে হবে।',
    hackTip: 'স্পর্শকের দৈর্ঘ্য = √(x₁² + y₁² + 2gx₁ + 2fy₁ + c)। বিন্দুটি বৃত্ত সমীকরণে বসিয়ে বর্গমূল নাও।',
    importantFor: ['DU', 'RU', 'GST', 'JU'],
  },
  {
    id: 'math_03',
    subject: 'math',
    paper: '1st',
    chapterName: 'অন্তরীকরণ',
    title: 'লা হসপিটাল রুল ও ক্যালকুলাস শর্টকাট',
    formula: 'lim_{x→a} f(x)/g(x) = lim_{x→a} f\'(x)/g\'(x)  (যদি 0/0 বা ∞/∞ হয়)',
    explanation:
      'অনির্দিষ্ট আকারে লব ও হরকে আলাদা আলাদা x-এর সাপেক্ষে অন্তরীকরণ করতে হবে যতক্ষণ না অনির্দিষ্ট আকার দূর হয়।',
    hackTip: 'lim_{x→0} (sin ax / bx) = a/b এবং lim_{x→0} (tan ax / bx) = a/b।',
    importantFor: ['DU', 'RU', 'CU', 'GST', 'JU'],
  },
  {
    id: 'math_04',
    subject: 'math',
    paper: '1st',
    chapterName: 'যোগজীকরণ',
    title: 'স্ট্যান্ডার্ড ইনটিগ্রাল শর্টকাট',
    formula: '∫ [f\'(x) / f(x)] dx = ln |f(x)| + c  |  ∫ e^x [f(x) + f\'(x)] dx = e^x f(x) + c',
    explanation:
      'যদি হরের অন্তরজ হুবহু লবে থাকে, তবে সরাসরি ln|হর|। e^x এর পাশে ফাংশন ও তার অন্তরজ যোগাকারে থাকলে e^x · ফাংশন।',
    hackTip: '∫₀^(π/2) sinⁿx dx = ওয়ালিস ফর্মুলা দিয়ে ২ সেকেন্ডে নির্ণয় করা যায়।',
    importantFor: ['DU', 'RU', 'GST', 'JU', 'BUTEX'],
  },
  {
    id: 'math_05',
    subject: 'math',
    paper: '2nd',
    chapterName: 'জটিল সংখ্যা',
    title: 'এককের কাল্পনিক ঘনমূল ও মডুলাস-আর্গুমেন্ট',
    formula: '1 + ω + ω² = 0  |  ω³ = 1  |  z = x + iy ➔ |z| = √(x² + y²), θ = tan⁻¹|y/x|',
    explanation:
      'চতুর্ভাগ অনুসারে আর্গুমেন্ট: ১ম চতুর্ভাগে θ, ২য় তে (π - θ), ৩য় তে (-π + θ) বা (π + θ), ৪র্থ চতুর্ভাগে (-θ)।',
    hackTip: 'ω-এর ঘাতকে ৩ দিয়ে ভাগ করে ভাগশেষ নাও: ω¹⁰⁰ = ω^(3×33+1) = ω¹ = ω।',
    importantFor: ['DU', 'RU', 'GST', 'CU'],
  },
];
