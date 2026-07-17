// Kalimas & Shahadah — complete data layer.
// All content is hardcoded; no network required (fully offline).

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WordMeaning {
  arabic: string;
  transliteration: string;
  meaning: string;
}

export interface QuranRef {
  verse: string;    // e.g. "Surah Al-Ikhlas (112:1-4)"
  arabic: string;
  english: string;
}

export interface HadithRef {
  source: string;   // e.g. "Sahih al-Bukhari 6463"
  english: string;
}

export interface Kalima {
  id: string;
  number: number;
  name: string;          // e.g. "Tayyibah"
  nameUrdu: string;      // e.g. "طیّبہ"
  subtitle: string;      // English subtitle
  arabic: string;
  transliteration: string;
  english: string;
  urdu: string;
  words: WordMeaning[];
  explanation: string;
  benefits: string[];
  quranRefs: QuranRef[];
  hadithRefs: HadithRef[];
  color: string;         // Tailwind color name, e.g. "emerald"
}

export interface TawheedCard {
  id: string;
  icon: string;          // emoji
  title: string;
  body: string;
  quranRef?: QuranRef;
  hadithRef?: HadithRef;
}

// ─── Six Kalimas ──────────────────────────────────────────────────────────────

export const KALIMAS: Kalima[] = [
  {
    id: "kalima-1",
    number: 1,
    name: "Tayyibah",
    nameUrdu: "طیّبہ",
    subtitle: "The Word of Purity",
    arabic: "لَا إِلَٰهَ إِلَّا اللهُ مُحَمَّدٌ رَّسُولُ اللهِ",
    transliteration: "Lā ilāha illallāhu Muḥammadur rasūlullāh",
    english: "There is no god but Allah; Muhammad is the Messenger of Allah.",
    urdu: "اللہ کے سوا کوئی معبود نہیں، محمد ﷺ اللہ کے رسول ہیں۔",
    words: [
      { arabic: "لَا", transliteration: "Lā", meaning: "No / There is not" },
      { arabic: "إِلَٰهَ", transliteration: "ilāha", meaning: "god / deity" },
      { arabic: "إِلَّا", transliteration: "illā", meaning: "except / but" },
      { arabic: "اللهُ", transliteration: "Allāhu", meaning: "Allah" },
      { arabic: "مُحَمَّدٌ", transliteration: "Muḥammadun", meaning: "Muhammad ﷺ" },
      { arabic: "رَّسُولُ", transliteration: "rasūlu", meaning: "Messenger" },
      { arabic: "اللهِ", transliteration: "Allāhi", meaning: "of Allah" },
    ],
    explanation:
      "The First Kalima is the most fundamental declaration of Islamic faith. It affirms two pillars of belief: the absolute Oneness of Allah (Tawheed) and the prophethood of Muhammad ﷺ (Risalah). This kalima is the gateway to Islam and the most powerful statement a Muslim can utter. Whoever sincerely believes in its meaning and lives by it will be among the successful on the Day of Judgment.",
    benefits: [
      "It is the key to Paradise — the Prophet ﷺ said whoever says it sincerely enters Jannah.",
      "It wipes away sins and purifies the heart from spiritual impurities.",
      "It is the best remembrance (dhikr) after the Quran.",
      "Reciting it regularly guards one against disbelief and hypocrisy.",
      "It is the last words a Muslim should say before death.",
    ],
    quranRefs: [
      {
        verse: "Surah Al-Ikhlas (112:1)",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        english: 'Say, "He is Allah, [Who is] One."',
      },
      {
        verse: "Surah Muhammad (47:19)",
        arabic: "فَاعْلَمْ أَنَّهُ لَا إِلَٰهَ إِلَّا اللَّهُ",
        english: "So know that there is no deity except Allah.",
      },
    ],
    hadithRefs: [
      {
        source: "Sahih al-Bukhari 6463",
        english:
          "The Prophet ﷺ said: 'Whoever's last words are Lā ilāha illallāh will enter Paradise.'",
      },
      {
        source: "Sahih Muslim 94",
        english:
          "'The best remembrance is Lā ilāha illallāh and the best supplication is Alḥamdulillāh.'",
      },
    ],
    color: "emerald",
  },
  {
    id: "kalima-2",
    number: 2,
    name: "Shahadah",
    nameUrdu: "شہادت",
    subtitle: "The Word of Testimony",
    arabic:
      "أَشْهَدُ أَنْ لَّا إِلَٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration:
      "Ash-hadu al-lā ilāha illallāhu waḥdahū lā sharīka lahū wa ash-hadu anna Muḥammadan ʿabduhū wa rasūluh",
    english:
      "I bear witness that there is no god but Allah, alone, without partner. And I bear witness that Muhammad is His servant and Messenger.",
    urdu:
      "میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں۔ اور میں گواہی دیتا ہوں کہ محمد ﷺ اللہ کے بندے اور رسول ہیں۔",
    words: [
      { arabic: "أَشْهَدُ", transliteration: "Ash-hadu", meaning: "I bear witness" },
      { arabic: "أَن", transliteration: "an", meaning: "that" },
      { arabic: "لَّا إِلَٰهَ", transliteration: "lā ilāha", meaning: "there is no god" },
      { arabic: "إِلَّا اللهُ", transliteration: "illallāhu", meaning: "but Allah" },
      { arabic: "وَحْدَهُ", transliteration: "waḥdahū", meaning: "alone / solely" },
      { arabic: "لَا شَرِيكَ لَهُ", transliteration: "lā sharīka lah", meaning: "no partner for Him" },
      { arabic: "وَأَشْهَدُ", transliteration: "wa ash-hadu", meaning: "and I bear witness" },
      { arabic: "أَنَّ", transliteration: "anna", meaning: "that" },
      { arabic: "مُحَمَّدًا", transliteration: "Muḥammadan", meaning: "Muhammad ﷺ" },
      { arabic: "عَبْدُهُ", transliteration: "ʿabduhū", meaning: "His servant" },
      { arabic: "وَرَسُولُهُ", transliteration: "wa rasūluh", meaning: "and His Messenger" },
    ],
    explanation:
      "The Second Kalima is the formal declaration of faith (Shahadah) recited when entering Islam. It expands on the First Kalima by adding 'alone, without partner' — explicitly rejecting all forms of polytheism. It also specifies Muhammad ﷺ as the servant of Allah, preserving his human status, while affirming his prophethood. This kalima is the most important testimony a Muslim makes.",
    benefits: [
      "Reciting it with conviction makes one a Muslim and opens the gates of Paradise.",
      "It is recited in the Adhan, Iqamah, and the Tashahhud of every prayer.",
      "It protects one from hellfire when recited with true belief and righteous deeds.",
      "It is the testimony that makes all worship accepted by Allah.",
      "It separates truth from falsehood and monotheism from polytheism.",
    ],
    quranRefs: [
      {
        verse: "Surah Al-Imran (3:18)",
        arabic: "شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ",
        english:
          "Allah witnesses that there is no deity except Him, and [so do] the angels and those of knowledge.",
      },
    ],
    hadithRefs: [
      {
        source: "Sahih Muslim 29",
        english:
          "The Prophet ﷺ said: 'I have been commanded to fight until people testify that there is no god but Allah and that Muhammad is the Messenger of Allah.'",
      },
    ],
    color: "sky",
  },
  {
    id: "kalima-3",
    number: 3,
    name: "Tamjeed",
    nameUrdu: "تمجید",
    subtitle: "The Word of Glorification",
    arabic:
      "سُبْحَانَ اللهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ",
    transliteration:
      "Subḥānallāhi walḥamdu lillāhi wa lā ilāha illallāhu wallāhu akbaru wa lā ḥawla wa lā quwwata illā billāhil ʿAliyyil ʿAẓīm",
    english:
      "Glory be to Allah, and all praise is for Allah, and there is no god but Allah, and Allah is the Greatest. And there is no power or strength except with Allah, the Most High, the Most Great.",
    urdu:
      "اللہ پاک ہے، تمام تعریفیں اللہ کے لیے ہیں، اللہ کے سوا کوئی معبود نہیں، اللہ سب سے بڑا ہے۔ اور کوئی طاقت اور قوت نہیں مگر اللہ عالی و عظیم کی طرف سے۔",
    words: [
      { arabic: "سُبْحَانَ اللهِ", transliteration: "Subḥānallāh", meaning: "Glory be to Allah" },
      { arabic: "وَالْحَمْدُ لِلَّهِ", transliteration: "walḥamdu lillāh", meaning: "and all praise is for Allah" },
      { arabic: "وَلَا إِلَٰهَ إِلَّا اللهُ", transliteration: "wa lā ilāha illallāh", meaning: "and there is no god but Allah" },
      { arabic: "وَاللهُ أَكْبَرُ", transliteration: "wallāhu akbar", meaning: "and Allah is the Greatest" },
      { arabic: "وَلَا حَوْلَ", transliteration: "wa lā ḥawla", meaning: "and there is no power" },
      { arabic: "وَلَا قُوَّةَ", transliteration: "wa lā quwwata", meaning: "and no strength" },
      { arabic: "إِلَّا بِاللهِ", transliteration: "illā billāh", meaning: "except with Allah" },
      { arabic: "الْعَلِيِّ", transliteration: "al-ʿAliyy", meaning: "the Most High" },
      { arabic: "الْعَظِيمِ", transliteration: "al-ʿAẓīm", meaning: "the Most Great" },
    ],
    explanation:
      "The Third Kalima combines the four most beloved phrases to Allah — SubhanAllah, Alhamdulillah, La ilaha illallah, and Allahu Akbar — followed by the profound acknowledgment that all power belongs to Allah alone. Together, these are known as the 'Baqi-as-Salihat' (the righteous good deeds that remain). This kalima is a comprehensive glorification of Allah's perfection, praiseworthiness, uniqueness, and greatness.",
    benefits: [
      "Reciting SubhanAllah, Alhamdulillah, Allahu Akbar 33 times each after every prayer brings immense reward.",
      "The phrase Lā ḥawla wa lā quwwata illā billāh is a treasure from the treasures of Paradise.",
      "It is among the phrases most beloved to Allah and the heaviest on the scales of good deeds.",
      "Regular recitation brings peace of heart and remembrance of Allah's greatness.",
      "It protects the believer from arrogance and reliance on oneself.",
    ],
    quranRefs: [
      {
        verse: "Surah Al-Kahf (18:39)",
        arabic: "وَلَوْلَا إِذْ دَخَلْتَ جَنَّتَكَ قُلْتَ مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ",
        english: "And why did you, when you entered your garden, not say, 'What Allah willed [has occurred]; there is no power except in Allah'?",
      },
    ],
    hadithRefs: [
      {
        source: "Sahih Muslim 2137",
        english:
          "The Prophet ﷺ said: 'The most beloved words to Allah are four: SubhanAllah, Alhamdulillah, La ilaha illallah, and Allahu Akbar. There is no harm in which order you say them.'",
      },
    ],
    color: "violet",
  },
  {
    id: "kalima-4",
    number: 4,
    name: "Tawheed",
    nameUrdu: "توحید",
    subtitle: "The Word of Oneness",
    arabic:
      "لَا إِلَٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَّا يَمُوتُ أَبَدًا أَبَدًا ذُو الْجَلَالِ وَالْإِكْرَامِ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "Lā ilāha illallāhu waḥdahū lā sharīka lah, lahul mulku wa lahul ḥamdu yuḥyī wa yumītu wa huwa ḥayyun lā yamūtu abadan abadā, dhul jalāli wal ikrām, biyadihil khayru wa huwa ʿalā kulli shay'in qadīr",
    english:
      "There is no god but Allah, alone, without partner. His is the dominion and His is all praise. He gives life and causes death, and He is Ever-Living and will never die, ever, ever. Possessor of Majesty and Honour. In His hand is all good, and He has power over all things.",
    urdu:
      "اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے اس کا کوئی شریک نہیں۔ اسی کی بادشاہت ہے اور اسی کے لیے تمام تعریفیں ہیں۔ وہ زندگی دیتا اور موت دیتا ہے، اور وہ زندہ ہے کبھی نہیں مرے گا ہرگز ہرگز۔ وہ بزرگی اور عزت والا ہے۔ اس کے ہاتھ میں بھلائی ہے اور وہ ہر چیز پر قادر ہے۔",
    words: [
      { arabic: "لَا إِلَٰهَ إِلَّا اللهُ", transliteration: "Lā ilāha illallāh", meaning: "There is no god but Allah" },
      { arabic: "وَحْدَهُ", transliteration: "waḥdahū", meaning: "alone" },
      { arabic: "لَا شَرِيكَ لَهُ", transliteration: "lā sharīka lah", meaning: "without partner" },
      { arabic: "لَهُ الْمُلْكُ", transliteration: "lahul mulk", meaning: "His is the dominion" },
      { arabic: "وَلَهُ الْحَمْدُ", transliteration: "wa lahul ḥamd", meaning: "and His is all praise" },
      { arabic: "يُحْيِي", transliteration: "yuḥyī", meaning: "He gives life" },
      { arabic: "وَيُمِيتُ", transliteration: "wa yumīt", meaning: "and causes death" },
      { arabic: "وَهُوَ حَيٌّ", transliteration: "wa huwa ḥayy", meaning: "and He is Ever-Living" },
      { arabic: "لَّا يَمُوتُ", transliteration: "lā yamūt", meaning: "He will not die" },
      { arabic: "ذُو الْجَلَالِ", transliteration: "dhul jalāl", meaning: "Possessor of Majesty" },
      { arabic: "وَالْإِكْرَامِ", transliteration: "wal ikrām", meaning: "and Honour" },
      { arabic: "بِيَدِهِ الْخَيْرُ", transliteration: "biyadihil khayr", meaning: "in His hand is all good" },
      { arabic: "قَدِيرٌ", transliteration: "qadīr", meaning: "All-Powerful" },
    ],
    explanation:
      "The Fourth Kalima is a magnificent proclamation of Allah's absolute Oneness combined with His divine attributes. It affirms that Allah is eternal, ever-living, the possessor of all sovereignty, praise, goodness, and power. The phrase 'He gives life and causes death' reminds the believer that all of existence is under Allah's complete control. Recited after Fajr and Maghrib, it brings abundant blessings.",
    benefits: [
      "Reciting it 10 times after Fajr and Maghrib brings the reward of freeing 4 slaves, 10 good deeds, 10 sins erased, and elevated 10 ranks.",
      "It encompasses the most comprehensive description of Allah's attributes in a single statement.",
      "It protects from Shaytan throughout the day and night.",
      "It is a shield against forgetfulness of Allah and keeps the heart attached to Him.",
      "Regular recitation brings barakah (blessing) in all affairs of life.",
    ],
    quranRefs: [
      {
        verse: "Surah Al-Hadid (57:2)",
        arabic: "لَهُ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ ۖ يُحْيِي وَيُمِيتُ ۖ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
        english: "To Him belongs the dominion of the heavens and earth. He gives life and causes death, and He is over all things competent.",
      },
    ],
    hadithRefs: [
      {
        source: "Sunan at-Tirmidhi 3468",
        english:
          "Whoever says Lā ilāha illallāhu waḥdahū lā sharīka lahu, lahul mulku wa lahul ḥamdu wa huwa ʿalā kulli shay'in qadīr 100 times daily will have the reward of freeing 10 slaves, 100 good deeds written, 100 sins erased, and be protected from Shaytan that day.",
      },
    ],
    color: "amber",
  },
  {
    id: "kalima-5",
    number: 5,
    name: "Istighfar",
    nameUrdu: "استغفار",
    subtitle: "The Word of Seeking Forgiveness",
    arabic:
      "أَسْتَغْفِرُ اللهَ رَبِّي مِنْ كُلِّ ذَنْبٍ أَذْنَبْتُهُ عَمَدًا أَوْ خَطَأً سِرًّا أَوْ عَلَانِيَةً وَأَتُوبُ إِلَيْهِ مِنَ الذَّنْبِ الَّذِي أَعْلَمُ وَمِنَ الذَّنْبِ الَّذِي لَا أَعْلَمُ إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ وَسَتَّارُ الْعُيُوبِ وَغَفَّارُ الذُّنُوبِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ",
    transliteration:
      "Astaghfirullāha rabbī min kulli dhambin adhnabtuhu ʿamadan aw khataʾan sirran aw ʿalāniyatan wa atūbu ilayhi minadh-dhambi alladhī aʿlamu wa minadh-dhambi alladhī lā aʿlam, innaka anta ʿallāmul ghuyūbi wa sattārul ʿuyūbi wa ghaffārudh-dhunūb, wa lā ḥawla wa lā quwwata illā billāhil ʿAliyyil ʿAẓīm",
    english:
      "I seek forgiveness from Allah, my Lord, for every sin I have committed — intentionally or by mistake, secretly or openly — and I repent to Him for the sins I am aware of and the sins I am not aware of. Truly, You are the All-Knower of the unseen, the Concealer of faults, and the Forgiver of sins. And there is no power or strength except with Allah, the Most High, the Most Great.",
    urdu:
      "میں اللہ سے معافی مانگتا ہوں، اپنے رب سے، ہر اس گناہ سے جو میں نے کیا — جان بوجھ کر یا غلطی سے، چھپ کر یا ظاہر میں — اور میں اس کی طرف توبہ کرتا ہوں ان گناہوں سے جو میں جانتا ہوں اور ان سے بھی جو میں نہیں جانتا۔ بے شک آپ پوشیدہ چیزوں کے جاننے والے، عیبوں کے چھپانے والے اور گناہوں کے معاف کرنے والے ہیں۔",
    words: [
      { arabic: "أَسْتَغْفِرُ اللهَ", transliteration: "Astaghfirullāh", meaning: "I seek forgiveness from Allah" },
      { arabic: "رَبِّي", transliteration: "rabbī", meaning: "my Lord" },
      { arabic: "مِنْ كُلِّ ذَنْبٍ", transliteration: "min kulli dhamb", meaning: "from every sin" },
      { arabic: "عَمَدًا أَوْ خَطَأً", transliteration: "ʿamadan aw khaṭaʾan", meaning: "intentionally or by mistake" },
      { arabic: "سِرًّا أَوْ عَلَانِيَةً", transliteration: "sirran aw ʿalāniyatan", meaning: "secretly or openly" },
      { arabic: "وَأَتُوبُ", transliteration: "wa atūbu", meaning: "and I repent" },
      { arabic: "عَلَّامُ الْغُيُوبِ", transliteration: "ʿallāmul ghuyūb", meaning: "All-Knower of the unseen" },
      { arabic: "سَتَّارُ الْعُيُوبِ", transliteration: "sattārul ʿuyūb", meaning: "Concealer of faults" },
      { arabic: "غَفَّارُ الذُّنُوبِ", transliteration: "ghaffārudh-dhunūb", meaning: "Forgiver of sins" },
    ],
    explanation:
      "The Fifth Kalima is a profound declaration of repentance and divine forgiveness. Unlike a simple 'sorry', it acknowledges the full spectrum of human fallibility — intentional and accidental sins, public and private transgressions, known and unknown mistakes — while appealing to three of Allah's magnificent attributes: His omniscience, His veil of protection over human faults, and His infinite forgiveness. It ends with the recognition that all strength comes from Allah alone.",
    benefits: [
      "It is one of the most comprehensive repentance formulas in Islamic practice.",
      "It cleanses the soul from the weight of sins one may not even be aware of.",
      "Appealing to the attribute 'Sattār' (Concealer) asks Allah to keep one's sins hidden on the Day of Judgment.",
      "It cultivates humility and awareness of one's utter dependence on Allah's mercy.",
      "Reciting it regularly keeps one in a state of constant spiritual purification.",
    ],
    quranRefs: [
      {
        verse: "Surah Az-Zumar (39:53)",
        arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
        english: 'Say, "O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins."',
      },
    ],
    hadithRefs: [
      {
        source: "Sahih al-Bukhari 6307",
        english:
          "The Prophet ﷺ said: 'By Allah, I seek forgiveness from Allah and repent to Him more than seventy times a day.'",
      },
    ],
    color: "rose",
  },
  {
    id: "kalima-6",
    number: 6,
    name: "Radd-e-Kufr",
    nameUrdu: "ردّ کفر",
    subtitle: "The Word of Rejection of Disbelief",
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ بِهِ وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ بِهِ تُبْتُ عَنْهُ وَتَبَرَّأْتُ مِنَ الْكُفْرِ وَالشِّرْكِ وَالْكِذْبِ وَالْغِيبَةِ وَالْبِدْعَةِ وَالنَّمِيمَةِ وَالْفَوَاحِشِ وَالْبُهْتَانِ وَالْمَعَاصِي كُلِّهَا وَأَسْلَمْتُ وَأَقُولُ لَا إِلَٰهَ إِلَّا اللهُ مُحَمَّدٌ رَّسُولُ اللهِ",
    transliteration:
      "Allāhumma innī aʿūdhu bika min an ushrika bika shay'an wa anā aʿlamu bih, wa astaghfiruka limā lā aʿlamu bih, tubtu ʿanh, wa tabarraʾtu minal kufri wash-shirki wal-kadhibi wal-ghībati wal-bidʿati wan-namīmati wal-fawāḥishi wal-buhtāni wal-maʿāṣī kullihā, wa aslamtu wa aqūlu lā ilāha illallāhu Muḥammadur rasūlullāh",
    english:
      "O Allah, I seek refuge in You from associating anything with You knowingly, and I seek Your forgiveness for what I do not know of it. I have repented from it and I renounce disbelief, polytheism, lying, backbiting, innovation, tale-carrying, indecencies, slander, and all sins. I have submitted to Islam and I say: There is no god but Allah; Muhammad is the Messenger of Allah.",
    urdu:
      "اے اللہ! میں تیری پناہ مانگتا ہوں اس سے کہ میں جان بوجھ کر تیرے ساتھ کسی کو شریک ٹھہراؤں، اور میں تجھ سے معافی مانگتا ہوں جو مجھے معلوم نہیں۔ میں نے اس سے توبہ کی اور میں کفر، شرک، جھوٹ، غیبت، بدعت، چغلی، بے حیائی، بہتان اور تمام گناہوں سے بیزاری کا اظہار کرتا ہوں۔ میں اسلام لایا اور کہتا ہوں: اللہ کے سوا کوئی معبود نہیں، محمد ﷺ اللہ کے رسول ہیں۔",
    words: [
      { arabic: "اللَّهُمَّ", transliteration: "Allāhumma", meaning: "O Allah" },
      { arabic: "أَعُوذُ بِكَ", transliteration: "aʿūdhu bik", meaning: "I seek refuge in You" },
      { arabic: "مِنْ أَنْ أُشْرِكَ", transliteration: "min an ushrik", meaning: "from associating (partners)" },
      { arabic: "وَأَنَا أَعْلَمُ", transliteration: "wa anā aʿlam", meaning: "while I know" },
      { arabic: "وَأَسْتَغْفِرُكَ", transliteration: "wa astaghfiruk", meaning: "and I seek Your forgiveness" },
      { arabic: "تُبْتُ عَنْهُ", transliteration: "tubtu ʿanh", meaning: "I have repented from it" },
      { arabic: "وَتَبَرَّأْتُ", transliteration: "wa tabarraʾtu", meaning: "and I renounce / disavow" },
      { arabic: "الْكُفْرِ", transliteration: "al-kufr", meaning: "disbelief" },
      { arabic: "الشِّرْكِ", transliteration: "ash-shirk", meaning: "polytheism" },
      { arabic: "وَأَسْلَمْتُ", transliteration: "wa aslamtu", meaning: "and I submit to Islam" },
    ],
    explanation:
      "The Sixth Kalima is the most comprehensive declaration of moral and spiritual cleansing. It seeks refuge from both conscious and unconscious shirk, then explicitly renounces a full list of major sins — disbelief, polytheism, lying, backbiting, religious innovation, tale-carrying, indecency, slander, and all other sins. It concludes by returning to the foundation of Islam: the First Kalima. This makes it a complete cycle of repentance and renewal of faith.",
    benefits: [
      "It is a complete declaration of immunity from disbelief and all major spiritual diseases.",
      "Reciting it protects from both obvious and subtle forms of shirk.",
      "It renews one's covenant with Allah and reaffirms one's commitment to Islam.",
      "It cultivates consciousness of every type of sin, encouraging vigilance in daily life.",
      "Ending with the First Kalima reminds the believer that all repentance returns to Tawheed.",
    ],
    quranRefs: [
      {
        verse: "Surah An-Nisa (4:48)",
        arabic: "إِنَّ اللَّهَ لَا يَغْفِرُ أَن يُشْرَكَ بِهِ وَيَغْفِرُ مَا دُونَ ذَٰلِكَ لِمَن يَشَاءُ",
        english: "Indeed, Allah does not forgive association with Him, but He forgives what is less than that for whom He wills.",
      },
    ],
    hadithRefs: [
      {
        source: "Sahih Muslim 2654",
        english:
          "The Prophet ﷺ said: 'Shirk is more hidden in this ummah than the sound of an ant walking on a black stone in the dark of night.' This kalima guards against such hidden shirk.",
      },
    ],
    color: "indigo",
  },
];

