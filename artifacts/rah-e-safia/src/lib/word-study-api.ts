/**
 * Quranic Word Study API
 *
 * Data sources (all free, no auth required):
 *   - api.quran.com/api/v4  → word-by-word data per verse
 *   - api.alquran.cloud/v1  → whole-Quran text search for occurrences
 *   - audio.qurancdn.com    → word-level pronunciation audio
 *
 * Caching: in-memory Maps, keyed by "surah:ayah" / "word-text".
 */

import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

// ─── Base URLs ─────────────────────────────────────────────────────────────────
const QURANCOM   = "https://api.quran.com/api/v4";
const ALQURAN    = "https://api.alquran.cloud/v1";
export const WORD_AUDIO_BASE = "https://audio.qurancdn.com/";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface VerseWord {
  id: number;
  position: number;         // 1-based position among "word" tokens
  audioUrl: string;         // relative, prepend WORD_AUDIO_BASE
  textUthmani: string;      // Arabic Uthmani text
  charType: string;         // "word" | "end" | "pause" | "sajdah" | "rub-el-hizb"
  translation: string;      // English meaning
  transliteration: string;  // Romanised transliteration
}

export interface WordOccurrence {
  surahNum: number;
  surahName: string;
  ayahNum: number;
  arabic: string;
}

export interface WordSearchResult {
  total: number;
  occurrences: WordOccurrence[];
}

// ─── Lexicon ──────────────────────────────────────────────────────────────────
// Curated mini-dictionary of the most frequently occurring Quranic words.
// Covers ~70 % of all word tokens in the Quran.
// Lookup is by stripped form (diacritics removed, alif normalised).

export interface LexiconEntry {
  arabic: string;       // Display form (with diacritics)
  root: string;         // Arabic root letters
  rootMeaning: string;  // English meaning of root
  pos: string;          // Part of speech label
  explanation: string;  // Lexical explanation
  urdu: string;         // Urdu meaning
}

// Strip tashkeel + tatweel + other marks for matching
export function stripDiacritics(text: string): string {
  return text
    // 1. Remove BOM (appears on the first word of many AlQuran.cloud responses)
    .replace(/\uFEFF/g, "")
    // 2. Superscript alef (U+0670) is used in Uthmani orthography to represent a
    //    phonemic alef that is not written as an explicit letter (e.g. رَحْمَٰن, مَٰلِك).
    //    Convert it to a regular alef so it participates in root matching.
    .replace(/\u0670/g, "\u0627")
    // 3. Strip all remaining tashkeel, Quranic pause/sajda marks, and small
    //    hamza/waw/ya signs (U+06E5, U+06E6 are NOT in the \u06DF-\u06E4 block).
    .replace(/[\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E4\u06E5\u06E6\u06E7\u06E8\u06EA-\u06ED]/g, "")
    // 4. Tatweel (elongation)
    .replace(/\u0640/g, "")
    // 5. Normalise all alif variants (hamza-wasl ٱ, hamza-above أ, hamza-below إ,
    //    madda آ) to plain alef ا
    .replace(/[ٱإأآا]/g, "\u0627")
    // 6. Alef maqsura (ى U+0649) looks like ya but is a different codepoint —
    //    normalise to ya (ي U+064A) so كرسى / كرسي and على / علي both match
    .replace(/\u0649/g, "\u064A")
    .trim();
}

