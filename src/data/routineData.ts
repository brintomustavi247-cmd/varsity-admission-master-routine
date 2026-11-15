import type {
  RankInfo,
  RoutineDay,
  RoutineTaskField,
  StudyTrack,
  SyllabusStepField,
} from '../types/study';

export const ROUTINE_DATA: RoutineDay[] = [
  {d:1, iso:"2026-11-16", date:"১৬ নভেম্বর", main:"ত্রিকোণমিতিক অনুপাত + ভৌতজগৎ ও পরিমাপ (দুই অধ্যায়)", eng:"Parts of Speech & Noun", rev:"আজকের অধ্যায়ের সূত্র একবার লিখে ফেলা", type:"normal"},
  {d:2, iso:"2026-11-17", date:"১৭ নভেম্বর", main:"সংযুক্ত কোণের ত্রিকোণমিতি + ল্যাবরেটরির নিরাপদ ব্যবহার (দুই অধ্যায়)", eng:"Pronoun & Determiners", rev:"আগের দিন: ত্রিকোণমিতিক অনুপাত + ভৌতজগৎ ও পরিমাপ", type:"normal"},
  {d:3, iso:"2026-11-18", date:"১৮ নভেম্বর", main:"গুণগত রসায়ন-১ (পরমাণু মডেল, কোয়ান্টাম সংখ্যা)", eng:"Articles & Tag Questions", rev:"আগের দিন: সংযুক্ত কোণ + ল্যাবরেটরি", type:"normal"},
  {d:4, iso:"2026-11-19", date:"১৯ নভেম্বর", main:"গুণগত রসায়ন-২ (দ্রাব্যতা ও আয়ন শনাক্তকরণ)", eng:"Right Form of Verbs (Rule 1–15)", rev:"আগের দিন: গুণগত রসায়ন-১", type:"normal"},
  {d:5, iso:"2026-11-20", date:"২০ নভেম্বর", main:"সাপ্তাহিক টেস্ট + কাভার-আপ দিন (২ ঘণ্টা টেস্ট → ২ ঘণ্টা ভুল বিশ্লেষণ → ২ ঘণ্টা ব্যাকলগ)", eng:"সম্পূর্ণ সপ্তাহের রিভিশন", rev:"ভুলের খাতা আপডেট ও বিশ্রাম", type:"test"},
  {d:6, iso:"2026-11-21", date:"২১ নভেম্বর", main:"ফাংশন ও ফাংশনের লেখচিত্র", eng:"Right Form of Verbs (Rule 16–30)", rev:"আগের দিন: গুণগত রসায়ন-২", type:"normal"},
  {d:7, iso:"2026-11-22", date:"২২ নভেম্বর", main:"ভেক্টর (পদার্থবিজ্ঞান)", eng:"Subject-Verb Agreement", rev:"আগের দিন: ফাংশন ও লেখচিত্র", type:"normal"},
  {d:8, iso:"2026-11-23", date:"২৩ নভেম্বর", main:"অন্তরীকরণ-১ (সীমা ও মূল নিয়ম)", eng:"Tense & Sequence of Tense", rev:"আগের দিন: ভেক্টর | ১ সপ্তাহ আগে: ত্রিকোণমিতি + ভৌতজগৎ", type:"normal"},
  {d:9, iso:"2026-11-24", date:"২৪ নভেম্বর", main:"অন্তরীকরণ-২ (প্রয়োগ: স্পর্শক, ম্যাক্সিমা-মিনিমা)", eng:"Appropriate Preposition (A–D)", rev:"আগের দিন: অন্তরীকরণ-১ | ১ সপ্তাহ আগে: সংযুক্ত কোণ + ল্যাবরেটরি", type:"normal"},
  {d:10, iso:"2026-11-25", date:"২৫ নভেম্বর", main:"গতিবিদ্যা", eng:"Appropriate Preposition (E–M)", rev:"আগের দিন: অন্তরীকরণ-২ | ১ সপ্তাহ আগে: গুণগত রসায়ন-১", type:"normal"},
  {d:11, iso:"2026-11-26", date:"২৬ নভেম্বর", main:"মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন", eng:"Appropriate Preposition (N–Z)", rev:"আগের দিন: গতিবিদ্যা | ১ সপ্তাহ আগে: গুণগত রসায়ন-২", type:"normal"},
  {d:12, iso:"2026-11-27", date:"২৭ নভেম্বর", main:"সাপ্তাহিক টেস্ট + কাভার-আপ দিন", eng:"সম্পূর্ণ সপ্তাহের রিভিশন", rev:"ভুলের খাতা আপডেট ও বিশ্রাম", type:"test"},

  {d:13, iso:"2026-11-28", date:"২৮ নভেম্বর", main:"নিউটনীয় বলবিদ্যা", eng:"Conditional Sentences", rev:"আগের দিন: পর্যায়বৃত্ত ধর্ম | ১ সপ্তাহ আগে: ফাংশন ও লেখচিত্র", type:"normal"},
  {d:14, iso:"2026-11-29", date:"২৯ নভেম্বর", main:"যোগজীকরণ-১ (মূল নিয়ম ও কৌশল)", eng:"Subjunctive & Causative Verbs", rev:"আগের দিন: নিউটনীয় বলবিদ্যা | ১ সপ্তাহ আগে: ভেক্টর", type:"normal"},
  {d:15, iso:"2026-11-30", date:"৩০ নভেম্বর", main:"যোগজীকরণ-২ (সমাকলন ও ক্ষেত্রফল)", eng:"Voice Change (All Rules)", rev:"আগের দিন: যোগজীকরণ-১ | ১ সপ্তাহ আগে: অন্তরীকরণ-১", type:"normal"},
  {d:16, iso:"2026-12-01", date:"১ ডিসেম্বর", main:"পরিমাণগত রসায়ন (মোল, ঘনমাত্রা)", eng:"Narration (Direct & Indirect)", rev:"আগের দিন: যোগজীকরণ-২ | ১ সপ্তাহ আগে: অন্তরীকরণ-২", type:"normal"},
  {d:17, iso:"2026-12-02", date:"২ ডিসেম্বর", main:"কাজ, শক্তি ও ক্ষমতা", eng:"Degree of Comparison", rev:"আগের দিন: পরিমাণগত রসায়ন | ১ সপ্তাহ আগে: গতিবিদ্যা", type:"normal"},
  {d:18, iso:"2026-12-03", date:"৩ ডিসেম্বর", main:"রাসায়নিক পরিবর্তন (Kp, Kc, pH, তাপ)", eng:"Clause & Phrase Identification", rev:"আগের দিন: কাজ, শক্তি | ১ সপ্তাহ আগে: পর্যায়বৃত্ত ধর্ম", type:"normal"},
  {d:19, iso:"2026-12-04", date:"৪ ডিসেম্বর", main:"সাপ্তাহিক টেস্ট + কাভার-আপ দিন", eng:"সম্পূর্ণ সপ্তাহের রিভিশন", rev:"ভুলের খাতা আপডেট ও বিশ্রাম", type:"test"},
  {d:20, iso:"2026-12-05", date:"৫ ডিসেম্বর", main:"মহাকর্ষ ও অভিকর্ষ + ম্যাট্রিক্স ও নির্ণায়ক", eng:"Transformation of Sentences (1)", rev:"আগের দিন: রাসায়নিক পরিবর্তন | ১ সপ্তাহ আগে: নিউটনীয় বলবিদ্যা", type:"normal"},
  {d:21, iso:"2026-12-06", date:"৬ ডিসেম্বর", main:"তড়িৎ রসায়ন", eng:"Transformation of Sentences (2)", rev:"আগের দিন: মহাকর্ষ + ম্যাট্রিক্স | ১ সপ্তাহ আগে: যোগজীকরণ-১", type:"normal"},
  {d:22, iso:"2026-12-07", date:"৭ ডিসেম্বর", main:"পদার্থের গাঠনিক ধর্ম + ভেক্টর (গণিত)", eng:"Dangling Modifier & Inversion", rev:"আগের দিন: তড়িৎ রসায়ন | ১ সপ্তাহ আগে: যোগজীকরণ-২", type:"normal"},
  {d:23, iso:"2026-12-08", date:"৮ ডিসেম্বর", main:"জৈব রসায়ন-১ (নামকরণ, সমানুতা, অ্যালকেন/অ্যালকিন/অ্যালকাইন)", eng:"Sentence Correction & Parallelism", rev:"আগের দিন: গাঠনিক ধর্ম + ভেক্টর | ১ সপ্তাহ আগে: পরিমাণগত রসায়ন", type:"normal"},
  {d:24, iso:"2026-12-09", date:"৯ ডিসেম্বর", main:"জৈব রসায়ন-২ (অ্যারোমেটিক ও হ্যালাইড)", eng:"Spelling Correction", rev:"আগের দিন: জৈব রসায়ন-১ | ১ সপ্তাহ আগে: কাজ, শক্তি", type:"normal"},
  {d:25, iso:"2026-12-10", date:"১০ ডিসেম্বর", main:"জৈব রসায়ন-৩ (অ্যালকোহল, অ্যালডিহাইড, এসিড)", eng:"Phrases & Idioms (Part 1)", rev:"আগের দিন: জৈব রসায়ন-২ | ১ সপ্তাহ আগে: রাসায়নিক পরিবর্তন", type:"normal"},
  {d:26, iso:"2026-12-11", date:"১১ ডিসেম্বর", main:"সাপ্তাহিক টেস্ট + কাভার-আপ দিন", eng:"সম্পূর্ণ সপ্তাহের রিভিশন", rev:"ভুলের খাতা আপডেট ও বিশ্রাম", type:"test"},

  {d:27, iso:"2026-12-12", date:"১২ ডিসেম্বর", main:"পর্যাবৃত্ত গতি + সরলরেখা", eng:"Phrases & Idioms (Part 2)", rev:"আগের দিন: জৈব রসায়ন-৩ | ১ সপ্তাহ আগে: মহাকর্ষ + ম্যাট্রিক্স", type:"normal"},
  {d:28, iso:"2026-12-13", date:"১৩ ডিসেম্বর", main:"তরঙ্গ + বৃত্ত", eng:"Phrasal Verbs (1)", rev:"আগের দিন: পর্যাবৃত্ত গতি + সরলরেখা | ১ সপ্তাহ আগে: তড়িৎ রসায়ন", type:"normal"},
  {d:29, iso:"2026-12-14", date:"১৪ ডিসেম্বর", main:"আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব + বিন্যাস ও সমাবেশ", eng:"Phrasal Verbs (2)", rev:"আগের দিন: তরঙ্গ + বৃত্ত | ১ সপ্তাহ আগে: গাঠনিক ধর্ম + ভেক্টর", type:"normal"},
  {d:30, iso:"2026-12-15", date:"১৫ ডিসেম্বর", main:"তাপগতিবিদ্যা + পরিবেশ রসায়ন", eng:"Synonyms & Antonyms (A–F)", rev:"আগের দিন: আদর্শ গ্যাস + বিন্যাস | ১ সপ্তাহ আগে: জৈব রসায়ন-১", type:"normal"},
  {d:31, iso:"2026-12-16", date:"১৬ ডিসেম্বর", main:"বাস্তব সংখ্যা ও অসমতা + রৈখিক প্রোগ্রামিং", eng:"Synonyms & Antonyms (G–M)", rev:"আগের দিন: তাপগতিবিদ্যা + পরিবেশ | ১ সপ্তাহ আগে: জৈব রসায়ন-২", type:"normal"},
  {d:32, iso:"2026-12-17", date:"১৭ ডিসেম্বর", main:"স্থির তড়িৎ", eng:"Synonyms & Antonyms (N–S)", rev:"আগের দিন: বাস্তব সংখ্যা + রৈখিক | ১ সপ্তাহ আগে: জৈব রসায়ন-৩", type:"normal"},
  {d:33, iso:"2026-12-18", date:"১৮ ডিসেম্বর", main:"সাপ্তাহিক টেস্ট + কাভার-আপ দিন", eng:"সম্পূর্ণ সপ্তাহের রিভিশন", rev:"ভুলের খাতা আপডেট ও বিশ্রাম", type:"test"},
  {d:34, iso:"2026-12-19", date:"১৯ ডিসেম্বর", main:"জটিল সংখ্যা + অর্থনৈতিক রসায়ন", eng:"Synonyms & Antonyms (T–Z)", rev:"আগের দিন: স্থির তড়িৎ | ১ সপ্তাহ আগে: পর্যাবৃত্ত গতি + সরলরেখা", type:"normal"},
  {d:35, iso:"2026-12-20", date:"২০ ডিসেম্বর", main:"চল তড়িৎ", eng:"One Word Substitution", rev:"আগের দিন: জটিল সংখ্যা + অর্থনৈতিক | ১ সপ্তাহ আগে: তরঙ্গ + বৃত্ত", type:"normal"},
  {d:36, iso:"2026-12-21", date:"২১ ডিসেম্বর", main:"বহুপদী ও বহুপদী সমীকরণ + কো-অর্ডিনেশন রসায়ন", eng:"Confusing Words", rev:"আগের দিন: চল তড়িৎ | ১ সপ্তাহ আগে: আদর্শ গ্যাস + বিন্যাস", type:"normal"},
  {d:37, iso:"2026-12-22", date:"২২ ডিসেম্বর", main:"তড়িৎ প্রবাহের চুম্বকীয় ক্রিয়া + দ্বিপদী বিস্তৃতি", eng:"Fill in the Blanks & Analogy", rev:"আগের দিন: বহুপদী + কো-অর্ডিনেশন | ১ সপ্তাহ আগে: তাপগতিবিদ্যা + পরিবেশ", type:"normal"},
  {d:38, iso:"2026-12-23", date:"২৩ ডিসেম্বর", main:"তড়িৎচুম্বক আবেশ ও পরিবর্তী প্রবাহ", eng:"Pinpoint Error & Analogy", rev:"আগের দিন: চুম্বকীয় ক্রিয়া + দ্বিপদী | ১ সপ্তাহ আগে: বাস্তব সংখ্যা + রৈখিক", type:"normal"},
  {d:39, iso:"2026-12-24", date:"২৪ ডিসেম্বর", main:"কনিক", eng:"Comprehension / Passage Practice", rev:"আগের দিন: তড়িৎচুম্বক আবেশ | ১ সপ্তাহ আগে: স্থির তড়িৎ", type:"normal"},
  {d:40, iso:"2026-12-25", date:"২৫ ডিসেম্বর", main:"সাপ্তাহিক টেস্ট + কাভার-আপ দিন", eng:"সম্পূর্ণ সপ্তাহের রিভিশন", rev:"ভুলের খাতা আপডেট ও বিশ্রাম", type:"test"},

  {d:41, iso:"2026-12-26", date:"২৬ ডিসেম্বর", main:"জ্যামিতিক আলোকবিজ্ঞান + বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ", eng:"RU Previous English Questions", rev:"আগের দিন: কনিক | ১ সপ্তাহ আগে: জটিল সংখ্যা + অর্থনৈতিক", type:"normal"},
  {d:42, iso:"2026-12-27", date:"২৭ ডিসেম্বর", main:"ভৌত আলোকবিজ্ঞান", eng:"CU Previous English Questions", rev:"আগের দিন: জ্যামিতিক আলো + বিপরীত ত্রিকোণ | ১ সপ্তাহ আগে: চল তড়িৎ", type:"normal"},
  {d:43, iso:"2026-12-28", date:"২৮ ডিসেম্বর", main:"স্থিতিবিদ্যা + আধুনিক পদার্থবিজ্ঞানের সূচনা", eng:"JU Previous English Questions", rev:"আগের দিন: ভৌত আলো | ১ সপ্তাহ আগে: বহুপদী + কো-অর্ডিনেশন", type:"normal"},
  {d:44, iso:"2026-12-29", date:"২৯ ডিসেম্বর", main:"সমতল বস্তুকণার গতি", eng:"DU Previous English Questions", rev:"আগের দিন: স্থিতিবিদ্যা + আধুনিক | ১ সপ্তাহ আগে: চুম্বকীয় ক্রিয়া + দ্বিপদী", type:"normal"},
  {d:45, iso:"2026-12-30", date:"৩০ ডিসেম্বর", main:"পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান + সেমিকন্ডাক্টর ও ইলেকট্রনিক্স", eng:"Grammar Revision", rev:"আগের দিন: সমতল গতি | ১ সপ্তাহ আগে: তড়িৎচুম্বক আবেশ", type:"normal"},
  {d:46, iso:"2026-12-31", date:"৩১ ডিসেম্বর", main:"জ্যোতির্বিজ্ঞান + বিস্তার পরিমাপ ও সম্ভাবনা", eng:"Grammar + Vocabulary Revision", rev:"আগের দিন: পরমাণু + সেমিকন্ডাক্টর | ১ সপ্তাহ আগে: কনিক", type:"normal"},
  {d:47, iso:"2027-01-01", date:"১ জানুয়ারি", main:"সাপ্তাহিক টেস্ট + কাভার-আপ দিন", eng:"সম্পূর্ণ সপ্তাহের রিভিশন", rev:"ভুলের খাতা আপডেট ও বিশ্রাম", type:"test"},
  {d:48, iso:"2027-01-02", date:"২ জানুয়ারি", main:"বাফার ও ফুল সিলেবাস চেক: বাঁকি/দুর্বল অধ্যায় শেষ করো। সব ঠিক থাকলে PCM মিক্সড ৩ ঘণ্টার টেস্ট দাও", eng:"Vocabulary + Preposition & Idioms Revision", rev:"দুর্বল অধ্যায় চূড়ান্ত করা", type:"buffer"},

  {d:49, iso:"2027-01-03", date:"৩ জানুয়ারি", main:"পদার্থ ১ম ও ২য় পত্র: ২১ অধ্যায়ের সূত্র রিভিশন + লাল দাগানো সলভ", eng:"পদার্থের সূত্রের খাতা + Grammar দ্রুত রিভিশন", rev:"লাল দাগানো ও ভুল প্রশ্ন সমাধান", type:"revision"},
  {d:50, iso:"2027-01-04", date:"৪ জানুয়ারি", main:"রসায়ন ১ম ও ২য় পত্র: ১০ অধ্যায়ের লাল দাগানো সলভ + জৈব রসায়নের বিক্রিয়া চার্ট", eng:"রসায়নের বৈশিষ্ট্য ও তথ্য-তালিকা + Vocabulary", rev:"জৈব রসায়নের বিক্রিয়া চার্ট", type:"revision"},
  {d:51, iso:"2027-01-05", date:"৫ জানুয়ারি", main:"গণিত ১ম ও ২য় পত্র: ২০ অধ্যায়ের লাল দাগানো সলভ + ত্রিকোণমিতি ও ক্যালকুলাস শর্টকাট", eng:"গণিতের সূত্রের খাতা + Preposition ও Idioms", rev:"ত্রিকোণমিতি ও ক্যালকুলাস শর্টকাট", type:"revision"},
  {d:52, iso:"2027-01-06", date:"৬ জানুয়ারি", main:"DU ও JU (A-Unit) বিগত বছরের পূর্ণাঙ্গ প্রশ্ন ঘড়ি ধরে সলভ + IQ প্র্যাকটিস", eng:"ভুল বিশ্লেষণ + ইংরেজি ও IQ শর্টকাট", rev:"সময় ব্যবস্থাপনা চর্চা", type:"solve"},
  {d:53, iso:"2027-01-07", date:"৭ জানুয়ারি", main:"RU, CU ও GST বিগত বছরের পূর্ণাঙ্গ প্রশ্ন ঘড়ি ধরে সলভ", eng:"ভুল বিশ্লেষণ + ইংরেজি রিভিশন", rev:"কনসেপ্ট ব্রাশ-আপ", type:"solve"},
  {d:54, iso:"2027-01-08", date:"৮ জানুয়ারি", main:"মডেল টেস্ট ১ — ভুলের ধরন চিনে নাও (অজানা, অসাবধানতা, সময়)", eng:"ভুলের খাতা + সূত্র + ইংরেজি", rev:"ভুলের ধরন চিহ্নিত করা", type:"model"},
  {d:55, iso:"2027-01-09", date:"৯ জানুয়ারি", main:"মডেল টেস্ট ২ — সকাল ১০টায় ঘড়ি ধরে পূর্ণাঙ্গ মডেল", eng:"ভুলের খাতা + সূত্র + ইংরেজি", rev:"দুর্বল অধ্যায়ের পুনরাবৃত্তি", type:"model"},
  {d:56, iso:"2027-01-10", date:"১০ জানুয়ারি", main:"মডেল টেস্ট ৩ — নেগেটিভ মার্কিং কমানোর কৌশল প্রয়োগ", eng:"ভুলের খাতা + সূত্র + ইংরেজি", rev:"নেগেটিভ মার্কিং কমানো", type:"model"},
  {d:57, iso:"2027-01-11", date:"১১ জানুয়ারি", main:"মডেল টেস্ট ৪ — প্রতিটি প্রশ্নের পুঙ্খানুপুঙ্খ ব্যাখ্যা বিশ্লেষণ", eng:"ভুলের খাতা + সূত্র + ইংরেজি", rev:"ব্যাখ্যা বিশ্লেষণ", type:"model"},
  {d:58, iso:"2027-01-12", date:"১২ জানুয়ারি", main:"মডেল টেস্ট ৫ — সময় ব্যবস্থাপনার দিকে বিশেষ নজর", eng:"ভুলের খাতা + সূত্র + ইংরেজি", rev:"সময় ব্যবস্থাপনা চূড়ান্ত করা", type:"model"},
  {d:59, iso:"2027-01-13", date:"১৩ জানুয়ারি", main:"মডেল টেস্ট ৬ — পূর্ণাঙ্গ রিয়েল-টাইম মডেল টেস্ট", eng:"ভুলের খাতা + সূত্র + ইংরেজি", rev:"রিয়েল-টাইম পরীক্ষার অনুভূতি", type:"model"},
  {d:60, iso:"2027-01-14", date:"১৪ জানুয়ারি", main:"মডেল টেস্ট ৭ — চূড়ান্ত কনফিডেন্স বুস্টিং", eng:"ভুলের খাতা + শেষ মুহূর্তের চোখ বুলানো", rev:"চূড়ান্ত কনফিডেন্স বুস্টিং", type:"model"},
  {d:61, iso:"2027-01-15", date:"১৫ জানুয়ারি", main:"চূড়ান্ত হালকা রিভিশন: শুধু সূত্রের খাতা ও ভুলের খাতা (৪–৫ ঘণ্টা)। নতুন কিছু পড়া বা টেস্ট নয়", eng:"প্রবেশপত্র, কলম ও সামগ্রী গুছিয়ে রাখো", rev:"দ্রুত ঘুমাও", type:"final"}
];

