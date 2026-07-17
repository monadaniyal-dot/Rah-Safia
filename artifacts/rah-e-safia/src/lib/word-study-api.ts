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
    // 7. Ta marbuta (ة U+0629) is a word-final feminine marker. Normalise to ha
    //    (ه U+0647) so رَحْمَةِ / رَحْمَةً / رَحْمَةُ all match the lexicon entry رَحْمَة.
    .replace(/\u0629/g, "\u0647")
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

  // ── Pronouns and demonstratives ─────────────────────────────────────────────
  { arabic: "هُوَ", root: "", rootMeaning: "", pos: "Pronoun (3rd masc. singular)", explanation: "'Huwa' (He/It) is the 3rd person masculine singular independent pronoun. Theologically decisive in 'Qul Huwa Allāhu Aḥad' (112:1) — Say: He is Allah, the One. Used as a copula to affirm Allah's attributes: 'wa Huwa al-ʿAliyyu al-ʿAẓīm' (He is the Most High, the Most Great). Covers attached forms: huwa, bihi, lahu, minhu.", urdu: "وہ (مذکر واحد)" },
  { arabic: "هِيَ", root: "", rootMeaning: "", pos: "Pronoun (3rd fem. singular)", explanation: "'Hiya' (She/It) is the 3rd person feminine singular pronoun. The Quran uses it for grammatically feminine nouns including the soul (nafs), the earth, and the Fire. Its attached form 'hā' is very frequent: 'rabbahā' (her Lord), 'fīhā' (in it), 'ʿalayhā' (upon it).", urdu: "وہ (مؤنث واحد)" },
  { arabic: "هُمْ", root: "", rootMeaning: "", pos: "Pronoun (3rd masc. plural)", explanation: "'Hum' (They) is the 3rd person masculine plural pronoun, also used for mixed-gender groups by Arabic convention. 'Hum al-muflihūn' (they are the successful) is a repeated Quranic formula of high praise. Its attached form 'hum' appears in 'lahum' (for them), 'bihim' (with them), 'minhum' (among them).", urdu: "وہ (جمع مذکر)" },
  { arabic: "أَنتَ", root: "", rootMeaning: "", pos: "Pronoun (2nd masc. singular)", explanation: "'Anta' (You, masc. sing.) is used in direct address from Allah to the Prophet ﷺ: 'Inna anzalnā ilayka al-kitāba bi'l-haqq.' It also appears in supplication: 'Anta Rabbī, lā ilāha illā Anta' (You are my Lord, there is no god but You — the Sayyid al-Istighfār). It embodies the intimate directness of Quranic address.", urdu: "آپ، تو (مذکر واحد)" },
  { arabic: "نَحْنُ", root: "", rootMeaning: "", pos: "Pronoun (1st plural — Royal We)", explanation: "'Naḥnu' (We) is the 1st person plural pronoun. When Allah says 'Naḥnu' it is the plural of majesty (al-ʿaẓamah), not literal plurality. 'Naḥnu nazzalnā al-dhikr wa-innā lahu laḥāfiẓūn' (Indeed We sent down the reminder and indeed We are its guardian — 15:9). It affirms divine sovereignty and power.", urdu: "ہم (تعظیمی)" },
  { arabic: "هَذَا", root: "", rootMeaning: "", pos: "Demonstrative (proximate masculine)", explanation: "'Hādhā' (This, masc.) is the near demonstrative pronoun. 'Hādhā al-Qurʾān' (this Quran — 17:9). 'Dhā' is its contracted form. The Quran uses 'hādhā' to draw vivid attention to something present: 'Hādhā Khuluqu Allāh' (This is the creation of Allah — 31:11). Covers: hādhā, hādhihi (fem.), hādhayni (dual).", urdu: "یہ (مذکر)" },
  { arabic: "ذَلِكَ", root: "", rootMeaning: "", pos: "Demonstrative (distal masculine)", explanation: "'Dhālika' (That, masc.) is the far demonstrative. 'Dhālika al-Kitābu lā rayba fīh' (That is the Book, about which there is no doubt — 2:2). The use of 'dhālika' for the Quran indicates its exalted, transcendent status. Covers: dhālika (masc.), tilka (fem.), dhānika (dual).", urdu: "وہ (مذکر دور)" },
  { arabic: "الَّذِي", root: "", rootMeaning: "", pos: "Relative Pronoun (masc. singular)", explanation: "'Alladhī' (Who/Which/That) is the masculine singular relative pronoun, introducing relative clauses that define a noun. 'Alladhī khalaqa' (the One who created), 'alladhī awḥā' (the One who revealed). It appears over 1,400 times in the Quran, connecting attributes to subjects with great grammatical precision.", urdu: "جو (مذکر واحد)" },
  { arabic: "الَّذِينَ", root: "", rootMeaning: "", pos: "Relative Pronoun (masc. plural)", explanation: "'Alladhīna' (Those who) is the masculine plural relative pronoun — among the most frequent Quranic words (~1,300 occurrences). 'Alladhīna āmanū' (those who believe), 'alladhīna kafarū' (those who disbelieve), 'alladhīna yuqīmūna al-ṣalāh' (those who establish prayer). It groups people by their defining qualities.", urdu: "جو لوگ، وہ جو" },
  { arabic: "مَا", root: "", rootMeaning: "", pos: "Particle (Interrogative / Relative / Negation)", explanation: "'Mā' is one of the most versatile Arabic particles with three main functions: (1) negation — 'mā kāna' (it was not); (2) interrogative — 'mā hādhā?' (what is this?); (3) relative pronoun — 'mā ʿamiltu' (what I did). In Surah Al-Kahf: 'Wa mā tashāʾūna illā an yashāʾa Allāhu' — and you do not will unless Allah wills. Appears ~1,400 times.", urdu: "کیا، جو، نہیں" },
  { arabic: "مَنْ", root: "", rootMeaning: "", pos: "Particle (Interrogative / Relative — persons)", explanation: "'Man' (Who) is used for sentient beings. As interrogative: 'Man Rabbuka?' (Who is your Lord?). As relative: 'Man āmana' (whoever believes). 'Man yatawakal ʿalā Allāh fa-Huwa ḥasbuh' (whoever relies on Allah, He is sufficient for them). It appears over 900 times and is often used to universalise a ruling or promise.", urdu: "کون، جو کوئی" },

  // ── Common particles ──────────────────────────────────────────────────────
  { arabic: "لَا", root: "", rootMeaning: "", pos: "Particle (Negation / Prohibition)", explanation: "'Lā' (No / Not) is the primary negation particle. Its greatest use is 'Lā ilāha illā Allāh' — the declaration of Tawheed: there is no deity except Allah. 'Lā' for prohibition: 'lā taqnaṭū min raḥmati Allāh' (do not despair of Allah's mercy — 39:53). Appears thousands of times across all Quranic contexts.", urdu: "نہیں، مت، لا" },
  { arabic: "أَن", root: "", rootMeaning: "", pos: "Particle (Complementiser / Infinitive marker)", explanation: "'An' (That / To) introduces a verbal noun clause or an infinitive-like construction: 'urīdu an adhaba' (I want to go). 'Shahida Allāhu annahu lā ilāha illā Huwa' (Allah testifies that there is no god but Him — 3:18). It links ideas of intention, command, and testimony throughout the Quran.", urdu: "کہ، تاکہ" },
  { arabic: "إِذَا", root: "", rootMeaning: "", pos: "Particle (Temporal / Conditional)", explanation: "'Idhā' (When / Whenever / If) introduces conditional or temporal clauses. 'Idhā zulzilati al-arḍu zilzālahā' (When the earth is shaken with its earthquake — 99:1). The Quran uses 'idhā' to vividly describe eschatological turning points and moments of divine consequence.", urdu: "جب، جب کہ" },
  { arabic: "حَتَّى", root: "", rootMeaning: "", pos: "Particle (Until / So that)", explanation: "'Ḥattā' (until, so that) marks a limit or purpose. 'Ḥattā yaʿlama' (so that He makes known). 'Wa qātilūhum ḥattā lā takūna fitnatun' (fight them until there is no more persecution — 2:193). It marks the culminating endpoint of an action or the purpose for which something is done.", urdu: "یہاں تک کہ، تا آنکہ" },
  { arabic: "أَوْ", root: "", rootMeaning: "", pos: "Particle (Disjunctive — Or)", explanation: "'Aw' (or) presents alternatives or options. In legal contexts: 'fa-kaffāratuhu iṭʿāmu ʿashara masākīna aw kiswatuhum aw taḥrīru raqabah' (its expiation is feeding ten poor people, or clothing them, or freeing a slave — 5:89). 'Aw' presents the full range of permitted responses.", urdu: "یا" },
  { arabic: "لَوْ", root: "", rootMeaning: "", pos: "Particle (Contrary-to-fact conditional)", explanation: "'Law' (If [but it is not so]) introduces hypothetical or counterfactual conditions. The great argument for Tawheed: 'Law kāna fīhimā ālihatun illā Allāh la-fasadatā' (If there were gods other than Allah in them both, they would surely be ruined — 21:22). It signals an impossibility or an unrealised alternative.", urdu: "اگر (خلافِ واقعہ)" },
  { arabic: "بَلْ", root: "", rootMeaning: "", pos: "Particle (Adversative — Rather / But)", explanation: "'Bal' (Rather / But / Indeed) corrects or intensifies. 'Bal Allāhu Mawlākum' (Rather, Allah is your Protector — 3:150). It pivots from a rejected claim to the correct truth. 'Bal huwa Qurʾānun Majīd' (Rather, it is a Glorious Quran — 85:21). It signals that what follows overrides what came before.", urdu: "بلکہ، بلکہ یہ" },

  // ── Key verbs (base / lemma form — lookup matches conjugations via cascade) ──
  { arabic: "كَانَ", root: "كون", rootMeaning: "To be, exist, become", pos: "Verb (Defective root — to be)", explanation: "'Kāna' (was / were / has been) is the most frequent Quranic verb — appearing over 1,300 times in all conjugations. 'Wa kāna Allāhu ʿAlīman Ḥakīmā' (and Allah is ever All-Knowing, All-Wise) is a formulaic close to many verses. This entry covers: kāna, kānat, kānū, kuntum, kunnā, kuntu, yakūnu.", urdu: "تھا، ہے، ہوا، ہونا" },
  { arabic: "قَالَ", root: "قول", rootMeaning: "To say, speak, utter", pos: "Verb (Hollow root — to say)", explanation: "'Qāla' (he said) introduces divine speech, prophetic conversations, and responses of nations. Over 1,700 occurrences across all conjugations. 'Qāla Rabbi' (He said: My Lord!) opens prophetic supplications. This entry covers: qāla, qālat, qālū, qīla, yaqūlu, yaqūlūna, qul (say! — also a standalone entry).", urdu: "کہا، کہنا" },
  { arabic: "جَاءَ", root: "جيأ", rootMeaning: "To come, arrive", pos: "Verb (Hamzated root — to come)", explanation: "'Jāʾa' (came, arrived) describes the arrival of revelation, prophets, truth, and judgment. 'Qad jāʾakum rasūlun min anfusikum' (A Messenger has come to you from among yourselves — 9:128). 'Fa-idhā jāʾa ajalu hum lā yastaʾkhirūna' — when their time comes, they cannot delay it. Covers: jāʾa, jāʾat, jāʾū, yajīʾu.", urdu: "آیا، آنا" },
  { arabic: "خَلَقَ", root: "خلق", rootMeaning: "To create, fashion, form", pos: "Verb (Sound root — to create)", explanation: "'Khalaqa' (created) is the verb of Creation. 'Khalaqa al-insāna min ṭīn' (He created man from clay — 55:14). 'Alladhī khalaqa kulla shayʾin fa-qaddarahu taqdīrā' (Who created everything and determined it precisely — 25:2). Covers: khalaqa, khalaqat, khalaqnā, khalaqū, yakhluqu, takhluqu.", urdu: "پیدا کیا، بنایا، تخلیق کی" },
  { arabic: "أَمَرَ", root: "أمر", rootMeaning: "To command, order, instruct", pos: "Verb (Sound root — to command)", explanation: "'Amara' (commanded, ordered) describes divine commands and the commands of authorities. 'Inna Allāha yaʾmuru bi'l-ʿadl wa'l-iḥsān' (Indeed Allah commands justice and excellence — 16:90). It also appears as the noun 'amr' (command, affair). Covers: amara, amarat, amarū, yaʾmuru, yuʾmaru, umira.", urdu: "حکم دیا، فرمایا" },
  { arabic: "شَاءَ", root: "شيأ", rootMeaning: "To will, wish, want", pos: "Verb (Hamzated hollow root — to will)", explanation: "'Shāʾa' (willed, wished) expresses divine and human will. 'Wa mā tashāʾūna illā an yashāʾa Allāh' (and you do not will unless Allah wills — 81:29) — affirming divine sovereignty over all will and choice. 'In shāʾa Allāhu' (if Allah wills) is the Muslim formula for conditional planning. Covers: shāʾa, shāʾat, shāʾū, yashāʾu.", urdu: "چاہا، ارادہ کیا" },
  { arabic: "ظَلَمَ", root: "ظلم", rootMeaning: "To oppress, wrong, darken", pos: "Verb (Sound root — to wrong)", explanation: "'Ẓalama' (wronged, oppressed) covers all injustice: oppressing others, sinning against the self, and associating partners with Allah. 'Inna al-shirka la-ẓulmun ʿaẓīm' (Polytheism is a tremendous wrong — 31:13). 'Wa man yaẓlim minkum nudhiqhu ʿadhāban kabīrā' (Whoever wrongs among you, We will make him taste a great punishment — 25:19).", urdu: "ظلم کیا، ستایا، ناانصافی کی" },
  { arabic: "عَمِلَ", root: "عمل", rootMeaning: "To work, do, act", pos: "Verb (Sound root — to act)", explanation: "'ʿAmila' (worked, did, acted) describes all human deeds. The Quran constantly pairs 'āmanū wa ʿamilū al-ṣāliḥāt' (believed and did righteous deeds) — faith must be accompanied by action. 'Man ʿamila ṣāliḥan min dhakarin aw unthā wa huwa muʾminun fa-lanuḥyiyannahu ḥayātan ṭayyibah' (16:97).", urdu: "عمل کیا، کام کیا" },
  { arabic: "أَرَادَ", root: "ريد", rootMeaning: "To intend, want, seek", pos: "Verb (Hollow root — to intend)", explanation: "'Arāda' (intended, wanted, willed) expresses will and intention — both divine and human. 'Man arāda al-ʿājilata ʿajjalnā lahu fīhā' (Whoever desires the immediate [world], We hasten for him therein — 17:18). 'Wa Allāhu yurīdu an yatūba ʿalaykum' (Allah intends to accept your repentance — 4:27). Covers: arāda, arādat, arādū, yurīdu.", urdu: "چاہا، ارادہ کیا" },
  { arabic: "آتَى", root: "أتي", rootMeaning: "To give, bring, come with", pos: "Verb (Hollow root — to give)", explanation: "'Ātā' (gave, brought) describes divine bestowal. 'Wa yu'tī al-ḥikmata man yashāʾu' (He gives wisdom to whom He wills — 2:269). 'Man ātā Allāha bi-qalbin salīm' (one who comes to Allah with a sound heart — 26:89). Also: 'Wa ātu al-zakāh' (give the zakāh). Covers: ātā, ātat, ātaw, yuʾtī.", urdu: "دیا، عطا کیا" },

  // ── Allah's Names and Attributes ─────────────────────────────────────────────
  { arabic: "سَمِيع", root: "سمع", rootMeaning: "To hear, listen", pos: "Adjective (Divine Name)", explanation: "'Al-Samīʿ' (the All-Hearing) affirms that Allah hears every sound, spoken word, inner whisper, and unvoiced longing. 'Wa Huwa al-Samīʿu al-ʿAlīm' — paired with All-Knowing, nothing heard is outside His complete awareness. This name gives immense comfort — every duʿāʾ is heard, no matter how quietly it leaves the heart.", urdu: "سننے والا، سمیع" },
  { arabic: "بَصِير", root: "بصر", rootMeaning: "To see, perceive, be aware", pos: "Adjective (Divine Name)", explanation: "'Al-Baṣīr' (the All-Seeing) affirms Allah's unobstructed vision of everything in creation — hidden and manifest. 'Wa kāna Allāhu bi-mā taʿmalūna Baṣīrā' (Allah is All-Seeing of what you do). No deed, large or small, public or private, escapes His sight. This name inspires constant God-consciousness (taqwā) in every action.", urdu: "دیکھنے والا، بصیر" },
  { arabic: "عَزِيز", root: "عزز", rootMeaning: "Might, invincibility, honour", pos: "Adjective (Divine Name)", explanation: "'Al-ʿAzīz' (the All-Mighty, the Honourable) denotes absolute power that nothing can overcome, and dignity that nothing can diminish. Frequently paired with 'Al-Ḥakīm' (the Wise): might exercised with perfect wisdom. 'Wa kāna Allāhu ʿAzīzan Ḥakīmā' closes many verses asserting divine authority and wisdom together.", urdu: "غالب، عزّت والا، عزیز" },
  { arabic: "حَكِيم", root: "حكم", rootMeaning: "To judge, be wise, restrain", pos: "Adjective (Divine Name)", explanation: "'Al-Ḥakīm' (the All-Wise) affirms that every divine decree, command, and action is grounded in perfect, comprehensive wisdom — even when human understanding cannot fully grasp it. Wisdom (ḥikm) means placing everything precisely where it belongs. Paired with 'ʿAzīz' (Mighty) and 'Khabīr' (Aware) across dozens of verses.", urdu: "حکمت والا، دانا، حکیم" },
  { arabic: "عَلِيم", root: "علم", rootMeaning: "To know, be aware", pos: "Adjective (Divine Name)", explanation: "'Al-ʿAlīm' (the All-Knowing) is among the most frequently occurring Divine Names. His knowledge is comprehensive, eternal, and perfect — encompassing past, present, and future; the visible and the hidden; the depths of the sea and the particles of creation. 'Inna Allāha kāna ʿAlīman Khabīrā.'", urdu: "جاننے والا، علیم" },
  { arabic: "قَدِير", root: "قدر", rootMeaning: "Power, decree, precise measure", pos: "Adjective (Divine Name)", explanation: "'Al-Qadīr' (the All-Powerful) affirms that Allah has absolute, unlimited power over everything. 'Wa Allāhu ʿalā kulli shayʾin Qadīr' (Allah is over all things All-Powerful) — one of the most repeated Quranic affirmations. Nothing is beyond His ability; no prayer is too difficult for Him to answer.", urdu: "قدرت والا، قادر" },
  { arabic: "غَفُور", root: "غفر", rootMeaning: "To forgive, cover, protect", pos: "Adjective (Divine Name)", explanation: "'Al-Ghafūr' (the Oft-Forgiving) is among the most frequently occurring Divine Names. From 'ghafara' — to cover or protect as a helmet protects the head. Allah covers sins with His forgiveness. 'Inna Allāha Ghafūrun Rahīm' — paired with mercy. Its intensive form 'Ghaffār' appears in Surah Nūḥ: 'Innahu kāna Ghaffārā' (He has ever been most forgiving — 71:10).", urdu: "بہت بخشنے والا، غفور" },
  { arabic: "كَرِيم", root: "كرم", rootMeaning: "Generosity, nobility, abundance", pos: "Adjective (Divine Name)", explanation: "'Al-Karīm' (the Most Generous, Most Noble) — Allah's generosity has no limit or condition. 'Iqraʾ wa Rabbuka al-Akram' (Recite, and your Lord is the Most Generous — 96:3). The Quran itself is 'Qurʾānun Karīm' (96:77). His generosity flows to believers and non-believers alike in this world.", urdu: "کریم، سخی، شریف" },
  { arabic: "وَلِيّ", root: "ولي", rootMeaning: "Closeness, nearness, friendship", pos: "Noun / Adjective (Divine Name)", explanation: "'Walī' (Guardian, Protector, Close Friend) describes Allah's special support of the believers. 'Allāhu waliyyu alladhīna āmanū' (Allah is the Guardian of those who believe — 2:257). He takes them from darkness into light. The believers are Allah's awliyāʾ — and He is theirs. No believer is ever truly alone.", urdu: "ولی، سرپرست، دوست" },
  { arabic: "حَلِيم", root: "حلم", rootMeaning: "Forbearance, gentleness, maturity", pos: "Adjective (Divine Name)", explanation: "'Al-Ḥalīm' (the Forbearing) is Allah's name expressing that despite seeing all wrongdoing, He does not hasten punishment. He gives time for repentance. 'Wa Allāhu Ghafūrun Ḥalīm' (Allah is Oft-Forgiving, Forbearing — 2:235). His forbearance is not weakness — it is mercy for creation.", urdu: "بردبار، حلیم" },
  { arabic: "غَنِيّ", root: "غني", rootMeaning: "Richness, self-sufficiency", pos: "Adjective (Divine Name)", explanation: "'Al-Ghanī' (the Self-Sufficient, the Rich) affirms that Allah has absolutely no need of anything. 'Allāhu al-Ghaniyyu wa antumu al-fuqarāʾ' (Allah is Self-Sufficient and you are the needy — 35:15). All worship, sacrifice, and gratitude benefit only the worshipper — Allah gains nothing from them.", urdu: "بے نیاز، غنی" },
  { arabic: "لَطِيف", root: "لطف", rootMeaning: "Subtlety, kindness, fineness", pos: "Adjective (Divine Name)", explanation: "'Al-Laṭīf' (the Subtle, the Kind, the Gentle) describes Allah's exquisite, fine-grained care. He knows the subtlest affairs and tends to them with unmatched care. 'Inna Allāha Laṭīfun bi-ʿibādih' (Allah is Subtle toward His servants — 42:19). His care reaches where no human eye sees and no human hand can reach.", urdu: "باریک بین، مہربان، لطیف" },
  { arabic: "خَبِير", root: "خبر", rootMeaning: "Experience, informed awareness", pos: "Adjective (Divine Name)", explanation: "'Al-Khabīr' (the Well-Acquainted, the Fully-Aware) affirms Allah's deep, experiential awareness of all things — their inner workings and hidden realities. 'Inna Allāha kāna Laṭīfan Khabīrā' — His subtle care is backed by total, intimate awareness of everything.", urdu: "باخبر، خبیر" },
  { arabic: "وَاسِع", root: "وسع", rootMeaning: "Vastness, encompassing, capacity", pos: "Adjective (Divine Name)", explanation: "'Al-Wāsiʿ' (the All-Encompassing, the Vast) describes the boundlessness of Allah's mercy, forgiveness, knowledge, and provision. 'Wa Allāhu Wāsiʿun ʿAlīm' (Allah is All-Encompassing, All-Knowing — 2:115). His forgiveness encompasses every sin; His provision reaches every creature.", urdu: "وسیع، کشادہ، وسعت والا" },
  { arabic: "عَلِيّ", root: "علو", rootMeaning: "Highness, elevation, supremacy", pos: "Adjective (Divine Name)", explanation: "'Al-ʿAlī' (the Most High) affirms Allah's absolute exaltation above all creation in rank, power, and essence. 'Wa Huwa al-ʿAliyyu al-ʿAẓīm' — the two names close Ayat al-Kursī. 'SubḥānAllāhu wa Taʿālā' (Glorified and Most High is He) is the standard formula of exaltation after mentioning His name.", urdu: "بلند، اعلیٰ، علی" },
  { arabic: "حَمِيد", root: "حمد", rootMeaning: "To praise, commend", pos: "Adjective (Divine Name)", explanation: "'Al-Ḥamīd' (the Praiseworthy) — Allah is inherently deserving of all praise by virtue of His infinite perfections. 'Wa Allāhu al-Ghaniyyu al-Ḥamīd' (Allah is the Self-Sufficient, the Praiseworthy — 35:15). All 'ḥamd' (genuine praise) ultimately returns to Allah, which is why 'Alḥamdulillāh' opens the Quran.", urdu: "لائقِ تعریف، حمید" },
  { arabic: "شَهِيد", root: "شهد", rootMeaning: "To witness, testify, be present", pos: "Adjective (Divine Name)", explanation: "'Al-Shahīd' (the Witness) affirms that Allah witnesses everything — every secret, every deed, every moment. 'Wa kāna Allāhu ʿalā kulli shayʾin Shahīdā' (Allah is over all things a Witness — 4:33). In its broader Quranic use, 'shahīd' also means a martyr — one who witnesses to the truth with their life.", urdu: "گواہ، شاہد" },

  // ── Common Quranic nouns ──────────────────────────────────────────────────
  { arabic: "نُور", root: "نور", rootMeaning: "Light, radiance", pos: "Noun", explanation: "'Nūr' (light) is a profound Quranic concept encompassing physical light, divine guidance, the light of faith in the heart, and the Quran itself. The famous Āyat al-Nūr (24:35): 'Allāhu nūru al-samāwāti wa'l-arḍ' (Allah is the Light of the heavens and the earth). The Prophet ﷺ is called 'Sirājan Munīrā' (a radiant lamp — 33:46).", urdu: "نور، روشنی" },
  { arabic: "ظُلْمَة", root: "ظلم", rootMeaning: "Darkness, placing things out of place", pos: "Noun", explanation: "'Ẓulmah' (darkness, pl. ẓulumāt) represents disbelief, misguidance, and all that opposes divine light. 'Min al-ẓulumāti ilā al-nūr' (from darknesses to the light) is the Quran's recurring formula for the journey from ignorance to guidance. The root is shared with 'ẓulm' (oppression) — both are forms of putting something in the wrong place.", urdu: "اندھیرا، ظلمت" },
  { arabic: "نِعْمَة", root: "نعم", rootMeaning: "Blessing, wellbeing, ease", pos: "Noun", explanation: "'Niʿmah' (blessing, favour, gift) encompasses every gift Allah bestows — health, provision, guidance, family, and most supremely faith itself. 'Wa in taʿuddū niʿmata Allāhi lā tuḥṣūhā' (If you count Allah's blessings you could never enumerate them — 16:18). Gratitude for niʿmah is a core Quranic commandment.", urdu: "نعمت، احسان" },
  { arabic: "عَذَاب", root: "عذب", rootMeaning: "Pain, torment (root also means sweet water — extremes)", pos: "Noun", explanation: "'ʿAdhāb' (punishment, torment) is the consequence Allah has decreed for those who persist in rejection and injustice. It occurs in this world (drought, defeat, calamity) and in the Hereafter (Hellfire). The Quran describes it in vivid, urgent detail — both as a warning and as a motivation to turn to Allah in repentance.", urdu: "عذاب، سزا" },
  { arabic: "أَجْر", root: "أجر", rootMeaning: "Wage, reward, recompense", pos: "Noun", explanation: "'Ajr' (reward, recompense, wage) is Allah's promised return for every righteous deed and patient trial. 'Inna Allāha lā yuḍīʿu ajra al-muḥsinīn' (Allah does not waste the reward of those who do good — 9:120). 'Lahum ajrun ghayr mamnūn' (for them is a reward that is uninterrupted). It is the eternal wage of faith.", urdu: "اجر، ثواب" },
  { arabic: "أَمْر", root: "أمر", rootMeaning: "Command, affair, matter", pos: "Noun", explanation: "'Amr' (command, matter, affair) has two senses: (1) a divine command — 'ittabiʿū amra Allāh'; (2) an affair or matter — 'wa fawwaḍtu amrī ilā Allāh' (I entrust my affair to Allah — 40:44). 'Alā, inna bi-amri Allāhi taṭmaʾinnu al-qulūb' — verily, in the remembrance of Allah do hearts find peace.", urdu: "حکم، معاملہ" },
  { arabic: "قَوْم", root: "قوم", rootMeaning: "Standing, rising", pos: "Noun", explanation: "'Qawm' (people, nation, community) refers to a group sharing common origin or bond. 'Yā qawmi' (O my people!) is the formulaic call of every prophet to their community. The Quran narrates the histories of Qawm Nūḥ, Qawm ʿĀd, Qawm Thamūd, and Qawm Lūṭ as solemn warnings to later generations.", urdu: "قوم، لوگ" },
  { arabic: "نَاس", root: "أنس", rootMeaning: "Humanity, familiarity, sociability", pos: "Noun", explanation: "'Nās' (people, mankind) in definite form 'al-nās' refers to humanity collectively. Surah Al-Nās (114) addresses 'al-nās'. 'Yā ayyuhā al-nās' (O people!) is the universal address used when the Quran's message is for all humanity, not just believers. 'Wa mā arsalnāka illā raḥmatan li'l-ʿālamīn.'", urdu: "لوگ، انسان" },
  { arabic: "عَرْش", root: "عرش", rootMeaning: "Throne, elevated structure, pergola", pos: "Noun", explanation: "'ʿArsh' (the Throne of Allah) is the greatest of created things. 'Wa kāna ʿArshuhu ʿalā al-māʾ' (His Throne was upon the water — 11:7). 'Rabb al-ʿArsh al-ʿAẓīm' (Lord of the Great Throne). The exact nature of the ʿArsh belongs to the unseen (ghayb) — it is affirmed without likening it to created thrones.", urdu: "عرش، تخت" },
  { arabic: "مِيزَان", root: "وزن", rootMeaning: "To weigh, balance", pos: "Noun", explanation: "'Mīzān' (the Balance, the Scale) is both the cosmic principle of justice established by Allah in all of creation (55:7–9) and the actual scale on which deeds are weighed on the Day of Judgment. 'Fa-man thaqulat mawāzīnuhu fa-ʾulāʾika hum al-mufliḥūn' (Whoever's scales are heavy with good — those are the successful).", urdu: "میزان، ترازو" },
  { arabic: "حِسَاب", root: "حسب", rootMeaning: "To count, reckon, calculate", pos: "Noun", explanation: "'Ḥisāb' (reckoning, accounting, calculation) is the divine audit of every soul's deeds on the Day of Judgment. 'Wa kāna Allāhu ʿalā kulli shayʾin Ḥasībā' (Allah is a sufficient Reckoner over all things). 'Yawm al-Ḥisāb' (the Day of Reckoning) is a major Quranic theme — every atom of good and evil is accounted for.", urdu: "حساب، شمار" },
  { arabic: "قَلَم", root: "قلم", rootMeaning: "Reed pen, cutting instrument", pos: "Noun", explanation: "'Qalam' (pen) — Allah swears by it: 'Nūn. Wa'l-qalami wa mā yasṭurūn' (By the pen and what they inscribe — 68:1). The Quran begins with 'Iqraʾ' and the pen is among the first creations. Hadith: 'The first thing Allah created was the Pen, and He said to it: Write. And it wrote all that will be.'", urdu: "قلم" },
  { arabic: "رُوح", root: "روح", rootMeaning: "Breath, wind, spirit", pos: "Noun", explanation: "'Rūḥ' (spirit, soul) is among the greatest mysteries. 'Wa yas'alūnaka ʿan al-Rūḥ. Qul al-Rūḥu min amri Rabbī' (They ask you about the spirit. Say: the spirit is from the command of my Lord — 17:85). The Quran deliberately limits its description, affirming that the full knowledge of the rūḥ belongs to Allah alone.", urdu: "روح" },
  { arabic: "سَبِيل", root: "سبل", rootMeaning: "Easy road, free flow, access", pos: "Noun", explanation: "'Sabīl' (way, path, route) is used alongside 'ṣirāṭ'. 'Fī sabīl Allāh' (in the way / cause of Allah) encompasses all sincere effort for Allah's sake — charity, learning, teaching, defending the community. 'Wa jihādun fī sabīlillāh' is among the greatest deeds a believer can perform.", urdu: "راستہ، سبیل" },
  { arabic: "قَوْل", root: "قول", rootMeaning: "To say, speak, utter", pos: "Noun", explanation: "'Qawl' (speech, word, saying) is the verbal noun of qāla. 'Qawlan sadīdan' (truthful speech — 33:70) is a divine command. 'Wa qūlū li'l-nāsi ḥusnā' (speak to people kindly — 2:83). The Quran itself is a 'Qawlun Karīm' (a noble word). Speech is a divine trust — used rightly it is worship; misused it becomes a burden.", urdu: "قول، بات" },
  { arabic: "وَقْت", root: "وقت", rootMeaning: "Appointed time, fixed moment", pos: "Noun", explanation: "'Waqt' (time, appointed moment) refers to divinely fixed times — for prayer, for seasons, for the Hour. 'Inna al-ṣalāta kānat ʿalā al-muʾminīna kitāban mawqūtā' (Prayer has been prescribed for believers at fixed times — 4:103). The Quran instils awareness that every moment is divinely appointed.", urdu: "وقت، وقت مقرر" },
  { arabic: "آدَم", root: "أدم", rootMeaning: "Humanity, earth, reddish complexion", pos: "Proper Noun (Prophet)", explanation: "'Ādam' (Adam, peace be upon him) is the first human and first Prophet. 'Wa ʿallama Ādam al-asmāʾ kullahā' (He taught Adam the names of all things — 2:31). Created from clay, honoured by Allah, tested in the Garden, blessed with repentance and prophethood. His story is the story of human dignity, free will, and the mercy of tawbah.", urdu: "آدم (علیہ السلام)" },
  { arabic: "إِبْرَاهِيم", root: "", rootMeaning: "Father of many nations (Semitic origin)", pos: "Proper Noun (Prophet)", explanation: "'Ibrāhīm' (Abraham, peace be upon him) is the patriarch of the Abrahamic faiths and one of the greatest prophets — called 'Khalīlullāh' (the intimate friend of Allah). He broke idols, was thrown into fire (and emerged unharmed), built the Kaʿbah with his son Ismāʿīl, and his 'millah' (way) is the foundation of Islam (22:78).", urdu: "ابراہیم (علیہ السلام)" },
  { arabic: "مُوسَى", root: "موس", rootMeaning: "Drawn from water (Egyptian origin)", pos: "Proper Noun (Prophet)", explanation: "'Mūsā' (Moses, peace be upon him) is the most frequently mentioned prophet in the Quran — appearing in over 100 passages. His story encompasses miraculous birth, exile, prophethood at the burning bush, miracles against Pharaoh, receiving the Torah on Mount Sinai, and leading Banū Isrāʾīl across the sea. His story is the Quran's archetype of faith confronting tyranny.", urdu: "موسیٰ (علیہ السلام)" },
  { arabic: "عِيسَى", root: "", rootMeaning: "From Aramaic Yeshu / Yeshua", pos: "Proper Noun (Prophet)", explanation: "'ʿĪsā' (Jesus, peace be upon him) is described as a prophet, Messenger, 'Kalimatullāh' (Word of Allah), and 'Rūḥun minhu' (a Spirit from Him). Born miraculously to Maryam, he performed miracles by Allah's permission, was not crucified but raised to Allah. He will return near the end of times as a just ruler.", urdu: "عیسیٰ (علیہ السلام)" },
  { arabic: "مُحَمَّد", root: "حمد", rootMeaning: "To praise, commend", pos: "Proper Noun (Prophet)", explanation: "'Muḥammad' (the Praised One, peace be upon him) is the final Prophet and Messenger. His blessed name appears four times in the Quran (3:144, 33:40, 47:2, 48:29). 'Wa mā arsalnāka illā raḥmatan li'l-ʿālamīn' (We have not sent you except as a mercy to the worlds — 21:107). He is the Seal of the Prophets — no prophet will come after him.", urdu: "محمد (صلی اللہ علیہ وسلم)" },
  { arabic: "مَرْيَم", root: "", rootMeaning: "Uncertain; possibly purity (Aramaic)", pos: "Proper Noun", explanation: "'Maryam' (Mary, may Allah be pleased with her) is the only woman explicitly named in the Quran and has an entire Surah (19) named after her. 'Inna Allāha iṣṭafāki wa ṭahharaki wa iṣṭafāki ʿalā nisāʾi al-ʿālamīn' (Allah has chosen you, purified you, and chosen you above all women of the worlds — 3:42). A model of piety and devotion.", urdu: "مریم (علیہا السلام)" },

  // ── Quranic concepts ────────────────────────────────────────────────────────
  { arabic: "شِرْك", root: "شرك", rootMeaning: "Partnership, sharing", pos: "Noun", explanation: "'Shirk' (polytheism, associating partners with Allah) is the gravest sin in Islam — the only sin Allah will not forgive if one dies upon it. 'Inna Allāha lā yaghfiru an yushraka bih wa yaghfiru mā dūna dhālika li-man yashāʾ' (4:48). It encompasses worship of idols, saints, graves, or attributing Allah's exclusive qualities to any created being.", urdu: "شرک، کسی کو اللہ کا شریک ٹھہرانا" },
  { arabic: "إِحْسَان", root: "حسن", rootMeaning: "Beauty, goodness, excellence", pos: "Noun", explanation: "'Iḥsān' (excellence, worshipping with perfection) is the highest level of faith — beyond islām and īmān. The Prophet ﷺ defined it: 'To worship Allah as if you see Him; and if you do not see Him, know that He sees you.' (Bukhārī). 'Wa aḥsinū inna Allāha yuḥibbu al-muḥsinīn' (Do good — Allah loves those who do good — 2:195).", urdu: "احسان، خوبی سے عبادت کرنا" },
  { arabic: "قِيَامَة", root: "قوم", rootMeaning: "Standing, rising, establishment", pos: "Noun", explanation: "'Qiyāmah' (the Resurrection, the Day of Standing) is the moment when all the dead are raised and stand before Allah for judgment. 'Yawm al-Qiyāmah' is the Quran's central eschatological event. The Surah Al-Qiyāmah (75) opens with two oaths about its reality: 'Lā uqsimu bi-Yawm al-Qiyāmah' (I swear by the Day of Resurrection).", urdu: "قیامت" },
  { arabic: "مَغْفِرَة", root: "غفر", rootMeaning: "To cover, protect, forgive", pos: "Noun", explanation: "'Maghfirah' (forgiveness) is Allah's covering of a servant's sins with His mercy. 'Wa sāriʿū ilā maghfiratin min Rabbikum' (Hasten to forgiveness from your Lord — 3:133). The Quran consistently presents maghfirah as the ultimate prize — worth more than all worldly wealth. It is the fruit of sincere tawbah combined with Allah's grace.", urdu: "مغفرت، بخشش" },
  { arabic: "تَوَكُّل", root: "وكل", rootMeaning: "To delegate, entrust, appoint an agent", pos: "Noun", explanation: "'Tawakkul' (complete reliance on Allah) combines maximum personal effort with complete trust in Allah for the outcome. 'Wa ʿalā Allāhi fa-tawakkalū in kuntum muʾminīn' (Put your trust in Allah if you are believers — 5:23). The Prophet ﷺ: 'Tie your camel, then put your trust in Allah.' It is the believer's response to every challenge.", urdu: "توکل، اللہ پر بھروسا" },
  { arabic: "صِدْق", root: "صدق", rootMeaning: "Truth, truthfulness, sincerity", pos: "Noun", explanation: "'Ṣidq' (truthfulness, sincerity) is the foundation of Islamic character and one of the key attributes of prophets. 'Yā ayyuhā alladhīna āmanū ittaqū Allāha wa kūnū maʿa al-ṣādiqīn' (Fear Allah and be with the truthful — 9:119). The Quran recognises a rank called 'Ṣiddīq' — the utterly truthful — above that of ordinary believers.", urdu: "سچائی، صداقت" },
  { arabic: "ظُلْم", root: "ظلم", rootMeaning: "Darkness, oppression, misplacement", pos: "Noun", explanation: "'Ẓulm' (oppression, injustice, transgression) is placing something where it does not belong — oppressing others, wronging the self through sin, or ascribing partners to Allah. 'Inna al-shirka la-ẓulmun ʿaẓīm' (Polytheism is a tremendous wrong — 31:13). 'Wa lā taẓlimūna wa lā tuẓlamūn' — you shall not oppress and shall not be oppressed (2:279).", urdu: "ظلم، ناانصافی" },
  { arabic: "جِهَاد", root: "جهد", rootMeaning: "Effort, struggle, exertion", pos: "Noun", explanation: "'Jihād' (striving, struggle in Allah's cause) encompasses all forms of effort: striving against one's own desires (the 'greater jihād'), striving for knowledge, striving for justice, and — in its specific legal form — armed defense of the community when properly sanctioned. 'Jāhidū fī sabīlillāh bi-amwālikum wa anfusikum' (Strive in the way of Allah with your wealth and your lives — 9:41).", urdu: "جہاد، کوشش" },
  { arabic: "فِتْنَة", root: "فتن", rootMeaning: "Trial, test in fire (of gold)", pos: "Noun", explanation: "'Fitnah' (trial, tribulation, discord) originally meant testing gold in fire — burning away impurities. In the Quran it describes trials that test faith, civil discord, and temptation to abandon truth. 'Wa al-fitnatu ashaddu min al-qatl' (And fitnah is worse than killing — 2:191). It encompasses both personal temptation and collective social strife.", urdu: "فتنہ، آزمائش" },
  { arabic: "بِرّ", root: "برر", rootMeaning: "Vast goodness, land, piety", pos: "Noun", explanation: "'Birr' (righteousness, comprehensive goodness) is defined in the Quran (2:177) as: belief in Allah, the Hereafter, angels, scripture, and prophets; giving wealth to those in need; establishing prayer; paying zakāh; fulfilling promises; and being patient. It is the totality of virtue — the highest standard of personal and social conduct.", urdu: "نیکی، بھلائی" },
  { arabic: "إِثْم", root: "أثم", rootMeaning: "Sin, guilt, heaviness", pos: "Noun", explanation: "'Ithm' (sin, guilt, wrongdoing) refers to acts that burden the soul and incur Allah's displeasure. The Prophet ﷺ said: 'Righteousness (al-birr) is good character and sin (al-ithm) is what pricks your conscience.' (Muslim). The Quran calls believers to 'dhaʿu al-ithm wa'l-ʿudwān' — abandon sin and transgression.", urdu: "گناہ، قصور" },
];