// ─── Shahadah detail ───────────────────────────────────────────────────────────

export const SHAHADAH_DETAIL = {
  arabic: "أَشْهَدُ أَنْ لَّا إِلَٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
  transliteration:
    "Ash-hadu al-lā ilāha illallāhu waḥdahū lā sharīka lahū wa ash-hadu anna Muḥammadan ʿabduhū wa rasūluh",
  english:
    "I bear witness that there is no deity worthy of worship except Allah, alone without partner, and I bear witness that Muhammad is His servant and Messenger.",
  urdu:
    "میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے اس کا کوئی شریک نہیں، اور میں گواہی دیتا ہوں کہ محمد ﷺ اللہ کے بندے اور رسول ہیں۔",
  tawheedExplanation: [
    {
      title: "Lā ilāha — No deity",
      body: "This first part negates any object of worship. 'Ilāh' means that which is worshipped. By saying lā ilāha, the Muslim categorically rejects every false deity — idols, saints, nature, rulers — as unworthy of worship.",
    },
    {
      title: "illallāhu — except Allah",
      body: "The exception is Allah alone. This affirms that all worship — prayer, supplication, sacrifice, hope, fear, trust — belongs exclusively to Allah. This is Tawheed al-Uluhiyyah: the Oneness of Allah in worship.",
    },
    {
      title: "waḥdahū lā sharīka lah — alone, without partner",
      body: "This reinforces the rejection of all forms of partnership with Allah in His Lordship, names, attributes, and right to be worshipped. Allah has no equals, no helpers in divinity, and no co-deities.",
    },
  ],
  prophetExplanation:
    "Accepting Muhammad ﷺ as the Messenger of Allah means following the Sunnah (his way of life), taking his example as the perfect model, believing in everything he conveyed from Allah, and loving him more than any other human being. It also means he was a human being — 'His servant' — not divine, and that he was the final Prophet, after whom no new prophet will come.",
  importance: [
    "The Shahadah is the First Pillar of Islam — the foundation upon which all other acts of worship rest.",
    "It is the entry point into Islam. When a non-Muslim accepts Islam, reciting the Shahadah is their first act.",
    "It is woven into every part of Islamic worship — the Adhan, the prayer (Tashahhud), and the moment of death.",
    "It is the most powerful statement on the scales of deeds — outweighing the heavens and earth.",
    "Dying with the Shahadah on one's lips is the ultimate hope for Paradise.",
  ],
  quranRefs: [
    {
      verse: "Surah Al-Imran (3:18)",
      arabic:
        "شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ قَائِمًا بِالْقِسْطِ",
      english:
        "Allah witnesses that there is no deity except Him, and [so do] the angels and those of knowledge — [He is] maintaining [creation] in justice.",
    },
    {
      verse: "Surah Muhammad (47:19)",
      arabic: "فَاعْلَمْ أَنَّهُ لَا إِلَٰهَ إِلَّا اللَّهُ وَاسْتَغْفِرْ لِذَنبِكَ",
      english: "So know that there is no deity except Allah and ask forgiveness for your sin.",
    },
  ],
  hadithRefs: [
    {
      source: "Sahih al-Bukhari 4",
      english:
        "The Prophet ﷺ said: 'Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is His Messenger, establishing prayer, paying Zakat, making the pilgrimage, and fasting Ramadan.'",
    },
    {
      source: "Sahih Muslim 94a",
      english:
        "'If you were to put all the heavens and earth on one side of the scale, and Lā ilāha illallāh on the other, it (the Kalima) would outweigh them.' — attributed to Ibn Amr.",
    },
  ],
};

