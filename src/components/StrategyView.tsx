export function StrategyView() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">
          ⏱️ দৈনিক সময়বণ্টন (প্রায় ৮ ঘণ্টা)
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300">
          <li>
            <strong className="text-slate-900 dark:text-slate-100">
              সকাল/দুপুর (৩ ঘণ্টা):
            </strong>{' '}
            নির্ধারিত অধ্যায়ের থিওরি, সূত্র ও কনসেপ্ট কুইক রিভিশন।
          </li>
          <li>
            <strong className="text-slate-900 dark:text-slate-100">
              বিকাল (৩.৫ ঘণ্টা):
            </strong>{' '}
            বিগত বছরের ব্যাংক (RU, CU, GST, JU, DU) হাতে-কলমে সলভ। ভুল/কঠিন প্রশ্ন লাল কলমে মার্ক করো।
          </li>
          <li>
            <strong className="text-slate-900 dark:text-slate-100">
              রাত (১ ঘণ্টা):
            </strong>{' '}
            ইংরেজির নির্ধারিত টপিক অনুশীলন।
          </li>
          <li>
            <strong className="text-slate-900 dark:text-slate-100">
              রাত (৩০ মিনিট):
            </strong>{' '}
            স্পেসড রিভিশন — আগের দিন + ১ সপ্তাহ আগের অধ্যায়।
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">
          📌 কীভাবে চলবে
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300">
          <li>
            <strong className="text-slate-900 dark:text-slate-100">
              ১ দিন পিছিয়ে পড়লে:
            </strong>{' '}
            পরের শুক্রবারের কাভার-আপ সেটে পূরণ করো।
          </li>
          <li>
            <strong className="text-slate-900 dark:text-slate-100">
              ২ দিনের বেশি পিছালে:
            </strong>{' '}
            হালকা অধ্যায়গুলোর ব্যাংক ছোট করো (পরিবেশ, অর্থনৈতিক, কো-অর্ডিনেশন, জ্যোতির্বিজ্ঞান, সেমিকন্ডাক্টর, রৈখিক প্রোগ্রামিং, বিস্তার পরিমাপ)।
          </li>
          <li>
            <strong className="text-slate-900 dark:text-slate-100">
              ভারী অধ্যায় কখনো বাদ দেবে না।
            </strong>
          </li>
          <li>
            <strong className="text-slate-900 dark:text-slate-100">
              ভুলের খাতা:
            </strong>{' '}
            প্রতিদিনের ভুল প্রশ্ন সংক্ষেপে লিখবে। শুক্রবার ও মডেল টেস্টের পর এখান থেকেই রিভিশন হবে।
          </li>
          <li>
            <strong className="text-slate-900 dark:text-slate-100">
              সাপ্তাহিক টেস্ট:
            </strong>{' '}
            প্রতি শুক্রবার সকালে ঐ সপ্তাহের অধ্যায়গুলো থেকে ২ ঘণ্টার মিক্সড টেস্ট দাও।
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">
          ☁️ Cloud Sync, Squad ও Backup
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300">
          <li>
            টিক দিলেই অটোমেটিক আপনার{' '}
            <strong className="text-slate-900 dark:text-slate-100">
              Google অ্যাকাউন্টের ক্লাউডে
            </strong>{' '}
            সেভ হবে এবং আপনার স্কোয়াডের সব বন্ধুর স্ক্রিনে লাইভ প্রোফাইল ছবিসহ আপডেট হবে।
          </li>
          <li>
            কোনো টাস্ক বা দিনের ৩টি মিশন শেষ করলেই AURA, স্ট্রিক ও এসথেটিক সেলিব্রেশন অ্যানিমেশন পাবেন।
          </li>
          <li>
            অতিরিক্ত নিরাপত্তার জন্য উপরের{' '}
            <strong className="text-slate-900 dark:text-slate-100">Backup</strong>{' '}
            বাটনে ক্লিক করে JSON ব্যাকআপ ডাউনলোড করতে বা{' '}
            <strong className="text-slate-900 dark:text-slate-100">Import</strong>{' '}
            করতে পারবেন।
          </li>
        </ul>
      </section>
    </div>
  );
}