export const BIOLOGY_ROUTINE_BY_DAY: Record<number, string> = {
  1: "উদ্ভিদবিজ্ঞান অধ্যায় ১: কোষ ও এর গঠন (১ম অংশ — কোষ প্রাচীর, প্লাজমামেমব্রেন ও অঙ্গাণু)",
  2: "উদ্ভিদবিজ্ঞান অধ্যায় ১: কোষ ও এর গঠন (২য় অংশ — নিউক্লিয়াস, ডিএনএ ও আরএনএ)",
  3: "উদ্ভিদবিজ্ঞান অধ্যায় ২: কোষ বিভাজন (মাইটোসিস ও মিয়োসিস)",
  4: "উদ্ভিদবিজ্ঞান অধ্যায় ৩: কোষ রসায়ন (কার্বোহাইড্রেট, প্রোটিন, লিপিড ও এনজাইম)",
  5: "সম্পূর্ণ সপ্তাহের জীববিজ্ঞান রিভিশন ও প্রশ্ন সলভ",
  6: "উদ্ভিদবিজ্ঞান অধ্যায় ৪: অণুজীব (১ম অংশ — ভাইরাস ও ব্যাকটেরিয়া)",
  7: "উদ্ভিদবিজ্ঞান অধ্যায় ৪: অণুজীব (২য় অংশ — ম্যালেরিয়া পরজীবী)",
  8: "উদ্ভিদবিজ্ঞান অধ্যায় ৫: শৈবাল ও ছত্রাক",
  9: "উদ্ভিদবিজ্ঞান অধ্যায় ৬: ব্রায়োফাইটা ও টেরিডোফাইটা",
  10: "উদ্ভিদবিজ্ঞান অধ্যায় ৭: নগ্নবীজী ও আবৃতবীজী উদ্ভিদ (১ম অংশ — বৈশিষ্ট্য ও গোত্র)",
  11: "উদ্ভিদবিজ্ঞান অধ্যায় ৭: নগ্নবীজী ও আবৃতবীজী উদ্ভিদ (২য় অংশ — পুষ্প প্রতীক ও অমরাবিন্যাস)",
  12: "সম্পূর্ণ সপ্তাহের জীববিজ্ঞান রিভিশন ও প্রশ্ন সলভ",
  13: "উদ্ভিদবিজ্ঞান অধ্যায় ৮: টিস্যু ও টিস্যুতন্ত্র",
  14: "উদ্ভিদবিজ্ঞান অধ্যায় ৯: উদ্ভিদ শারীরতত্ত্ব (১ম অংশ — খনিজ শোষণ, প্রস্বেদন ও সালোকসংশ্লেষণ)",
  15: "উদ্ভিদবিজ্ঞান অধ্যায় ৯: উদ্ভিদ শারীরতত্ত্ব (২য় অংশ — শ্বসন ও উদ্ভিদ বৃদ্ধি)",
  16: "উদ্ভিদবিজ্ঞান অধ্যায় ১০: উদ্ভিদ প্রজনন",
  17: "উদ্ভিদবিজ্ঞান অধ্যায় ১১: জীবপ্রযুক্তি",
  18: "উদ্ভিদবিজ্ঞান অধ্যায় ১২: জীবের পরিবেশ, বিস্তার ও সংরক্ষণ",
  19: "উদ্ভিদবিজ্ঞান (১ম পত্র) সম্পূর্ণ রিভিশন ও প্রশ্ন সলভ",
  20: "প্রাণিবিজ্ঞান অধ্যায় ১: প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস (১ম অংশ — ভিত্তি ও অমেরুদণ্ডী পর্ব)",
  21: "প্রাণিবিজ্ঞান অধ্যায় ১: প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস (২য় অংশ — কর্ডাটা পর্ব ও শ্রেণি)",
  22: "প্রাণিবিজ্ঞান অধ্যায় ২: প্রাণীর পরিচিতি (হাইড্রা)",
  23: "প্রাণিবিজ্ঞান অধ্যায় ২: প্রাণীর পরিচিতি (ঘাসফড়িং)",
  24: "প্রাণিবিজ্ঞান অধ্যায় ২: প্রাণীর পরিচিতি (রুই মাছ)",
  25: "প্রাণিবিজ্ঞান অধ্যায় ৩: মানব শারীরতত্ত্ব — পরিপাক ও শোষণ (১ম অংশ — পরিপাক ও এনজাইম)",
  26: "সম্পূর্ণ সপ্তাহের জীববিজ্ঞান রিভিশন ও প্রশ্ন সলভ",
  27: "প্রাণিবিজ্ঞান অধ্যায় ৩: মানব শারীরতত্ত্ব — পরিপাক ও শোষণ (২য় অংশ — যকৃত, অগ্ন্যাশয় ও শোষণ)",
  28: "প্রাণিবিজ্ঞান অধ্যায় ৪: মানব শারীরতত্ত্ব — রক্ত ও সংবহন (১ম অংশ — রক্তকণিকা ও রক্ত তঞ্চন)",
  29: "প্রাণিবিজ্ঞান অধ্যায় ৪: মানব শারীরতত্ত্ব — রক্ত ও সংবহন (২য় অংশ — হৃৎপিণ্ড ও রক্ত সংবহন)",
  30: "প্রাণিবিজ্ঞান অধ্যায় ৫: মানব শারীরতত্ত্ব — শ্বাসক্রিয়া ও শ্বসন",
  31: "প্রাণিবিজ্ঞান অধ্যায় ৬: মানব শারীরতত্ত্ব — বর্জ্য ও নিষ্কাশন",
  32: "প্রাণিবিজ্ঞান অধ্যায় ৭: মানব শারীরতত্ত্ব — চলন ও অঙ্গচালনা",
  33: "সম্পূর্ণ সপ্তাহের জীববিজ্ঞান রিভিশন ও প্রশ্ন সলভ",
  34: "প্রাণিবিজ্ঞান অধ্যায় ৮: মানব শারীরতত্ত্ব — সমন্বয় ও নিয়ন্ত্রণ (১ম অংশ — মস্তিষ্ক ও স্নায়ুতন্ত্র)",
  35: "প্রাণিবিজ্ঞান অধ্যায় ৮: মানব শারীরতত্ত্ব — সমন্বয় ও নিয়ন্ত্রণ (২য় অংশ — চোখ, কান ও হরমোন)",
  36: "প্রাণিবিজ্ঞান অধ্যায় ৯: মানব জীবনের ধারাবাহিকতা (১ম অংশ — প্রজননতন্ত্র ও গ্যামেটোজেনেসিস)",
  37: "প্রাণিবিজ্ঞান অধ্যায় ৯: মানব জীবনের ধারাবাহিকতা (২য় অংশ — নিষেক ও ভ্রূণীয় পরিস্ফুটন)",
  38: "প্রাণিবিজ্ঞান অধ্যায় ১০: মানবদেহের প্রতিরক্ষা — অনাক্রম্যতা",
  39: "প্রাণিবিজ্ঞান অধ্যায় ১১: জিনতত্ত্ব ও বিবর্তন (১ম অংশ — মেন্ডেলের সূত্র ও ব্যতিক্রম)",
  40: "সম্পূর্ণ সপ্তাহের জীববিজ্ঞান রিভিশন ও প্রশ্ন সলভ",
  41: "প্রাণিবিজ্ঞান অধ্যায় ১১: জিনতত্ত্ব ও বিবর্তন (২য় অংশ — লিঙ্গ-সংযুক্ত বংশগতি, রক্তের গ্রুপ ও বিবর্তন)",
  42: "প্রাণিবিজ্ঞান অধ্যায় ১২: প্রাণীর আচরণ",
  43: "উদ্ভিদবিজ্ঞান রিভিশন — অধ্যায় ১ থেকে ৬ (গুরুত্বপূর্ণ ছক ও তথ্য)",
  44: "উদ্ভিদবিজ্ঞান রিভিশন — অধ্যায় ৭ থেকে ১২ (বৈজ্ঞানিক নাম ও শারীরতত্ত্ব)",
  45: "প্রাণিবিজ্ঞান রিভিশন — অধ্যায় ১ থেকে ৬ (শ্রেণিবিন্যাস ও শারীরতত্ত্ব)",
  46: "প্রাণিবিজ্ঞান রিভিশন — অধ্যায় ৭ থেকে ১২ (হরমোন, জিনতত্ত্ব ও অনাক্রম্যতা)",
  47: "সম্পূর্ণ সপ্তাহের জীববিজ্ঞান রিভিশন ও প্রশ্ন সলভ",
  48: "জীববিজ্ঞানের বাকি ও দুর্বল অধ্যায় + চিত্র রিভিশন",
  49: "উদ্ভিদবিজ্ঞান (১ম পত্র): ১২ অধ্যায়ের ছক, বৈজ্ঞানিক নাম ও লাল দাগানো সলভ",
  50: "প্রাণিবিজ্ঞান (২য় পত্র): ১২ অধ্যায়ের তথ্য-তালিকা, এনজাইম-হরমোন ও লাল দাগানো সলভ",
  51: "জীববিজ্ঞান ১ম ও ২য় পত্রের মিক্সড প্রশ্নব্যাংক (ঢাবি, রাবি, চবি, গুচ্ছ) দ্রুত সলভ",
  52: "ঢাবি ও জাবি বিগত বছরের জীববিজ্ঞান পূর্ণাঙ্গ প্রশ্ন সলভ",
  53: "রাবি, চবি ও গুচ্ছ বিগত বছরের জীববিজ্ঞান প্রশ্ন সলভ",
  54: "ভুলের খাতা + জীববিজ্ঞান ১ম ও ২য় পত্র কুইক রিভিশন",
  55: "ভুলের খাতা + জীববিজ্ঞান ১ম ও ২য় পত্র কুইক রিভিশন",
  56: "ভুলের খাতা + জীববিজ্ঞান ১ম ও ২য় পত্র কুইক রিভিশন",
  57: "ভুলের খাতা + জীববিজ্ঞান ১ম ও ২য় পত্র কুইক রিভিশন",
  58: "ভুলের খাতা + জীববিজ্ঞান ১ম ও ২য় পত্র কুইক রিভিশন",
  59: "ভুলের খাতা + জীববিজ্ঞান ১ম ও ২য় পত্র কুইক রিভিশন",
  60: "ভুলের খাতা + জীববিজ্ঞান শেষ মুহূর্তের চোখ বুলানো",
  61: "প্রবেশপত্র, কলম ও সামগ্রী গুছিয়ে রাখো",
};