// ─── Tawheed cards ─────────────────────────────────────────────────────────────

export const TAWHEED_CARDS: TawheedCard[] = [
  {
    id: "tw-1",
    icon: "☝️",
    title: "What is Tawheed?",
    body: "Tawheed (توحید) is the concept of the absolute Oneness of Allah. It is the central message of every Prophet sent by Allah — from Adam to Muhammad ﷺ. It means that Allah is unique in His being, His lordship, His right to be worshipped, and His names and attributes. Nothing resembles Him, nothing can replace Him, and nothing shares in His divinity.",
    quranRef: {
      verse: "Surah Al-Ikhlas (112:1-4)",
      arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
      english: 'Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent.',
    },
  },
  {
    id: "tw-2",
    icon: "📖",
    title: "The Three Categories of Tawheed",
    body: "Scholars have organised Tawheed into three categories:\n\n1. Tawheed ar-Rububiyyah — Oneness in Lordship: believing that Allah alone is the Creator, Sustainer, and Controller of all things.\n\n2. Tawheed al-Uluhiyyah — Oneness in Worship: directing all acts of worship (prayer, sacrifice, vows, love, fear, hope) exclusively to Allah.\n\n3. Tawheed al-Asma was-Sifat — Oneness in Names and Attributes: affirming all of Allah's names and attributes as He described Himself without distortion, denial, or likening them to creation.",
  },
  {
    id: "tw-3",
    icon: "🏛️",
    title: "Why Tawheed is the Foundation",
    body: "Tawheed is not merely one part of Islam — it is the very foundation upon which the entire religion stands. Every act of worship, every moral code, every law in Islam stems from the recognition that only Allah has the right to be obeyed, worshipped, and loved above all else. Without Tawheed, no act of worship is accepted. A person might pray, fast, and perform Hajj, but if they associate partners with Allah, all deeds become void.",
    quranRef: {
      verse: "Surah Az-Zumar (39:65)",
      arabic: "وَلَقَدْ أُوحِيَ إِلَيْكَ وَإِلَى الَّذِينَ مِن قَبْلِكَ لَئِنْ أَشْرَكْتَ لَيَحْبَطَنَّ عَمَلُكَ",
      english: "And it was already revealed to you and to those before you that if you should associate [anything] with Allah, your work would surely become worthless.",
    },
  },
  {
    id: "tw-4",
    icon: "🚫",
    title: "Avoiding Shirk",
    body: "Shirk (polytheism — associating partners with Allah) is the only sin Allah has declared He will not forgive if one dies upon it. It comes in major forms (worshipping idols, invoking the dead) and subtle forms (seeking fame through worship, seeking blessings from graves, oaths by other than Allah). The Sixth Kalima specifically seeks protection from shirk. A Muslim must constantly examine their heart and actions to ensure all devotion is directed solely to Allah.",
    quranRef: {
      verse: "Surah An-Nisa (4:48)",
      arabic: "إِنَّ اللَّهَ لَا يَغْفِرُ أَن يُشْرَكَ بِهِ وَيَغْفِرُ مَا دُونَ ذَٰلِكَ لِمَن يَشَاءُ",
      english: "Indeed, Allah does not forgive association with Him, but He forgives what is less than that for whom He wills.",
    },
  },
  {
    id: "tw-5",
    icon: "📜",
    title: "Quranic References on Tawheed",
    body: "The Quran contains hundreds of verses affirming Tawheed. From the opening chapter Al-Fatihah ('You alone we worship and You alone we ask for help') to the closing chapters, the message is unbroken: there is no god but Allah. The repeated command to humanity across all prophets — from Ibrahim ﷺ to Musa ﷺ to Isa ﷺ to Muhammad ﷺ — was always 'Worship Allah alone.'",
    quranRef: {
      verse: "Surah Al-Anbiya (21:25)",
      arabic: "وَمَا أَرْسَلْنَا مِن قَبْلِكَ مِن رَّسُولٍ إِلَّا نُوحِي إِلَيْهِ أَنَّهُ لَا إِلَٰهَ إِلَّا أَنَا فَاعْبُدُونِ",
      english: "And We sent not before you any messenger except that We revealed to him that, 'There is no deity except Me, so worship Me.'",
    },
  },
  {
    id: "tw-6",
    icon: "🌟",
    title: "Authentic Hadith References",
    body: "The Prophet ﷺ emphasised Tawheed above all else. When sending Mu'adh ibn Jabal to Yemen, his first instruction was: 'Let the first thing you call them to be the Tawheed of Allah.' The Prophet ﷺ spent 13 years in Makkah primarily establishing Tawheed before any laws were revealed. This shows that correct belief in Allah's Oneness must precede and underpin all action.",
    hadithRef: {
      source: "Sahih al-Bukhari 1496",
      english:
        "The Prophet ﷺ said to Mu'adh ibn Jabal: 'You are going to a people from the People of the Book. The first thing you should invite them to is the Tawheed of Allah.'",
    },
  },
];