// Build lookup map (stripped → entry) on module load
const LEXICON_MAP = new Map<string, LexiconEntry>();
for (const entry of LEXICON) {
  LEXICON_MAP.set(stripDiacritics(entry.arabic), entry);
}

// ── Lexicon match result ─────────────────────────────────────────────────────

/** Returned by lookupLexiconFull — entry + how the word was matched */
export interface LexiconMatch {
  entry: LexiconEntry;
  /**
   * Describes how the match was made.
   * Used by deriveMorphNote() to build a human-readable morphological summary.
   * Examples: "direct", "definite", "preposition-ب", "plural-sound-masc-nom",
   *           "definite+pronoun-هم", "conjunction-و+definite"
   */
  matchType: string;
}

/**
 * Look up a raw Quranic word in the curated lexicon.
 *
 * Cascade strategy (runs until a match is found):
 *  1. Direct stripped lookup          بِسْمِ  → بسم ✓
 *  2. Strip definite article ال       ٱلرَّحِيمِ → رحيم ✓
 *  3. Ligated لل (لِلَّهِ → الله)    لِلَّهِ → لله → الله ✓
 *  4. Single-letter prefix (و ف ب ل ك) وَرَبِّ → رب ✓
 *  5. Prefix + ال                     وَٱللَّهِ → الله ✓
 *  6. Sound plural suffix (ون ين ات)  الْمُؤْمِنُونَ → مؤمن ✓
 *  7. Attached pronoun suffix          عِلْمُهُ → علم ✓
 */