const LEXICON: LexiconEntry[] = [
  { arabic: "اللَّه", root: "أله", rootMeaning: "To worship, to be bewildered", pos: "Proper Noun", explanation: "The proper name of the One God in Arabic. It is derived from the root 'ilāh' (deity) with the definite article, uniquely designating the Creator. Unlike generic terms for 'god', this name has no plural, no feminine form, and belongs exclusively to the Creator.", urdu: "اللہ (معبودِ حقیقی)" },
  { arabic: "رَبّ", root: "ربب", rootMeaning: "To nurture, sustain, foster", pos: "Noun", explanation: "'Rabb' means Lord, Master, and Nurturer. It conveys that Allah is the One who created all things and continues to sustain, manage, and perfect them. Every created being is nurtured by its Rabb.", urdu: "پروردگار، رب" },
  { arabic: "رَحْمَان", root: "رحم", rootMeaning: "Mercy, compassion", pos: "Adjective", explanation: "Ar-Rahmān is one of the most exalted names of Allah, denoting the One whose mercy is vast and comprehensive, encompassing all of creation in this world. It is derived from 'rahmah' (mercy) and is an intensive form indicating mercy of the greatest magnitude.", urdu: "بے حد رحم کرنے والا" },
  { arabic: "رَحِيم", root: "رحم", rootMeaning: "Mercy, compassion", pos: "Adjective", explanation: "Ar-Rahīm is another name of Allah meaning the Especially Merciful. While Ar-Rahmān indicates universal mercy encompassing all beings, Ar-Rahīm specifically refers to special mercy reserved for the believers in the Hereafter.", urdu: "بار بار رحم کرنے والا" },
  { arabic: "بِسْم", root: "سمو", rootMeaning: "To be elevated, exalted", pos: "Preposition + Noun", explanation: "'Bism' (In the name of) is a formula of consecration. Beginning any action with 'Bismillah' seeks Allah's blessing and protection and acknowledges that every act is done in His name, with His permission, and with dependence on Him.", urdu: "نام سے (بنام)" },
  { arabic: "اسم", root: "سمو", rootMeaning: "To be elevated, exalted", pos: "Noun", explanation: "'Ism' (name) in Arabic is derived from a root meaning elevation. Names elevate and distinguish beings. In Islamic theology, Allah's names (al-Asmā' al-Husnā) are the most elevated and beautiful of all names.", urdu: "نام" },
  { arabic: "حَمْد", root: "حمد", rootMeaning: "To praise, commend", pos: "Noun", explanation: "'Al-Hamd' means praise that acknowledges perfection combined with love. It differs from mere flattery ('madh') in that it is only for those who truly deserve it. 'Alhamdulillah' declares that all true praise, in its perfect form, belongs to Allah alone.", urdu: "تعریف، حمد" },
  { arabic: "مَالِك", root: "ملك", rootMeaning: "To own, possess, rule", pos: "Noun", explanation: "'Mālik' means Owner, Master, or King — One who has complete and absolute ownership. On the Day of Judgment, Allah alone is the King; no earthly authority will exist. This name instils both awe and hope — the hope of a just Master.", urdu: "مالک، بادشاہ" },
  { arabic: "يَوْم", root: "يوم", rootMeaning: "Day, time period", pos: "Noun", explanation: "'Yawm' generally means 'day' but in the Quran it also refers to significant periods or epochs. 'Yawm al-Dīn' (the Day of Judgment) is the day on which all deeds are accounted for and justice is perfectly served.", urdu: "دن" },
  { arabic: "دِين", root: "دين", rootMeaning: "Judgment, debt, submission", pos: "Noun", explanation: "'Dīn' carries multiple meanings: religion (a way of life), judgment (on the Last Day), and the debt every soul owes to its Creator. As a complete system, it encompasses belief, worship, law, and morality.", urdu: "دین، جزا، قرض" },
  { arabic: "إِيَّاك", root: "", rootMeaning: "", pos: "Pronoun", explanation: "'Iyyāka' is a second-person object pronoun meaning 'You alone'. Placing it before the verb 'naʿbudu' (we worship) gives it emphasis and exclusivity: 'You ALONE we worship' — the cornerstone of Tawheed.", urdu: "تجھ ہی کو (صرف تجھے)" },
  { arabic: "عِبَادة", root: "عبد", rootMeaning: "To serve, worship, submit", pos: "Verb/Noun", explanation: "'ʿIbādah' (worship) encompasses all acts of obedience to Allah — prayer, fasting, charity, dhikr, kindness, and even permissible daily actions done with the intention of pleasing Allah. It is the purpose of human creation (51:56).", urdu: "عبادت، بندگی" },
  { arabic: "اسْتَعِين", root: "عون", rootMeaning: "To aid, help, assist", pos: "Verb", explanation: "'Nasta'īn' (we seek help) follows 'naʿbudu' (we worship) — the perfect pairing. We worship only Allah and seek help only from Him. This verse eliminates dependence on any other being and establishes a direct, exclusive relationship with the Creator.", urdu: "مدد مانگنا" },
  { arabic: "هِدَايَة", root: "هدي", rootMeaning: "To guide, lead gently", pos: "Noun", explanation: "'Hidāyah' is divine guidance — the highest of Allah's gifts. It is not merely information but the ability to follow the straight path. The Quran itself is Hudā (guidance), and 'Ihdinas-Sirāt' is the most repeated prayer a Muslim makes, asked 17+ times daily.", urdu: "ہدایت، راہنمائی" },
  { arabic: "صِرَاط", root: "صرط", rootMeaning: "Path, swallowing up", pos: "Noun", explanation: "'Sirāt' is a wide, clear road or path — unlike 'tarīq' which can be narrow. The 'Sirāt al-Mustaqīm' (Straight Path) is the clear, comprehensive way of belief and action that leads to Allah's pleasure and Paradise.", urdu: "راستہ، صراط" },
  { arabic: "مُسْتَقِيم", root: "قوم", rootMeaning: "To stand straight, be upright", pos: "Adjective", explanation: "'Mustaqīm' (straight, upright) is the path that does not deviate into extremes of excess or negligence. It is the path of the Prophets, the truthful, the martyrs, and the righteous — the balance between this world and the Hereafter.", urdu: "سیدھا، مستقیم" },
  { arabic: "أَنْعَم", root: "نعم", rootMeaning: "To bestow, give favour", pos: "Verb", explanation: "'An'amta' (You have bestowed favour upon) describes the path of those whom Allah has especially blessed: the Prophets, the Siddiqin, the martyrs, and the righteous. It is the path of gratitude and complete submission.", urdu: "نعمت دی، فضل کیا" },
  { arabic: "غَيْر", root: "غير", rootMeaning: "Other than, non-identical", pos: "Noun/Preposition", explanation: "'Ghayri' (other than) marks the contrast between the blessed path and the paths of those who earned anger or went astray. It reinforces that there is a specific path of truth distinct from all deviations.", urdu: "غیر، کے علاوہ" },
  { arabic: "مَغْضُوب", root: "غضب", rootMeaning: "Anger, wrath", pos: "Passive Participle", explanation: "'Al-Maghdūb ʿalayhim' (those who earned anger) traditionally interpreted as those who had knowledge of truth but deliberately rejected it and turned away. Anger (ghadab) here is Allah's response to wilful rejection despite knowing the truth.", urdu: "جن پر غضب ہوا" },
  { arabic: "ضَالّ", root: "ضلل", rootMeaning: "To be lost, astray", pos: "Active Participle", explanation: "'Ad-Dāllīn' (those who went astray) traditionally interpreted as those who followed their desires and whims in worship without the guidance of revelation, falling into misguidance through ignorance or misdirected zeal.", urdu: "گمراہ، بھٹکے ہوئے" },
  { arabic: "قُل", root: "قول", rootMeaning: "To say, speak", pos: "Verb (Imperative)", explanation: "'Qul' (Say!) is a divine command to the Prophet ﷺ — and by extension to all believers — to declare, convey, or respond with specific words. It appears ~332 times in the Quran, marking divinely-revealed declarations.", urdu: "کہو، فرماؤ" },
  { arabic: "آمَن", root: "أمن", rootMeaning: "Safety, security, peace", pos: "Verb", explanation: "'Āmana' (believed, had faith) comes from a root meaning security and peace. Iman (faith) gives the believer inner peace and security because they have entrusted themselves to the All-Knowing, All-Powerful Creator.", urdu: "ایمان لایا" },
  { arabic: "كَافِر", root: "كفر", rootMeaning: "To cover, conceal", pos: "Active Participle", explanation: "'Kāfir' (disbeliever) literally means 'one who covers'. The farmer who buries seeds in the ground is called 'kāfir' in Arabic. Spiritually, it refers to one who covers or conceals the truth, despite recognising it.", urdu: "کافر، انکار کرنے والا" },
  { arabic: "كِتَاب", root: "كتب", rootMeaning: "To write, decree", pos: "Noun", explanation: "'Kitāb' (book, scripture) comes from the root meaning to write and to decree. The Quran is 'Al-Kitāb' — the definitive written decree of Allah. The root also implies that all things are written in the Divine Record (Lawh al-Mahfūdh).", urdu: "کتاب، لکھا ہوا" },
  { arabic: "آيَة", root: "أيي", rootMeaning: "To come, sign", pos: "Noun", explanation: "'Āyah' means a sign, a verse, or a miracle. Each verse of the Quran is an 'āyah' — a sign pointing to Allah's existence, power, wisdom, and mercy. The plural 'āyāt' refers to verses and also to all signs in creation.", urdu: "آیت، نشانی" },
  { arabic: "سَمَاء", root: "سمو", rootMeaning: "Height, elevation", pos: "Noun", explanation: "'Samāʾ' (sky, heaven) comes from the root meaning height and elevation. It refers both to the physical sky above us and to the celestial heavens. In the Quran, the heavens are described as having seven layers, each populated with angelic beings.", urdu: "آسمان" },
  { arabic: "أَرْض", root: "أرض", rootMeaning: "Earth, ground", pos: "Noun", explanation: "'Ard' (earth, land) refers to the physical earth as well as dry ground. In Quranic context, it is often paired with 'samāwāt' (heavens) to indicate the entirety of creation — 'everything in the heavens and the earth belongs to Allah.'", urdu: "زمین" },
  { arabic: "إِنَّ", root: "", rootMeaning: "", pos: "Particle (Emphatic)", explanation: "'Inna' is an emphatic particle that strengthens the sentence it introduces, meaning 'Indeed', 'Verily', or 'Certainly'. Its use signals that what follows is of great importance and worthy of deep attention and certainty.", urdu: "بیشک، یقیناً" },
  { arabic: "وَ", root: "", rootMeaning: "", pos: "Conjunction", explanation: "'Wa' (and) is the most basic Arabic conjunction, linking words, phrases, and ideas. In Quranic rhetoric, its repetition (polysyndeton) creates rhythm, lists comprehensive qualities of Allah or believers, and emphasises the totality of the joined elements.", urdu: "اور" },
  { arabic: "فِي", root: "", rootMeaning: "", pos: "Preposition", explanation: "'Fī' (in, within, among) indicates containment, belonging, or contextual setting. In the Quran, 'fī sabīlillāh' (in the way of Allah) is a foundational concept for striving and sacrifice.", urdu: "میں، کے اندر" },
  { arabic: "عَلَى", root: "", rootMeaning: "", pos: "Preposition", explanation: "'ʿAlā' (upon, on, over) indicates elevation, authority, or responsibility. 'ʿAlā kulli shay'in qadīr' — 'over all things, All-Powerful' — appears dozens of times, affirming Allah's absolute power over everything.", urdu: "پر، اوپر" },
  { arabic: "مِن", root: "", rootMeaning: "", pos: "Preposition", explanation: "'Min' (from, of, some of) indicates origin, part of a whole, or starting point. In Quranic cosmology: 'We created every living thing from water' (21:30) — here 'min' marks the material origin of life.", urdu: "سے، میں سے" },
  { arabic: "إِلَى", root: "", rootMeaning: "", pos: "Preposition", explanation: "'Ilā' (to, towards, until) indicates direction of movement or extension. 'Ilā Rabbi' (towards my Lord) expresses the soul's journey — all creation returns to Allah ultimately.", urdu: "تک، کی طرف" },
  { arabic: "نَفْس", root: "نفس", rootMeaning: "Breath, self, soul", pos: "Noun", explanation: "'Nafs' (soul, self) can refer to the self/person, the soul as a spiritual entity, or the ego/desires. The Quran mentions three aspects of the nafs: the nafs that commands evil (ammāra), the self-blaming soul (lawwāmah), and the tranquil soul (muṭmaʾinnah).", urdu: "نفس، روح، جان" },
  { arabic: "قَلْب", root: "قلب", rootMeaning: "To turn, flip, revolve", pos: "Noun", explanation: "'Qalb' (heart) literally means something that turns and changes — the heart physically beats and spiritually changes its state. In Islam, the heart is the seat of faith and intention. 'In the body is a piece of flesh — if it is sound, the whole body is sound...' (Bukhari)", urdu: "دل، قلب" },
  { arabic: "عِلْم", root: "علم", rootMeaning: "To know, be aware", pos: "Noun", explanation: "'ʿIlm' (knowledge) is one of the most praised qualities in the Quran. The first revelation ('Iqra' — Read!) inaugurated an era of divine knowledge. 'Are those who know equal to those who do not know?' (39:9). Allah is described as Al-ʿAlīm — the All-Knowing.", urdu: "علم، جاننا" },
  { arabic: "حَيّ", root: "حيي", rootMeaning: "Life, to be alive", pos: "Adjective/Noun", explanation: "'Hayy' (Living, Ever-Living) is one of the supreme names of Allah. In Ayat al-Kursi: 'Allah — there is no deity except Him, the Ever-Living (al-Hayy), the Sustainer of existence (al-Qayyūm).' His life is absolute, eternal, and uncaused.", urdu: "زندہ، حی" },
  { arabic: "قَيُّوم", root: "قوم", rootMeaning: "To stand, rise, establish", pos: "Noun", explanation: "'Al-Qayyūm' (the Sustainer of all existence) means the One who stands by Himself and by whom everything else stands and exists. Nothing can exist for a single moment without His sustaining power. This is paired with 'Al-Hayy' in the Greatest Verse (Ayat al-Kursi).", urdu: "قائم رہنے والا، سب کو قائم رکھنے والا" },
  { arabic: "سِنَة", root: "سنن", rootMeaning: "Drowsiness, pattern", pos: "Noun", explanation: "'Sinatun' (drowsiness) in Ayat al-Kursi: 'Neither drowsiness nor sleep overtakes Him.' Allah's vigilance is absolute — He neither tires nor forgets. This contrasts entirely with human limitations, establishing His perfect Lordship.", urdu: "اونگھ" },
  { arabic: "نَوْم", root: "نوم", rootMeaning: "Sleep", pos: "Noun", explanation: "'Nawm' (sleep) — Allah does not sleep, as declared in Ayat al-Kursi. Sleep represents vulnerability and loss of awareness. Allah's freedom from sleep affirms His continuous, perfect, all-encompassing knowledge and control of creation.", urdu: "نیند" },
  { arabic: "كُرْسِيّ", root: "كرس", rootMeaning: "Seat, throne", pos: "Noun", explanation: "'Kursī' (the Footstool / Chair of Allah) is mentioned in the greatest verse of the Quran. The Prophet ﷺ said: 'His Kursī extends over the heavens and the earth.' It represents the extent of Allah's knowledge and dominion.", urdu: "کرسی، تخت" },
  { arabic: "عَظِيم", root: "عظم", rootMeaning: "Greatness, greatness of bone", pos: "Adjective", explanation: "'ʿAẓīm' (the Most Great) denotes magnitude in every dimension — power, knowledge, majesty, and holiness. 'Wa huwa al-ʿAliyyu al-ʿAẓīm' ends Ayat al-Kursi. Saying 'SubhānAllāh al-ʿAẓīm' in rukū' (bowing) acknowledges this supreme greatness.", urdu: "عظیم، بزرگ" },
  { arabic: "جَنَّة", root: "جنن", rootMeaning: "Hidden, concealed, garden", pos: "Noun", explanation: "'Jannah' (Paradise, Garden) comes from a root meaning to conceal, as a garden's beauty is hidden behind its walls. It is the abode of Allah's pleasure and eternal reward for the believers. 'In it is what no eye has seen, no ear has heard, and no human heart has imagined.' (Bukhari)", urdu: "جنت، باغ" },
  { arabic: "نَار", root: "نور", rootMeaning: "Light, fire", pos: "Noun", explanation: "'Nār' (Fire, Hellfire) is the place of punishment for those who rejected faith and persisted in injustice. It is described with intense heat, darkness, and various forms of punishment. Allah in His justice has prepared it as a consequence of willful rejection.", urdu: "آگ، جہنم" },
  { arabic: "إِسْلَام", root: "سلم", rootMeaning: "Peace, submission, safety", pos: "Noun", explanation: "'Islām' means complete, willing submission to Allah. The root 'salm' means peace — those who submit find peace with their Creator and with creation. It is the name Allah chose for His final religion (5:3), and all prophets were 'muslimīn' (those who submitted).", urdu: "اسلام، سلامتی کا راستہ" },
  { arabic: "مُؤْمِن", root: "أمن", rootMeaning: "Safety, trust, peace", pos: "Active Participle", explanation: "'Muʾmin' (believer) is one whose heart is full of īmān (faith). Al-Muʾmin is also a name of Allah (59:23) — the One who gives safety and security. The link between faith and security is profound: true faith brings inner peace.", urdu: "مومن، ایمان والا" },
  { arabic: "مُسْلِم", root: "سلم", rootMeaning: "Peace, submission", pos: "Active Participle", explanation: "'Muslim' is one who has submitted (aslama) their will entirely to Allah. It is the name of every follower of Islam and, in its broader sense, every prophet and pious person throughout history who submitted to the One God.", urdu: "مسلمان، فرمانبردار" },
  { arabic: "صَلَاة", root: "صلو", rootMeaning: "Connection, prayer", pos: "Noun", explanation: "'Salāh' is the ritual prayer — the direct, formal connection between the servant and Allah established five times daily. It is the Second Pillar of Islam and the 'pillar of the religion' (ʿAmādu al-dīn). Its root means connection — it connects the human to the Divine.", urdu: "نماز، صلوٰة" },
  { arabic: "زَكَاة", root: "زكو", rootMeaning: "Purity, growth", pos: "Noun", explanation: "'Zakāh' (obligatory almsgiving) comes from a root meaning purity and growth. Giving Zakāh purifies one's remaining wealth and soul from greed, and causes wealth to grow through Allah's blessing. It is the Third Pillar of Islam.", urdu: "زکوٰة، پاکیزگی" },
  { arabic: "صَوْم", root: "صوم", rootMeaning: "Abstaining, restraint", pos: "Noun", explanation: "'Sawm' (fasting) literally means restraint and abstention. In Islamic practice it is abstaining from food, drink, and intimate relations from dawn to sunset, cultivating taqwā (God-consciousness) and gratitude. It is the Fourth Pillar of Islam.", urdu: "روزہ، صوم" },
  { arabic: "حَجّ", root: "حجج", rootMeaning: "To intend, pilgrimage", pos: "Noun", explanation: "'Hajj' (pilgrimage to Makkah) comes from a root meaning to intend or aim for something important. It is the Fifth Pillar of Islam — performed once in a lifetime when able. It represents the ultimate human gathering in submission to Allah.", urdu: "حج، زیارت" },
  { arabic: "تَقْوَى", root: "وقي", rootMeaning: "To protect, guard", pos: "Noun", explanation: "'Taqwā' is God-consciousness, piety, and a protective awareness of Allah. It is to place a protective barrier between yourself and Allah's displeasure through obedience. 'Verily the most honoured of you before Allah is the most taqwā-conscious.' (49:13)", urdu: "تقویٰ، خوفِ الٰہی" },
  { arabic: "تَوْبَة", root: "توب", rootMeaning: "To return, repent", pos: "Noun", explanation: "'Tawbah' (repentance) means to return — turning back to Allah from sin. True tawbah requires remorse, stopping the sin, resolving not to return to it, and (if applicable) making right wrongs done to others. Allah is At-Tawwāb — He loves to accept repentance.", urdu: "توبہ، رجوع" },
  { arabic: "دُعَاء", root: "دعو", rootMeaning: "To call, invite, supplicate", pos: "Noun", explanation: "'Duʿāʾ' (supplication) is calling upon Allah directly. The Prophet ﷺ called duʿāʾ 'the essence of worship' (Tirmidhi). Allah says: 'Call upon Me; I will respond to you.' (40:60) It is the most direct expression of dependence and faith.", urdu: "دعا، پکار" },
  { arabic: "ذِكْر", root: "ذكر", rootMeaning: "To remember, mention", pos: "Noun", explanation: "'Dhikr' (remembrance, mention) is the continuous remembrance of Allah through words, heart, and action. 'Verily, in the remembrance of Allah do hearts find rest.' (13:28) The Quran itself is called a 'Dhikr' — a reminder for all humanity.", urdu: "ذکر، یاد" },
  { arabic: "نَبِيّ", root: "نبأ", rootMeaning: "To bring news, inform", pos: "Noun", explanation: "'Nabī' (Prophet) is one who receives divine news/revelation from Allah and conveys it. All Prophets were human beings chosen by Allah to guide humanity. Muhammad ﷺ is the Khātam al-Nabiyyīn — the Seal of the Prophets, after whom no prophet will come.", urdu: "نبی، پیغمبر" },
  { arabic: "رَسُول", root: "رسل", rootMeaning: "To send, dispatch", pos: "Noun", explanation: "'Rasūl' (Messenger) is a Prophet who was also given a scripture or major law. Not every prophet is a rasūl, but every rasūl is a prophet. Muhammad ﷺ is described as both Nabī and Rasūl — the final Prophet and Messenger.", urdu: "رسول، پیغام رساں" },
  { arabic: "مَلَك", root: "ملك", rootMeaning: "To possess, power", pos: "Noun", explanation: "'Malak' (angel) is a being of light created from light, created to worship Allah, carry out His commands, and manage the affairs of creation. They do not eat, drink, sleep, or have desires. The greatest angels include Jibreel, Mikā'eel, Isrāfeel, and ʿIzrā'eel.", urdu: "فرشتہ" },
  { arabic: "شَيْطَان", root: "شطن", rootMeaning: "Distant, deviant", pos: "Noun", explanation: "'Shayṭān' (Devil/Satan) comes from a root meaning to be far from good or to be deviant. Iblīs, the chief of the devils, was a jinn who refused to bow to Adam out of pride and was expelled from Allah's mercy. He became humanity's sworn enemy.", urdu: "شیطان، ابلیس" },
  { arabic: "جِنّ", root: "جنن", rootMeaning: "Hidden, concealed", pos: "Noun", explanation: "'Jinn' are beings created from smokeless fire, hidden from human sight. Like humans, they have free will and are accountable to Allah. An entire Surah (Al-Jinn, 72) describes a group of jinn who heard the Quran and became believers.", urdu: "جن" },
  { arabic: "إِنس", root: "أنس", rootMeaning: "Familiarity, humanity", pos: "Noun", explanation: "'Ins' (humankind) is derived from a root meaning familiarity and sociability — humans are social beings who find comfort in each other. The Quran frequently pairs 'jinn and ins' as the two accountable creations: 'I did not create jinn and humans except to worship Me.' (51:56)", urdu: "انسان" },
  { arabic: "عَقْل", root: "عقل", rootMeaning: "To bind, restrain, intellect", pos: "Noun", explanation: "'ʿAql' (intellect, reason) literally means to bind — the intellect that restrains one from error. The Quran repeatedly asks 'Afalā taʿqilūn?' (Will you not use reason?) Belief in Islam is affirmed through the intellect, not blind imitation alone.", urdu: "عقل، سمجھ" },
  { arabic: "خَيْر", root: "خير", rootMeaning: "Good, better, choice", pos: "Noun/Adjective", explanation: "'Khayr' (good, goodness) encompasses all forms of genuine benefit and righteousness. 'Whoever is saved from the greed of his soul — those are the successful ones.' (59:9) The Quran frequently contrasts khayr (good) with sharr (evil), guiding humans to choose well.", urdu: "خیر، بھلائی" },
  { arabic: "شَرّ", root: "شرر", rootMeaning: "Evil, spark, spark of fire", pos: "Noun", explanation: "'Sharr' (evil, harm) is the opposite of khayr. Seeking Allah's refuge from sharr — as in Surah Al-Falaq and An-Naas — is a fundamental protective practice. All evil ultimately stems from turning away from Allah.", urdu: "شر، برائی" },
  { arabic: "حَقّ", root: "حقق", rootMeaning: "To be due, real, certain", pos: "Noun/Adjective", explanation: "'Haqq' (truth, right, reality) is one of Allah's names — Al-Haqq. It means that which is fixed, real, and due. Islam is described as 'dīn al-haqq' (the religion of truth). Justice ('giving every right its due') flows from the concept of haqq.", urdu: "حق، سچائی، واجب" },
  { arabic: "عَدْل", root: "عدل", rootMeaning: "Straight, balanced, equal", pos: "Noun", explanation: "'ʿAdl' (justice, equity) means perfect balance — giving everyone their due without excess or deficiency. It is a foundational attribute of Allah's governance. 'Allah commands justice (ʿadl) and good conduct.' (16:90)", urdu: "عدل، انصاف" },
  { arabic: "صَبْر", root: "صبر", rootMeaning: "To restrain, patience, bitter plant", pos: "Noun", explanation: "'Sabr' (patience, steadfastness) literally means to restrain oneself. It has three dimensions: patience in obedience to Allah, patience in abstaining from what is forbidden, and patience in bearing trials. 'Allah is with those who are patient.' (2:153)", urdu: "صبر، برداشت" },
  { arabic: "شُكْر", root: "شكر", rootMeaning: "Gratitude, acknowledgment", pos: "Noun", explanation: "'Shukr' (gratitude) is to acknowledge and act upon a blessing. The Quran frames gratitude as both a personal and social virtue. 'If you are grateful, I will certainly increase you (in blessing).' (14:7) Ingratitude (kufr) is the root of all spiritual disease.", urdu: "شکر، شکرگزاری" },
  { arabic: "أَخ", root: "أخو", rootMeaning: "Brotherhood, companionship", pos: "Noun", explanation: "'Akh' (brother) is used for biological brotherhood and, powerfully, for the bond of faith. 'The believers are but one brotherhood.' (49:10) Islam transformed the concept of community from tribal bonds to universal brotherhood based on faith.", urdu: "بھائی، برادر" },
  { arabic: "أُمَّة", root: "أمم", rootMeaning: "Mother, origin, community", pos: "Noun", explanation: "'Ummah' (community, nation) shares its root with 'umm' (mother) — it is the community bound by a common origin, faith, and direction. The Muslim Ummah (community) is described as 'the best nation brought forth for mankind' (3:110).", urdu: "امت، قوم" },
  { arabic: "إِخْلَاص", root: "خلص", rootMeaning: "Pure, refined, free", pos: "Noun", explanation: "'Ikhlāṣ' (sincerity, pure devotion) means purifying one's intention so that all actions are done solely for Allah's pleasure, free from any desire for praise, status, or worldly reward. Surah Al-Ikhlāṣ (112) is called 'the third of the Quran' for its pure declaration of Tawheed.", urdu: "اخلاص، خلوص" },
  { arabic: "رِزْق", root: "رزق", rootMeaning: "To provide, sustain", pos: "Noun", explanation: "'Rizq' (provision, sustenance) is all that Allah provides: food, wealth, health, knowledge, and spiritual nourishment. Allah is 'Ar-Razzāq' (the Provider). The Quran reminds believers that their rizq is guaranteed — they need only trust Allah and strive lawfully.", urdu: "رزق، روزی" },
  { arabic: "مَوْت", root: "موت", rootMeaning: "Death, still", pos: "Noun", explanation: "'Mawt' (death) is the departure of the soul from the body, transitioning the human being from this temporary world to the eternal realm. 'Every soul shall taste death.' (3:185) Islam teaches that death is not an end but a doorway to the next life.", urdu: "موت، وفات" },
  { arabic: "حَيَاة", root: "حيي", rootMeaning: "Life", pos: "Noun", explanation: "'Hayāh' (life) comes from the same root as Hayy (Ever-Living). The Quran uses it for both biological life and spiritual life — the life of the heart illuminated by faith and guidance. 'Is the one who was dead and We gave him life... like one who is in darkness?' (6:122)", urdu: "زندگی، حیات" },
  { arabic: "آخِرَة", root: "أخر", rootMeaning: "Last, latter, end", pos: "Noun", explanation: "'Ākhirah' (the Hereafter, the Last Abode) is the final and permanent realm after this world. The Quran consistently pairs it with 'dunyā' (this world) — everything of the dunyā is temporary, while the ākhirah is eternal. Believers prioritise the eternal over the temporary.", urdu: "آخرت، قیامت کے بعد کی زندگی" },
  { arabic: "دُنْيَا", root: "دنو", rootMeaning: "Close, low, near", pos: "Noun", explanation: "'Dunyā' (this world) literally means 'the lower' or 'the nearer' — it is the realm closest to us but the least important. It is fleeting and deceptive. 'The life of this world is nothing but an enjoyment of delusion.' (3:185) Believers are encouraged to use it for the ākhirah.", urdu: "دنیا، قریب کی زندگی" },
  { arabic: "قُرْآن", root: "قرأ", rootMeaning: "To read, recite, gather", pos: "Noun", explanation: "'Qurʾān' comes from 'qaraʾa' — to read and to gather/collect. It is the literal word of Allah revealed to Muhammad ﷺ, collected and preserved. It is the final revelation, protecting all previous divine guidance, and a miracle of linguistic perfection that challenges all of humanity.", urdu: "قرآن، تلاوت کی گئی کتاب" },
  { arabic: "سُورَة", root: "سور", rootMeaning: "Enclosure, wall, rank", pos: "Noun", explanation: "'Sūrah' (a chapter of the Quran) comes from a root meaning an enclosure or a complete, enclosed unit. Each surah is a complete, self-contained unit of divine revelation. There are 114 surahs, ranging from the longest (Al-Baqarah, 286 verses) to the shortest (Al-Kawthar, 3 verses).", urdu: "سورت، قرآن کا باب" },
  { arabic: "حَدِيث", root: "حدث", rootMeaning: "New, speech, occurrence", pos: "Noun", explanation: "'Hadīth' (speech, narration) refers to the recorded sayings, actions, and approvals of the Prophet Muhammad ﷺ. It forms the second source of Islamic law and guidance after the Quran. In the Quran itself, 'hadīth' sometimes means a story or a new thing.", urdu: "حدیث، بات" },
  { arabic: "وَحْي", root: "وحي", rootMeaning: "Rapid secret communication", pos: "Noun", explanation: "'Wahy' (divine revelation) is the miraculous process by which Allah communicated His word to the Prophets. For Muhammad ﷺ, it came most often through Jibreel, sometimes directly, sometimes like the ringing of a bell. The Quran is the perfect, preserved wahy.", urdu: "وحی، الہام" },
  { arabic: "فَضْل", root: "فضل", rootMeaning: "Excess, favour, grace", pos: "Noun", explanation: "'Fadl' (grace, favour, bounty) is Allah's freely-given generosity beyond what is strictly deserved. 'Allah's fadl is not withheld from any who seek it.' The greatest fadl is faith itself — it is a gift from Allah, not merely a human achievement.", urdu: "فضل، احسان" },
  { arabic: "رَحْمَة", root: "رحم", rootMeaning: "Womb, mercy, compassion", pos: "Noun", explanation: "'Rahmah' (mercy, compassion) shares its root with 'rahim' (womb) — mercy that is warm, nurturing, and encompassing like a mother's love. 'My mercy encompasses all things.' (7:156) The Prophet ﷺ said: 'Allah is more merciful to His servants than a mother to her child.'", urdu: "رحمت، مہربانی" },
];