export function getSecondaryTaskInfo(day: RoutineDay, track: StudyTrack) {
  if (track === 'biology') {
    return {
      title: 'জীববিজ্ঞান (রাত ১ ঘণ্টা)',
      desc: BIOLOGY_ROUTINE_BY_DAY[day.d] ?? day.eng,
    };
  }
  return {
    title: 'ইংরেজি (রাত ১ ঘণ্টা)',
    desc: day.eng,
  };
}

export const BASE_SYLLABUS_DATA: Record<string, string[]> = {
  "পদার্থবিজ্ঞান ১ম পত্র (১০)": [
    "ভৌতজগৎ ও পরিমাপ",
    "ভেক্টর",
    "গতিবিদ্যা",
    "নিউটনীয় বলবিদ্যা",
    "কাজ, শক্তি ও ক্ষমতা",
    "মহাকর্ষ ও অভিকর্ষ",
    "পদার্থের গাঠনিক ধর্ম",
    "পর্যাবৃত্ত গতি",
    "তরঙ্গ",
    "আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব"
  ],
  "পদার্থবিজ্ঞান ২য় পত্র (১১)": [
    "তাপগতিবিদ্যা",
    "স্থির তড়িৎ",
    "চল তড়িৎ",
    "তড়িৎ প্রবাহের চুম্বকীয় ক্রিয়া",
    "তড়িৎচুম্বক আবেশ ও পরিবর্তী প্রবাহ",
    "জ্যামিতিক আলোকবিজ্ঞান",
    "ভৌত আলোকবিজ্ঞান",
    "আধুনিক পদার্থবিজ্ঞানের সূচনা",
    "পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান",
    "সেমিকন্ডাক্টর ও ইলেকট্রনিক্স",
    "জ্যোতির্বিজ্ঞান"
  ],
  "রসায়ন ১ম পত্র (৫)": [
    "ল্যাবরেটরির নিরাপদ ব্যবহার",
    "গুণগত রসায়ন (২ দিন)",
    "মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন",
    "রাসায়নিক পরিবর্তন",
    "কো-অর্ডিনেশন রসায়ন"
  ],
  "রসায়ন ২য় পত্র (৫)": [
    "পরিবেশ রসায়ন",
    "জৈব রসায়ন (৩ দিন)",
    "পরিমাণগত রসায়ন",
    "তড়িৎ রসায়ন",
    "অর্থনৈতিক রসায়ন"
  ],
  "উচ্চতর গণিত ১ম পত্র (১০)": [
    "ম্যাট্রিক্স ও নির্ণায়ক",
    "ভেক্টর",
    "সরলরেখা",
    "বৃত্ত",
    "বিন্যাস ও সমাবেশ",
    "ত্রিকোণমিতিক অনুপাত",
    "সংযুক্ত কোণের ত্রিকোণমিতি",
    "ফাংশন ও ফাংশনের লেখচিত্র",
    "অন্তরীকরণ (২ দিন)",
    "যোগজীকরণ (২ দিন)"
  ],
  "উচ্চতর গণিত ২য় পত্র (১০)": [
    "বাস্তব সংখ্যা ও অসমতা",
    "রৈখিক প্রোগ্রামিং",
    "জটিল সংখ্যা",
    "বহুপদী ও বহুপদী সমীকরণ",
    "দ্বিপদী বিস্তৃতি",
    "কনিক",
    "বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ",
    "স্থিতিবিদ্যা",
    "সমতল বস্তুকণার গতি",
    "বিস্তার পরিমাপ ও সম্ভাবনা"
  ]
};