export function lookupLexiconFull(arabicWord: string): LexiconMatch | undefined {
  const s = stripDiacritics(arabicWord);

  // Helper: attempt a map lookup and return LexiconMatch if found
  const hit = (key: string, matchType: string): LexiconMatch | undefined => {
    const entry = LEXICON_MAP.get(key);
    return entry ? { entry, matchType } : undefined;
  };

  // 1. Direct
  let m = hit(s, "direct");
  if (m) return m;

  // 2. Strip ال
  if (s.startsWith("ال")) {
    m = hit(s.slice(2), "definite");
    if (m) return m;
  }

  // 3. Ligated لل (preposition لِ + ال merged, hamzah elided)
  if (s.startsWith("لل")) {
    m = hit("\u0627" + s, "preposition-لِ");        // ا + لله = الله
    if (m) return m;
    m = hit(s.slice(2), "preposition-لِ");
    if (m) return m;
  }

  // 4 & 5. Single-letter prefix (و ف ب ل ك)
  const PFX: Record<string, string> = {
    "و": "conjunction-و", "ف": "consequence-ف",
    "ب": "preposition-ب", "ل": "preposition-لِ", "ك": "comparison-ك",
  };
  if (s.length > 2 && /^[وفبلك]/.test(s)) {
    const pfxType = PFX[s[0]] ?? "prefix";
    const np = s.slice(1);

    m = hit(np, pfxType);
    if (m) return m;

    if (np.startsWith("ال")) {
      m = hit(np.slice(2), pfxType + "+definite");
      if (m) return m;
    }
    if (np.startsWith("لل")) {
      m = hit("\u0627" + np, pfxType + "+preposition-لِ");
      if (m) return m;
      m = hit(np.slice(2), pfxType + "+preposition-لِ");
      if (m) return m;
    }
  }

  // 6. Sound plural suffixes: ون (nom) · ين (gen/acc) · ات (fem)
  for (const [suf, sufType] of [
    ["ون", "plural-sound-masc-nom"],
    ["ين", "plural-sound-masc-gen"],
    ["ات", "plural-sound-fem"],
  ] as [string, string][]) {
    if (s.endsWith(suf) && s.length > suf.length + 1) {
      const stem = s.slice(0, -suf.length);
      m = hit(stem, sufType);
      if (m) return m;
      if (stem.startsWith("ال")) {
        m = hit(stem.slice(2), "definite+" + sufType);
        if (m) return m;
      }
      if (stem.length > 3 && /^[وفبلك]/.test(stem)) {
        const np2 = stem.slice(1);
        if (np2.startsWith("ال")) {
          m = hit(np2.slice(2), "prefix+definite+" + sufType);
          if (m) return m;
        }
      }
    }
  }

  // 7. Attached pronoun suffixes (ضمائر متصلة)
  for (const suf of ["هما", "هم", "هن", "كم", "كن", "كما", "ها", "ني", "نا", "ك", "ه"]) {
    if (s.endsWith(suf) && s.length > suf.length + 1) {
      const stem = s.slice(0, -suf.length);
      const sufType = `pronoun-${suf}`;
      m = hit(stem, sufType);
      if (m) return m;
      if (stem.startsWith("ال")) {
        m = hit(stem.slice(2), "definite+" + sufType);
        if (m) return m;
      }
      if (stem.endsWith("ه") && stem.length > 2) {
        m = hit(stem.slice(0, -1), sufType);  // ta-marbuta stem
        if (m) return m;
      }
    }
  }

  // 8. Verb past-tense 3rd-person plural suffix: وا
  //    e.g. خَلَقُوا → خَلَقَ ✓  آمَنُوا → آمَنَ ✓  كَفَرُوا → كَفَرَ ✓
  //    For hollow/defective verbs (كان، قال، جاء) the stem changes, so
  //    this only reliably matches sound-root verbs — false positives are low
  //    because nouns rarely end in bare waw+alef (و+ا).
  if (s.endsWith("وا") && s.length > 4) {
    m = hit(s.slice(0, -2), "plural-past-verb");
    if (m) return m;
  }

  return undefined;
}