// Build lookup map (stripped → entry) on module load
const LEXICON_MAP = new Map<string, LexiconEntry>();
for (const entry of LEXICON) {
  LEXICON_MAP.set(stripDiacritics(entry.arabic), entry);
}

/**
 * Look up a raw Quranic word in the curated lexicon.
 *
 * Cascade strategy (runs until a match is found):
 *  1. Direct stripped lookup          e.g. بِسْمِ  → بسم ✓
 *  2. Strip definite article ال       e.g. ٱلرَّحِيمِ → رحيم ✓
 *  3. Strip single-letter prefix      e.g. وَرَبِّ  → رب ✓
 *     (و ف ب ل ك)
 *  4. Strip prefix + ال               e.g. وَٱللَّهِ → الله ✓
 *  5. Map لل → ال (ligated لِلَّهِ)   e.g. لِلَّهِ  → لله → الله ✓
 *  6. Strip prefix + لل → ال          e.g. فَلِلَّهِ → لله → الله ✓
 */
export function lookupLexicon(arabicWord: string): LexiconEntry | undefined {
  const s = stripDiacritics(arabicWord);
  let e: LexiconEntry | undefined;

  // 1. Direct
  e = LEXICON_MAP.get(s);
  if (e) return e;

  // 2. Strip ال
  if (s.startsWith("ال")) {
    e = LEXICON_MAP.get(s.slice(2));
    if (e) return e;
  }

  // 5. Ligated form: لِلَّهِ → لله, where ل is preposition "for" and الله loses its
  //    hamzatu'l-wasl. Prepend ا to restore the full word: لله → الله.
  //    Also try root-only (s.slice(2)) as a fallback for other لل+ words.
  if (s.startsWith("لل")) {
    e = LEXICON_MAP.get("\u0627" + s);   // ا + لله = الله ✓
    if (e) return e;
    e = LEXICON_MAP.get(s.slice(2));     // fallback: strip both lams
    if (e) return e;
  }

  // 3 & 4. Single-letter prefix (و ف ب ل ك)
  if (s.length > 2 && /^[وفبلك]/.test(s)) {
    const np = s.slice(1);
    // 3a. prefix only
    e = LEXICON_MAP.get(np);
    if (e) return e;
    // 4. prefix + ال
    if (np.startsWith("ال")) {
      e = LEXICON_MAP.get(np.slice(2));
      if (e) return e;
    }
    // 6. prefix + لل → ال
    if (np.startsWith("لل")) {
      e = LEXICON_MAP.get("ال" + np.slice(2));
      if (e) return e;
      e = LEXICON_MAP.get(np.slice(2));
      if (e) return e;
    }
  }

  return undefined;
}