export const BIOLOGY_SYLLABUS_DATA: Record<string, string[]> = {
  "জীববিজ্ঞান ১ম পত্র — উদ্ভিদবিজ্ঞান (১২)": [
    "অধ্যায় ১: কোষ ও এর গঠন",
    "অধ্যায় ২: কোষ বিভাজন",
    "অধ্যায় ৩: কোষ রসায়ন",
    "অধ্যায় ৪: অণুজীব",
    "অধ্যায় ৫: শৈবাল ও ছত্রাক",
    "অধ্যায় ৬: ব্রায়োফাইটা ও টেরিডোফাইটা",
    "অধ্যায় ৭: নগ্নবীজী ও আবৃতবীজী উদ্ভিদ",
    "অধ্যায় ৮: টিস্যু ও টিস্যুতন্ত্র",
    "অধ্যায় ৯: উদ্ভিদ শারীরতত্ত্ব",
    "অধ্যায় ১০: উদ্ভিদ প্রজনন",
    "অধ্যায় ১১: জীবপ্রযুক্তি",
    "অধ্যায় ১২: জীবের পরিবেশ, বিস্তার ও সংরক্ষণ"
  ],
  "জীববিজ্ঞান ২য় পত্র — প্রাণিবিজ্ঞান (১২)": [
    "অধ্যায় ১: প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস",
    "অধ্যায় ২: প্রাণীর পরিচিতি (হাইড্রা, ঘাসফড়িং ও রুই মাছ)",
    "অধ্যায় ৩: মানব শারীরতত্ত্ব — পরিপাক ও শোষণ",
    "অধ্যায় ৪: মানব শারীরতত্ত্ব — রক্ত ও সংবহন",
    "অধ্যায় ৫: মানব শারীরতত্ত্ব — শ্বাসক্রিয়া ও শ্বসন",
    "অধ্যায় ৬: মানব শারীরতত্ত্ব — বর্জ্য ও নিষ্কাশন",
    "অধ্যায় ৭: মানব শারীরতত্ত্ব — চলন ও অঙ্গচালনা",
    "অধ্যায় ৮: মানব শারীরতত্ত্ব — সমন্বয় ও নিয়ন্ত্রণ",
    "অধ্যায় ৯: মানব জীবনের ধারাবাহিকতা",
    "অধ্যায় ১০: মানবদেহের প্রতিরক্ষা — অনাক্রম্যতা",
    "অধ্যায় ১১: জিনতত্ত্ব ও বিবর্তন",
    "অধ্যায় ১২: প্রাণীর আচরণ"
  ]
};