/** Backward-compatible wrapper */
export function lookupLexicon(arabicWord: string): LexiconEntry | undefined {
  return lookupLexiconFull(arabicWord)?.entry;
}

// ── Morphological note derivation ─────────────────────────────────────────────

const PRON_LABELS: Record<string, string> = {
  "هما": "dual (their/them both)",
  "هم":  "3rd person plural masculine (their/them)",
  "هن":  "3rd person plural feminine",
  "كم":  "2nd person plural masculine (your/you)",
  "كن":  "2nd person plural feminine",
  "كما": "dual 2nd person (your/you both)",
  "ها":  "3rd person singular feminine (her/its)",
  "ني":  "1st person singular (me/my)",
  "نا":  "1st person plural (us/our)",
  "ك":   "2nd person singular (you/your)",
  "ه":   "3rd person singular masculine (his/its)",
};

const PFX_LABELS: Record<string, string> = {
  "conjunction-و":  "conjunction وَ (and)",
  "consequence-ف":  "particle فَ (then / so)",
  "preposition-ب":  "preposition بِ (in / with / by)",
  "preposition-لِ": "preposition لِ (for / to)",
  "comparison-ك":   "comparative particle كَ (like / as)",
};

/**
 * Derive a human-readable morphological note from the lookup match type and
 * the part-of-speech label of the matched lexicon entry.
 */