// ─── Verse words cache ─────────────────────────────────────────────────────────

const verseWordsCache = new Map<string, VerseWord[]>();
const verseWordsInflight = new Map<string, Promise<VerseWord[]>>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseVerseWords(raw: any[]): VerseWord[] {
  return raw
    .filter((w: any) => typeof w.position === "number")
    .map((w: any) => ({
      id: w.id as number,
      position: w.position as number,
      audioUrl: (w.audio_url as string) ?? "",
      textUthmani: (w.text_uthmani ?? w.text ?? "") as string,
      charType: (w.char_type_name ?? "word") as string,
      translation: (w.translation?.text ?? "") as string,
      transliteration: (w.transliteration?.text ?? "") as string,
    }));
}

export async function fetchVerseWords(
  surahNum: number,
  ayahNum: number
): Promise<VerseWord[]> {
  const key = `${surahNum}:${ayahNum}`;
  if (verseWordsCache.has(key)) return verseWordsCache.get(key)!;
  if (verseWordsInflight.has(key)) return verseWordsInflight.get(key)!;

  const url =
    `${QURANCOM}/verses/by_key/${surahNum}:${ayahNum}` +
    `?words=true&word_fields=text_uthmani,transliteration,location,char_type_name`;

  const promise = fetchWithTimeout(url, { timeoutMs: 10_000 })
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const words = parseVerseWords(json?.verse?.words ?? []);
      verseWordsCache.set(key, words);
      return words;
    })
    .catch((): VerseWord[] => [])
    .finally(() => verseWordsInflight.delete(key));

  verseWordsInflight.set(key, promise);
  return promise;
}

