/**
 * QAC Root Meanings
 *
 * Compact lookup table: Arabic root (QAC-normalized Unicode) → { en, ur }
 *
 * Key encoding matches the Quranic Arabic Corpus (qac-roots.json) exactly:
 *   • All alif variants (أ إ آ ٱ) are stored as plain ا
 *   • Alif maqsura (ى) is stored as ya (ي)
 *   • No diacritics / shadda / tatweel
 *
 * `lookupRootMeaning(root)` normalizes the input before lookup, so callers
 * can pass the raw QAC root string directly from qacEntry.r without any
 * pre-processing.
 */

export interface RootMeaning {
  /** Concise English meaning of the root */
  en: string;
  /** Urdu equivalent */
  ur?: string;
}

// ─── Normalization ──────────────────────────────────────────────────────────────
// Converts any Arabic alif variant + alif maqsura → canonical QAC form.
function normalize(root: string): string {
  return root
    // hamza-on-alif variants → plain alif
    .replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627")
    // alif maqsura → ya
    .replace(/\u0649/g, "\u064A")
    // ta marbuta → ha
    .replace(/\u0629/g, "\u0647")
    // strip diacritics / tatweel
    .replace(/[\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E4\u0640]/g, "");
}

// ─── Root table (keys pre-normalized to QAC encoding) ──────────────────────────
const ROOT_MEANINGS: Record<string, RootMeaning> = {

  // ─── ا ─────────────────────────────────────────────────────────────────────
  "امن": { en: "security, faith, trust", ur: "امن، ایمان، اعتماد" },
  "اتي": { en: "to come, to bring", ur: "آنا، لانا" },
  "اخذ": { en: "to take, to seize", ur: "لینا، پکڑنا" },
  "اذن": { en: "permission, ear", ur: "اجازت، کان" },
  "ارض": { en: "earth, land, ground", ur: "زمین، سرزمین" },
  "اسف": { en: "sorrow, grief, regret", ur: "افسوس، غم" },
  "اصل": { en: "origin, root, principle", ur: "اصل، بنیاد" },
  "اكل": { en: "to eat, to consume", ur: "کھانا، کھا جانا" },
  "امر": { en: "command, affair, matter", ur: "حکم، معاملہ، امر" },
  "امل": { en: "hope, aspiration", ur: "امید، آرزو" },
  "اهل": { en: "family, people, worthy", ur: "اہل، خاندان" },
  "اوي": { en: "to shelter, to refuge", ur: "پناہ دینا، ٹھکانا" },
  "ابو": { en: "father, ancestor", ur: "باپ، آبا" },
  "اخو": { en: "brother", ur: "بھائی" },

  // ─── ب ─────────────────────────────────────────────────────────────────────
  "بدا": { en: "to begin, to start", ur: "شروع کرنا، آغاز" },
  "بدل": { en: "to change, to substitute", ur: "بدلنا، تبدیل کرنا" },
  "برا": { en: "to create, to be free of", ur: "پیدا کرنا، بری ہونا" },
  "برر": { en: "righteousness, piety, dutiful", ur: "نیکی، تقویٰ، فرماں برداری" },
  "بصر": { en: "sight, vision, insight", ur: "بصارت، نظر، بصیرت" },
  "بعث": { en: "to send, to raise up, to resurrect", ur: "بھیجنا، اٹھانا" },
  "بعد": { en: "after, distance, far", ur: "بعد، دوری" },
  "بقي": { en: "to remain, to last", ur: "باقی رہنا، بقا" },
  "بكي": { en: "to weep, to cry", ur: "رونا" },
  "بلغ": { en: "to reach, to convey, to mature", ur: "پہنچنا، پہنچانا" },
  "بني": { en: "to build, to construct; son", ur: "بنانا، بیٹا" },
  "بيت": { en: "house, home", ur: "گھر، خانہ" },
  "بين": { en: "between, clear, evident", ur: "درمیان، واضح، ظاہر" },
  "بشر": { en: "human being, glad tidings", ur: "انسان، بشارت" },
  "بلو": { en: "trial, to test, tribulation", ur: "آزمانا، بلا" },

  // ─── ت ─────────────────────────────────────────────────────────────────────
  "تبع": { en: "to follow, to pursue", ur: "پیروی کرنا، اتباع" },
  "توب": { en: "to repent, to turn back", ur: "توبہ کرنا، رجوع کرنا" },

  // ─── ث ─────────────────────────────────────────────────────────────────────
  "ثقل": { en: "weight, burden, heavy", ur: "بوجھ، بھاری" },
  "ثلث": { en: "three, third", ur: "تین، تہائی" },
  "ثمر": { en: "fruit, produce", ur: "پھل" },
  "ثمن": { en: "price, value", ur: "قیمت، مول" },

  // ─── ج ─────────────────────────────────────────────────────────────────────
  "جيا": { en: "to come, to arrive", ur: "آنا، تشریف لانا" },
  "جبر": { en: "to compel, to repair; might", ur: "مجبور کرنا، جبار" },
  "جحد": { en: "to deny, to reject", ur: "انکار کرنا" },
  "جزي": { en: "to recompense, to reward", ur: "جزا دینا، بدلہ دینا" },
  "جعل": { en: "to make, to place, to appoint", ur: "بنانا، مقرر کرنا" },
  "جهد": { en: "to strive, to struggle", ur: "کوشش کرنا، جہاد" },
  "جهل": { en: "ignorance, foolishness", ur: "جہالت، نادانی" },
  "جمع": { en: "to gather, to collect, to unite", ur: "جمع کرنا، اکٹھا کرنا" },
  "جنب": { en: "side, to avoid", ur: "پہلو، بچنا" },
  "جنن": { en: "garden, paradise; hidden; madness", ur: "باغ، جنت، پوشیدہ" },
  "جند": { en: "army, troops", ur: "فوج، لشکر" },

  // ─── ح ─────────────────────────────────────────────────────────────────────
  "حبط": { en: "to nullify, to make vain", ur: "اعمال ضائع کرنا" },
  "حبس": { en: "to confine, to hold back", ur: "قید کرنا، روکنا" },
  "حجج": { en: "argument, proof, pilgrimage", ur: "دلیل، حج، حجت" },
  "حدد": { en: "limits, boundaries", ur: "حد، سرحد" },
  "حذر": { en: "caution, to be wary", ur: "احتیاط، خبردار رہنا" },
  "حرم": { en: "forbidden, sacred, to prohibit", ur: "حرام، ممنوع، مقدس" },
  "حزن": { en: "grief, sadness", ur: "غم، حزن" },
  "حسب": { en: "to account, to reckon, to suffice", ur: "حساب کرنا، کافی ہونا" },
  "حسن": { en: "good, beautiful, excellent", ur: "اچھا، خوبصورت" },
  "حفظ": { en: "to guard, to protect, to memorize", ur: "حفاظت کرنا، یاد کرنا" },
  "حقق": { en: "truth, right, due; to verify", ur: "حق، سچ" },
  "حكم": { en: "wisdom, judgment, rule", ur: "حکمت، فیصلہ، حکم" },
  "حلل": { en: "lawful, permissible", ur: "حلال، جائز" },
  "حمد": { en: "praise, gratitude", ur: "حمد، تعریف، شکر" },
  "حمل": { en: "to carry, to bear a burden", ur: "اٹھانا، بوجھ اٹھانا" },
  "حيي": { en: "life, to live, to be alive", ur: "زندگی، جینا" },
  "حوت": { en: "whale, fish", ur: "مچھلی" },
  "حول": { en: "around, power, change", ur: "ارد گرد، طاقت، تبدیلی" },
  "حرب": { en: "war, conflict", ur: "جنگ، لڑائی" },
  "حبب": { en: "love, to love, beloved", ur: "محبت، پسند" },
  "حسد": { en: "envy, jealousy", ur: "حسد، جلن" },
  "حجب": { en: "veil, screen, to hide", ur: "پردہ، حجاب" },

  // ─── خ ─────────────────────────────────────────────────────────────────────
  "خبر": { en: "news, knowledge, to be aware", ur: "خبر، علم" },
  "خبث": { en: "evil, malicious, wicked", ur: "خباثت، برائی، ناپاک" },
  "خرج": { en: "to go out, to exit", ur: "نکلنا، خروج" },
  "خزي": { en: "disgrace, humiliation", ur: "رسوائی، ذلت" },
  "خشي": { en: "to fear, awe-inspiring reverence", ur: "ڈرنا، خشیت" },
  "خطا": { en: "error, mistake, sin", ur: "خطا، غلطی، گناہ" },
  "خطب": { en: "to address, important matter", ur: "خطبہ دینا، اہم معاملہ" },
  "خلص": { en: "pure, sincere, to save", ur: "خالص، مخلص" },
  "خلق": { en: "to create, character, nature", ur: "پیدا کرنا، خلق، اخلاق" },
  "خوف": { en: "fear, dread", ur: "خوف، ڈر" },
  "خير": { en: "good, goodness, better", ur: "خیر، بھلائی" },
  "خلف": { en: "behind, to succeed, successor", ur: "پیچھے، خلیفہ" },
  "خلد": { en: "eternity, to be immortal", ur: "ابدیت، ہمیشگی" },
  "خشع": { en: "humility, submission, reverence", ur: "خشوع، عاجزی" },
  "خصم": { en: "adversary, dispute", ur: "دشمن، جھگڑا" },
  "خوض": { en: "to wade into, to engage vainly", ur: "بیہودہ بات کرنا" },

  // ─── د ─────────────────────────────────────────────────────────────────────
  "دخل": { en: "to enter, to go in", ur: "داخل ہونا، گھسنا" },
  "درس": { en: "to study, to erase, to efface", ur: "پڑھنا، سیکھنا" },
  "دعو": { en: "to call, to invite, supplication", ur: "دعا، بلانا، پکارنا" },
  "دفع": { en: "to repel, to push away", ur: "دفع کرنا، روکنا" },
  "دنو": { en: "near, close, worldly", ur: "قریب، دنیا" },
  "دور": { en: "to revolve, rotation", ur: "گھومنا، دائرہ" },
  "دين": { en: "religion, faith, judgment, debt", ur: "دین، مذہب، قرض، جزا" },
  "درج": { en: "gradual, stages", ur: "درجہ، مرحلہ" },

  // ─── ذ ─────────────────────────────────────────────────────────────────────
  "ذكر": { en: "to remember, to mention, remembrance", ur: "یاد کرنا، ذکر، تذکرہ" },
  "ذنب": { en: "sin, crime, guilt", ur: "گناہ، جرم" },
  "ذهب": { en: "to go, to depart; gold", ur: "جانا، سونا" },
  "ذرر": { en: "offspring, to scatter, atom", ur: "ذریت، اولاد" },
  "ذوق": { en: "to taste, to experience", ur: "ذائقہ، چکھنا" },

  // ─── ر ─────────────────────────────────────────────────────────────────────
  "راي": { en: "to see, to observe, opinion", ur: "دیکھنا، رائے" },
  "ربب": { en: "lord, master, to nurture", ur: "رب، پالنہار، مالک" },
  "ربح": { en: "profit, gain", ur: "نفع، فائدہ" },
  "رجع": { en: "to return, to come back", ur: "واپس جانا، لوٹنا" },
  "رجو": { en: "to hope, to expect", ur: "امید کرنا، توقع" },
  "رحم": { en: "mercy, compassion, womb", ur: "رحم، مہربانی، شفقت" },
  "رزق": { en: "provision, sustenance, livelihood", ur: "رزق، روزی، سہارا" },
  "رسل": { en: "messenger, apostle, to send", ur: "رسول، پیغمبر، بھیجنا" },
  "رشد": { en: "right-mindedness, guidance, maturity", ur: "رشد، ہدایت، پختگی" },
  "رضو": { en: "to be pleased, consent, approval", ur: "راضی ہونا، خوشی" },
  "رعي": { en: "to tend, to guard, to observe", ur: "نگرانی کرنا، چرانا" },
  "رقب": { en: "to watch over, to observe", ur: "نگرانی کرنا، رقیب" },
  "رهب": { en: "fear, awe, to inspire dread", ur: "خوف، ہیبت، رہبانیت" },
  "ربط": { en: "to tie, to bind, to steady", ur: "باندھنا، ربط" },
  "رفع": { en: "to raise, to exalt, to elevate", ur: "اٹھانا، بلند کرنا" },
  "رتل": { en: "to recite slowly, to arrange", ur: "ترتیل، آہستہ پڑھنا" },
  "ركع": { en: "to bow, to kneel", ur: "رکوع، جھکنا" },
  "رهن": { en: "pledge, security, detained", ur: "رہن، گروی" },

  // ─── ز ─────────────────────────────────────────────────────────────────────
  "زكو": { en: "purification, growth, alms", ur: "پاکی، زکوۃ، بڑھنا" },
  "زيد": { en: "to increase, to add", ur: "زیادہ کرنا، بڑھانا" },
  "زود": { en: "provisions, to provide", ur: "زاد، سامان" },

  // ─── س ─────────────────────────────────────────────────────────────────────
  "سبح": { en: "to glorify, to swim, to travel", ur: "تسبیح کرنا، پاکی بیان کرنا" },
  "سبل": { en: "way, path, road", ur: "راستہ، سبیل" },
  "سجد": { en: "to prostrate, to bow down", ur: "سجدہ کرنا، جھکنا" },
  "سخر": { en: "to subjugate, to mock", ur: "مسخر کرنا، مذاق اڑانا" },
  "سرر": { en: "joy, happiness, secret", ur: "خوشی، مسرت، راز" },
  "سعي": { en: "to strive, to walk, to run", ur: "سعی کرنا، کوشش کرنا" },
  "سفه": { en: "foolishness, ignorance", ur: "بیوقوفی، سفاہت" },
  "سكن": { en: "to dwell, to rest, tranquility", ur: "رہنا، سکون، آرام" },
  "سلم": { en: "peace, submission, safety", ur: "سلامتی، اسلام، امن" },
  "سمع": { en: "to hear, listening", ur: "سننا، سمع" },
  "سوا": { en: "evil, harm, misfortune", ur: "برائی، برا، نقصان" },
  "سوي": { en: "to be equal, to make level", ur: "برابر کرنا، ہموار" },
  "سجن": { en: "prison, to imprison", ur: "جیل، قید" },
  "سفر": { en: "to travel, journey", ur: "سفر، سفر کرنا" },
  "سبق": { en: "to precede, to outrun", ur: "آگے بڑھنا، سبقت" },
  "سلط": { en: "authority, power, to dominate", ur: "سلطہ، اختیار" },
  "سال": { en: "to ask, to question, to beg", ur: "پوچھنا، مانگنا، سوال" },
  "صحب": { en: "companion, to accompany", ur: "ساتھی، صحبت" },
  "سجل": { en: "to register, scroll, record", ur: "درج کرنا، سجل" },
  "شكو": { en: "to complain, complaint", ur: "شکایت کرنا" },

  // ─── ش ─────────────────────────────────────────────────────────────────────
  "شفع": { en: "intercession, to intercede", ur: "شفاعت، سفارش" },
  "شكر": { en: "gratitude, thankfulness", ur: "شکر، شکریہ" },
  "شهد": { en: "to witness, to testify, martyr", ur: "گواہی دینا، شہید" },
  "شيا": { en: "thing, matter, something", ur: "چیز، شے" },
  "شرك": { en: "to associate, partnership, polytheism", ur: "شرک، شریک کرنا" },
  "شرع": { en: "law, to legislate, to begin", ur: "شریعت، قانون" },
  "شرب": { en: "to drink", ur: "پینا" },
  "شرح": { en: "to explain, to open, to expand", ur: "شرح کرنا، کھولنا" },
  "شيب": { en: "gray hair, old age", ur: "سفید بال، بڑھاپا" },

  // ─── ص ─────────────────────────────────────────────────────────────────────
  "صبر": { en: "patience, endurance, perseverance", ur: "صبر، برداشت" },
  "صدق": { en: "truth, truthfulness, sincerity", ur: "سچائی، صدق" },
  "صرط": { en: "path, road, way", ur: "راستہ، صراط" },
  "صلح": { en: "righteousness, goodness, reconciliation", ur: "صلح، درستگی، نیکی" },
  "صلو": { en: "prayer, blessings, to pray", ur: "نماز، درود، صلاۃ" },
  "صنع": { en: "to make, to work, craft", ur: "بنانا، کام کرنا، صنعت" },
  "صمد": { en: "eternal, absolute, besought by all", ur: "صمد، بے نیاز" },
  "صدر": { en: "chest, to issue from, heart", ur: "سینہ، صدر" },
  "صور": { en: "form, image, the trumpet", ur: "صورت، شکل، صور" },
  "صفح": { en: "to forgive, to turn away", ur: "معاف کرنا، صفح" },
  "صفو": { en: "pure, chosen, to purify", ur: "خالص، چنا ہوا" },

  // ─── ض ─────────────────────────────────────────────────────────────────────
  "ضرب": { en: "to strike, to travel, to coin", ur: "مارنا، مثال دینا" },
  "ضلل": { en: "to go astray, to mislead", ur: "گمراہ ہونا، ضلالت" },
  "ضرر": { en: "harm, injury, to harm", ur: "ضرر، نقصان" },
  "ضعف": { en: "weakness, to be weak", ur: "کمزوری، ضعف" },

  // ─── ط ─────────────────────────────────────────────────────────────────────
  "طغي": { en: "transgression, rebellion, excess", ur: "سرکشی، طغیان" },
  "طهر": { en: "purity, to be clean", ur: "پاکی، طہارت" },
  "طوع": { en: "willingness, to obey", ur: "اطاعت، خوشی سے ماننا" },
  "طلب": { en: "to seek, to demand, request", ur: "طلب، مانگنا" },
  "طبع": { en: "nature, to seal, to stamp", ur: "طبعیت، مہر لگانا" },
  "طول": { en: "length, to be long, bounty", ur: "لمبائی، طوالت، فضل" },

  // ─── ع ─────────────────────────────────────────────────────────────────────
  "عبد": { en: "servant, to worship, slavery", ur: "عبادت، بندہ، عبد" },
  "عذب": { en: "punishment, torment", ur: "عذاب، سزا" },
  "عرف": { en: "to know, to recognize", ur: "جاننا، پہچاننا، عرفان" },
  "عزز": { en: "might, power, honor", ur: "عزت، طاقت، غلبہ" },
  "عقل": { en: "reason, intellect, to comprehend", ur: "عقل، سمجھ" },
  "عقب": { en: "result, sequel, to follow behind", ur: "انجام، پیچھے آنا" },
  "علم": { en: "knowledge, to know, to learn", ur: "علم، جاننا" },
  "عمل": { en: "deed, action, work", ur: "عمل، کام، کرنا" },
  "عهد": { en: "covenant, promise, era", ur: "عہد، وعدہ، زمانہ" },
  "عود": { en: "to return, to revert", ur: "واپس آنا، لوٹنا" },
  "عون": { en: "help, assistance, support", ur: "مدد، اعانت" },
  "عمر": { en: "age, life, to inhabit", ur: "عمر، زندگی، آباد" },
  "عدل": { en: "justice, equity, to be just", ur: "عدل، انصاف" },
  "عدو": { en: "enemy, to transgress", ur: "دشمن، تجاوز" },
  "عرض": { en: "to offer, breadth, to display", ur: "پیش کرنا، چوڑائی" },
  "عفو": { en: "pardon, to forgive, to excuse", ur: "معافی، عفو" },
  "عجب": { en: "wonder, amazement", ur: "تعجب، حیرت" },
  "علو": { en: "height, to be high, exalted", ur: "بلندی، عالی" },
  "عصي": { en: "to disobey, rebellion", ur: "نافرمانی، معصیت" },

  // ─── غ ─────────────────────────────────────────────────────────────────────
  "غفر": { en: "forgiveness, to forgive", ur: "مغفرت، معاف کرنا" },
  "غيب": { en: "unseen, hidden, absent", ur: "غیب، پوشیدہ" },
  "غضب": { en: "anger, wrath", ur: "غضب، غصہ" },
  "غلب": { en: "to overcome, to prevail", ur: "غالب آنا، فتح" },
  "غني": { en: "richness, wealth, independence", ur: "غنا، امارت، بے نیازی" },

  // ─── ف ─────────────────────────────────────────────────────────────────────
  "فتح": { en: "to open, to conquer, victory", ur: "فتح، کھولنا" },
  "فجر": { en: "dawn, to burst forth", ur: "فجر، صبح، پھوٹنا" },
  "فرق": { en: "to separate, distinction", ur: "فرق، جدا کرنا" },
  "فسد": { en: "corruption, mischief, to corrupt", ur: "فساد، خرابی" },
  "فعل": { en: "to do, to act, deed", ur: "کرنا، فعل، عمل" },
  "فقه": { en: "understanding, jurisprudence", ur: "فہم، سمجھ، فقہ" },
  "فكر": { en: "to think, reflection", ur: "سوچنا، فکر" },
  "فوز": { en: "success, triumph, salvation", ur: "کامیابی، فلاح" },
  "فضل": { en: "grace, bounty, excellence", ur: "فضل، احسان، برتری" },
  "فلح": { en: "success, prosperity", ur: "فلاح، کامیابی" },
  "فتن": { en: "trial, tribulation, sedition", ur: "فتنہ، آزمائش" },
  "فرح": { en: "joy, happiness, to rejoice", ur: "خوشی، مسرت" },
  "فصل": { en: "to separate, chapter, to decide", ur: "فصل، الگ کرنا" },
  "فرض": { en: "obligation, to enjoin", ur: "فرض، لازم کرنا" },
  "فرد": { en: "individual, alone, unique", ur: "فرد، اکیلا" },

  // ─── ق ─────────────────────────────────────────────────────────────────────
  "قبل": { en: "before, to accept, to receive", ur: "پہلے، قبول کرنا" },
  "قتل": { en: "to kill, to slay", ur: "قتل کرنا، مارنا" },
  "قدر": { en: "power, measure, to decree", ur: "قدرت، اندازہ، تقدیر" },
  "قرا": { en: "to read, to recite, Quran", ur: "پڑھنا، تلاوت، قرآن" },
  "قرب": { en: "near, close, to draw near", ur: "قریب، نزدیک" },
  "قسم": { en: "oath, division, to swear", ur: "قسم، حصہ" },
  "قضي": { en: "to decree, to judge, to fulfill", ur: "فیصلہ کرنا، حکم دینا" },
  "قطع": { en: "to cut, to sever", ur: "کاٹنا، قطع کرنا" },
  "قلب": { en: "heart, to turn over", ur: "دل، قلب، پلٹنا" },
  "قنت": { en: "devout obedience, to be submissive", ur: "فرماں برداری، قنوت" },
  "قوم": { en: "people, nation; to stand upright", ur: "قوم، لوگ، کھڑا ہونا" },
  "قول": { en: "to say, speech, word", ur: "کہنا، قول" },
  "قرن": { en: "century, generation, to join", ur: "قرن، دور، جوڑنا" },
  "قسط": { en: "justice, equity, portion", ur: "انصاف، حصہ، قسط" },
  "قهر": { en: "to overpower, to dominate", ur: "قہر، غلبہ" },
  "قنع": { en: "contentment, to be satisfied", ur: "قناعت، سنتوش" },
  "قرع": { en: "to knock, calamity", ur: "کھٹکھٹانا، قارعہ" },
  "قسر": { en: "to force, to compel", ur: "زبردستی، مجبور کرنا" },
  "كيد": { en: "plot, scheme, cunning", ur: "چال، سازش" },

  // ─── ك ─────────────────────────────────────────────────────────────────────
  "كبر": { en: "greatness, to be great, arrogance", ur: "بڑائی، کبر، تکبر" },
  "كذب": { en: "to lie, falsehood, to deny", ur: "جھوٹ، کذب" },
  "كسب": { en: "to earn, to acquire", ur: "کمانا، حاصل کرنا" },
  "كشف": { en: "to uncover, to reveal", ur: "ظاہر کرنا، آشکار" },
  "كفر": { en: "to disbelieve, ingratitude, to cover", ur: "کفر، انکار، ناشکری" },
  "كلم": { en: "to speak, word, speech", ur: "کلام، بات، بولنا" },
  "كون": { en: "being, existence, to be", ur: "ہونا، وجود" },
  "كتب": { en: "to write, book, scripture", ur: "لکھنا، کتاب" },
  "كرم": { en: "generosity, nobility, honor", ur: "کرم، عزت، شرافت" },
  "كثر": { en: "abundance, many, much", ur: "کثرت، بہت" },
  "مكن": { en: "to establish, power, authority", ur: "قدرت، اقتدار" },

  // ─── ل ─────────────────────────────────────────────────────────────────────
  "لبث": { en: "to remain, to stay, to linger", ur: "ٹھہرنا، رہنا" },
  "لعن": { en: "curse, to curse", ur: "لعنت، لعنت کرنا" },
  "لقي": { en: "to meet, to encounter", ur: "ملنا، سامنا ہونا" },
  "لهو": { en: "amusement, play, distraction", ur: "کھیل، تماشا، لہو" },
  "لبس": { en: "to wear, to confuse", ur: "پہننا، التباس" },
  "لحق": { en: "to join, to catch up, to reach", ur: "ملنا، پہنچنا" },

  // ─── م ─────────────────────────────────────────────────────────────────────
  "مكر": { en: "scheming, plotting, deceit", ur: "مکر، چال، دھوکہ" },
  "ملك": { en: "king, dominion, to possess", ur: "بادشاہ، ملک، مالک" },
  "منع": { en: "to prevent, to withhold", ur: "روکنا، منع کرنا" },
  "موت": { en: "death, to die", ur: "موت، مرنا" },
  "مدد": { en: "to extend, to prolong, aid", ur: "مدد، بڑھانا" },
  "مثل": { en: "likeness, example, parable", ur: "مثال، مثل" },
  "مشي": { en: "to walk, to go", ur: "چلنا، جانا" },
  "محو": { en: "to erase, to obliterate", ur: "مٹانا، محو" },
  "منن": { en: "favor, to bestow, to cut", ur: "احسان، نعمت" },

  // ─── ن ─────────────────────────────────────────────────────────────────────
  "نبا": { en: "news, tidings, prophecy, prophet", ur: "خبر، نبی، پیغمبر" },
  "نجو": { en: "to save, to escape, salvation", ur: "نجات، بچنا" },
  "نذر": { en: "vow, to warn, to pledge", ur: "نذر، وعدہ، خبردار کرنا" },
  "نزل": { en: "to descend, to reveal", ur: "نازل ہونا، اترنا" },
  "نصر": { en: "help, victory, to support", ur: "مدد، نصرت، کامیابی" },
  "نظر": { en: "to look, to consider, sight", ur: "دیکھنا، نظر، غور کرنا" },
  "نعم": { en: "blessing, bounty, grace", ur: "نعمت، احسان" },
  "نفس": { en: "soul, self, life", ur: "نفس، روح، جان" },
  "نفع": { en: "benefit, advantage, profit", ur: "نفع، فائدہ" },
  "نهي": { en: "prohibition, to forbid, end", ur: "منع کرنا، نہی" },
  "نور": { en: "light, luminous", ur: "نور، روشنی" },
  "نفق": { en: "hypocrisy, tunnel, to spend", ur: "منافقت، خرچ کرنا" },
  "نسي": { en: "to forget, forgetfulness", ur: "بھولنا، نسیان" },
  "نشر": { en: "to spread, to resurrect", ur: "پھیلانا، نشر، قیامت" },
  "نكح": { en: "marriage, to marry", ur: "نکاح، شادی" },
  "نبذ": { en: "to cast away, to reject", ur: "پھینکنا، رد کرنا" },
  "نقم": { en: "vengeance, to punish", ur: "انتقام، سزا" },
  "نبت": { en: "to grow, to sprout", ur: "اگنا، نبات" },
  "نهر": { en: "river, to rebuke", ur: "دریا، نہر، ڈانٹنا" },

  // ─── ه ─────────────────────────────────────────────────────────────────────
  "هدي": { en: "guidance, to guide", ur: "ہدایت، راہ دکھانا" },
  "هلك": { en: "to perish, destruction", ur: "ہلاک ہونا، تباہی" },
  "هيا": { en: "awe, reverence, to fear", ur: "ہیبت، رعب، خوف" },
  "هجر": { en: "to abandon, to migrate", ur: "چھوڑنا، ہجرت" },

  // ─── و ─────────────────────────────────────────────────────────────────────
  "وجد": { en: "to find, to experience", ur: "پانا، محسوس کرنا" },
  "وجه": { en: "face, direction, purpose", ur: "چہرہ، وجہ، سمت" },
  "وحي": { en: "revelation, inspiration", ur: "وحی، الہام" },
  "وعد": { en: "promise, to promise, threat", ur: "وعدہ، پرامیس" },
  "وقي": { en: "to protect, to guard; God-consciousness", ur: "بچانا، تقویٰ" },
  "ولي": { en: "friend, guardian, protector", ur: "دوست، ولی، سرپرست" },
  "وهب": { en: "to give, to grant, gift", ur: "دینا، عطا کرنا" },
  "وصل": { en: "to reach, to connect, to arrive", ur: "پہنچنا، جوڑنا" },
  "وصف": { en: "to describe, attribute", ur: "بیان کرنا، وصف" },
  "وزن": { en: "weight, to weigh, balance", ur: "وزن، تولنا، ترازو" },
  "وسع": { en: "vast, spacious, to encompass", ur: "وسعت، کشادگی" },
  "وعظ": { en: "admonition, to admonish", ur: "وعظ، نصیحت" },
  "وجب": { en: "to be obligatory, to fall", ur: "واجب، لازم" },
  "وقف": { en: "to stand, to stop, endowment", ur: "رکنا، وقف" },

  // ─── ي ─────────────────────────────────────────────────────────────────────
  "يدي": { en: "hand, power, favor", ur: "ہاتھ، طاقت" },
  "يسر": { en: "ease, facilitation", ur: "آسانی، سہولت" },
  "يقن": { en: "certainty, conviction", ur: "یقین، قطعیت" },
  "يوم": { en: "day, time, era", ur: "دن، وقت" },

  // ─── Additional ─────────────────────────────────────────────────────────────
  "سمو": { en: "to be high, lofty, exalted", ur: "بلند، رفعت" },
  "اله": { en: "deity, god, to worship", ur: "الٰہ، معبود" },
  "روح": { en: "spirit, soul, revelation", ur: "روح، جان" },
  "ظلم": { en: "oppression, injustice, darkness", ur: "ظلم، ناانصافی، اندھیرا" },
  "ظهر": { en: "to appear, back, evident", ur: "ظاہر ہونا، پیٹھ" },
  "ظفر": { en: "victory, to succeed", ur: "ظفر، فتح" },
  "ظنن": { en: "assumption, conjecture, to think", ur: "گمان، خیال" },
};

/**
 * Synchronous lookup — no network required.
 *
 * The input root is normalized before lookup, so raw QAC root strings
 * (which already use the canonical form) are matched correctly, as are
 * any alternate alif/ya forms passed by callers.
 *
 * Returns null when the root is not in the curated table.
 */
export function lookupRootMeaning(root: string | null | undefined): RootMeaning | null {
  if (!root) return null;
  const key = normalize(root);
  return ROOT_MEANINGS[key] ?? null;
}