export const SYLLABUS_DATA = BASE_SYLLABUS_DATA;

export function getSyllabusForTrack(
  track: StudyTrack
): Record<string, string[]> {
  if (track === 'biology') {
    return { ...BASE_SYLLABUS_DATA, ...BIOLOGY_SYLLABUS_DATA };
  }
  return BASE_SYLLABUS_DATA;
}

export function getChapterCountForTrack(track: StudyTrack): number {
  return track === 'biology' ? 75 : 51;
}

export const TOTAL_CHAPTERS = 75;
export const BASE_CHAPTERS_COUNT = 51;

export const routineTaskKey = (dayId: number, field: RoutineTaskField) =>
  `d${dayId}_${field}`;

export const syllabusStepKey = (chapIndex: number, step: SyllabusStepField) =>
  `chap_${chapIndex}_${step}`;

export function getWeekday(iso: string): string {
  const bn = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];
  const d = new Date(iso + "T00:00:00");
  return bn[d.getDay()] ?? "";
}

export interface PhaseInfo {
  id: string;
  title: string;
  startDay: number;
  endDay: number;
  gradientCls: string;
}

export function getPhaseInfo(d: number): PhaseInfo {
  if (d <= 12) {
    return {
      id: "p1",
      title: "ধাপ ১ · সপ্তাহ ১–২ (১৬–২৭ নভেম্বর)",
      startDay: 1,
      endDay: 12,
      gradientCls: "from-[#3B4CCA] via-[#2B59D9] to-[#0EA5E9]",
    };
  }
  if (d <= 26) {
    return {
      id: "p2",
      title: "ধাপ ১ · সপ্তাহ ৩–৪ (২৮ নভেম্বর–১১ ডিসেম্বর)",
      startDay: 13,
      endDay: 26,
      gradientCls: "from-[#6D28D9] via-[#4F46E5] to-[#2563EB]",
    };
  }
  if (d <= 40) {
    return {
      id: "p3",
      title: "ধাপ ১ · সপ্তাহ ৫–৬ (১২–২৫ ডিসেম্বর)",
      startDay: 27,
      endDay: 40,
      gradientCls: "from-[#0284C7] via-[#0891B2] to-[#10B981]",
    };
  }
  if (d <= 48) {
    return {
      id: "p4",
      title: "ধাপ ১ · সপ্তাহ ৭–৮ (২৬ ডিসেম্বর–২ জানুয়ারি)",
      startDay: 41,
      endDay: 48,
      gradientCls: "from-[#D97706] via-[#EA580C] to-[#E11D48]",
    };
  }
  return {
    id: "p5",
    title: "ধাপ ২ · ফাইনাল রিভিশন ও মডেল টেস্ট (৩–১৫ জানুয়ারি)",
    startDay: 49,
    endDay: 61,
    gradientCls: "from-[#059669] via-[#0D9488] to-[#2563EB]",
  };
}