// ─── Colour map ────────────────────────────────────────────────────────────────

export const KALIMA_COLOR_MAP: Record<
  string,
  { bg: string; border: string; badge: string; accent: string; number: string }
> = {
  emerald: {
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    accent: "text-emerald-600 dark:text-emerald-400",
    number: "bg-emerald-600 text-white",
  },
  sky: {
    bg: "bg-sky-500/8",
    border: "border-sky-500/20",
    badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25",
    accent: "text-sky-600 dark:text-sky-400",
    number: "bg-sky-600 text-white",
  },
  violet: {
    bg: "bg-violet-500/8",
    border: "border-violet-500/20",
    badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25",
    accent: "text-violet-600 dark:text-violet-400",
    number: "bg-violet-600 text-white",
  },
  amber: {
    bg: "bg-amber-500/8",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
    accent: "text-amber-600 dark:text-amber-400",
    number: "bg-amber-600 text-white",
  },
  rose: {
    bg: "bg-rose-500/8",
    border: "border-rose-500/20",
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25",
    accent: "text-rose-600 dark:text-rose-400",
    number: "bg-rose-600 text-white",
  },
  indigo: {
    bg: "bg-indigo-500/8",
    border: "border-indigo-500/20",
    badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
    accent: "text-indigo-600 dark:text-indigo-400",
    number: "bg-indigo-600 text-white",
  },
};

// ─── Search helpers ────────────────────────────────────────────────────────────

export function searchKalimas(query: string): Kalima[] {
  if (!query.trim()) return KALIMAS;
  const q = query.toLowerCase();
  return KALIMAS.filter(
    (k) =>
      k.arabic.includes(query) ||
      k.transliteration.toLowerCase().includes(q) ||
      k.english.toLowerCase().includes(q) ||
      k.urdu.includes(query) ||
      k.name.toLowerCase().includes(q) ||
      k.nameUrdu.includes(query) ||
      k.subtitle.toLowerCase().includes(q)
  );
}
