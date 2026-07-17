// ─── Supplication (Dua) Library Data ──────────────────────────────────────────
// Authentic duas from Quran and Sunnah with Arabic, transliteration,
// English translation, Urdu translation, explanation, and reference.
// All data is stored locally — no network required.

export interface DuaItem {
  id: string;
  subcategoryId: string;
  categoryId: string;
  arabic: string;
  transliteration: string;
  english: string;
  urdu: string;
  explanation: string;
  reference: string;
}

export interface DuaSubcategory {
  id: string;
  categoryId: string;
  title: string;
  arabicTitle: string;
  icon: string;
}

export interface DuaCategory {
  id: string;
  title: string;
  arabicTitle: string;
  description: string;
  icon: string;
  color: string; // Tailwind token prefix
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const DUA_CATEGORIES: DuaCategory[] = [
  {
    id: "morning-evening",
    title: "Morning & Evening",
    arabicTitle: "الأذكار الصباحية والمسائية",
    description: "Adhkar to begin and close each blessed day",
    icon: "🌅",
    color: "amber",
  },
  {
    id: "daily-life",
    title: "Daily Life",
    arabicTitle: "أذكار الحياة اليومية",
    description: "Supplications for everyday activities and moments",
    icon: "🏡",
    color: "emerald",
  },
  {
    id: "prayer",
    title: "Prayer",
    arabicTitle: "أدعية الصلاة",
    description: "Duas before, during, and after Salah",
    icon: "🕌",
    color: "teal",
  },
  {
    id: "travel",
    title: "Travel",
    arabicTitle: "أدعية السفر",
    description: "Supplications for journeys and weather",
    icon: "✈️",
    color: "sky",
  },
  {
    id: "health-protection",
    title: "Health & Protection",
    arabicTitle: "الصحة والحماية",
    description: "Duas for healing and protection from harm",
    icon: "🛡️",
    color: "rose",
  },
  {
    id: "forgiveness",
    title: "Forgiveness & Repentance",
    arabicTitle: "الاستغفار والتوبة",
    description: "Seeking Allah's boundless forgiveness and mercy",
    icon: "🤲",
    color: "violet",
  },
  {
    id: "rizq-success",
    title: "Rizq & Success",
    arabicTitle: "الرزق والنجاح",
    description: "Duas for provision, ease, and worldly success",
    icon: "🌿",
    color: "green",
  },
  {
    id: "family",
    title: "Family",
    arabicTitle: "الأسرة",
    description: "Supplications for parents, children, and loved ones",
    icon: "❤️",
    color: "indigo",
  },
  {
    id: "special-occasions",
    title: "Special Occasions",
    arabicTitle: "المناسبات الخاصة",
    description: "Duas for Ramadan, Eid, Hajj, Umrah and more",
    icon: "✨",
    color: "violet",
  },
];

// ─── Subcategories ────────────────────────────────────────────────────────────

export const DUA_SUBCATEGORIES: DuaSubcategory[] = [
  // Morning & Evening
  { id: "morning-adhkar",    categoryId: "morning-evening",    title: "Morning Adhkar",          arabicTitle: "أذكار الصباح",                icon: "🌄" },
  { id: "evening-adhkar",    categoryId: "morning-evening",    title: "Evening Adhkar",          arabicTitle: "أذكار المساء",                icon: "🌆" },
  // Daily Life
  { id: "before-sleeping",   categoryId: "daily-life",         title: "Before Sleeping",         arabicTitle: "قبل النوم",                   icon: "🌙" },
  { id: "after-waking",      categoryId: "daily-life",         title: "After Waking Up",         arabicTitle: "عند الاستيقاظ",               icon: "☀️" },
  { id: "before-eating",     categoryId: "daily-life",         title: "Before Eating",           arabicTitle: "قبل الطعام",                  icon: "🍽️" },
  { id: "after-eating",      categoryId: "daily-life",         title: "After Eating",            arabicTitle: "بعد الطعام",                  icon: "✅" },
  { id: "before-drinking",   categoryId: "daily-life",         title: "Before Drinking",         arabicTitle: "قبل الشرب",                   icon: "💧" },
  { id: "after-drinking",    categoryId: "daily-life",         title: "After Drinking",          arabicTitle: "بعد الشرب",                   icon: "🫖" },
  { id: "before-wudu",       categoryId: "daily-life",         title: "Before Wudu",             arabicTitle: "قبل الوضوء",                  icon: "🚿" },
  { id: "after-wudu",        categoryId: "daily-life",         title: "After Wudu",              arabicTitle: "بعد الوضوء",                  icon: "💦" },
  { id: "entering-bathroom", categoryId: "daily-life",         title: "Entering Bathroom",       arabicTitle: "دخول الحمام",                 icon: "🚪" },
  { id: "leaving-bathroom",  categoryId: "daily-life",         title: "Leaving Bathroom",        arabicTitle: "الخروج من الحمام",            icon: "🚶" },
  { id: "entering-home",     categoryId: "daily-life",         title: "Entering Home",           arabicTitle: "دخول البيت",                  icon: "🏠" },
  { id: "leaving-home",      categoryId: "daily-life",         title: "Leaving Home",            arabicTitle: "الخروج من البيت",             icon: "🚶‍♂️" },
  { id: "entering-mosque",   categoryId: "daily-life",         title: "Entering Mosque",         arabicTitle: "دخول المسجد",                 icon: "🕌" },
  { id: "leaving-mosque",    categoryId: "daily-life",         title: "Leaving Mosque",          arabicTitle: "الخروج من المسجد",            icon: "🕌" },
  { id: "wearing-clothes",   categoryId: "daily-life",         title: "Wearing New Clothes",     arabicTitle: "لبس الثوب الجديد",            icon: "👕" },
  { id: "looking-mirror",    categoryId: "daily-life",         title: "Looking in the Mirror",   arabicTitle: "النظر في المرآة",             icon: "🪞" },
  // Prayer
  { id: "before-salah",      categoryId: "prayer",             title: "Before Salah",            arabicTitle: "قبل الصلاة",                  icon: "🕐" },
  { id: "after-salah",       categoryId: "prayer",             title: "After Salah",             arabicTitle: "بعد الصلاة",                  icon: "📿" },
  { id: "qunoot",            categoryId: "prayer",             title: "Qunoot",                  arabicTitle: "دعاء القنوت",                 icon: "🤲" },
  { id: "istikhara",         categoryId: "prayer",             title: "Istikhara",               arabicTitle: "صلاة الاستخارة",              icon: "⭐" },
  // Travel
  { id: "beginning-journey", categoryId: "travel",             title: "Beginning a Journey",     arabicTitle: "بداية السفر",                 icon: "🧳" },
  { id: "boarding-vehicle",  categoryId: "travel",             title: "Boarding a Vehicle",      arabicTitle: "ركوب المركبة",                icon: "🚗" },
  { id: "returning-home",    categoryId: "travel",             title: "Returning Home",          arabicTitle: "العودة إلى البيت",            icon: "🏡" },
  { id: "during-rain",       categoryId: "travel",             title: "During Rain",             arabicTitle: "عند نزول المطر",              icon: "🌧️" },
  { id: "during-storms",     categoryId: "travel",             title: "During Storms",           arabicTitle: "عند الريح الشديدة",           icon: "⛈️" },
  // Health & Protection
  { id: "dua-sickness",      categoryId: "health-protection",  title: "Dua for Sickness",        arabicTitle: "دعاء المريض",                 icon: "🌡️" },
  { id: "visiting-sick",     categoryId: "health-protection",  title: "Visiting the Sick",       arabicTitle: "عيادة المريض",                icon: "💊" },
  { id: "evil-eye",          categoryId: "health-protection",  title: "Protection from Evil Eye",arabicTitle: "الحماية من العين",            icon: "👁️" },
  { id: "shaytan-protect",   categoryId: "health-protection",  title: "Protection from Shaytan", arabicTitle: "الحماية من الشيطان",          icon: "🛡️" },
  { id: "sleeping-protect",  categoryId: "health-protection",  title: "Protection Before Sleep", arabicTitle: "الحماية قبل النوم",           icon: "🌛" },
  { id: "child-protection",  categoryId: "health-protection",  title: "Protection for Children", arabicTitle: "حماية الأبناء",               icon: "👶" },
  // Forgiveness
  { id: "sayyidul-istighfar",categoryId: "forgiveness",        title: "Sayyidul Istighfar",      arabicTitle: "سيد الاستغفار",               icon: "👑" },
  { id: "common-istighfar",  categoryId: "forgiveness",        title: "Common Istighfar",        arabicTitle: "الاستغفار العام",             icon: "🤲" },
  { id: "repentance",        categoryId: "forgiveness",        title: "Repentance Duas",         arabicTitle: "أدعية التوبة",                icon: "💫" },
  // Rizq & Success
  { id: "rizq",              categoryId: "rizq-success",       title: "Rizq",                    arabicTitle: "الرزق",                       icon: "🌾" },
  { id: "debt",              categoryId: "rizq-success",       title: "Debt",                    arabicTitle: "الدين",                       icon: "💰" },
  { id: "anxiety",           categoryId: "rizq-success",       title: "Anxiety",                 arabicTitle: "القلق",                       icon: "🫀" },
  { id: "stress",            categoryId: "rizq-success",       title: "Stress",                  arabicTitle: "الضغط النفسي",                icon: "😔" },
  { id: "sadness",           categoryId: "rizq-success",       title: "Sadness",                 arabicTitle: "الحزن",                       icon: "🌧️" },
  { id: "knowledge",         categoryId: "rizq-success",       title: "Knowledge",               arabicTitle: "العلم",                       icon: "📚" },
  { id: "guidance",          categoryId: "rizq-success",       title: "Guidance",                arabicTitle: "الهداية",                     icon: "⭐" },
  { id: "ease-difficulty",   categoryId: "rizq-success",       title: "Ease in Difficulties",    arabicTitle: "تفريج الكرب",                 icon: "🌈" },
  { id: "exam-success",      categoryId: "rizq-success",       title: "Success in Exams",        arabicTitle: "النجاح في الامتحانات",        icon: "📝" },
  { id: "business-success",  categoryId: "rizq-success",       title: "Business Success",        arabicTitle: "نجاح الأعمال",                icon: "📈" },
  // Family
  { id: "parents",           categoryId: "family",             title: "Parents",                 arabicTitle: "الوالدان",                    icon: "❤️" },
  { id: "children",          categoryId: "family",             title: "Children",                arabicTitle: "الأبناء",                     icon: "👶" },
  { id: "marriage",          categoryId: "family",             title: "Marriage",                arabicTitle: "الزواج",                      icon: "💍" },
  { id: "spouse",            categoryId: "family",             title: "Spouse",                  arabicTitle: "الزوج / الزوجة",              icon: "💑" },
  { id: "family-unity",      categoryId: "family",             title: "Family Unity",            arabicTitle: "وحدة الأسرة",                 icon: "🏡" },
  // Special Occasions
  { id: "ramadan",           categoryId: "special-occasions",  title: "Ramadan",                 arabicTitle: "رمضان",                       icon: "🌙" },
  { id: "laylatul-qadr",     categoryId: "special-occasions",  title: "Laylatul Qadr",           arabicTitle: "ليلة القدر",                  icon: "⭐" },
  { id: "eid",               categoryId: "special-occasions",  title: "Eid",                     arabicTitle: "العيد",                       icon: "🎉" },
  { id: "hajj",              categoryId: "special-occasions",  title: "Hajj",                    arabicTitle: "الحج",                        icon: "🕋" },
  { id: "umrah",             categoryId: "special-occasions",  title: "Umrah",                   arabicTitle: "العمرة",                      icon: "🕋" },
  { id: "janazah",           categoryId: "special-occasions",  title: "Janazah",                 arabicTitle: "الجنازة",                     icon: "🌹" },
];

// ─── Dua Items ────────────────────────────────────────────────────────────────

export const DUA_ITEMS: DuaItem[] = [

  // ── Morning Adhkar ─────────────────────────────────────────────────────────

  {
    id: "morning-1",
    subcategoryId: "morning-adhkar",
    categoryId: "morning-evening",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Asbahna wa asbahal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lahu, lahul mulku walahul hamd, wa huwa 'ala kulli shay'in qadir",
    english: "We have entered morning and at this very time, the whole dominion belongs to Allah. All praise is for Allah. There is no deity worthy of worship except Allah, alone, without any partner. His is the dominion, and His is the praise, and He is able to do all things.",
    urdu: "ہم نے صبح کی اور اللہ کی بادشاہت نے بھی صبح کی، تمام تعریف اللہ کے لیے ہے، اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے اس کا کوئی شریک نہیں",
    explanation: "This is the master morning dhikr recommended by the Prophet ﷺ. Reciting it in the morning and its evening equivalent at dusk affirms Allah's sovereignty over all creation. The Prophet ﷺ would not begin his day without this remembrance.",
    reference: "Abu Dawud 5076, Tirmidhi 3468",
  },
  {
    id: "morning-2",
    subcategoryId: "morning-adhkar",
    categoryId: "morning-evening",
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilaikan nushur",
    english: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the Resurrection.",
    urdu: "اے اللہ! تیری مدد سے ہم نے صبح کی اور تیری ہی مدد سے شام کریں گے، تیری وجہ سے جیتے ہیں اور تیری وجہ سے مریں گے اور تیری طرف لوٹنا ہے",
    explanation: "This supplication acknowledges total dependence on Allah — from the first breath of morning to the last moment of life. It is a profound declaration of tawakkul (complete reliance on Allah) that the Prophet ﷺ recited every morning.",
    reference: "Abu Dawud 5068, Tirmidhi 3391",
  },
  {
    id: "morning-3",
    subcategoryId: "morning-adhkar",
    categoryId: "morning-evening",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاهُ وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ",
    transliteration: "Allahumma inni as'aluka khayra hadhal yawm, fathahu wa nasrahu wa nurahu wa barakatahu wa hudahu, wa a'udhu bika min sharri ma fihi wa sharri ma ba'dahu",
    english: "O Allah, I ask You for the goodness of this day — its opening, its victory, its light, its blessings, and its guidance. And I seek refuge in You from the evil in it and the evil that comes after it.",
    urdu: "اے اللہ! میں تجھ سے اس دن کی بھلائی مانگتا ہوں، اس کی فتح، اس کی مدد، اس کی روشنی، اس کی برکت اور اس کی ہدایت، اور اس دن کی برائی اور اس کے بعد کی برائی سے تیری پناہ مانگتا ہوں",
    explanation: "A comprehensive morning prayer asking Allah to bless every facet of the new day — spiritual, practical, and temporal. Ibn As-Sunnah reported this as part of the morning adhkar of the Prophet ﷺ.",
    reference: "Abu Dawud 5084, Ibn As-Sunnah",
  },

  // ── Evening Adhkar ─────────────────────────────────────────────────────────

  {
    id: "evening-1",
    subcategoryId: "evening-adhkar",
    categoryId: "morning-evening",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Amsayna wa amsal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lahu, lahul mulku walahul hamd, wa huwa 'ala kulli shay'in qadir",
    english: "We have entered evening and at this very time, the whole dominion belongs to Allah. All praise is for Allah. There is no deity worthy of worship except Allah, alone, without any partner. His is the dominion, and His is the praise, and He is able to do all things.",
    urdu: "ہم نے شام کی اور اللہ کی بادشاہت نے بھی شام کی، تمام تعریف اللہ کے لیے ہے، اللہ کے سوا کوئی معبود نہیں وہ اکیلا ہے",
    explanation: "The evening counterpart of the morning remembrance, closing the day by affirming Allah's complete sovereignty. The words shift from 'asbahna' (we entered morning) to 'amsayna' (we entered evening), and resurrection is mentioned as 'al-masir' — the final return.",
    reference: "Abu Dawud 5077, Muslim 2723",
  },
  {
    id: "evening-2",
    subcategoryId: "evening-adhkar",
    categoryId: "morning-evening",
    arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
    transliteration: "Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilaykal masir",
    english: "O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the final return.",
    urdu: "اے اللہ! تیری مدد سے ہم نے شام کی اور تیری ہی مدد سے صبح کریں گے، تجھ سے ہی زندہ ہیں اور تجھ سے ہی موت آئے گی اور تیری طرف ہی لوٹنا ہے",
    explanation: "The evening version of the morning dua of total reliance. The word 'al-masir' (the final destination) replaces 'an-nushur' (the resurrection) — both point to the return to Allah but with a slightly different emphasis befitting the close of day.",
    reference: "Abu Dawud 5068, Tirmidhi 3391",
  },
  {
    id: "evening-3",
    subcategoryId: "evening-adhkar",
    categoryId: "morning-evening",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ فَتْحَهَا وَنَصْرَهَا وَنُورَهَا وَبَرَكَتَهَا وَهُدَاهَا وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهَا وَشَرِّ مَا بَعْدَهَا",
    transliteration: "Allahumma inni as'aluka khayra hadhihil layla, fathaha wa nasraha wa nuraha wa barakataha wa hudaha, wa a'udhu bika min sharri ma fiha wa sharri ma ba'daha",
    english: "O Allah, I ask You for the goodness of this night — its opening, its victory, its light, its blessings, and its guidance. And I seek refuge in You from the evil in it and the evil that comes after it.",
    urdu: "اے اللہ! میں تجھ سے اس رات کی بھلائی مانگتا ہوں، اس کی فتح، اس کی نصرت، اس کی روشنی، اس کی برکت اور اس کی ہدایت، اور اس رات کی برائی سے اور اس کے بعد کی برائی سے تیری پناہ مانگتا ہوں",
    explanation: "The evening parallel to the morning supplication for a blessed day, now applied to the night. Seeking light in the night has a particular spiritual resonance — it is a reminder that spiritual illumination is not bound by the sun.",
    reference: "Abu Dawud 5084, Ibn As-Sunnah",
  },

  // ── Before Sleeping ────────────────────────────────────────────────────────

  {
    id: "sleep-1",
    subcategoryId: "before-sleeping",
    categoryId: "daily-life",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    english: "In Your name, O Allah, I die and I live.",
    urdu: "اے اللہ! تیرے نام کے ساتھ مرتا ہوں اور جیتا ہوں",
    explanation: "Sleep is often described as the 'minor death' in Islamic tradition. This short supplication, said when lying down, connects the act of sleeping to trust in Allah — just as we surrender consciousness, we surrender ourselves entirely to Him.",
    reference: "Bukhari 6324",
  },
  {
    id: "sleep-2",
    subcategoryId: "before-sleeping",
    categoryId: "daily-life",
    arabic: "بِسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
    transliteration: "Bismika Rabbi wada'tu janbi wa bika arfa'uhu, fa in amsakta nafsi farhamha, wa in arsaltaha fahfadhha bima tahfadhu bihi 'ibadakas-salihin",
    english: "In Your name, my Lord, I lay down my side and by You I raise it. If You take my soul, then have mercy on it. If You release it, then protect it with that which You protect Your righteous servants.",
    urdu: "تیرے نام کے ساتھ اے میرے رب! اپنا پہلو رکھتا ہوں اور تیری مدد سے اٹھاؤں گا۔ اگر تو میری روح کو روک لے تو اس پر رحم فرما اور اگر چھوڑ دے تو اسے ایسے حفظ کر جیسے تو اپنے نیک بندوں کی حفاظت کرتا ہے",
    explanation: "One of the most beautiful bedtime duas, expressing complete surrender. The believer acknowledges that sleep and waking are both in Allah's hands, seeking His mercy and protection in both states. The Prophet ﷺ used to recite this every night.",
    reference: "Bukhari 6320, Muslim 2714",
  },
  {
    id: "sleep-3",
    subcategoryId: "before-sleeping",
    categoryId: "daily-life",
    arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak",
    english: "O Allah, save me from Your punishment on the Day You resurrect Your servants.",
    urdu: "اے اللہ! مجھے اپنے عذاب سے بچا اس دن جب تو اپنے بندوں کو اٹھائے گا",
    explanation: "The Prophet ﷺ would press his right cheek against his hand when sleeping and say this supplication three times. It directs the believer's mind, even at rest, toward the accountability of the Day of Judgement and the need for Allah's protection.",
    reference: "Abu Dawud 5045, Tirmidhi 3398",
  },

  // ── After Waking Up ────────────────────────────────────────────────────────

  {
    id: "waking-1",
    subcategoryId: "after-waking",
    categoryId: "daily-life",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil ladhi ahyana ba'da ma amatana wa ilayhin nushur",
    english: "All praise is for Allah who gave us life after having caused us to die, and unto Him is the Resurrection.",
    urdu: "تمام تعریف اللہ کے لیے ہے جس نے ہمیں موت دینے کے بعد زندگی دی اور اسی کی طرف اٹھ کر جانا ہے",
    explanation: "The first words of the day upon waking. Sleep is the 'minor death' and waking is a daily resurrection — a gift of renewed life. This dua trains the tongue and heart to begin every day with gratitude rather than complaint.",
    reference: "Bukhari 6312, Muslim 2711",
  },
  {
    id: "waking-2",
    subcategoryId: "after-waking",
    categoryId: "daily-life",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي وَرَدَّ عَلَيَّ رُوحِي وَأَذِنَ لِي بِذِكْرِهِ",
    transliteration: "Alhamdu lillahil ladhi 'afani fi jasadi wa radda 'alayya ruhi wa adhina li bidhikrihi",
    english: "All praise is for Allah who restored to me my health and returned my soul to me and allowed me to remember Him.",
    urdu: "تمام تعریف اللہ کے لیے ہے جس نے میرے جسم کو عافیت دی، میری روح لوٹائی اور مجھے اپنا ذکر کرنے کی اجازت دی",
    explanation: "This dua was reported by Tirmidhi as something the Prophet ﷺ said upon waking. It recognises three distinct gifts: physical health, the return of the soul, and most profoundly — the ability to make dhikr, which is the highest of all gifts.",
    reference: "Tirmidhi 3401",
  },

  // ── Before Eating ──────────────────────────────────────────────────────────

  {
    id: "eat-before-1",
    subcategoryId: "before-eating",
    categoryId: "daily-life",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    english: "In the name of Allah.",
    urdu: "اللہ کے نام کے ساتھ",
    explanation: "The Prophet ﷺ commanded us to say Bismillah before eating. If one forgets at the start, one should say 'Bismillahi awwalahu wa akhirahu' (In the name of Allah at its beginning and its end). This invocation sanctifies the meal and keeps Shaytan from sharing in it.",
    reference: "Abu Dawud 3767, Ibn Majah 3264",
  },
  {
    id: "eat-before-2",
    subcategoryId: "before-eating",
    categoryId: "daily-life",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْرًا مِنْهُ",
    transliteration: "Allahumma barik lana fihi wa at'imna khayran minhu",
    english: "O Allah, bless it for us and feed us something better than it.",
    urdu: "اے اللہ! ہمارے لیے اس میں برکت دے اور ہمیں اس سے بہتر کھانا کھلا",
    explanation: "The Prophet ﷺ and his Companions would recite this dua specifically when drinking milk, but scholars extend its spirit to all food. It is a dua for ongoing provision and blessings beyond what is currently before us.",
    reference: "Tirmidhi 3455, Ibn Majah 3322",
  },

  // ── After Eating ───────────────────────────────────────────────────────────

  {
    id: "eat-after-1",
    subcategoryId: "after-eating",
    categoryId: "daily-life",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Alhamdu lillahil ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    english: "All praise is for Allah who fed me this and provided it for me without any might or power on my part.",
    urdu: "تمام تعریف اللہ کے لیے ہے جس نے مجھے یہ کھلایا اور رزق دیا بغیر میری طاقت اور قوت کے",
    explanation: "This dua after eating is one of the most complete acts of gratitude. The Hadith records that whoever says this, their past sins are forgiven. It explicitly acknowledges that the food was not acquired by one's own power but by Allah's grace alone.",
    reference: "Abu Dawud 4023, Tirmidhi 3458, Ibn Majah 3285",
  },
  {
    id: "eat-after-2",
    subcategoryId: "after-eating",
    categoryId: "daily-life",
    arabic: "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ غَيْرَ مَكْفِيٍّ وَلَا مُوَدَّعٍ وَلَا مُسْتَغْنًى عَنْهُ رَبَّنَا",
    transliteration: "Alhamdu lillahi hamdan kathiran tayyiban mubarakan fihi, ghayra makfiyyin wa la muwadda'in wa la mustaghnan 'anhu, Rabbana",
    english: "All praise is for Allah, an abundant, good and blessed praise; a praise that is not insufficient, nor one that can be bidden farewell, nor one we can do without, O our Lord.",
    urdu: "اللہ کا بہت زیادہ، پاکیزہ اور بابرکت شکر ہے، ایسا شکر جو نہ نامکمل ہو نہ ختم ہو نہ اس سے بے نیاز ہو سکیں، اے ہمارے رب",
    explanation: "The Companion Mu'adh ibn Anas reported that the Prophet ﷺ said: whoever recites this dua after eating will be forgiven his past sins. This praise is designed to be unending and unlimited — suitable for a blessing as fundamental as food.",
    reference: "Bukhari 5458, Abu Dawud 3849",
  },

  // ── Before Drinking ────────────────────────────────────────────────────────

  {
    id: "drink-before-1",
    subcategoryId: "before-drinking",
    categoryId: "daily-life",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    english: "In the name of Allah.",
    urdu: "اللہ کے نام کے ساتھ",
    explanation: "Just as with eating, one begins drinking with Bismillah. The Prophet ﷺ would drink in three sips and praise Allah between each, teaching us that even quenching thirst is an act of worship when done with remembrance of Allah.",
    reference: "Tirmidhi 1885, Ibn Majah 3275",
  },

  // ── After Drinking ─────────────────────────────────────────────────────────

  {
    id: "drink-after-1",
    subcategoryId: "after-drinking",
    categoryId: "daily-life",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي سَقَانَا عَذْبًا فُرَاتًا بِرَحْمَتِهِ وَلَمْ يَجْعَلْهُ مِلْحًا أُجَاجًا بِذُنُوبِنَا",
    transliteration: "Alhamdu lillahil ladhi saqana 'adhban furatan birahmatih, wa lam yaj'alhu milhan ujajan bidhunubina",
    english: "All praise is for Allah who gave us fresh, sweet water to drink by His mercy, and did not make it salty and bitter because of our sins.",
    urdu: "تمام تعریف اللہ کے لیے ہے جس نے ہمیں اپنی رحمت سے میٹھا پانی پلایا اور ہمارے گناہوں کی وجہ سے اسے کڑوا نہیں کیا",
    explanation: "This dua draws attention to one of the greatest overlooked blessings — fresh, drinkable water. It reminds the believer that the sweetness of water is a mercy from Allah, and that it could have been otherwise given our sins. Ibn As-Sunnah recorded this as a prophetic supplication.",
    reference: "Ibn As-Sunnah, Abu Nu'aym",
  },

  // ── Before Wudu ────────────────────────────────────────────────────────────

  {
    id: "wudu-before-1",
    subcategoryId: "before-wudu",
    categoryId: "daily-life",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    english: "In the name of Allah.",
    urdu: "اللہ کے نام کے ساتھ",
    explanation: "The Prophet ﷺ said: 'There is no wudu for the one who does not mention the name of Allah at its start.' Saying Bismillah at the beginning of wudu is therefore considered by many scholars to be obligatory, and by all as essential sunnah.",
    reference: "Abu Dawud 101, Ibn Majah 399, Ahmad",
  },
  {
    id: "wudu-before-2",
    subcategoryId: "before-wudu",
    categoryId: "daily-life",
    arabic: "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي وَوَسِّعْ لِي فِي دَارِي وَبَارِكْ لِي فِي رِزْقِي",
    transliteration: "Allahummaghfir li dhanbi wa wassi' li fi dari wa barik li fi rizqi",
    english: "O Allah, forgive my sins, expand my home for me, and bless my provision.",
    urdu: "اے اللہ! میرے گناہ بخش دے، میرے گھر کو وسعت دے اور میرے رزق میں برکت دے",
    explanation: "A comprehensive supplication asking for the three fundamental needs: spiritual (forgiveness), domestic (spacious home), and material (blessed provision). Ibn As-Sunnah recorded this as a dua that can be recited during wudu.",
    reference: "Ibn As-Sunnah, Al-Hakim",
  },

  // ── After Wudu ─────────────────────────────────────────────────────────────

  {
    id: "wudu-after-1",
    subcategoryId: "after-wudu",
    categoryId: "daily-life",
    arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
    transliteration: "Ashhadu an la ilaha illallahu wahdahu la sharika lah, wa ashhadu anna Muhammadan 'abduhu wa rasuluh. Allahumma-j'alni minat-tawwabin waj'alni minal mutatahhirin",
    english: "I testify that there is no deity worthy of worship except Allah alone with no partner, and I testify that Muhammad is His servant and messenger. O Allah, make me among those who repent and make me among those who purify themselves.",
    urdu: "میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، کوئی شریک نہیں اور محمد ﷺ اس کے بندے اور رسول ہیں۔ اے اللہ! مجھے توبہ کرنے والوں میں سے بنا اور پاکیزگی اختیار کرنے والوں میں سے بنا",
    explanation: "The Prophet ﷺ said: 'Whoever completes wudu and then says these words, the eight gates of Paradise will be opened for him to enter from whichever he wishes.' This is one of the most rewarding short supplications in Islamic practice.",
    reference: "Muslim 234, Tirmidhi 55, Ibn Majah 470",
  },

  // ── Entering Bathroom ──────────────────────────────────────────────────────

  {
    id: "bathroom-enter-1",
    subcategoryId: "entering-bathroom",
    categoryId: "daily-life",
    arabic: "بِسْمِ اللَّهِ اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    transliteration: "Bismillah, Allahumma inni a'udhu bika minal-khbuthi wal-khaba'ith",
    english: "In the name of Allah. O Allah, I seek Your protection from male and female evil jinn.",
    urdu: "اللہ کے نام کے ساتھ۔ اے اللہ! میں نر اور مادہ شیطانوں سے تیری پناہ مانگتا ہوں",
    explanation: "Toilets and bathrooms are inhabited by evil jinn according to narrations. The Prophet ﷺ instructed us to seek Allah's protection before entering such places. The left foot enters first; the right foot exits first — the opposite of mosques.",
    reference: "Bukhari 142, Muslim 375",
  },

  // ── Leaving Bathroom ──────────────────────────────────────────────────────

  {
    id: "bathroom-leave-1",
    subcategoryId: "leaving-bathroom",
    categoryId: "daily-life",
    arabic: "غُفْرَانَكَ",
    transliteration: "Ghufranaka",
    english: "I ask for Your forgiveness.",
    urdu: "تیری مغفرت مانگتا ہوں",
    explanation: "This one word is a complete supplication. It was the first thing the Prophet ﷺ would say upon leaving the toilet. Scholars explain its wisdom: after relieving oneself from a worldly need, one is reminded of the spiritual need — forgiveness from Allah.",
    reference: "Abu Dawud 30, Tirmidhi 7, Ibn Majah 300",
  },

  // ── Entering Home ──────────────────────────────────────────────────────────

  {
    id: "home-enter-1",
    subcategoryId: "entering-home",
    categoryId: "daily-life",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'alallahi rabbina tawakkalna",
    english: "In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we place our trust.",
    urdu: "اللہ کے نام کے ساتھ ہم داخل ہوئے اور اللہ کے نام کے ساتھ نکلیں گے اور اپنے رب اللہ پر ہم نے بھروسہ کیا",
    explanation: "The Prophet ﷺ also instructed that one greet the family with salaam upon entering. When Bismillah is said upon entry, Shaytan says to his companions 'You have no lodging here tonight.' When salaam is also given, he says 'No supper either.' The home becomes a sanctuary.",
    reference: "Abu Dawud 5096, Muslim 2018",
  },

  // ── Leaving Home ───────────────────────────────────────────────────────────

  {
    id: "home-leave-1",
    subcategoryId: "leaving-home",
    categoryId: "daily-life",
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Bismillah, tawakkaltu 'alallah, wa la hawla wa la quwwata illa billah",
    english: "In the name of Allah, I place my trust in Allah, and there is no might or power except with Allah.",
    urdu: "اللہ کے نام کے ساتھ، اللہ پر بھروسہ کیا، اللہ کے سوا کوئی طاقت اور قوت نہیں",
    explanation: "When one leaves with this supplication, the Prophet ﷺ said: 'It will be said to him: you are guided, protected, and defended.' Shaytan turns away from whoever says this, and another devil says 'What can you do with a man who is guided, protected, and defended?'",
    reference: "Abu Dawud 5095, Tirmidhi 3426",
  },

  // ── Entering Mosque ────────────────────────────────────────────────────────

  {
    id: "mosque-enter-1",
    subcategoryId: "entering-mosque",
    categoryId: "daily-life",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahumma iftah li abwaba rahmatik",
    english: "O Allah, open for me the gates of Your mercy.",
    urdu: "اے اللہ! میرے لیے اپنی رحمت کے دروازے کھول دے",
    explanation: "One enters the mosque with the right foot first and recites this supplication. The mosque is the house of Allah and the gates of the mosque symbolise the gates of divine mercy. Entering it is entering a space of closeness to Allah.",
    reference: "Muslim 713, Abu Dawud 465, Ibn Majah 771",
  },

  // ── Leaving Mosque ─────────────────────────────────────────────────────────

  {
    id: "mosque-leave-1",
    subcategoryId: "leaving-mosque",
    categoryId: "daily-life",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allahumma inni as'aluka min fadlik",
    english: "O Allah, I ask You of Your grace and bounty.",
    urdu: "اے اللہ! میں تجھ سے تیرا فضل مانگتا ہوں",
    explanation: "One leaves the mosque with the left foot first. Leaving the mosque one asks for 'fadl' — Allah's grace and provision — because outside the mosque is the marketplace of the world. The believer departs carrying the spiritual charge of salah into the material world.",
    reference: "Muslim 713, Ibn Majah 773",
  },

  // ── Wearing New Clothes ────────────────────────────────────────────────────

  {
    id: "clothes-1",
    subcategoryId: "wearing-clothes",
    categoryId: "daily-life",
    arabic: "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ أَسْأَلُكَ خَيْرَهُ وَخَيْرَ مَا صُنِعَ لَهُ وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ",
    transliteration: "Allahumma lakal-hamd, anta kasawtanihi, as'aluka khayrah wa khayra ma suni'a lah, wa a'udhu bika min sharrihi wa sharri ma suni'a lah",
    english: "O Allah, all praise is for You. You have clothed me with it. I ask You for its goodness and the goodness of what it has been made for. And I seek refuge with You from its evil and the evil of what it has been made for.",
    urdu: "اے اللہ! تمام تعریف تیرے لیے ہے، تو نے مجھے یہ پہنایا۔ میں اس کی بھلائی اور اس کی جس مقصد کے لیے بنایا گیا اس کی بھلائی مانگتا ہوں، اور اس کی برائی سے اور اس کے مقصد کی برائی سے پناہ مانگتا ہوں",
    explanation: "The Prophet ﷺ recited this dua whenever he put on a new garment. It acknowledges that clothing is a gift from Allah and asks that it serve good purposes. The Prophet ﷺ also recommended reciting it when putting on any new item and giving away the old one in charity.",
    reference: "Abu Dawud 4020, Tirmidhi 1767, Ibn Majah 3557",
  },

  // ── Looking in the Mirror ──────────────────────────────────────────────────

  {
    id: "mirror-1",
    subcategoryId: "looking-mirror",
    categoryId: "daily-life",
    arabic: "اللَّهُمَّ أَنْتَ حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
    transliteration: "Allahumma anta hassanta khalqi fa-hassin khuluqi",
    english: "O Allah, just as You have made my outward form beautiful, make my character beautiful too.",
    urdu: "اے اللہ! جس طرح تو نے میری ظاہری صورت اچھی بنائی ہے، ایسے ہی میرے اخلاق کو بھی اچھا بنا دے",
    explanation: "This dua captures a profound Islamic principle — that inner character (khuluq) matters far more than outer appearance (khalq). When looking in the mirror, the believer uses the moment to ask Allah to align the beauty of the soul with the gift of physical appearance.",
    reference: "Ahmad 3649, Ibn Hibban 959",
  },
  {
    id: "mirror-2",
    subcategoryId: "looking-mirror",
    categoryId: "daily-life",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي سَوَّى خَلْقِي فَعَدَلَهُ وَكَرَّمَ صُورَةَ وَجْهِي فَأَحْسَنَهَا وَجَعَلَنِي مِنَ الْمُسْلِمِينَ",
    transliteration: "Alhamdu lillahil ladhi sawwa khalqi fa'adalahu, wa karrrama surata wajhi fa-ahsanaha, wa ja'alani minal muslimin",
    english: "All praise is for Allah who proportioned my creation and made it right, honoured the form of my face and made it beautiful, and made me from the Muslims.",
    urdu: "تمام تعریف اللہ کے لیے جس نے میری خلقت کو درست کیا، میرے چہرے کی صورت کو عزت دی اور خوبصورت بنایا اور مجھے مسلمانوں میں سے بنایا",
    explanation: "This comprehensive dua of gratitude acknowledges three layers of divine gift: physical proportionality, facial beauty, and most importantly — being blessed with Islam. The Prophet ﷺ taught that being a Muslim is the greatest gift of all.",
    reference: "Ibn As-Sunnah 167",
  },

  // ── Before Salah ───────────────────────────────────────────────────────────

  {
    id: "salah-before-1",
    subcategoryId: "before-salah",
    categoryId: "prayer",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ",
    transliteration: "Subhanakal-lahumma wa bihamdika, wa tabarakas-muka, wa ta'ala jadduka, wa la ilaha ghairuk",
    english: "Glory and praise be to You, O Allah. Blessed be Your name, exalted be Your majesty, and there is no deity worthy of worship other than You.",
    urdu: "اے اللہ! تو پاک ہے اور تیری حمد ہے، تیرا نام بابرکت ہے، تیری شان بلند ہے اور تیرے سوا کوئی معبود نہیں",
    explanation: "This is the opening supplication (Istiftah) recited after the opening Takbir and before Al-Fatiha in Salah. It sets the tone of the entire prayer — a declaration of Allah's transcendence and the worshipper's complete submission. It was the most commonly reported opening dua of the Prophet ﷺ.",
    reference: "Abu Dawud 775, Tirmidhi 242, Ibn Majah 804",
  },
  {
    id: "salah-before-2",
    subcategoryId: "before-salah",
    categoryId: "prayer",
    arabic: "وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّمَاوَاتِ وَالْأَرْضَ حَنِيفًا وَمَا أَنَا مِنَ الْمُشْرِكِينَ",
    transliteration: "Wajjahtu wajhiya lillladhi fataras-samawati wal-arda hanifan wa ma ana minal mushrikin",
    english: "I have turned my face toward He who created the heavens and earth, as a true monotheist, and I am not of those who associate partners with Allah.",
    urdu: "میں نے اپنا چہرہ اس ذات کی طرف کر لیا جس نے آسمانوں اور زمین کو پیدا کیا، یکسوئی کے ساتھ اور میں مشرکوں میں سے نہیں",
    explanation: "This extended opening dua (Dua al-Istiftah) continues with a declaration of one's Salah, sacrifice, life, and death being for Allah alone (based on Al-An'am 6:162). The Prophet ﷺ would sometimes recite this version in his night prayers.",
    reference: "Muslim 771, Abu Dawud 760, Tirmidhi 3421",
  },

  // ── After Salah ────────────────────────────────────────────────────────────

  {
    id: "salah-after-1",
    subcategoryId: "after-salah",
    categoryId: "prayer",
    arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration: "Allahumma antas-salam wa minkas-salam, tabarakta ya dhal-jalali wal-ikram",
    english: "O Allah, You are Peace and from You is peace. Blessed are You, O Possessor of majesty and honour.",
    urdu: "اے اللہ! تو سلامتی ہے اور تجھی سے سلامتی ہے، بابرکت ہے تو اے جلال اور اکرام والے",
    explanation: "The first dhikr after completing Salah. 'As-Salam' is both one of Allah's names and the complete peace He bestows. The Prophet ﷺ would say Astaghfirullah three times after completing salah, then recite this dua. It opens the post-Salah adhkar.",
    reference: "Muslim 591, Abu Dawud 1512",
  },
  {
    id: "salah-after-2",
    subcategoryId: "after-salah",
    categoryId: "prayer",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul mulku walahul hamd wa huwa 'ala kulli shay'in qadir. Allahumma la mani'a lima a'tayta wa la mu'tiya lima mana'ta wa la yanfa'u dhal-jaddi minkal-jadd",
    english: "There is no deity worthy of worship except Allah, alone, without any partner. His is the dominion and His is the praise, and He is able to do all things. O Allah, there is none who can withhold what You give, and none who can give what You withhold, and the fortune of a person of fortune is of no avail against You.",
    urdu: "اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے کوئی شریک نہیں، اس کی بادشاہت ہے اور اسی کی حمد ہے اور وہ ہر چیز پر قادر ہے۔ اے اللہ! جو تو دے اسے کوئی روک نہیں سکتا اور جو تو روکے اسے کوئی دے نہیں سکتا",
    explanation: "One of the most comprehensive post-salah supplications, combining tawhid, praise, and acknowledgement of Allah's total control over every decree. The final clause teaches that no worldly status or wealth can override what Allah has decided.",
    reference: "Bukhari 844, Muslim 593",
  },

  // ── Qunoot ─────────────────────────────────────────────────────────────────

  {
    id: "qunoot-1",
    subcategoryId: "qunoot",
    categoryId: "prayer",
    arabic: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِي فِيمَنْ عَافَيْتَ وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ وَبَارِكْ لِي فِيمَا أَعْطَيْتَ وَقِنِي شَرَّ مَا قَضَيْتَ فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ وَلَا يَعِزُّ مَنْ عَادَيْتَ تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ",
    transliteration: "Allahumma-hdini fiman hadayt, wa 'afini fiman 'afayt, wa tawallani fiman tawallayt, wa barik li fima a'tayt, wa qini sharra ma qadayt, fa innaka taqdi wa la yuqda 'alayk, wa innahu la yadhillu man walayt, wa la ya'izzu man 'adayt, tabarakta Rabbana wa ta'alayt",
    english: "O Allah, guide me among those You have guided, pardon me among those You have pardoned, befriend me among those You have befriended, bless me in what You have given me, and protect me from the evil of what You have decreed. For indeed You decree and nothing is decreed over You, and he is not humiliated whom You have befriended, nor is he honoured whom You have taken as an enemy. Blessed are You, our Lord, and Exalted.",
    urdu: "اے اللہ! مجھے ہدایت دے ان لوگوں میں جنہیں تو نے ہدایت دی، مجھے عافیت دے ان میں جنہیں تو نے عافیت دی، میری دوستی رکھ ان میں جن کی تو نے دوستی رکھی، جو تو نے دیا اس میں برکت دے، اور جو تو نے فیصلہ کیا اس کی برائی سے بچا",
    explanation: "This is Dua al-Qunoot, taught by the Prophet ﷺ to al-Hasan ibn Ali. It is recited in Witr prayer after ruku' in the last rak'ah. Many scholars consider it sunnah in Witr and recommend it in Fajr during calamities. It is one of the most comprehensive duas in the Sunnah.",
    reference: "Abu Dawud 1425, Tirmidhi 464, Nasa'i 1745",
  },

  // ── Istikhara ──────────────────────────────────────────────────────────────

  {
    id: "istikhara-1",
    subcategoryId: "istikhara",
    categoryId: "prayer",
    arabic: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ وَتَعْلَمُ وَلَا أَعْلَمُ وَأَنْتَ عَلَّامُ الْغُيُوبِ اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِي الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ",
    transliteration: "Allahumma inni astakhiruka bi'ilmika, wa astaqdiruka biqudratika, wa as'aluka min fadlikal-'adhim. Fa'innaka taqdiru wa la aqdiru, wa ta'lamu wa la a'lamu, wa anta 'allamul ghuyub. Allahumma in kunta ta'lamu anna hadhal-amra (mention the matter) khayrun li fi dini wa ma'ashi wa 'aqibati amri, faqdurhu li wa yassirhu li thumma barik li fih. Wa in kunta ta'lamu anna hadhal-amra sharrun li fi dini wa ma'ashi wa 'aqibati amri, fasrifhu 'anni wasrifni 'anhu, waqdur liyal-khayra haythu kana thumma ardini bih",
    english: "O Allah, I seek Your guidance by Your knowledge, and I seek Your power by Your power, and I ask You from Your great bounty. You have power, I have none. And You know, I do not know. You are the Knower of the unseen. O Allah, if in Your knowledge this matter (mention it) is good for me in my religion, livelihood, and in the consequence of my affairs, then ordain it for me, facilitate it for me, and bless me in it. But if in Your knowledge this matter is evil for me in my religion, livelihood, and the consequence of my affairs, then turn it away from me, turn me away from it, and ordain for me whatever is good wherever it is, and then make me pleased with it.",
    urdu: "اے اللہ! میں تیرے علم کے ذریعے تجھ سے خیر مانگتا ہوں اور تیری قدرت کے ذریعے تجھ سے طاقت مانگتا ہوں اور تجھ سے تیرے عظیم فضل کا سوال کرتا ہوں۔ تو قادر ہے اور میں قادر نہیں، تو جانتا ہے اور میں نہیں جانتا۔ اے اللہ! اگر تو جانتا ہے کہ یہ معاملہ میرے دین، معاش اور انجام کے اعتبار سے بہتر ہے تو اسے میرے لیے مقدر کر اور آسان بنا اور اس میں برکت دے۔ اور اگر برا ہے تو اسے مجھ سے پھیر دے اور مجھے اس سے پھیر دے",
    explanation: "Salat al-Istikhara is two voluntary rak'ahs followed by this dua, mentioning the specific matter in mind where it says 'this matter.' The Prophet ﷺ taught this to his Companions as he taught Surahs from the Quran. After making Istikhara, one should proceed with what becomes easiest, not wait for a dream.",
    reference: "Bukhari 1166, Abu Dawud 1538, Tirmidhi 480",
  },

  // ── Beginning a Journey ────────────────────────────────────────────────────

  {
    id: "travel-begin-1",
    subcategoryId: "beginning-journey",
    categoryId: "travel",
    arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ وَالْخَلِيفَةُ فِي الْأَهْلِ",
    transliteration: "Allahumma inna nas'aluka fi safarina hadhal birra wat-taqwa, wa minal 'amali ma tarda. Allahumma hawwin 'alayna safarana hadha watwi 'anna bu'dah. Allahumma antas-sahibu fis-safari wal-khalifatu fil-ahl",
    english: "O Allah, we ask You on this journey for righteousness and piety, and for deeds that are pleasing to You. O Allah, make this journey easy for us and fold up the distance for us. O Allah, You are the Companion on the journey and the Guardian of the family.",
    urdu: "اے اللہ! ہم اس سفر میں تجھ سے نیکی، تقویٰ اور پسندیدہ اعمال مانگتے ہیں۔ اے اللہ! ہمارے لیے یہ سفر آسان کر دے اور اس کی دوری لپیٹ دے۔ اے اللہ! تو سفر میں ساتھی ہے اور گھر میں نگہبان",
    explanation: "The Prophet ﷺ would recite this dua at the beginning of every journey and was also reported to say 'Subhanallah' three times upon mounting, then recite the verse of Al-Zukhruf (43:13-14). He would also say 'Allahumma inni a'udhu bika min wa'that as-safar' — seeking protection from the hardships of travel.",
    reference: "Muslim 1342, Tirmidhi 3438",
  },

  // ── Boarding a Vehicle ─────────────────────────────────────────────────────

  {
    id: "vehicle-1",
    subcategoryId: "boarding-vehicle",
    categoryId: "travel",
    arabic: "بِسْمِ اللَّهِ وَالْحَمْدُ لِلَّهِ سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Bismillah walhamdu lillah. Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun",
    english: "In the name of Allah and praise be to Allah. Glory be to the One who has subjected this to us, for we could not have done so ourselves. And indeed to our Lord, we will return.",
    urdu: "اللہ کے نام کے ساتھ اور اللہ کی تعریف ہے۔ پاک ہے وہ ذات جس نے یہ ہمارے لیے مسخر کر دیا ورنہ ہم اسے قابو میں نہیں کر سکتے تھے اور بے شک ہم اپنے رب کی طرف لوٹنے والے ہیں",
    explanation: "This dua is drawn from Quran 43:13-14 (Surah Az-Zukhruf). The Prophet ﷺ recommended reciting it upon mounting any conveyance. It reminds the traveller that the vehicle, the road, and the ability to travel are all gifts from Allah — not products of human power alone.",
    reference: "Abu Dawud 2602, Tirmidhi 3446",
  },

  // ── Returning Home ─────────────────────────────────────────────────────────

  {
    id: "return-1",
    subcategoryId: "returning-home",
    categoryId: "travel",
    arabic: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ",
    transliteration: "Ayibuna, ta'ibuna, 'abiduna, li-Rabbina hamidun",
    english: "We are returning, repenting, worshipping, and praising our Lord.",
    urdu: "ہم لوٹنے والے ہیں، توبہ کرنے والے، عبادت کرنے والے، اپنے رب کی حمد کرنے والے",
    explanation: "The Prophet ﷺ would say this supplication at the end of every journey. Travel is an experience of awe and encounter with the world; returning home with gratitude, repentance, and worship brings the spiritual lessons of the journey back into daily life.",
    reference: "Bukhari 1797, Muslim 1345",
  },

  // ── During Rain ────────────────────────────────────────────────────────────

  {
    id: "rain-1",
    subcategoryId: "during-rain",
    categoryId: "travel",
    arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا",
    transliteration: "Allahumma sayyiban nafi'a",
    english: "O Allah, may it be a beneficial rain.",
    urdu: "اے اللہ! اسے نفع بخش بارش بنا",
    explanation: "This concise dua was the Prophet's ﷺ prayer when it rained. Rain is one of Allah's greatest signs and a mercy from the sky. The Prophet ﷺ would also put his garment in the rain, saying: 'It has recently come from its Lord.' He would also uncover part of his body to receive the blessed rain.",
    reference: "Bukhari 1032",
  },
  {
    id: "rain-2",
    subcategoryId: "during-rain",
    categoryId: "travel",
    arabic: "مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ",
    transliteration: "Mutirna bifadlillahi wa rahmatih",
    english: "We have been given rain by the grace of Allah and His mercy.",
    urdu: "ہیں پر اللہ کے فضل اور رحمت سے بارش ہوئی",
    explanation: "Said after rain, this supplication attributes the blessing of rain entirely to Allah. It contrasts with the statement of those who attribute rain to stars or natural cycles, declaring that rain is Allah's direct mercy and grace, not a mere meteorological event.",
    reference: "Bukhari 846, Muslim 71",
  },

  // ── During Storms ──────────────────────────────────────────────────────────

  {
    id: "storm-1",
    subcategoryId: "during-storms",
    categoryId: "travel",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا فِيهَا وَخَيْرَ مَا أُرْسِلَتْ بِهِ وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا وَشَرِّ مَا أُرْسِلَتْ بِهِ",
    transliteration: "Allahumma inni as'aluka khayraha wa khayra ma fiha wa khayra ma ursilat bih, wa a'udhu bika min sharriha wa sharri ma fiha wa sharri ma ursilat bih",
    english: "O Allah, I ask You for the good in it, the good of what is in it, and the good of what it is sent with; and I seek refuge in You from the evil in it, the evil of what is in it, and the evil of what it is sent with.",
    urdu: "اے اللہ! میں اس کی بھلائی مانگتا ہوں، اس میں جو ہے اس کی بھلائی اور جو اس کے ساتھ بھیجا گیا اس کی بھلائی۔ اور اس کی برائی سے پناہ مانگتا ہوں",
    explanation: "The Prophet ﷺ would become serious and his complexion would change when winds or storms came. He would recite this supplication, fearing the storm might be a punishment and hoping it would be a mercy. Sunnah also includes reciting Al-Ikhlas, Al-Falaq, and An-Nas during storms.",
    reference: "Muslim 899, Abu Dawud 5097",
  },

  // ── Dua for Sickness ───────────────────────────────────────────────────────

  {
    id: "sick-1",
    subcategoryId: "dua-sickness",
    categoryId: "health-protection",
    arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا",
    transliteration: "Allahumma Rabban-nas, adhhibil-ba's, ishfi antas-Shafi, la shifa'a illa shifa'uka shifa'an la yughadiru saqama",
    english: "O Allah, Lord of mankind, remove this affliction. Heal, for You are the Healer. There is no healing except Your healing — a healing that leaves no sickness behind.",
    urdu: "اے اللہ! لوگوں کے رب! تکلیف دور فرما، شفا دے، تو ہی شفا دینے والا ہے، تیری شفا کے سوا کوئی شفا نہیں، ایسی شفا جو کوئی بیماری نہ چھوڑے",
    explanation: "The Prophet ﷺ would recite this dua while performing ruqyah on the sick. It contains one of Allah's names, As-Shafi (The Healer). The phrase 'no healing but Yours' is a declaration of tawakkul (reliance on Allah) — accepting that medicine helps, but only Allah truly heals.",
    reference: "Bukhari 5675, Muslim 2191",
  },
  {
    id: "sick-2",
    subcategoryId: "dua-sickness",
    categoryId: "health-protection",
    arabic: "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ",
    transliteration: "As'alullahel 'adhima Rabbal 'arshil 'adhimi an yashfiyak",
    english: "I ask Allah the Magnificent, Lord of the Magnificent Throne, to cure you.",
    urdu: "میں عظیم اللہ سے جو عرش عظیم کا رب ہے، سوال کرتا ہوں کہ وہ تجھے شفا دے",
    explanation: "The Prophet ﷺ said: 'Whoever visits a sick person who is not yet dying and says this seven times, Allah will heal him of that illness.' This dua combines two of Allah's greatest attributes — His magnificence and His lordship over the throne — to petition for the most complete healing.",
    reference: "Abu Dawud 3106, Tirmidhi 2083",
  },

  // ── Visiting the Sick ──────────────────────────────────────────────────────

  {
    id: "visit-sick-1",
    subcategoryId: "visiting-sick",
    categoryId: "health-protection",
    arabic: "لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ",
    transliteration: "La ba's, tahurun in sha'Allah",
    english: "Do not worry. It is a purification, if Allah wills.",
    urdu: "گھبراؤ نہیں، یہ پاکیزگی ہے ان شاءاللہ",
    explanation: "When visiting the sick, the Prophet ﷺ would say this to comfort them. 'Tahur' (purification) means the illness expiates sins. Every pain, sickness, and difficulty a believer experiences — even a prick of a thorn — is used by Allah to purify them and raise their rank.",
    reference: "Bukhari 5656",
  },

  // ── Protection from Evil Eye ───────────────────────────────────────────────

  {
    id: "evil-eye-1",
    subcategoryId: "evil-eye",
    categoryId: "health-protection",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
    transliteration: "A'udhu bikalimati-llahit-tammati min kulli shaytanin wa hammatin wa min kulli 'aynin lammah",
    english: "I seek refuge in the perfect words of Allah from every devil and every poisonous creature and from every evil eye.",
    urdu: "میں اللہ کے کامل کلمات کی پناہ مانگتا ہوں ہر شیطان سے، ہر زہریلے جانور سے اور ہر لگنے والی نظر سے",
    explanation: "The Prophet ﷺ used to seek Allah's protection for al-Hasan and al-Husayn using this very formula, saying: 'Your forefather (Ibrahim) used to recite this for Ismail and Ishaaq.' Scholars recommend saying it for children and oneself as a protection against the evil eye.",
    reference: "Bukhari 3371, Abu Dawud 4737",
  },
  {
    id: "evil-eye-2",
    subcategoryId: "evil-eye",
    categoryId: "health-protection",
    arabic: "بِسْمِ اللَّهِ أَرْقِيكَ مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ اللَّهُ يَشْفِيكَ بِسْمِ اللَّهِ أَرْقِيكَ",
    transliteration: "Bismillahi arqika min kulli shay'in yu'dhika, min sharri kulli nafsin aw 'ayni hasidin, Allahu yashfika, bismillahi arqika",
    english: "In the name of Allah I perform ruqyah on you, from everything that harms you, from the evil of every soul or envious eye. May Allah heal you. In the name of Allah I perform ruqyah on you.",
    urdu: "اللہ کے نام کے ساتھ تجھ پر دم کرتا ہوں ہر اس چیز سے جو تجھے تکلیف دے، ہر نفس کی یا حسد کرنے والی آنکھ کی برائی سے، اللہ تجھے شفا دے",
    explanation: "Jibril performed this ruqyah on the Prophet ﷺ when he was ill, saying 'Bismillahi arqika' three times followed by 'min kulli shay'in yu'dhika.' This is an authorised formula for ruqyah (Islamic healing recitation) against the evil eye and other spiritual harm.",
    reference: "Muslim 2186",
  },

  // ── Protection from Shaytan ────────────────────────────────────────────────

  {
    id: "shaytan-1",
    subcategoryId: "shaytan-protect",
    categoryId: "health-protection",
    arabic: "أَعُوذُ بِاللَّهِ السَّمِيعِ الْعَلِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ مِنْ هَمْزِهِ وَنَفْخِهِ وَنَفْثِهِ",
    transliteration: "A'udhu billahis-sami'il-'alimi minash-shaytanir-rajim, min hamzihi wa nafkhihi wa nafthih",
    english: "I seek refuge in Allah, the All-Hearing, the All-Knowing, from the accursed Shaytan — from his incitement to madness, his pride, and his poetry.",
    urdu: "میں سننے والے اور جاننے والے اللہ کی پناہ مانگتا ہوں مردود شیطان سے، اس کے وسوسے سے، اس کے تکبر سے اور اس کے شاعری والے وساوس سے",
    explanation: "Recited when beginning Salah after the Takbir in some narrations, and also recommended before reading Quran (as commanded in An-Nahl 16:98). 'Hamz' refers to madness or seizure, 'nafkh' to arrogance, and 'nafth' to the harmful effects of poetry that Shaytan inspires.",
    reference: "Abu Dawud 775, Ibn Majah 807",
  },

  // ── Protection Before Sleeping ─────────────────────────────────────────────

  {
    id: "sleep-protect-1",
    subcategoryId: "sleeping-protect",
    categoryId: "health-protection",
    arabic: "اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا لَكَ مَمَاتُهَا وَمَحْيَاهَا إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ",
    transliteration: "Allahumma innaka khalaqta nafsi wa anta tawaffaha, laka mmamatuha wa mahyaha, in ahyaytaha fahfadha, wa in amattaha faghfir laha. Allahumma inni as'alukal-'afiyah",
    english: "O Allah, You have created my soul and You take it away. Its death and its life belong to You. If You let it live, then guard it. If You cause it to die, then forgive it. O Allah, I ask You for good health.",
    urdu: "اے اللہ! تو نے میری جان بنائی اور تو ہی اسے فوت کرے گا، اس کی موت اور زندگی تیرے لیے ہے، اگر تو اسے زندہ رکھے تو اس کی حفاظت فرما اور اگر فوت کر دے تو اسے بخش دے۔ اے اللہ! میں تجھ سے عافیت مانگتا ہوں",
    explanation: "The Prophet ﷺ would recite this dua before sleeping. It beautifully connects the act of sleeping to life and death — surrendering both to Allah's will and seeking His protection in both states. The final request for 'afiyah (complete wellbeing) is comprehensive, covering body, mind, and spirit.",
    reference: "Muslim 2712",
  },

  // ── Protection for Children ────────────────────────────────────────────────

  {
    id: "child-protect-1",
    subcategoryId: "child-protection",
    categoryId: "health-protection",
    arabic: "أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
    transliteration: "U'idhukuma bikalimati-llahit-tammati min kulli shaytanin wa hammatin wa min kulli 'aynin lammah",
    english: "I seek Allah's protection for both of you with His perfect words, from every devil and every poisonous creature and from every evil eye.",
    urdu: "میں تم دونوں کو اللہ کے کامل کلمات کی پناہ میں دیتا ہوں ہر شیطان سے، ہر زہریلے جانور سے اور ہر لگنے والی نظر سے",
    explanation: "This is the very same formula with which Ibrahim (AS) used to seek protection for Ismail and Ishaaq, and with which the Prophet ﷺ protected al-Hasan and al-Husayn. The word 'ukuma' (for two) can be changed to 'uka' (for one) or 'ukum' (for many). Recite over children morning and evening.",
    reference: "Bukhari 3371",
  },

  // ── Sayyidul Istighfar ─────────────────────────────────────────────────────

  {
    id: "sayyidul-1",
    subcategoryId: "sayyidul-istighfar",
    categoryId: "forgiveness",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration: "Allahumma anta Rabbi la ilaha illa ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't. A'udhu bika min sharri ma sana't, abu'u laka bini'matika 'alayya wa abu'u laka bidhanbi faghfir li fa'innahu la yaghfirudh-dhunuba illa ant",
    english: "O Allah, You are my Lord, there is no deity worthy of worship except You. You created me and I am Your slave. I am on Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge before You Your blessings upon me and I acknowledge my sin before You, so forgive me, for indeed there is none who forgives sins except You.",
    urdu: "اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود نہیں، تو نے مجھے بنایا اور میں تیرا بندہ ہوں، اور میں جتنا ہو سکے تیرے عہد اور وعدے پر ہوں۔ تیری پناہ مانگتا ہوں اس بدی سے جو میں نے کی، اپنے اوپر تیری نعمتوں کا اقرار کرتا ہوں اور اپنے گناہ کا اعتراف کرتا ہوں، پس مجھے بخش دے کیونکہ گناہ تیرے سوا کوئی نہیں بخش سکتا",
    explanation: "The Master of Istighfar (Sayyid al-Istighfar). The Prophet ﷺ said: 'Whoever says this with certainty in the morning and dies during the day before evening will be among the people of Paradise. And whoever says it with certainty in the evening and dies during the night will be among the people of Paradise.' It contains all pillars of tawbah.",
    reference: "Bukhari 6306",
  },

  // ── Common Istighfar ───────────────────────────────────────────────────────

  {
    id: "istighfar-1",
    subcategoryId: "common-istighfar",
    categoryId: "forgiveness",
    arabic: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullahallladhi la ilaha illa huwal-hayyul-qayyumu wa atubu ilayh",
    english: "I seek forgiveness from Allah, there is no deity worthy of worship except Him, the Ever-Living, the Self-Sustaining, and I repent to Him.",
    urdu: "میں اللہ سے بخشش مانگتا ہوں جس کے سوا کوئی معبود نہیں، جو ہمیشہ زندہ اور قائم رہنے والا ہے اور اسی کی طرف توبہ کرتا ہوں",
    explanation: "The Prophet ﷺ said: 'Whoever says this, even if he has committed sins as numerous as the foam of the ocean, they will be forgiven.' The power of this formula lies in its combination: the act of seeking forgiveness paired with the affirmation of the two most comprehensive names of Allah — Al-Hayy (The Ever-Living) and Al-Qayyum (The Self-Sustaining).",
    reference: "Abu Dawud 1517, Tirmidhi 3577, Hakim",
  },
  {
    id: "istighfar-2",
    subcategoryId: "common-istighfar",
    categoryId: "forgiveness",
    arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
    transliteration: "Rabbighfir li wa tub 'alayya, innaka antat-tawwabur-rahim",
    english: "My Lord, forgive me and accept my repentance. Indeed, You are the Accepter of Repentance, the Most Merciful.",
    urdu: "میرے رب! مجھے بخش دے اور میری توبہ قبول کر، بے شک تو توبہ قبول کرنے والا، رحم کرنے والا ہے",
    explanation: "The Prophet ﷺ would say this one hundred times in a single sitting. The name 'At-Tawwab' means the One who constantly turns toward His servants in forgiveness, not just once but continuously. Paired with 'Ar-Raheem', this supplication is a profound appeal to Allah's two doors of mercy: acceptance and compassion.",
    reference: "Abu Dawud 1516, Ibn Majah 3814, Tirmidhi 3434",
  },

  // ── Repentance Duas ────────────────────────────────────────────────────────

  {
    id: "repent-1",
    subcategoryId: "repentance",
    categoryId: "forgiveness",
    arabic: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
    transliteration: "Allahumma inni dhalamtu nafsi dhulman kathiran wa la yaghfirudh-dhunuba illa anta, faghfir li maghfiratan min 'indika warhamni, innaka antal-ghafurur-rahim",
    english: "O Allah, I have greatly wronged myself and none but You forgives sins, so forgive me with forgiveness from You, and have mercy on me. Indeed, You are the Oft-Forgiving, the Most Merciful.",
    urdu: "اے اللہ! میں نے اپنے آپ پر بہت ظلم کیا اور گناہ تیرے سوا کوئی نہیں بخشتا، پس اپنے پاس سے مغفرت بخش اور مجھ پر رحم کر، بے شک تو بخشنے والا مہربان ہے",
    explanation: "Ali ibn Abi Talib narrated that the Prophet ﷺ was asked about the best supplication and he gave this. It was Abu Bakr as-Siddiq's favourite supplication. It contains a complete acknowledgement of sin without making excuses, combined with certainty in Allah's exclusive power to forgive.",
    reference: "Bukhari 834, Muslim 2705",
  },
  {
    id: "repent-2",
    subcategoryId: "repentance",
    categoryId: "forgiveness",
    arabic: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    transliteration: "Rabbana dhalamna anfusana wa in lam taghfir lana wa tarhamna lanakunanna minal-khashirin",
    english: "Our Lord! We have wronged ourselves. If You forgive us not and have not mercy on us, we shall most certainly be of the losers.",
    urdu: "اے ہمارے رب! ہم نے اپنے آپ پر ظلم کیا اور اگر تو نے ہمیں نہ بخشا اور رحم نہ کیا تو ہم یقیناً نقصان اٹھانے والوں میں سے ہوں گے",
    explanation: "This is the dua of Adam and Hawa (peace be upon them) after they descended from Paradise. Allah accepted it and forgave them (Quran 2:37). The Quran preserved it for all believers to use. It is a raw, honest prayer acknowledging wrongdoing with no attempt to justify, while appealing to Allah's mercy.",
    reference: "Quran 7:23",
  },

  // ── Rizq ───────────────────────────────────────────────────────────────────

  {
    id: "rizq-1",
    subcategoryId: "rizq",
    categoryId: "rizq-success",
    arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
    transliteration: "Allahumma-kfini bihalaalika 'an haramika wa aghnini bifadlika 'amman siwak",
    english: "O Allah, suffice me with what You have permitted, as opposed to what You have forbidden, and make me independent of all others besides You through Your bounty.",
    urdu: "اے اللہ! مجھے حلال سے حرام سے بے نیاز کر دے اور اپنے فضل سے مجھے تیرے سوا دوسروں سے بے نیاز کر دے",
    explanation: "Ali ibn Abi Talib narrated that a man in debt came to him and he said: 'Shall I not teach you words that the Messenger of Allah taught me? If you say them, Allah will repay your debt even if it is as great as a mountain.' He then taught him this supplication. It asks for self-sufficiency from halal, and freedom from depending on any creature.",
    reference: "Tirmidhi 3563, Ahmad",
  },
  {
    id: "rizq-2",
    subcategoryId: "rizq",
    categoryId: "rizq-success",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ رِزْقًا طَيِّبًا وَعِلْمًا نَافِعًا وَعَمَلًا مُتَقَبَّلًا",
    transliteration: "Allahumma inni as'aluka rizqan tayyiban wa 'ilman nafi'an wa 'amalan mutaqabbala",
    english: "O Allah, I ask You for good provision, beneficial knowledge, and accepted deeds.",
    urdu: "اے اللہ! میں تجھ سے پاکیزہ رزق، نفع بخش علم اور قبول ہونے والے اعمال مانگتا ہوں",
    explanation: "This dua is commonly recited after the Fajr prayer and encompasses three of the greatest needs of a believer: halal and good provision for the body, knowledge that benefits this life and the next, and deeds that are accepted by Allah — because an unaccepted deed is no deed at all.",
    reference: "Ibn Majah 925, Ahmad",
  },

  // ── Debt ───────────────────────────────────────────────────────────────────

  {
    id: "debt-1",
    subcategoryId: "debt",
    categoryId: "rizq-success",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubni, wa dhala'id-dayni wa ghalabaatir-rijal",
    english: "O Allah, I seek refuge in You from grief and sadness, from weakness and laziness, from miserliness and cowardice, from the burden of debts and from being overpowered by men.",
    urdu: "اے اللہ! میں تیری پناہ مانگتا ہوں فکر اور غم سے، عاجزی اور سستی سے، بخل اور بزدلی سے، قرض کے بوجھ سے اور لوگوں کے غلبے سے",
    explanation: "A comprehensive dua the Prophet ﷺ made frequently. 'Dhala' ad-dayn' literally means being bent or crushed by debt — a powerful image. This supplication covers eight of life's most debilitating conditions. The Prophet ﷺ sought refuge from debt specifically because it consumes the night in worry and the day in humiliation.",
    reference: "Bukhari 6363, Abu Dawud 1555",
  },

  // ── Anxiety ────────────────────────────────────────────────────────────────

  {
    id: "anxiety-1",
    subcategoryId: "anxiety",
    categoryId: "rizq-success",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal wakil",
    english: "Allah is sufficient for us and He is the best Disposer of affairs.",
    urdu: "اللہ ہمارے لیے کافی ہے اور وہ بہترین کارساز ہے",
    explanation: "This was the exact statement of Ibrahim (AS) when he was thrown into fire, and the statement of the believers when told their enemies were gathering against them. Both were expressions of absolute reliance on Allah when faced with overwhelming fear. The result for Ibrahim was that the fire became 'cool and safe.' (Quran 21:69, 3:173)",
    reference: "Bukhari 4563, Quran 3:173",
  },

  // ── Stress ─────────────────────────────────────────────────────────────────

  {
    id: "stress-1",
    subcategoryId: "stress",
    categoryId: "rizq-success",
    arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minadh-dhalimin",
    english: "There is no deity worthy of worship except You. Glory be to You. Indeed, I have been of the wrongdoers.",
    urdu: "تیرے سوا کوئی معبود نہیں، تو پاک ہے، بے شک میں ظالموں میں سے تھا",
    explanation: "This is the Dua of Yunus (Dhun-Nun), said from within the belly of the whale when he was in his darkest moment. Allah says in the Quran (21:88): 'We responded to him and saved him from distress.' The Prophet ﷺ said: 'No Muslim ever calls upon Allah with these words in any matter except that Allah responds to him.' A proven remedy for stress and distress.",
    reference: "Quran 21:87, Tirmidhi 3505",
  },

  // ── Sadness ────────────────────────────────────────────────────────────────

  {
    id: "sadness-1",
    subcategoryId: "sadness",
    categoryId: "rizq-success",
    arabic: "اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ نَاصِيَتِي بِيَدِكَ مَاضٍ فِيَّ حُكْمُكَ عَدْلٌ فِيَّ قَضَاؤُكَ أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي وَنُورَ صَدْرِي وَجِلَاءَ حُزْنِي وَذَهَابَ هَمِّي",
    transliteration: "Allahumma inni 'abduka wabnu 'abdika wabnu amatika, nasiyati biyadika, madin fiyya hukmuka, 'adlun fiyya qada'uka. As'aluka bikulli-smin huwa lak, sammayta bihi nafsaka aw anzaltahu fi kitabika aw 'allamtahu ahadan min khalqika awista'tharta bihi fi 'ilmil ghaybi 'indaka an taj'alal Qur'ana rabi'a qalbi wa nura sadri wa jala'a huzni wa dhahaba hammi",
    english: "O Allah, I am Your slave, son of Your slave, son of Your maidservant. My forelock is in Your hand. Your judgement upon me is assured and Your decree concerning me is just. I ask You by every name that belongs to You with which You named Yourself, or which You revealed in Your book, or which You taught to any of Your creation, or which You have preserved in the knowledge of the unseen — make the Quran the spring of my heart, the light of my chest, the banisher of my sadness, and the reliever of my distress.",
    urdu: "اے اللہ! میں تیرا بندہ ہوں، تیرے بندے کا بیٹا، تیری باندی کا بیٹا، میری پیشانی تیرے ہاتھ میں ہے، مجھ پر تیرا فیصلہ نافذ ہوتا ہے، مجھ میں تیرا قضاء عادل ہے۔ میں ہر اس نام کے ذریعے سوال کرتا ہوں جو تیرا ہے...",
    explanation: "The Prophet ﷺ said about this supplication: 'There is no one afflicted with anxiety and grief who says this except that Allah will remove his anxiety and grief, and replace them with happiness.' When asked if one should learn it, he said: 'Yes, anyone who hears it should learn it.' It is one of the most powerful duas for emotional healing in Islam.",
    reference: "Ahmad 3712, Ibn Hibban 972",
  },

  // ── Knowledge ──────────────────────────────────────────────────────────────

  {
    id: "knowledge-1",
    subcategoryId: "knowledge",
    categoryId: "rizq-success",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma",
    english: "My Lord, increase me in knowledge.",
    urdu: "میرے رب! مجھے علم میں اضافہ کر",
    explanation: "The only dua where Allah directly commanded His Prophet to ask for 'more.' (Quran 20:114). This short dua encapsulates the Islamic spirit of seeking knowledge as a lifelong act of worship. Unlike wealth or health, one can never have 'too much' knowledge, so there is no limit to what one may ask for.",
    reference: "Quran 20:114",
  },
  {
    id: "knowledge-2",
    subcategoryId: "knowledge",
    categoryId: "rizq-success",
    arabic: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي وَزِدْنِي عِلْمًا وَالْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ",
    transliteration: "Allahumma-nfa'ni bima 'allamtani wa 'allimni ma yanfa'uni wa zidni 'ilma, walhamdu lillahi 'ala kulli hal",
    english: "O Allah, benefit me with what You have taught me, teach me what will benefit me, increase me in knowledge, and all praise is for Allah in every circumstance.",
    urdu: "اے اللہ! جو تو نے مجھے سکھایا اس سے مجھے فائدہ دے، اور مجھے وہ سکھا جو مجھے نفع دے اور علم میں اضافہ فرما اور ہر حال میں اللہ کی حمد ہے",
    explanation: "This supplication was taught by the Prophet ﷺ and addresses three stages of knowledge: using what one already knows, learning what is beneficial, and continuing to grow. 'Beneficial knowledge' is a key Islamic concept — knowledge is only truly valuable when it draws one closer to Allah and serves creation.",
    reference: "Ibn Majah 251, Tirmidhi 3599",
  },

  // ── Guidance ───────────────────────────────────────────────────────────────

  {
    id: "guidance-1",
    subcategoryId: "guidance",
    categoryId: "rizq-success",
    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    transliteration: "Ihdinas-siratal mustaqim, siratallladhina an'amta 'alayhim, ghayril-maghdubi 'alayhim wa lad-dallin",
    english: "Guide us to the straight path — the path of those You have blessed, not of those who have incurred anger upon them, nor of those who are astray.",
    urdu: "ہمیں سیدھی راہ دکھا، ان لوگوں کی راہ جن پر تو نے انعام کیا، نہ ان کی جن پر غضب ہوا اور نہ ان کی جو راہ بھٹک گئے",
    explanation: "The most recited dua in existence — every Muslim recites it at least 17 times daily in their obligatory prayers. Yet it remains the most fundamental request: guidance to the straight path. The Prophet ﷺ identified this as Surah Al-Fatiha and said: 'No prayer is valid without it.' Allah responds to each verse as the believer recites.",
    reference: "Quran 1:6-7, Bukhari, Muslim",
  },

  // ── Ease in Difficulties ───────────────────────────────────────────────────

  {
    id: "ease-1",
    subcategoryId: "ease-difficulty",
    categoryId: "rizq-success",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي",
    transliteration: "Rabbish-rahli sadri wa yassir li amri wahlul 'uqdatan min lisani yafqahu qawli",
    english: "My Lord, expand for me my breast [with assurance], ease for me my task, and untie the knot from my tongue so that they may understand my speech.",
    urdu: "میرے رب! میرے سینے کو کھول دے، میرے کام کو آسان کر دے اور میری زبان کی گرہ کھول دے تاکہ لوگ میری بات سمجھ سکیں",
    explanation: "The supplication of Musa (AS) before meeting Pharaoh — one of the most daunting tasks any human has undertaken. He asked for three things: an open heart (to receive guidance and courage), ease in the task (practical help), and clarity of speech (to convey the message). These are the essentials for facing any great challenge.",
    reference: "Quran 20:25-28",
  },
  {
    id: "ease-2",
    subcategoryId: "ease-difficulty",
    categoryId: "rizq-success",
    arabic: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
    transliteration: "Allahumma la sahla illa ma ja'altahu sahlan, wa anta taj'alul hazna idha shi'ta sahla",
    english: "O Allah, nothing is easy except what You make easy, and You make the difficult easy when You will.",
    urdu: "اے اللہ! کوئی چیز آسان نہیں مگر جسے تو آسان کرے، اور تو مشکل کو بھی آسان کر دیتا ہے جب چاہے",
    explanation: "This is a dua that reframes difficulty itself. 'Nothing is easy except what You make easy' means that the hardest mountain is negotiable with Allah's help, and the 'easy' path without His help is no path at all. It is recommended when facing any difficult situation or decision.",
    reference: "Ibn Hibban 974, Ibn As-Sunnah 353",
  },

  // ── Success in Exams ───────────────────────────────────────────────────────

  {
    id: "exam-1",
    subcategoryId: "exam-success",
    categoryId: "rizq-success",
    arabic: "رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا",
    transliteration: "Rabbi zidni 'ilman warzuqni fahma",
    english: "My Lord, increase me in knowledge and grant me understanding.",
    urdu: "میرے رب! علم میں اضافہ کر اور مجھے سمجھ عطا فرما",
    explanation: "Knowledge and understanding (fahm) are two distinct gifts. A person can memorise vast amounts of information yet lack the deep comprehension that makes knowledge truly useful. This dua asks for both — the raw material of facts and the intelligence to understand them. Recite before studying and before an exam.",
    reference: "Adapted from Quran 20:114, Scholars' consensus",
  },

  // ── Business Success ───────────────────────────────────────────────────────

  {
    id: "business-1",
    subcategoryId: "business-success",
    categoryId: "rizq-success",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
    transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhirah",
    english: "O Allah, I ask You for pardon and well-being in this world and in the Hereafter.",
    urdu: "اے اللہ! میں تجھ سے دنیا اور آخرت میں معافی اور عافیت مانگتا ہوں",
    explanation: "The Prophet ﷺ said: 'No one has ever been given anything better than good health and well-being.' 'Afiyah encompasses safety, health, freedom from worry, and protection from all harm — it is the foundation upon which any successful endeavour rests. Said regularly in business, it invites divine protection over one's dealings.",
    reference: "Ibn Majah 3850, Ahmad",
  },

  // ── Parents ────────────────────────────────────────────────────────────────

  {
    id: "parents-1",
    subcategoryId: "parents",
    categoryId: "family",
    arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbighfir li wa liwaalidayya, Rabbir-hamhuma kama rabbayani sagheera",
    english: "My Lord, forgive me and my parents, and have mercy upon them as they raised me when I was young.",
    urdu: "میرے رب! مجھے اور میرے والدین کو بخش دے، میرے رب! ان پر رحم فرما جیسا انہوں نے مجھے بچپن میں پالا",
    explanation: "This dua is from Surah Al-Isra (17:24), placed immediately after the command to show kindness to parents. Dua for parents is among the most beloved acts in Islam. The Prophet ﷺ said that after a person dies, three things continue to benefit them: ongoing charity, beneficial knowledge, and the prayers of a righteous child.",
    reference: "Quran 17:24, Abu Dawud 2880",
  },
  {
    id: "parents-2",
    subcategoryId: "parents",
    categoryId: "family",
    arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    transliteration: "Rabbana-ghfir li wa liwalidayya wa lil-mu'minina yawma yaqumul-hisab",
    english: "Our Lord! Forgive me and my parents and the believers on the Day when the Reckoning will come to pass.",
    urdu: "اے ہمارے رب! مجھے، میرے والدین کو اور مومنوں کو اس دن بخش دے جب حساب قائم ہوگا",
    explanation: "This is the supplication of Ibrahim (AS) recorded in Surah Ibrahim (14:41). By following in the footsteps of the Khalilullah (Friend of Allah), the believer not only prays for their own parents but for all believers — demonstrating the expansive compassion that is a mark of true iman.",
    reference: "Quran 14:41",
  },

  // ── Children ───────────────────────────────────────────────────────────────

  {
    id: "children-1",
    subcategoryId: "children",
    categoryId: "family",
    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama",
    english: "Our Lord! Bless us with spouses and offspring who will be the comfort of our eyes, and make us leaders of the righteous.",
    urdu: "اے ہمارے رب! ہمیں ہماری بیویوں اور اولاد سے آنکھوں کی ٹھنڈک دے اور ہمیں متقیوں کا امام بنا",
    explanation: "From Surah Al-Furqan (25:74) — the dua of the 'servants of the Most Merciful' (ibad ur-Rahman). 'Qurrata a'yun' (comfort of eyes) is an Arabic idiom for the deepest joy one can feel. The ultimate request is not just righteous children but to become a leader of the righteous — a goal that transforms personal piety into a legacy.",
    reference: "Quran 25:74",
  },
  {
    id: "children-2",
    subcategoryId: "children",
    categoryId: "family",
    arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    transliteration: "Rabbij-'alni muqimas-salati wa min dhurriyyati, Rabbana wa taqabbal du'a",
    english: "My Lord, make me an establisher of prayer and [also] from my descendants. Our Lord, and accept my supplication.",
    urdu: "میرے رب! مجھے نماز قائم کرنے والا بنا اور میری اولاد کو بھی، اے ہمارے رب! میری دعا قبول فرما",
    explanation: "The dua of Ibrahim (AS) from Surah Ibrahim (14:40). The defining criterion for righteous children is Salah — the pillar of the deen. If a parent asks for only one thing for their children, it should be that they establish prayer. This supplication represents the heart of every believing parent.",
    reference: "Quran 14:40",
  },

  // ── Marriage ───────────────────────────────────────────────────────────────

  {
    id: "marriage-1",
    subcategoryId: "marriage",
    categoryId: "family",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ",
    transliteration: "Allahumma inni as'aluka khayraha wa khayra ma jabaltaha 'alayhi, wa a'udhu bika min sharriha wa sharri ma jabaltaha 'alayhi",
    english: "O Allah, I ask You for her good and the good of what You have instilled in her nature, and I seek refuge in You from her evil and the evil of what You have instilled in her nature.",
    urdu: "اے اللہ! میں اس کی بھلائی اور اس کی فطرت میں جو رکھا ہے اس کی بھلائی مانگتا ہوں، اور اس کی برائی سے اور اس کی فطرت میں جو رکھا ہے اس کی برائی سے پناہ مانگتا ہوں",
    explanation: "The Prophet ﷺ recommended that a man recite this dua when he first sees his bride-to-be. 'Ma jabaltaha alayhi' refers to the natural disposition Allah created her with. This dua shows Islamic realism — acknowledging that every person has both good and less-good qualities and asking Allah to bring forth the best.",
    reference: "Abu Dawud 2160, Ibn Majah 1918",
  },
  {
    id: "marriage-2",
    subcategoryId: "marriage",
    categoryId: "family",
    arabic: "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
    transliteration: "Barakallaahu laka wa baaraka 'alayka wa jama'a baynakuma fi khayr",
    english: "May Allah bless you and shower His blessings upon you, and may He unite you both in goodness.",
    urdu: "اللہ تجھے برکت دے اور تجھ پر برکت نازل کرے اور تم دونوں کو خیر میں اکٹھا رکھے",
    explanation: "This is the prophetic dua to be said to a newlywed couple. The Prophet ﷺ replaced the pre-Islamic custom of congratulating newlyweds with obscene blessings with this pure and beautiful supplication. It asks for baraka — divine increase in every dimension of the marriage.",
    reference: "Abu Dawud 2130, Tirmidhi 1091, Ibn Majah 1905",
  },

  // ── Spouse ─────────────────────────────────────────────────────────────────

  {
    id: "spouse-1",
    subcategoryId: "spouse",
    categoryId: "family",
    arabic: "اللَّهُمَّ آلِفْ بَيْنَ قُلُوبِنَا وَأَصْلِحْ ذَاتَ بَيْنِنَا وَاهْدِنَا سُبُلَ السَّلَامِ",
    transliteration: "Allahumma allif bayna qulubina wa aslieh dhata baynina wahdina subulas-salam",
    english: "O Allah, unite our hearts in love, rectify the matters between us, and guide us to the paths of peace.",
    urdu: "اے اللہ! ہمارے دلوں میں الفت ڈال دے، ہمارے درمیان کے معاملات درست کر دے اور ہمیں سلامتی کے راستوں کی طرف ہدایت دے",
    explanation: "An adaptation of the dua in Surah Al-Anfal (8:63) about the bonding of hearts. Love between spouses is not only a feeling — it is a divine gift. 'Ta'lif al-qulub' (the uniting of hearts) is something only Allah can create. Said together or separately, this dua invites Allah's love into the home.",
    reference: "Inspired by Quran 8:63, Ibn As-Sunnah",
  },

  // ── Family Unity ───────────────────────────────────────────────────────────

  {
    id: "family-unity-1",
    subcategoryId: "family-unity",
    categoryId: "family",
    arabic: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَحِيمٌ",
    transliteration: "Rabbana-ghfir lana wa li ikhwaninal-ladhina sabaquna bil-imani, wa la taj'al fi qulubina ghillan lil-ladhina amanu, Rabbana innaka Ra'ufur-Rahim",
    english: "Our Lord! Forgive us and our brothers and sisters who preceded us in faith, and let there be no bitterness in our hearts toward those who believe. Our Lord, indeed You are Kind and Merciful.",
    urdu: "اے ہمارے رب! ہمیں اور ہمارے ان بھائیوں کو بخش دے جو ایمان میں ہم سے آگے گزر گئے اور ہمارے دلوں میں ایمان والوں کے لیے کینہ نہ رکھ، اے ہمارے رب! تو بہت شفیق اور رحیم ہے",
    explanation: "This dua from Surah Al-Hashr (59:10) addresses the unity of the entire Muslim Ummah across generations. 'Ghillan' (bitterness or rancour) in the heart is one of the most destructive forces within families and communities. This supplication actively asks Allah to cleanse the heart of all grudges and ill-feeling.",
    reference: "Quran 59:10",
  },

  // ── Ramadan ────────────────────────────────────────────────────────────────

  {
    id: "ramadan-1",
    subcategoryId: "ramadan",
    categoryId: "special-occasions",
    arabic: "اللَّهُمَّ بَارِكْ لَنَا فِي رَجَبٍ وَشَعْبَانَ وَبَلِّغْنَا رَمَضَانَ",
    transliteration: "Allahumma barik lana fi Rajaba wa Sha'bana wa ballighna Ramadan",
    english: "O Allah, bless us in Rajab and Sha'ban, and allow us to reach Ramadan.",
    urdu: "اے اللہ! ہمیں رجب اور شعبان میں برکت دے اور ہمیں رمضان تک پہنچا",
    explanation: "This supplication is reported from the Prophet ﷺ as a prayer said in the months leading up to Ramadan. It reflects the depth of the Prophet's ﷺ anticipation and love for Ramadan. The very fact that he prayed to reach Ramadan teaches us to never take any future moment for granted.",
    reference: "Ahmad, Bayhaqi — reported as hasan by scholars",
  },
  {
    id: "ramadan-2",
    subcategoryId: "ramadan",
    categoryId: "special-occasions",
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    transliteration: "Allahumma innaka 'Afuwwun Karimun tuhibbul 'afwa fa'fu 'anni",
    english: "O Allah, You are the Ever-Pardoning, the Most Generous, and You love to pardon, so pardon me.",
    urdu: "اے اللہ! تو معاف کرنے والا ہے، کریم ہے، معافی دینا پسند کرتا ہے، پس مجھے معاف کر دے",
    explanation: "Aisha (RA) asked the Prophet ﷺ: 'If I know which night Laylatul Qadr is, what should I say?' He taught her this supplication. Adding 'Karim' (Most Generous) to the name 'Afuww' (Ever-Pardoning) reflects the belief that Allah's generosity in forgiving is boundless. Recite abundantly in the last ten nights of Ramadan.",
    reference: "Tirmidhi 3513, Ibn Majah 3850",
  },

  // ── Laylatul Qadr ──────────────────────────────────────────────────────────

  {
    id: "qadr-1",
    subcategoryId: "laylatul-qadr",
    categoryId: "special-occasions",
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    transliteration: "Allahumma innaka 'Afuwwun Karimun tuhibbul 'afwa fa'fu 'anni",
    english: "O Allah, You are the Ever-Pardoning, the Most Generous, and You love to pardon, so pardon me.",
    urdu: "اے اللہ! تو معاف کرنے والا کریم ہے، معافی کو پسند فرماتا ہے، پس مجھے معاف فرما دے",
    explanation: "The specific dua the Prophet ﷺ prescribed for Laylatul Qadr — the Night of Power. One night better than a thousand months (83+ years). This single night, if found and spent in worship, can transform a person's entire life account. The Prophet ﷺ recommended reviving all ten last nights to ensure one does not miss it.",
    reference: "Tirmidhi 3513, Sahih — The Laylatul Qadr dua",
  },

  // ── Eid ────────────────────────────────────────────────────────────────────

  {
    id: "eid-1",
    subcategoryId: "eid",
    categoryId: "special-occasions",
    arabic: "تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ",
    transliteration: "Taqabbalallahu minna wa minkum",
    english: "May Allah accept from us and from you.",
    urdu: "اللہ ہم سے اور تم سے قبول فرمائے",
    explanation: "The prophetic greeting on Eid. The Companions of the Prophet ﷺ would say this to each other on Eid days. Its beauty lies in mutual supplication — asking for acceptance not just for oneself but for others too. Acceptance (qubul) is the goal of all worship; without it, forms are empty. May every Eid find our worship accepted.",
    reference: "Ahmad, Tabrani — reported as Hasan by Ibn Hajar",
  },

  // ── Hajj ───────────────────────────────────────────────────────────────────

  {
    id: "hajj-1",
    subcategoryId: "hajj",
    categoryId: "special-occasions",
    arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لَا شَرِيكَ لَكَ",
    transliteration: "Labbayk Allahumma labbayk, labbayk la sharika laka labbayk, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak",
    english: "Here I am, O Allah, here I am. Here I am — You have no partner — here I am. Indeed, all praise, all grace, and all sovereignty belong to You; You have no partner.",
    urdu: "حاضر ہوں اے اللہ! حاضر ہوں، حاضر ہوں تیرا کوئی شریک نہیں، حاضر ہوں، بے شک تمام تعریف، تمام نعمت اور سلطنت تیری ہے، تیرا کوئی شریک نہیں",
    explanation: "The Talbiyah — the call of the pilgrim. From the moment of Ihram until stoning the Jamarah on Eid al-Adha, the pilgrim repeats this cry. It is the response to Ibrahim's call to Hajj, which Allah told him would be heard. Every labbayk is a personal encounter with the divine call.",
    reference: "Bukhari 1549, Muslim 1184",
  },
  {
    id: "hajj-2",
    subcategoryId: "hajj",
    categoryId: "special-occasions",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
    english: "Our Lord! Give us good in this world and good in the Hereafter and protect us from the punishment of the Fire.",
    urdu: "اے ہمارے رب! ہمیں دنیا میں بھلائی دے اور آخرت میں بھی بھلائی دے اور ہمیں آگ کے عذاب سے بچا",
    explanation: "The Quran records (2:201) that among the pilgrims are those who ask for both this life and the next — and Allah gives both to those who ask. This dua is a masterpiece of comprehensiveness: 'hasanah' in this life covers everything good, 'hasanah' in the next covers Paradise, and protection from the Fire covers the greatest fear.",
    reference: "Quran 2:201, Bukhari 6389, Muslim 2690",
  },

  // ── Umrah ──────────────────────────────────────────────────────────────────

  {
    id: "umrah-1",
    subcategoryId: "umrah",
    categoryId: "special-occasions",
    arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لَا شَرِيكَ لَكَ",
    transliteration: "Labbayk Allahumma labbayk, labbayk la sharika laka labbayk, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak",
    english: "Here I am, O Allah, here I am. Here I am — You have no partner — here I am. Indeed, all praise, all grace, and all sovereignty belong to You; You have no partner.",
    urdu: "حاضر ہوں اے اللہ! حاضر ہوں، حاضر ہوں تیرا کوئی شریک نہیں، حاضر ہوں۔ بے شک تمام تعریف، نعمت اور سلطنت تیری ہے، تیرا کوئی شریک نہیں",
    explanation: "The Talbiyah is recited in Umrah just as in Hajj, from the state of Ihram. The Prophet ﷺ described Umrah as 'a Hajj minors'. While Hajj is an obligation once in a lifetime, Umrah can be performed any time and is a sunnah that cleans sins between one Umrah and the next.",
    reference: "Bukhari 1549, Muslim 1184",
  },
  {
    id: "umrah-2",
    subcategoryId: "umrah",
    categoryId: "special-occasions",
    arabic: "اللَّهُمَّ إِنَّ هَذَا الْبَيْتَ بَيْتُكَ وَالْحَرَمَ حَرَمُكَ وَالْأَمْنَ أَمْنُكَ وَهَذَا مَقَامُ الْعَائِذِ بِكَ مِنَ النَّارِ",
    transliteration: "Allahumma inna hadhal bayta baytuka, wal-harama haramuka, wal-amna amnuka, wa hadha maqamul-'a'idhi bika minan-nar",
    english: "O Allah, this House is Your House, and this sacred precinct is Your sacred precinct, and this security is Your security, and this is the station of one seeking Your refuge from the Fire.",
    urdu: "اے اللہ! یہ گھر تیرا گھر ہے، یہ حرم تیرا حرم ہے، یہ امن تیرا امن ہے اور یہ آگ سے تیری پناہ مانگنے والے کا مقام ہے",
    explanation: "A powerful dua to recite when first beholding the Ka'bah. Standing before the House of Allah for the first time is one of the most profound moments a Muslim can experience. This dua acknowledges Allah's absolute ownership and uses the sacred moment to seek refuge from the greatest of all fears — the Fire.",
    reference: "Al-Azraki, Reported by scholars as an established dua of the Ka'bah",
  },

  // ── Janazah ────────────────────────────────────────────────────────────────

  {
    id: "janazah-1",
    subcategoryId: "janazah",
    categoryId: "special-occasions",
    arabic: "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ",
    transliteration: "Allahummaghfir lahu warhamhu wa 'afihi wa'fu 'anhu wa akrim nuzulahu wa wassi' mudkhalahu waghsilhu bil-ma'i wath-thalji wal-barad",
    english: "O Allah, forgive him, have mercy on him, pardon him, grant him wellbeing, honor his reception, expand his entrance, and wash him with water, snow, and hail.",
    urdu: "اے اللہ! اسے بخش دے، اس پر رحم فرما، اسے عافیت دے، اسے معاف کر، اس کی مہمانداری عزت سے فرما، اس کی منزل وسیع کر اور اسے پانی، برف اور اولے سے دھو",
    explanation: "The Janazah prayer dua for a male — say 'laha' (her) for a female. The Prophet ﷺ taught this as the core supplication in the Salat al-Janazah. It covers seven requests: forgiveness, mercy, pardon, wellbeing, an honoured reception in the next life, a spacious abode, and spiritual purification. This is the most comprehensive mercy we can ask for a departed soul.",
    reference: "Muslim 963, Abu Dawud 3202",
  },
  {
    id: "janazah-2",
    subcategoryId: "janazah",
    categoryId: "special-occasions",
    arabic: "اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَصَغِيرِنَا وَكَبِيرِنَا وَذَكَرِنَا وَأُنْثَانَا",
    transliteration: "Allahummaghfir lihayyina wa mayyitina wa shahidina wa gha'ibina wa saghirana wa kabirina wa dhakarina wa unthana",
    english: "O Allah, forgive our living and our dead, those present and those absent, our young and our old, our males and our females.",
    urdu: "اے اللہ! ہمارے زندوں اور مردوں کو، حاضرین اور غائبین کو، چھوٹوں اور بڑوں کو، مردوں اور عورتوں کو بخش دے",
    explanation: "Recited in the Janazah prayer, this supplication is a gift to the deceased but also a reminder to the living: we will all reach this moment. Its comprehensiveness — covering all ages, both genders, those present and absent — reflects the Islamic spirit of communal brotherhood that transcends death.",
    reference: "Abu Dawud 3201, Tirmidhi 1024, Ibn Majah 1498",
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getSubcategoriesByCategory(categoryId: string): DuaSubcategory[] {
  return DUA_SUBCATEGORIES.filter((s) => s.categoryId === categoryId);
}

export function getDuasBySubcategory(subcategoryId: string): DuaItem[] {
  return DUA_ITEMS.filter((d) => d.subcategoryId === subcategoryId);
}

export function getDuaCountBySubcategory(subcategoryId: string): number {
  return DUA_ITEMS.filter((d) => d.subcategoryId === subcategoryId).length;
}

export function searchDuas(query: string): DuaItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return DUA_ITEMS.filter((d) => {
    const subcat = DUA_SUBCATEGORIES.find((s) => s.id === d.subcategoryId);
    const cat = DUA_CATEGORIES.find((c) => c.id === d.categoryId);
    return (
      d.arabic.includes(query) ||
      d.transliteration.toLowerCase().includes(q) ||
      d.english.toLowerCase().includes(q) ||
      d.urdu.includes(query) ||
      d.reference.toLowerCase().includes(q) ||
      d.explanation.toLowerCase().includes(q) ||
      (subcat?.title.toLowerCase().includes(q) ?? false) ||
      (cat?.title.toLowerCase().includes(q) ?? false)
    );
  });
}
