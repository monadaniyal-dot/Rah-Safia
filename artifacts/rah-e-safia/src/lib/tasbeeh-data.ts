// ─── Tasbeeh & Dhikr Data ─────────────────────────────────────────────────────
// Authentic Islamic remembrance with Arabic, transliteration, translations,
// explanations, and references.

export interface DhikrItem {
  id: string;
  categoryId: string;
  arabic: string;
  transliteration: string;
  english: string;
  urdu: string;
  explanation: string;
  reference: string;
  count?: string; // recommended repetition count
}

export interface DhikrCategory {
  id: string;
  title: string;
  arabicTitle: string;
  description: string;
  color: string;        // Tailwind color token prefix e.g. "emerald"
  icon: string;         // emoji
}

export const DHIKR_CATEGORIES: DhikrCategory[] = [
  {
    id: "daily",
    title: "Daily Tasbeehs",
    arabicTitle: "الأذكار اليومية",
    description: "Essential remembrance for every Muslim, every day",
    color: "emerald",
    icon: "📿",
  },
  {
    id: "morning",
    title: "Morning Adhkar",
    arabicTitle: "أذكار الصباح",
    description: "Begin your day with the remembrance of Allah",
    color: "amber",
    icon: "🌅",
  },
  {
    id: "evening",
    title: "Evening Adhkar",
    arabicTitle: "أذكار المساء",
    description: "Protect and close your day with dhikr",
    color: "indigo",
    icon: "🌙",
  },
  {
    id: "istighfar",
    title: "Istighfar & Forgiveness",
    arabicTitle: "الاستغفار والتوبة",
    description: "Seek Allah's forgiveness and mercy",
    color: "rose",
    icon: "🤲",
  },
  {
    id: "durood",
    title: "Durood & Salawat",
    arabicTitle: "الصلاة على النبي ﷺ",
    description: "Send blessings upon the Prophet Muhammad ﷺ",
    color: "teal",
    icon: "✨",
  },
  {
    id: "protection",
    title: "Protection & Hardship",
    arabicTitle: "أذكار الحماية والكرب",
    description: "Dhikr for difficulties, worries, and seeking refuge",
    color: "sky",
    icon: "🛡️",
  },
  {
    id: "quranic",
    title: "Quranic Tasbeehs",
    arabicTitle: "التسبيحات القرآنية",
    description: "Remembrance phrases mentioned in the Holy Quran",
    color: "green",
    icon: "📖",
  },
];

