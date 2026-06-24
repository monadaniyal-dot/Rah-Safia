// Daily Inspiration data — Ayahs and Hadiths shown one per day
// Selection rotates deterministically by day-of-year so it changes every day.

export interface DailyAyah {
  surah: number;
  ayah: number;
  surahName: string;
  arabic: string;
  urdu: string;
  english: string;
}

export interface DailyHadith {
  arabic: string;
  english: string;
  narrator: string;
  reference: string;
}

/** Returns a zero-based day index that increments once per calendar day */
function dayIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

export function getDailyAyah(): DailyAyah {
  const idx = dayIndex() % AYAHS.length;
  return AYAHS[idx];
}

export function getDailyHadith(): DailyHadith {
  // Offset by half the list so Ayah and Hadith don't cycle together
  const idx = (dayIndex() + Math.floor(HADITHS.length / 2)) % HADITHS.length;
  return HADITHS[idx];
}

// ─── Ayahs ────────────────────────────────────────────────────────────────────

export const AYAHS: DailyAyah[] = [
  {
    surah: 2, ayah: 286, surahName: "Al-Baqarah",
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    urdu: "اللہ کسی جان کو اس کی طاقت سے زیادہ تکلیف نہیں دیتا",
    english: "Allah does not burden a soul beyond that it can bear.",
  },
  {
    surah: 94, ayah: 5, surahName: "Ash-Sharh",
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    urdu: "بیشک تکلیف کے ساتھ آسانی ہے",
    english: "For indeed, with hardship will be ease.",
  },
  {
    surah: 3, ayah: 173, surahName: "Ali 'Imran",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    urdu: "ہمارے لیے اللہ کافی ہے اور وہ بہترین کارساز ہے",
    english: "Sufficient for us is Allah, and He is the best Disposer of affairs.",
  },
  {
    surah: 65, ayah: 3, surahName: "At-Talaq",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    urdu: "اور جو اللہ پر توکل کرے تو وہ اس کے لیے کافی ہے",
    english: "And whoever relies upon Allah — then He is sufficient for him.",
  },
  {
    surah: 13, ayah: 28, surahName: "Ar-Ra'd",
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    urdu: "آگاہ رہو! اللہ کی یاد سے دلوں کو سکون ملتا ہے",
    english: "Verily, in the remembrance of Allah do hearts find rest.",
  },
  {
    surah: 2, ayah: 152, surahName: "Al-Baqarah",
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    urdu: "تم مجھے یاد کرو میں تمہیں یاد کروں گا اور میرا شکر ادا کرو ناشکری مت کرو",
    english: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
  },
  {
    surah: 39, ayah: 53, surahName: "Az-Zumar",
    arabic: "إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ",
    urdu: "بیشک اللہ سب گناہ معاف فرماتا ہے، وہ بخشنے والا مہربان ہے",
    english: "Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.",
  },
  {
    surah: 2, ayah: 45, surahName: "Al-Baqarah",
    arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
    urdu: "اور صبر اور نماز سے مدد لو",
    english: "And seek help through patience and prayer.",
  },
  {
    surah: 49, ayah: 13, surahName: "Al-Hujurat",
    arabic: "إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ",
    urdu: "اللہ کے نزدیک تم میں سب سے زیادہ عزت والا وہ ہے جو سب سے زیادہ پرہیزگار ہو",
    english: "Indeed, the most noble of you in the sight of Allah is the most righteous of you.",
  },
  {
    surah: 55, ayah: 13, surahName: "Ar-Rahman",
    arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
    urdu: "تو تم اپنے رب کی کون کون سی نعمتوں کو جھٹلاؤ گے؟",
    english: "So which of the favours of your Lord would you deny?",
  },
  {
    surah: 17, ayah: 44, surahName: "Al-Isra",
    arabic: "وَإِن مِّن شَيْءٍ إِلَّا يُسَبِّحُ بِحَمْدِهِ وَلَٰكِن لَّا تَفْقَهُونَ تَسْبِيحَهُمْ",
    urdu: "اور کوئی چیز نہیں مگر اس کی تسبیح اس کی حمد کے ساتھ کرتی ہے لیکن تم ان کی تسبیح نہیں سمجھتے",
    english: "And there is not a thing except that it exalts Allah by His praise, but you do not understand their way of exalting.",
  },
  {
    surah: 4, ayah: 103, surahName: "An-Nisa",
    arabic: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
    urdu: "بیشک نماز مومنوں پر مقررہ اوقات میں فرض ہے",
    english: "Indeed, prayer has been decreed upon the believers a decree of specified times.",
  },
  {
    surah: 57, ayah: 21, surahName: "Al-Hadid",
    arabic: "سَابِقُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ",
    urdu: "اپنے رب کی مغفرت کی طرف سبقت کرو",
    english: "Race toward forgiveness from your Lord.",
  },
  {
    surah: 9, ayah: 51, surahName: "At-Tawbah",
    arabic: "قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا",
    urdu: "کہہ دو ہمیں وہی پہنچے گا جو اللہ نے ہمارے لیے لکھ دیا ہے",
    english: "Say: Nothing will befall us except what Allah has decreed for us.",
  },
  {
    surah: 3, ayah: 200, surahName: "Ali 'Imran",
    arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا",
    urdu: "اے ایمان والو! صبر کرو اور ثابت قدم رہو اور ڈٹے رہو",
    english: "O you who believe! Persevere, and endure, and remain stationed.",
  },
  {
    surah: 14, ayah: 7, surahName: "Ibrahim",
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    urdu: "اگر تم شکر کرو گے تو میں تمہیں اور زیادہ دوں گا",
    english: "If you are grateful, I will surely increase you in favour.",
  },
  {
    surah: 40, ayah: 60, surahName: "Ghafir",
    arabic: "ادْعُونِي أَسْتَجِبْ لَكُمْ",
    urdu: "مجھ سے دعا کرو میں تمہاری دعا قبول کروں گا",
    english: "Call upon Me; I will respond to you.",
  },
  {
    surah: 2, ayah: 177, surahName: "Al-Baqarah",
    arabic: "وَأَقَامَ الصَّلَاةَ وَآتَى الزَّكَاةَ",
    urdu: "اور نماز قائم کی اور زکوٰۃ دی",
    english: "And established prayer and gave zakah.",
  },
  {
    surah: 31, ayah: 17, surahName: "Luqman",
    arabic: "يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ",
    urdu: "اے میرے بیٹے! نماز قائم کر اور نیکی کا حکم دے اور برائی سے روک",
    english: "O my son! Establish prayer, enjoin what is right, forbid what is wrong.",
  },
  {
    surah: 29, ayah: 45, surahName: "Al-Ankabut",
    arabic: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
    urdu: "بیشک نماز بے حیائی اور برائی سے روکتی ہے",
    english: "Indeed, prayer prohibits immorality and wrongdoing.",
  },
  {
    surah: 93, ayah: 11, surahName: "Ad-Duha",
    arabic: "وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ",
    urdu: "اور اپنے رب کی نعمت کا ذکر کرتے رہو",
    english: "And proclaim the blessings of your Lord.",
  },
  {
    surah: 18, ayah: 10, surahName: "Al-Kahf",
    arabic: "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    urdu: "اے ہمارے رب! ہمیں اپنے پاس سے رحمت عطا فرما اور ہمارے معاملے میں ہدایت فراہم فرما",
    english: "Our Lord, grant us mercy from Yourself and prepare for us from our affair right guidance.",
  },
  {
    surah: 2, ayah: 255, surahName: "Al-Baqarah (Ayat al-Kursi)",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    urdu: "اللہ — اس کے سوا کوئی معبود نہیں، وہ زندہ ہمیشہ قائم رہنے والا ہے",
    english: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.",
  },
  {
    surah: 112, ayah: 1, surahName: "Al-Ikhlas",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    urdu: "کہو وہ اللہ ایک ہے",
    english: "Say: He is Allah, the One.",
  },
  {
    surah: 1, ayah: 5, surahName: "Al-Fatihah",
    arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    urdu: "ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں",
    english: "It is You we worship and You we ask for help.",
  },
  {
    surah: 1, ayah: 6, surahName: "Al-Fatihah",
    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    urdu: "ہمیں سیدھے راستے پر چلا",
    english: "Guide us to the straight path.",
  },
  {
    surah: 3, ayah: 160, surahName: "Ali 'Imran",
    arabic: "إِن يَنصُرْكُمُ اللَّهُ فَلَا غَالِبَ لَكُمْ",
    urdu: "اگر اللہ تمہاری مدد کرے تو کوئی تم پر غالب نہیں آ سکتا",
    english: "If Allah should aid you, no one can overcome you.",
  },
  {
    surah: 8, ayah: 2, surahName: "Al-Anfal",
    arabic: "إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ إِذَا ذُكِرَ اللَّهُ وَجِلَتْ قُلُوبُهُمْ",
    urdu: "ایمان والے تو وہ ہیں کہ جب اللہ کا ذکر کیا جائے تو ان کے دل کانپ اٹھتے ہیں",
    english: "The believers are only those who, when Allah is mentioned, their hearts tremble.",
  },
  {
    surah: 33, ayah: 41, surahName: "Al-Ahzab",
    arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا",
    urdu: "اے ایمان والو! اللہ کا بکثرت ذکر کرو",
    english: "O you who believe! Remember Allah with much remembrance.",
  },
  {
    surah: 76, ayah: 9, surahName: "Al-Insan",
    arabic: "إِنَّمَا نُطْعِمُكُمْ لِوَجْهِ اللَّهِ لَا نُرِيدُ مِنكُمْ جَزَاءً وَلَا شُكُورًا",
    urdu: "ہم تمہیں صرف اللہ کی رضا کے لیے کھانا کھلاتے ہیں نہ بدلہ چاہتے ہیں نہ شکریہ",
    english: "We feed you only for the countenance of Allah. We wish not from you reward or gratitude.",
  },
];