export function getPhase(d: number): string {
  return getPhaseInfo(d).title;
}

export function getTypeMeta(type: RoutineDay['type']) {
  const map: Record<
    RoutineDay['type'],
    {
      label: string;
      textCls: string;
      cardBorderCls: string;
      headerBgCls: string;
      dayColorCls: string;
      barGradientCls: string;
    }
  > = {
    normal: {
      label: "রেগুলার",
      textCls: "text-indigo-600 dark:text-indigo-400",
      cardBorderCls: "border-indigo-200/90 dark:border-indigo-900/60",
      headerBgCls:
        "bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-sky-50/40 dark:from-indigo-950/40 dark:via-blue-950/25 dark:to-slate-900",
      dayColorCls: "text-[#4F46E5] dark:text-[#818CF8]",
      barGradientCls: "from-[#4F46E5] via-blue-500 to-sky-400",
    },
    test: {
      label: "সাপ্তাহিক টেস্ট",
      textCls: "text-amber-700 dark:text-amber-400",
      cardBorderCls: "border-amber-200 dark:border-amber-900/60",
      headerBgCls:
        "bg-gradient-to-r from-amber-50/95 via-orange-50/65 to-yellow-50/40 dark:from-amber-950/40 dark:via-orange-950/25 dark:to-slate-900",
      dayColorCls: "text-amber-600 dark:text-amber-400",
      barGradientCls: "from-amber-500 via-orange-500 to-rose-500",
    },
    buffer: {
      label: "বাফার",
      textCls: "text-sky-700 dark:text-sky-400",
      cardBorderCls: "border-sky-200 dark:border-sky-900/60",
      headerBgCls:
        "bg-gradient-to-r from-sky-50/95 via-cyan-50/65 to-blue-50/40 dark:from-sky-950/40 dark:via-cyan-950/25 dark:to-slate-900",
      dayColorCls: "text-sky-600 dark:text-sky-400",
      barGradientCls: "from-sky-500 via-cyan-500 to-blue-600",
    },
    revision: {
      label: "ফাইনাল রিভিশন",
      textCls: "text-emerald-700 dark:text-emerald-400",
      cardBorderCls: "border-emerald-200 dark:border-emerald-900/60",
      headerBgCls:
        "bg-gradient-to-r from-emerald-50/95 via-teal-50/65 to-cyan-50/40 dark:from-emerald-950/40 dark:via-teal-950/25 dark:to-slate-900",
      dayColorCls: "text-emerald-600 dark:text-emerald-400",
      barGradientCls: "from-emerald-500 via-teal-500 to-sky-500",
    },
    solve: {
      label: "ইউনিভার্সিটি সলভ",
      textCls: "text-cyan-700 dark:text-cyan-400",
      cardBorderCls: "border-cyan-200 dark:border-cyan-900/60",
      headerBgCls:
        "bg-gradient-to-r from-cyan-50/95 via-sky-50/65 to-indigo-50/40 dark:from-cyan-950/40 dark:via-sky-950/25 dark:to-slate-900",
      dayColorCls: "text-cyan-600 dark:text-cyan-400",
      barGradientCls: "from-cyan-500 via-sky-500 to-indigo-600",
    },
    model: {
      label: "মডেল টেস্ট",
      textCls: "text-violet-700 dark:text-violet-400",
      cardBorderCls: "border-violet-200 dark:border-violet-900/60",
      headerBgCls:
        "bg-gradient-to-r from-violet-50/95 via-purple-50/65 to-fuchsia-50/40 dark:from-violet-950/40 dark:via-purple-950/25 dark:to-slate-900",
      dayColorCls: "text-violet-600 dark:text-violet-400",
      barGradientCls: "from-violet-600 via-purple-500 to-pink-500",
    },
    final: {
      label: "ফাইনাল ডে",
      textCls: "text-rose-700 dark:text-rose-400",
      cardBorderCls: "border-rose-200 dark:border-rose-900/60",
      headerBgCls:
        "bg-gradient-to-r from-rose-50/95 via-pink-50/65 to-amber-50/40 dark:from-rose-950/40 dark:via-pink-950/25 dark:to-slate-900",
      dayColorCls: "text-rose-600 dark:text-rose-400",
      barGradientCls: "from-rose-500 via-pink-500 to-amber-500",
    },
  };
  return map[type] || map.normal;
}