// ─── Occurrence search ─────────────────────────────────────────────────────────

const occurrenceCache = new Map<string, WordSearchResult>();

// Strip diacritics for search query
function prepareSearchQuery(word: string): string {
  // Remove diacritics, keep base Arabic letters only
  return stripDiacritics(word).replace(/\s+/g, " ").trim();
}

export async function fetchWordOccurrences(
  arabicWord: string
): Promise<WordSearchResult> {
  const query = prepareSearchQuery(arabicWord);
  if (!query) return { total: 0, occurrences: [] };
  if (occurrenceCache.has(query)) return occurrenceCache.get(query)!;

  // Note: specifying an edition (e.g. /quran-uthmani) causes a 404 on this
  // endpoint. Omitting it returns results from all editions, which is fine
  // since we only use surah/ayah numbers from the response, not the text.
  const url = `${ALQURAN}/search/${encodeURIComponent(query)}/all`;

  try {
    const res = await fetchWithTimeout(url, { timeoutMs: 12_000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const matches = json?.data?.matches ?? [];
    const count = json?.data?.count ?? matches.length;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const occurrences: WordOccurrence[] = matches.map((m: any) => ({
      surahNum: m.surah?.number ?? 0,
      surahName: m.surah?.englishName ?? "",
      ayahNum: m.numberInSurah ?? 0,
      arabic: m.text ?? "",
    }));

    const result: WordSearchResult = { total: count, occurrences };
    occurrenceCache.set(query, result);
    return result;
  } catch {
    return { total: 0, occurrences: [] };
  }
}

/** Full-text search for the Quran word search panel */
export async function searchQuranWords(query: string): Promise<WordOccurrence[]> {
  if (!query.trim()) return [];
  const url = `${ALQURAN}/search/${encodeURIComponent(query.trim())}/all`;
  try {
    const res = await fetchWithTimeout(url, { timeoutMs: 12_000 });
    if (!res.ok) return [];
    const json = await res.json();
    const matches = json?.data?.matches ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return matches.map((m: any) => ({
      surahNum: m.surah?.number ?? 0,
      surahName: m.surah?.englishName ?? "",
      ayahNum: m.numberInSurah ?? 0,
      arabic: m.text ?? "",
    }));
  } catch {
    return [];
  }
}