export const DHIKR_ITEMS: DhikrItem[] = [
  // ── Daily Tasbeehs ─────────────────────────────────────────────────────────

  {
    id: "daily-1",
    categoryId: "daily",
    arabic: "سُبْحَانَ اللّٰهِ",
    transliteration: "SubhanAllah",
    english: "Glory be to Allah",
    urdu: "اللہ پاک ہے",
    explanation:
      "SubhanAllah expresses the absolute perfection and purity of Allah, declaring Him free from any deficiency, partner, or imperfection. It is one of the most beloved phrases to Allah and weighs heavily on the scale of good deeds.",
    reference: "Bukhari 6406, Muslim 2694",
    count: "33×",
  },
  {
    id: "daily-2",
    categoryId: "daily",
    arabic: "الْحَمْدُ لِلّٰهِ",
    transliteration: "Alhamdulillah",
    english: "All praise and thanks are due to Allah",
    urdu: "تمام تعریف اللہ کے لیے ہے",
    explanation:
      "Alhamdulillah is an expression of complete gratitude to Allah. The Prophet ﷺ said it fills the scales of good deeds. Gratitude to Allah is one of the highest stations a believer can attain.",
    reference: "Muslim 223, Tirmidhi 3514",
    count: "33×",
  },
  {
    id: "daily-3",
    categoryId: "daily",
    arabic: "اللّٰهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    english: "Allah is the Greatest",
    urdu: "اللہ سب سے بڑا ہے",
    explanation:
      "Allahu Akbar declares that Allah is greater than everything — greater than all worries, fears, and worldly concerns. It is the opening of every Salah and the call to prayer, reminding the believer to put Allah above all else.",
    reference: "Bukhari 6406, Muslim 597",
    count: "33×",
  },
  {
    id: "daily-4",
    categoryId: "daily",
    arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ",
    transliteration: "La ilaha illallah",
    english: "There is no deity worthy of worship except Allah",
    urdu: "اللہ کے سوا کوئی معبود نہیں",
    explanation:
      "The foundational declaration of Islamic monotheism. The Prophet ﷺ said it is the best form of dhikr. It renews one's faith and is the key to Paradise. Its recitation wipes away sins as leaves fall from a tree.",
    reference: "Tirmidhi 3383, Ibn Majah 3794",
    count: "100×",
  },
  {
    id: "daily-5",
    categoryId: "daily",
    arabic: "أَسْتَغْفِرُ اللّٰهَ",
    transliteration: "Astaghfirullah",
    english: "I seek forgiveness from Allah",
    urdu: "میں اللہ سے بخشش مانگتا ہوں",
    explanation:
      "A short but powerful supplication seeking Allah's forgiveness. The Prophet ﷺ himself sought forgiveness more than 70 times a day despite being sinless, teaching us the importance of constant repentance.",
    reference: "Bukhari 6307, Muslim 2702",
    count: "100×",
  },
  {
    id: "daily-6",
    categoryId: "daily",
    arabic: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllahi wa bihamdihi",
    english: "Glory be to Allah and with His praise",
    urdu: "اللہ پاک ہے اور اس کی حمد کے ساتھ",
    explanation:
      "The Prophet ﷺ said: 'Whoever says SubhanAllahi wa bihamdihi one hundred times a day, his sins are forgiven even if they are as great as the foam of the sea.' It is light on the tongue but heavy on the scales.",
    reference: "Bukhari 6405, Muslim 2691",
    count: "100×",
  },
  {
    id: "daily-7",
    categoryId: "daily",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    english: "There is no might nor power except with Allah",
    urdu: "اللہ کے سوا کوئی طاقت اور قوت نہیں",
    explanation:
      "Known as the Hawqala, this phrase is a treasure of Paradise. It acknowledges complete dependence on Allah and is highly recommended after Adhan, during hardship, and throughout the day.",
    reference: "Bukhari 7386, Muslim 2704",
    count: "—",
  },
  {
    id: "daily-8",
    categoryId: "daily",
    arabic: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ سُبْحَانَ اللّٰهِ الْعَظِيمِ",
    transliteration: "SubhanAllahi wa bihamdihi, SubhanAllahil Adheem",
    english: "Glory be to Allah and His is the praise; Glory be to Allah the Almighty",
    urdu: "اللہ پاک ہے اور اس کی حمد ہے، عظیم اللہ پاک ہے",
    explanation:
      "The Prophet ﷺ said these two phrases are light on the tongue, heavy on the scale, and beloved to the Most Merciful. They combine glorification with the acknowledgment of Allah's absolute greatness.",
    reference: "Bukhari 6682, Muslim 2694",
    count: "—",
  },

  // ── Morning Adhkar ──────────────────────────────────────────────────────────

  {
    id: "morning-1",
    categoryId: "morning",
    arabic: "اللّٰهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    transliteration:
      "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilaikan-nushoor",
    english:
      "O Allah, by You we enter the morning and by You we enter the evening; by You we live and by You we die, and to You is the resurrection.",
    urdu:
      "اے اللہ! تیرے نام سے ہم نے صبح کی اور تیرے نام سے شام کریں گے، تیرے ذریعے جیتے اور مریں گے، اور تیری طرف اٹھنا ہے",
    explanation:
      "This morning supplication begins the day by acknowledging complete dependence on Allah — from waking to sleeping, living to dying. It is a comprehensive surrender to Allah at the start of each day.",
    reference: "Abu Dawud 5068, Tirmidhi 3391",
    count: "1×",
  },
  {
    id: "morning-2",
    categoryId: "morning",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:
      "Asbahna wa asbahal mulku lillah, wal-hamdulillah, la ilaha illallahu wahdahu la shareeka lah",
    english:
      "We have entered the morning and the whole kingdom of Allah has entered the morning. All praise is due to Allah. None has the right to be worshipped except Allah alone, Who has no partner.",
    urdu:
      "ہم نے صبح کی اور اللہ کی بادشاہت نے صبح کی، تمام تعریف اللہ کے لیے، اللہ کے سوا کوئی معبود نہیں، اکیلا ہے کوئی شریک نہیں",
    explanation:
      "Recited every morning to affirm that sovereignty belongs only to Allah and to begin the day with His praises. It reminds the believer of the true Owner of all creation.",
    reference: "Muslim 2723",
    count: "1×",
  },
  {
    id: "morning-3",
    categoryId: "morning",
    arabic: "اللّٰهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ",
    transliteration:
      "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduka",
    english:
      "O Allah, You are my Lord. There is no deity worthy of worship except You. You created me and I am Your servant.",
    urdu:
      "اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود نہیں، تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں",
    explanation:
      "Part of Sayyidul Istighfar — the master of supplications for forgiveness. Reciting it in the morning with firm belief, and dying that day, guarantees Paradise according to the Prophet ﷺ.",
    reference: "Bukhari 6306",
    count: "1×",
  },
  {
    id: "morning-4",
    categoryId: "morning",
    arabic: "بِسْمِ اللّٰهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration:
      "Bismillahil-lathee la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-samee'ul-'aleem",
    english:
      "In the name of Allah with Whose name nothing can harm on earth or in heaven, and He is the All-Hearing, All-Knowing.",
    urdu:
      "اس اللہ کے نام سے جس کے نام کے ساتھ زمین و آسمان میں کوئی چیز نقصان نہیں پہنچا سکتی، اور وہ سننے والا جاننے والا ہے",
    explanation:
      "Recited three times in the morning, this dhikr provides complete protection throughout the day. The Prophet ﷺ promised that nothing would harm the one who says it until evening.",
    reference: "Abu Dawud 5088, Tirmidhi 3388",
    count: "3×",
  },
  {
    id: "morning-5",
    categoryId: "morning",
    arabic: "رَضِيتُ بِاللّٰهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ نَبِيًّا",
    transliteration:
      "Radeetuبillahi rabba, wa bil-islami deena, wa bi-Muhammadin nabiyya",
    english:
      "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.",
    urdu:
      "میں اللہ کے رب ہونے پر، اسلام کے دین ہونے پر، اور محمد ﷺ کے نبی ہونے پر راضی ہوں",
    explanation:
      "The Prophet ﷺ said whoever says this in the morning three times, it is a right upon Allah to please that person on the Day of Resurrection. It is a declaration of complete contentment with one's faith.",
    reference: "Ahmad 18967, Abu Dawud 5072",
    count: "3×",
  },
  {
    id: "morning-6",
    categoryId: "morning",
    arabic: "اللّٰهُمَّ عَافِنِي فِي بَدَنِي، اللّٰهُمَّ عَافِنِي فِي سَمْعِي، اللّٰهُمَّ عَافِنِي فِي بَصَرِي",
    transliteration:
      "Allahumma 'aafini fi badani, Allahumma 'aafini fi sam'i, Allahumma 'aafini fi basari",
    english:
      "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight.",
    urdu:
      "اے اللہ! میرے بدن کو عافیت دے، اے اللہ! میری سماعت کو عافیت دے، اے اللہ! میری بصارت کو عافیت دے",
    explanation:
      "A comprehensive morning supplication seeking wellbeing in one's body, hearing, and sight — the fundamental gifts Allah has granted us. Recited three times each morning and evening.",
    reference: "Abu Dawud 5090, Ahmad 20430",
    count: "3×",
  },

  // ── Evening Adhkar ──────────────────────────────────────────────────────────

  {
    id: "evening-1",
    categoryId: "evening",
    arabic: "اللّٰهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
    transliteration:
      "Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilayk al-maseer",
    english:
      "O Allah, by You we enter the evening and by You we enter the morning; by You we live and by You we die, and to You is the final return.",
    urdu:
      "اے اللہ! تیرے نام سے ہم نے شام کی اور تیرے نام سے صبح کریں گے، تیرے ذریعے جیتے اور مریں گے، اور تیری طرف لوٹنا ہے",
    explanation:
      "The evening counterpart of the morning supplication. Recited at dusk, it closes the day by surrendering entirely to Allah and acknowledging that the ultimate return is to Him.",
    reference: "Abu Dawud 5068, Tirmidhi 3391",
    count: "1×",
  },
  {
    id: "evening-2",
    categoryId: "evening",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلّٰهِ، وَالْحَمْدُ لِلّٰهِ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:
      "Amsayna wa amsal-mulku lillah, wal-hamdulillah, la ilaha illallahu wahdahu la shareeka lah",
    english:
      "We have entered the evening and the whole kingdom belongs to Allah. All praise is due to Allah. None has the right to be worshipped except Allah alone, Who has no partner.",
    urdu:
      "ہم نے شام کی اور اللہ کی بادشاہت نے شام کی، تمام تعریف اللہ کے لیے، اللہ کے سوا کوئی معبود نہیں، اکیلا ہے کوئی شریک نہیں",
    explanation:
      "The evening version of the morning remembrance. It reaffirms sovereignty belonging solely to Allah as the day closes, bringing a sense of peace and trust before night.",
    reference: "Muslim 2723",
    count: "1×",
  },
  {
    id: "evening-3",
    categoryId: "evening",
    arabic: "حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration:
      "Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa rabbul 'arshil 'adheem",
    english:
      "Allah is sufficient for me; there is no deity worthy of worship except Him. Upon Him I rely and He is the Lord of the Mighty Throne.",
    urdu:
      "اللہ میرے لیے کافی ہے، اس کے سوا کوئی معبود نہیں، اس پر بھروسہ کیا اور وہ عرش عظیم کا رب ہے",
    explanation:
      "Recited seven times each morning and evening. The Prophet ﷺ said Allah will take care of all the worries of the one who recites it. It is a powerful expression of complete reliance on Allah.",
    reference: "Abu Dawud 5081, Ibn As-Sunni 71",
    count: "7×",
  },
  {
    id: "evening-4",
    categoryId: "evening",
    arabic: "اللّٰهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللّٰهُ لَا إِلٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ",
    transliteration:
      "Allahumma inni amsaytu ushhiduka wa ushhidu hamalata 'arshika wa mala'ikataka wa jamee'a khalqika annaka antallahu la ilaha illa anta wahdaka la shareeka lak",
    english:
      "O Allah, I have entered the evening calling You to witness and calling Your Throne-bearers, Your angels, and all Your creation to witness that You are Allah; there is no deity worthy of worship except You alone with no partner.",
    urdu:
      "اے اللہ! میں نے شام کی اور تجھے، تیرے عرش کے اٹھانے والوں، تیرے فرشتوں اور تمام مخلوق کو گواہ بناتا ہوں کہ تو اللہ ہے، تیرے سوا کوئی معبود نہیں، اکیلا ہے کوئی شریک نہیں",
    explanation:
      "Recited four times in the evening. The Prophet ﷺ said Allah will free from Hellfire the one who says it. It is a powerful testimony of faith witnessed by all of creation.",
    reference: "Abu Dawud 5069, Ibn Hibban",
    count: "4×",
  },
  {
    id: "evening-5",
    categoryId: "evening",
    arabic: "اللّٰهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration:
      "Allahumma inni as'alukal 'afwa wal 'aafiyata fid-dunya wal-akhirah",
    english:
      "O Allah, I ask You for pardon and well-being in this life and in the Hereafter.",
    urdu:
      "اے اللہ! میں تجھ سے دنیا اور آخرت میں معافی اور عافیت مانگتا ہوں",
    explanation:
      "Ibn 'Umar reported that the Prophet ﷺ never missed saying this dua morning and evening. He considered well-being ('aafiyah) to be one of the greatest blessings — it encompasses physical, mental, and spiritual soundness.",
    reference: "Abu Dawud 5074, Ibn Majah 3871",
    count: "1×",
  },

  // ── Istighfar & Forgiveness ─────────────────────────────────────────────────

  {
    id: "istighfar-1",
    categoryId: "istighfar",
    arabic:
      "اللّٰهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration:
      "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya wa abu'u bidhanbi faghfirli fa innahu la yaghfirudh-dhunuba illa ant",
    english:
      "O Allah, You are my Lord, there is no deity worthy of worship but You. You created me and I am Your servant, and I abide by Your covenant and promise as best as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.",
    urdu:
      "اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود نہیں، تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں، میں اپنی طاقت کے مطابق تیرے عہد و وعدے پر قائم ہوں، میں اپنے اعمال کی برائی سے تیری پناہ مانگتا ہوں، تیری نعمت کا اعتراف کرتا اور اپنے گناہ کا اقرار کرتا ہوں، پس مجھے بخش دے کیونکہ تیرے سوا کوئی گناہ نہیں بخش سکتا",
    explanation:
      "This is Sayyidul Istighfar — the Master Supplication for Forgiveness. The Prophet ﷺ said it is the best dua for seeking forgiveness. Whoever recites it with sincere belief in the morning or evening and dies that day or night is guaranteed Paradise.",
    reference: "Bukhari 6306",
    count: "1×",
  },
  {
    id: "istighfar-2",
    categoryId: "istighfar",
    arabic: "أَسْتَغْفِرُ اللّٰهَ الْعَظِيمَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    transliteration:
      "Astaghfirullaahal-'Adheemالladhi la ilaha illa huwal-Hayyul-Qayyumu wa atubu ilayh",
    english:
      "I seek forgiveness from Allah the Mighty, whom there is no deity worthy of worship except Him, the Ever-Living, the Sustainer, and I repent to Him.",
    urdu:
      "میں اللہ عظیم سے بخشش مانگتا ہوں جس کے سوا کوئی معبود نہیں، جو ہمیشہ زندہ اور قائم ہے، اور میں اس کی طرف توبہ کرتا ہوں",
    explanation:
      "The Prophet ﷺ said that whoever says this, Allah will forgive him even if he fled from the battlefield. It combines seeking forgiveness with affirming Allah's most powerful attributes — Al-Hayy (Ever-Living) and Al-Qayyum (Self-Sustaining).",
    reference: "Abu Dawud 1517, Tirmidhi 3577",
    count: "3×",
  },
  {
    id: "istighfar-3",
    categoryId: "istighfar",
    arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    transliteration:
      "Rabbana dhalamna anfusana wa illam taghfir lana wa tarhamna lanakunanna minal-khasireen",
    english:
      "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
    urdu:
      "اے ہمارے رب! ہم نے اپنی جانوں پر ظلم کیا، اگر تو نے ہمیں نہ بخشا اور ہم پر رحم نہ کیا تو ہم نقصان اٹھانے والوں میں سے ہوں گے",
    explanation:
      "This is the dua of Adam and Hawa (peace be upon them) as recorded in the Quran (7:23). It is a complete expression of humility and acknowledgment of one's own shortcomings before Allah.",
    reference: "Quran 7:23",
    count: "—",
  },
  {
    id: "istighfar-4",
    categoryId: "istighfar",
    arabic: "لَا إِلٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration:
      "La ilaha illa anta subhanaka inni kuntu minaz-dhalimeen",
    english:
      "There is no deity worthy of worship except You; Glory be to You. Indeed, I have been of the wrongdoers.",
    urdu:
      "تیرے سوا کوئی معبود نہیں، تو پاک ہے، بے شک میں ظالموں میں سے تھا",
    explanation:
      "Known as Dua Yunus — the supplication of Prophet Yunus (Jonah) when he was in the belly of the whale (Quran 21:87). The Prophet ﷺ said no Muslim recites this dua in any trial except that Allah responds to it.",
    reference: "Quran 21:87, Tirmidhi 3505",
    count: "—",
  },
  {
    id: "istighfar-5",
    categoryId: "istighfar",
    arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ",
    transliteration:
      "Rabbighfir li wa tub 'alayya innaka antat-Tawwabur-Raheem",
    english:
      "My Lord, forgive me and accept my repentance. Indeed, You are the Accepting of repentance, the Merciful.",
    urdu:
      "اے میرے رب! مجھے بخش دے اور میری توبہ قبول فرما، بے شک تو توبہ قبول کرنے والا، مہربان ہے",
    explanation:
      "The Prophet ﷺ used to repeat this dua one hundred times in a single sitting. It calls upon two of Allah's most comforting names — At-Tawwab (The Accepter of Repentance) and Ar-Raheem (The Merciful).",
    reference: "Tirmidhi 3434, Ibn Majah 3814",
    count: "100×",
  },

  // ── Durood & Salawat ────────────────────────────────────────────────────────

  {
    id: "durood-1",
    categoryId: "durood",
    arabic:
      "اللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللّٰهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration:
      "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hameedun Majeed. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hameedun Majeed",
    english:
      "O Allah, send your prayers upon Muhammad and upon the family of Muhammad, as You sent Your prayers upon Ibrahim and upon the family of Ibrahim. Indeed, You are Praiseworthy, Majestic. O Allah, send Your blessings upon Muhammad and upon the family of Muhammad, as You sent Your blessings upon Ibrahim and upon the family of Ibrahim. Indeed, You are Praiseworthy, Majestic.",
    urdu:
      "اے اللہ! محمد ﷺ پر اور آل محمد پر رحمت نازل فرما جیسے تو نے ابراہیم ؑ اور آل ابراہیم پر رحمت نازل فرمائی، بے شک تو قابل تعریف اور بزرگ ہے۔ اے اللہ! محمد ﷺ پر اور آل محمد پر برکت نازل فرما جیسے تو نے ابراہیم ؑ اور آل ابراہیم پر برکت نازل فرمائی، بے شک تو قابل تعریف اور بزرگ ہے",
    explanation:
      "Durood Ibrahim — the most authentic and complete form of salawat, recited in every Salah. The Prophet ﷺ taught this durood to his companions when they asked how to send blessings upon him. Whoever sends one salawat upon the Prophet ﷺ, Allah sends ten blessings upon him.",
    reference: "Bukhari 3370, Muslim 406",
    count: "10×",
  },
  {
    id: "durood-2",
    categoryId: "durood",
    arabic: "اللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    transliteration: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad",
    english: "O Allah, send Your blessings upon Muhammad and upon the family of Muhammad.",
    urdu: "اے اللہ! محمد ﷺ پر اور آل محمد پر رحمت نازل فرما",
    explanation:
      "The short form of salawat upon the Prophet ﷺ. The Prophet ﷺ said: 'Whoever sends one salawat upon me, Allah will send ten blessings upon him, erase ten of his sins, and raise him ten degrees.' It is the most beloved of deeds to bring one close to the Prophet ﷺ on the Day of Judgement.",
    reference: "Muslim 408, Tirmidhi 484",
    count: "10×",
  },
  {
    id: "durood-3",
    categoryId: "durood",
    arabic: "اللّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ عَبْدِكَ وَرَسُولِكَ النَّبِيِّ الْأُمِّيِّ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ",
    transliteration:
      "Allahumma salli 'ala Muhammadin 'abdika wa rasoolikal-nabiyyil-ummiyyi wa 'ala alihi wa sahbihi wa sallim",
    english:
      "O Allah, send Your blessings upon Muhammad, Your servant and messenger, the unlettered prophet, and upon his family and companions, and grant him peace.",
    urdu:
      "اے اللہ! اپنے بندے اور رسول، نبی امی محمد ﷺ پر رحمت نازل فرما اور ان کی آل اور صحابہ پر، اور انہیں سلام بھیج",
    explanation:
      "A comprehensive salawat that honours the Prophet ﷺ as both servant of Allah and His messenger, and extends blessings to his family and companions — all who preserved and transmitted Islam.",
    reference: "Authentic Salawat tradition",
    count: "—",
  },
  {
    id: "durood-4",
    categoryId: "durood",
    arabic: "اللّٰهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ",
    transliteration:
      "Allahumma salli salatan kamilatan wa sallim salaman tamman 'ala sayyidina Muhammadil-ladhi tanhallu bihil-'uqadu wa tanfariju bihil-kurab",
    english:
      "O Allah, send complete blessings and perfect peace upon our Master Muhammad, through whom knots are untied and hardships are relieved.",
    urdu:
      "اے اللہ! ہمارے سردار محمد ﷺ پر کامل درود اور پوری سلامتی نازل فرما جن کے ذریعے گرہیں کھلتی ہیں اور مشکلات دور ہوتی ہیں",
    explanation:
      "Durood Tunajjina — known for its profound blessings and supplication for relief from hardship. It is widely recited by Muslims around the world, especially in times of difficulty, as a means of seeking the intercession and blessings of the Prophet ﷺ.",
    reference: "Classical Islamic Tradition",
    count: "—",
  },

  // ── Protection & Hardship ───────────────────────────────────────────────────

  {
    id: "protection-1",
    categoryId: "protection",
    arabic: "حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal wakeel",
    english: "Allah is sufficient for us and He is the best Disposer of affairs.",
    urdu: "اللہ ہمارے لیے کافی ہے اور وہ بہترین کارساز ہے",
    explanation:
      "These were the words of Ibrahim ﷺ when he was thrown into the fire, and the words of the Prophet Muhammad ﷺ and the companions when told that the enemy forces had gathered against them. Allah responded to their trust — the fire became cool and safe for Ibrahim ﷺ, and the battle plans of the enemies crumbled.",
    reference: "Quran 3:173, Bukhari 4563",
    count: "—",
  },
  {
    id: "protection-2",
    categoryId: "protection",
    arabic: "إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
    transliteration: "Inna lillahi wa inna ilayhi raji'oon",
    english: "Indeed we belong to Allah and indeed to Him we will return.",
    urdu: "بے شک ہم اللہ کے لیے ہیں اور اسی کی طرف لوٹنے والے ہیں",
    explanation:
      "Recited upon any calamity, loss, or when hearing of someone's death. Allah revealed in the Quran (2:156-157) that those who say this upon affliction will receive blessings and mercy from their Lord. It resets perspective — all belongs to Allah and all returns to Him.",
    reference: "Quran 2:156, Muslim 918",
    count: "—",
  },
  {
    id: "protection-3",
    categoryId: "protection",
    arabic: "اللّٰهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنتَ تَجْعَلُ الْحَزَنَ إِذَا شِئْتَ سَهْلًا",
    transliteration:
      "Allahumma la sahla illa ma ja'altahu sahla, wa anta taj'alul hazna idha shi'ta sahla",
    english:
      "O Allah, there is no ease except what You have made easy, and You make the difficult easy when You will.",
    urdu:
      "اے اللہ! کوئی آسانی نہیں مگر جو تو نے آسان کی، اور تو غم کو جب چاہے آسان بنا دیتا ہے",
    explanation:
      "A dua for ease in difficulty. It acknowledges that all ease comes only from Allah, and that He alone can transform hardship into ease. Recite this whenever facing challenges in work, studies, relationships, or any aspect of life.",
    reference: "Ibn Hibban, Ibn As-Sunni",
    count: "—",
  },
  {
    id: "protection-4",
    categoryId: "protection",
    arabic: "اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
    transliteration:
      "Allahumma inni a'udhu bika minal-hammi wal-hazan, wa a'udhu bika minal-'ajzi wal-kasal, wa a'udhu bika minal-jubni wal-bukhl, wa a'udhu bika min ghalabatid-dayni wa qahrir-rijal",
    english:
      "O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from cowardice and miserliness, and from the overpowering of debt and the force of men.",
    urdu:
      "اے اللہ! میں تیری پناہ مانگتا ہوں فکر اور غم سے، عاجزی اور سستی سے، بزدلی اور بخیلی سے، اور قرض کی مغلوبیت اور لوگوں کے ظلم سے",
    explanation:
      "One of the most comprehensive morning and evening supplications of the Prophet ﷺ, covering emotional, psychological, and financial trials. It is a shield against the most common human hardships.",
    reference: "Bukhari 6369",
    count: "1×",
  },
  {
    id: "protection-5",
    categoryId: "protection",
    arabic: "اللّٰهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلٰهَ إِلَّا أَنتَ",
    transliteration:
      "Allahumma rahmataka arju fala takilni ila nafsi tarfata 'aynin, wa aslih li sha'ni kullahu, la ilaha illa ant",
    english:
      "O Allah, I hope for Your mercy; do not leave me to myself even for the blink of an eye. Rectify all my affairs. There is no deity worthy of worship except You.",
    urdu:
      "اے اللہ! میں تیری رحمت کا امیدوار ہوں، مجھے پلک جھپکنے کی مدت کے لیے بھی میرے نفس کے حوالے نہ کر، میرے تمام معاملات سنوار دے، تیرے سوا کوئی معبود نہیں",
    explanation:
      "A beautiful supplication for those feeling lost, overwhelmed, or alone. It expresses complete dependence on Allah's mercy and asks that He never abandon us to our own weaknesses — not even for a moment.",
    reference: "Abu Dawud 5090, Ahmad",
    count: "—",
  },
  {
    id: "protection-6",
    categoryId: "protection",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللّٰهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration:
      "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    english:
      "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    urdu:
      "میں اللہ کے کامل کلمات کی پناہ میں آتا ہوں اس کی مخلوق کی برائی سے",
    explanation:
      "Recited three times in the evening. The Prophet ﷺ said that nothing will harm the one who says it until morning. It is also recited upon arriving at a new place (hotel, village, etc.) as protection from harm.",
    reference: "Muslim 2708",
    count: "3×",
  },

  // ── Quranic Tasbeehs ────────────────────────────────────────────────────────

  {
    id: "quranic-1",
    categoryId: "quranic",
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    transliteration: "SubhanaRabbial-'Adheem",
    english: "Glory be to my Lord, the Most Great.",
    urdu: "پاک ہے میرا رب جو بڑا عظیم ہے",
    explanation:
      "Recited in Ruku' (bowing) during Salah. Allah says in the Quran (56:74): 'So glorify the name of your Lord, the Most Great.' It is the perfect glorification for the position of submission before the Almighty.",
    reference: "Quran 56:74, Muslim 772",
    count: "3×",
  },
  {
    id: "quranic-2",
    categoryId: "quranic",
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    transliteration: "Subhana Rabbiyal-A'la",
    english: "Glory be to my Lord, the Most High.",
    urdu: "پاک ہے میرا رب جو سب سے بلند ہے",
    explanation:
      "Recited in Sujood (prostration) during Salah, the highest act of worship. Allah says in the Quran (87:1): 'Glorify the name of your Lord, the Most High.' In prostration, the servant is closest to Allah — glorifying His transcendence while being in complete submission.",
    reference: "Quran 87:1, Muslim 772",
    count: "3×",
  },
  {
    id: "quranic-3",
    categoryId: "quranic",
    arabic: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
    transliteration:
      "SubhanAllahi wa bihamdihi 'adada khalqihi wa rida nafsihi wa zinata 'arshihi wa midada kalimatihi",
    english:
      "Glory be to Allah and His is the praise, to the number of His creation, in accordance with His pleasure, equal to the weight of His Throne, and equal to the ink of His words.",
    urdu:
      "اللہ پاک ہے اور اس کی حمد ہے، اس کی مخلوق کی تعداد کے برابر، اس کی رضا کے مطابق، اس کے عرش کے وزن کے برابر، اور اس کے کلمات کی سیاہی کے برابر",
    explanation:
      "Aisha (RA) reported that the Prophet ﷺ said this dhikr is superior to reciting SubhanAllah thousands of times. It encompasses all of creation and the unlimited attributes of Allah, making it one of the most expansive glorifications.",
    reference: "Muslim 2726",
    count: "3×",
  },
  {
    id: "quranic-4",
    categoryId: "quranic",
    arabic: "فَسُبْحَانَ اللّٰهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ",
    transliteration: "FasubhanAllahi heena tumsuna wa heena tusbihoon",
    english: "So glorify Allah when you enter the evening and when you enter the morning.",
    urdu: "پس اللہ کی تسبیح کرو جب تم شام کرو اور جب صبح کرو",
    explanation:
      "A direct Quranic command (30:17) to glorify Allah at both ends of the day — morning and evening. This verse establishes the two most important times for dhikr, when the transitions of day and night remind us of Allah's power and majesty.",
    reference: "Quran 30:17",
    count: "—",
  },
  {
    id: "quranic-5",
    categoryId: "quranic",
    arabic: "وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا",
    transliteration:
      "Wa sabbih bihamdi rabbika qabla tuluu'ish-shamsi wa qabla ghuroobiha",
    english:
      "And glorify the praises of your Lord before the rising of the sun and before its setting.",
    urdu:
      "اور اپنے رب کی تعریف کے ساتھ تسبیح کرو سورج طلوع ہونے سے پہلے اور اس کے غروب ہونے سے پہلے",
    explanation:
      "A Quranic command (20:130) to perform dhikr at Fajr and Asr times — before sunrise and before sunset. These two times correspond to the Fajr and Asr prayers, emphasising that salah itself is the greatest form of glorification.",
    reference: "Quran 20:130",
    count: "—",
  },
  {
    id: "quranic-6",
    categoryId: "quranic",
    arabic: "أَلَا بِذِكْرِ اللّٰهِ تَطْمَئِنُّ الْقُلُوبُ",
    transliteration: "Ala bidhikrillahi tatma'innul-quloob",
    english: "Verily, in the remembrance of Allah do hearts find rest.",
    urdu: "خبردار! اللہ کی یاد ہی سے دلوں کو سکون ملتا ہے",
    explanation:
      "One of the most profound verses in the Quran (13:28). It is not merely a statement but a divine prescription — the cure for anxiety, depression, grief, and restlessness. Dhikr of Allah is the only true source of lasting peace for the human heart.",
    reference: "Quran 13:28",
    count: "—",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getItemsByCategory(categoryId: string): DhikrItem[] {
  return DHIKR_ITEMS.filter((item) => item.categoryId === categoryId);
}

export function searchDhikr(query: string): DhikrItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return DHIKR_ITEMS;
  return DHIKR_ITEMS.filter(
    (item) =>
      item.arabic.includes(query) ||
      item.transliteration.toLowerCase().includes(q) ||
      item.english.toLowerCase().includes(q) ||
      item.urdu.includes(query) ||
      item.explanation.toLowerCase().includes(q) ||
      item.reference.toLowerCase().includes(q)
  );
}