export function isDayCompleted(
  routineMap: Record<string, boolean>,
  dayId: number
): boolean {
  return Boolean(
    routineMap[routineTaskKey(dayId, 'main')] &&
      routineMap[routineTaskKey(dayId, 'eng')] &&
      routineMap[routineTaskKey(dayId, 'rev')]
  );
}

export function computeMetrics(
  routineMap: Record<string, boolean>,
  syllabusMap: Record<string, boolean>,
  track: StudyTrack = 'english'
) {
  let daysDone = 0;
  let routineTasksDone = 0;

  for (const day of ROUTINE_DATA) {
    const m = Boolean(routineMap[routineTaskKey(day.d, 'main')]);
    const e = Boolean(routineMap[routineTaskKey(day.d, 'eng')]);
    const r = Boolean(routineMap[routineTaskKey(day.d, 'rev')]);
    if (m) routineTasksDone++;
    if (e) routineTasksDone++;
    if (r) routineTasksDone++;
    if (m && e && r) daysDone++;
  }

  const activeChapters = getChapterCountForTrack(track);
  let chapsDone = 0;
  let syllabusStepsDone = 0;
  for (let i = 0; i < activeChapters; i++) {
    const t = Boolean(syllabusMap[syllabusStepKey(i, 't')]);
    const b = Boolean(syllabusMap[syllabusStepKey(i, 'b')]);
    const r1 = Boolean(syllabusMap[syllabusStepKey(i, 'r1')]);
    const r2 = Boolean(syllabusMap[syllabusStepKey(i, 'r2')]);
    if (t) syllabusStepsDone++;
    if (b) syllabusStepsDone++;
    if (r1) syllabusStepsDone++;
    if (r2) syllabusStepsDone++;
    if (t && b && r1 && r2) chapsDone++;
  }

  let currentRun = 0;
  let maxStreak = 0;
  for (const day of ROUTINE_DATA) {
    if (isDayCompleted(routineMap, day.d)) {
      currentRun++;
      if (currentRun > maxStreak) maxStreak = currentRun;
    } else {
      currentRun = 0;
    }
  }

  const xp =
    routineTasksDone * 20 +
    daysDone * 50 +
    syllabusStepsDone * 15 +
    chapsDone * 25;

  const totalUnits = ROUTINE_DATA.length * 3 + activeChapters * 4;
  const doneUnits = routineTasksDone + syllabusStepsDone;
  const overallPct = Math.round((doneUnits / totalUnits) * 100);

  return {
    daysDone,
    chapsDone,
    totalChapters: activeChapters,
    routineTasksDone,
    syllabusStepsDone,
    xp,
    streak: maxStreak,
    overallPct,
  };
}

const RANKS = [
  { level: 1, title: "Rookie Challenger", minXp: 0 },
  { level: 2, title: "Formula Seeker", minXp: 300 },
  { level: 3, title: "Concept Builder", minXp: 800 },
  { level: 4, title: "Bank Solver", minXp: 1600 },
  { level: 5, title: "Revision Master", minXp: 2800 },
  { level: 6, title: "Model Champion", minXp: 4500 },
  { level: 7, title: "Varsity Ranker", minXp: 6800 },
  { level: 8, title: "Admission Legend", minXp: 9500 },
];

export function getRankInfo(xp: number): RankInfo {
  let current = RANKS[0];
  let next = RANKS[1];
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? {
        level: RANKS[i].level + 1,
        title: "Apex Grandmaster",
        minXp: RANKS[i].minXp + 3000,
      };
    }
  }
  const span = Math.max(1, next.minXp - current.minXp);
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round(((xp - current.minXp) / span) * 100))
  );
  return {
    level: current.level,
    title: current.title,
    minXp: current.minXp,
    nextXp: next.minXp,
    progressPct,
  };
}