export function deriveMorphNote(matchType: string, pos: string): string {
  const base = pos || "word";

  if (matchType === "direct") {
    return `${base} · Base / lemma form — no morphological attachments.`;
  }
  if (matchType === "definite") {
    return `${base} · Definite — prefixed with ال (al-, the definite article).`;
  }

  // Plural suffixes
  if (matchType.includes("plural-sound-masc-nom")) {
    const def = matchType.startsWith("definite") ? "Definite " : "";
    return `${def}Sound masculine plural · Nominative case (subject position) · ${base}.`;
  }
  if (matchType.includes("plural-sound-masc-gen")) {
    const def = matchType.startsWith("definite") ? "Definite " : "";
    return `${def}Sound masculine plural · Genitive / accusative case · ${base}.`;
  }
  if (matchType.includes("plural-sound-fem")) {
    const def = matchType.startsWith("definite") ? "Definite " : "";
    return `${def}Sound feminine plural (جمع مؤنث سالم) · ${base}.`;
  }

  // Pronoun suffixes
  for (const [suf, label] of Object.entries(PRON_LABELS)) {
    if (matchType === `pronoun-${suf}` || matchType === `definite+pronoun-${suf}`) {
      const def = matchType.startsWith("definite") ? "Definite " : "";
      return `${def}${base} · With attached pronoun suffix ـ${suf} — ${label}.`;
    }
  }

  // Prefix combinations
  for (const [pfx, label] of Object.entries(PFX_LABELS)) {
    if (matchType.includes(pfx)) {
      const hasDef = matchType.includes("definite");
      return `${hasDef ? "Definite " : ""}${base} · With ${label}.`;
    }
  }

  return `${base}.`;
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

  // Adding `translation` to word_fields requests the word-level English gloss
  // sub-object (w.translation.text) from Quran.com's word-by-word database.
  // Note: translation_fields controls the verse-level translation object and
  // has no effect on word-level translation — do not add it here.
  const url =
    `${QURANCOM}/verses/by_key/${surahNum}:${ayahNum}` +
    `?words=true&word_fields=text_uthmani,transliteration,translation,location,char_type_name`;

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

// ── Tafseer ────────────────────────────────────────────────────────────────────

export interface TafseerResult {
  /** Tafseer prose — may be HTML (check isHtml flag) */
  text: string;
  /** Human-readable name of the tafseer work */
  name: string;
  /** Whether text contains HTML markup */
  isHtml: boolean;
}

const tafseerCache = new Map<string, TafseerResult | null>();

/**
 * Fetch the Ibn Kathir tafseer (English, Quran.com ID 169) for a verse.
 * Returns null when unavailable (network error, missing entry, etc.).
 *
 * Uses the same api.quran.com domain as fetchVerseWords so the same CORS
 * allow-list applies and no additional configuration is needed.
 */
export async function fetchTafseer(
  surahNum: number,
  ayahNum: number,
): Promise<TafseerResult | null> {
  const key = `${surahNum}:${ayahNum}`;
  if (tafseerCache.has(key)) return tafseerCache.get(key) ?? null;

  const url = `${QURANCOM}/tafsirs/169/by_key/${key}`;
  try {
    const res = await fetchWithTimeout(url, { timeoutMs: 12_000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const content: string = json?.tafsir?.resource_content ?? "";
    if (!content) { tafseerCache.set(key, null); return null; }
    const result: TafseerResult = {
      text: content,
      name: (json?.tafsir?.name as string) ?? "Ibn Kathir",
      isHtml: /<[a-z]/i.test(content),
    };
    tafseerCache.set(key, result);
    return result;
  } catch {
    tafseerCache.set(key, null);
    return null;
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