// ─── Hadiths ─────────────────────────────────────────────────────────────────

export const HADITHS: DailyHadith[] = [
  {
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    english: "Actions are judged by intentions, and every person will have what they intended.",
    narrator: "Umar ibn Al-Khattab (رضي الله عنه)",
    reference: "Sahih Bukhari 1",
  },
  {
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    english: "The best among you are those who learn the Qur'an and teach it.",
    narrator: "Uthman ibn Affan (رضي الله عنه)",
    reference: "Sahih Bukhari 5027",
  },
  {
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    english: "None of you truly believes until he loves for his brother what he loves for himself.",
    narrator: "Anas ibn Malik (رضي الله عنه)",
    reference: "Sahih Bukhari 13",
  },
  {
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    english: "Your smile in the face of your brother is charity.",
    narrator: "Abu Dharr Al-Ghifari (رضي الله عنه)",
    reference: "Al-Adab Al-Mufrad 224",
  },
  {
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    english: "The strong man is not the one who is good at wrestling; the strong man is the one who controls himself at the time of anger.",
    narrator: "Abu Hurairah (رضي الله عنه)",
    reference: "Sahih Bukhari 6114",
  },
  {
    arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    english: "Whoever fasts in Ramadan with faith, hoping for its reward, will have his past sins forgiven.",
    narrator: "Abu Hurairah (رضي الله عنه)",
    reference: "Sahih Bukhari 38",
  },
  {
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    english: "Charity does not in any way decrease wealth.",
    narrator: "Abu Hurairah (رضي الله عنه)",
    reference: "Sahih Muslim 2588",
  },
  {
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ",
    english: "Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise.",
    narrator: "Abu Hurairah (رضي الله عنه)",
    reference: "Sahih Muslim 2699",
  },
  {
    arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ",
    english: "Every act of kindness is a charity.",
    narrator: "Jabir ibn Abdillah (رضي الله عنه)",
    reference: "Sahih Muslim 1005",
  },
  {
    arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ",
    english: "Cleanliness is half of faith.",
    narrator: "Abu Malik Al-Ash'ari (رضي الله عنه)",
    reference: "Sahih Muslim 223",
  },
  {
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    english: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    narrator: "Abu Hurairah (رضي الله عنه)",
    reference: "Sahih Bukhari 6475",
  },
  {
    arabic: "الدُّعَاءُ هُوَ الْعِبَادَةُ",
    english: "Du'a (supplication) is worship.",
    narrator: "An-Nu'man ibn Bashir (رضي الله عنه)",
    reference: "Tirmidhi 3372",
  },
  {
    arabic: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    english: "The most beloved deeds to Allah are those done consistently, even if they are few.",
    narrator: "Aishah (رضي الله عنها)",
    reference: "Sahih Bukhari 6465",
  },
  {
    arabic: "اتَّقِ اللهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا",
    english: "Fear Allah wherever you are; follow a bad deed with a good deed and it will wipe it out; and deal with people in a good manner.",
    narrator: "Mu'adh ibn Jabal (رضي الله عنه)",
    reference: "Tirmidhi 1987",
  },
  {
    arabic: "رَحِمَ اللهُ عَبْدًا قَالَ خَيْرًا فَغَنِمَ أَوْ سَكَتَ فَسَلِمَ",
    english: "May Allah have mercy on a person who says something good and benefits, or keeps silent and is safe.",
    narrator: "Ibn Mas'ud (رضي الله عنه)",
    reference: "Shu'ab al-Iman",
  },
  {
    arabic: "إِنَّ اللهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ",
    english: "Indeed, Allah loves that when one of you does a job he does it with excellence.",
    narrator: "Aishah (رضي الله عنها)",
    reference: "Al-Bayhaqi, Shu'ab al-Iman",
  },
  {
    arabic: "مِفْتَاحُ الْجَنَّةِ الصَّلَاةُ",
    english: "The key to Paradise is the prayer, and the key to prayer is purification.",
    narrator: "Jabir ibn Abdillah (رضي الله عنه)",
    reference: "Musnad Ahmad 14539",
  },
  {
    arabic: "إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا، مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ",
    english: "Allah has ninety-nine names. Whoever encompasses them will enter Paradise.",
    narrator: "Abu Hurairah (رضي الله عنه)",
    reference: "Sahih Muslim 2677",
  },
];
