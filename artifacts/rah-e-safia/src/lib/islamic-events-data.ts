/**
 * Islamic Events Data
 *
 * Static event definitions (Hijri date + description) and dynamic helpers
 * that resolve Gregorian dates and days-remaining at runtime.
 *
 * Architecture note: each event carries a `notificationKey` so future versions
 * can enable reminders without restructuring this module.
 */

import { toHijri } from "./hijri";
import { findGregorianForHijri, daysUntil } from "./islamic-calendar";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuranRef {
  arabic: string;
  translation: string;
  reference: string;
}

export interface HadithRef {
  text: string;
  source: string;
}

export interface IslamicEvent {
  id: string;
  name: string;
  arabicName: string;
  hijriDay: number;
  hijriMonth: number;
  color: "emerald" | "violet" | "amber" | "rose" | "sky" | "teal";
  emoji: string;
  importance: string;
  description: string;
  quranRefs?: QuranRef[];
  hadithRefs?: HadithRef[];
  /** Used as a key for future notification preferences */
  notificationKey: string;
}

export interface ComputedEvent extends IslamicEvent {
  hijriYear: number;
  gregDate: Date;
  daysRemaining: number;
}

// ── Static event list ─────────────────────────────────────────────────────────

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    id: "new-year",
    name: "Islamic New Year",
    arabicName: "رأس السنة الهجرية",
    hijriDay: 1,
    hijriMonth: 1,
    color: "teal",
    emoji: "🌙",
    notificationKey: "islamic_new_year",
    importance: "Start of the Hijri calendar year",
    description:
      "The Islamic New Year marks the migration (Hijra) of the Prophet Muhammad ﷺ from Makkah to Madinah in 622 CE — a defining moment that established the Muslim community. It is a time for reflection, gratitude, and renewing one's commitment to faith.",
    quranRefs: [
      {
        arabic: "إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ",
        translation:
          "Indeed, the number of months with Allah is twelve months in the register of Allah.",
        reference: "At-Tawbah 9:36",
      },
    ],
  },
  {
    id: "ashura",
    name: "Day of Ashura",
    arabicName: "يوم عاشوراء",
    hijriDay: 10,
    hijriMonth: 1,
    color: "violet",
    emoji: "✨",
    notificationKey: "ashura",
    importance: "Day Allah saved Musa (AS) — fasting is Sunnah",
    description:
      "On this day, Allah saved Prophet Musa (Moses, peace be upon him) and the Children of Israel from Pharaoh by parting the Red Sea. When the Prophet ﷺ arrived in Madinah and found the Jews fasting, he said: 'We have more right to Musa than you.' He fasted and instructed Muslims to fast on the 9th and 10th (or 10th and 11th) of Muharram.",
    hadithRefs: [
      {
        text:
          "The Prophet ﷺ came to Madinah and saw the Jews fasting on the day of Ashura. He asked them about it, and they said: 'This is a great day on which Allah saved Musa and his people and drowned Pharaoh and his people, so Musa fasted this day as gratitude.' The Prophet ﷺ said: 'We have more right to Musa than you,' so he fasted and ordered fasting on that day.",
        source: "Sahih al-Bukhari 3943",
      },
      {
        text:
          "Fasting on the day of Ashura — I hope that Allah will accept it as expiation for the year that came before it.",
        source: "Sahih Muslim 1162",
      },
    ],
  },
  {
    id: "mawlid",
    name: "Mawlid al-Nabi",
    arabicName: "المولد النبوي الشريف",
    hijriDay: 12,
    hijriMonth: 3,
    color: "rose",
    emoji: "🌹",
    notificationKey: "mawlid",
    importance: "Birth of Prophet Muhammad ﷺ",
    description:
      "The twelfth of Rabi' al-Awwal is widely observed as the birthday of the Prophet Muhammad ﷺ. Muslims across the world mark the occasion with prayers, reflection on the Prophet's life and character, and expressions of gratitude to Allah for sending the final Messenger as a mercy to all of mankind.",
    quranRefs: [
      {
        arabic: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
        translation: "And We have not sent you except as a mercy to the worlds.",
        reference: "Al-Anbiya 21:107",
      },
    ],
    hadithRefs: [
      {
        text:
          "The Prophet ﷺ was asked about fasting on Mondays. He said: 'That is the day on which I was born and the day on which I received revelation.'",
        source: "Sahih Muslim 1162b",
      },
    ],
  },
  {
    id: "isra-miraj",
    name: "Isra & Mi'raj",
    arabicName: "الإسراء والمعراج",
    hijriDay: 27,
    hijriMonth: 7,
    color: "violet",
    emoji: "🌟",
    notificationKey: "isra_miraj",
    importance: "The Night Journey and Ascension to the Heavens",
    description:
      "On this night, the Angel Jibreel (AS) took the Prophet Muhammad ﷺ from the Sacred Mosque in Makkah to Al-Aqsa Mosque in Jerusalem (Isra), and then ascended through the seven heavens to the Divine Presence (Mi'raj). The five daily prayers were prescribed on this blessed night.",
    quranRefs: [
      {
        arabic:
          "سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى",
        translation:
          "Exalted is He who took His Servant by night from Al-Masjid al-Haram to Al-Masjid al-Aqsa.",
        reference: "Al-Isra 17:1",
      },
    ],
  },
  {
    id: "mid-shaban",
    name: "Laylat al-Bara'ah",
    arabicName: "ليلة البراءة",
    hijriDay: 15,
    hijriMonth: 8,
    color: "sky",
    emoji: "🤲",
    notificationKey: "mid_shaban",
    importance: "Night of forgiveness and mercy in mid-Sha'ban",
    description:
      "The fifteenth night of Sha'ban is known as Laylat al-Bara'ah (the Night of Decree or Immunity). It is reported that Allah looks upon His creation with special mercy this night and forgives many of His servants. Many Muslims spend this night in additional prayer, supplication, and seeking forgiveness.",
    hadithRefs: [
      {
        text:
          "Allah looks upon all His creation on the fifteenth night of Sha'ban and forgives all His creation except the polytheist and the one who harbours enmity.",
        source: "Ibn Majah 1390 (declared Sahih by Al-Albani)",
      },
    ],
  },
  {
    id: "ramadan",
    name: "Ramadan Begins",
    arabicName: "بداية رمضان المبارك",
    hijriDay: 1,
    hijriMonth: 9,
    color: "emerald",
    emoji: "🌙",
    notificationKey: "ramadan",
    importance: "Month of fasting, Quran, and spiritual renewal",
    description:
      "Ramadan is the ninth and most sacred month of the Islamic calendar. Fasting (Sawm) is obligatory upon every adult Muslim — abstaining from food, drink, and relations from dawn to sunset. It is the month in which the Quran was first revealed, and its last ten nights include Laylat al-Qadr, better than a thousand months.",
    quranRefs: [
      {
        arabic:
          "شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ",
        translation:
          "The month of Ramadan in which was revealed the Quran, a guidance for the people and clear proofs of guidance and criterion.",
        reference: "Al-Baqarah 2:185",
      },
    ],
    hadithRefs: [
      {
        text:
          "When the month of Ramadan enters, the gates of Paradise are opened, the gates of Hellfire are closed, and the devils are chained.",
        source: "Sahih al-Bukhari 1899",
      },
    ],
  },
  {
    id: "laylat-al-qadr",
    name: "Laylat al-Qadr",
    arabicName: "ليلة القدر",
    hijriDay: 27,
    hijriMonth: 9,
    color: "violet",
    emoji: "✨",
    notificationKey: "laylat_al_qadr",
    importance: "Night of Power — better than a thousand months",
    description:
      "Laylat al-Qadr is the most blessed night of the year, found within the last ten nights of Ramadan, most likely on an odd-numbered night. On this night, the first verses of the Quran were revealed to the Prophet ﷺ. Worship on this single night surpasses eighty-three years of continuous worship.",
    quranRefs: [
      {
        arabic:
          "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ ۝ وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ ۝ لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ",
        translation:
          "Indeed, We sent it down on the Night of Decree. And what can make you know what the Night of Decree is? The Night of Decree is better than a thousand months.",
        reference: "Al-Qadr 97:1–3",
      },
    ],
    hadithRefs: [
      {
        text:
          "Seek Laylat al-Qadr in the odd nights of the last ten days of Ramadan.",
        source: "Sahih al-Bukhari 2017",
      },
    ],
  },
  {
    id: "eid-fitr",
    name: "Eid al-Fitr",
    arabicName: "عيد الفطر",
    hijriDay: 1,
    hijriMonth: 10,
    color: "emerald",
    emoji: "🎉",
    notificationKey: "eid_fitr",
    importance: "Celebration marking the end of Ramadan",
    description:
      "Eid al-Fitr (the Festival of Breaking the Fast) is one of the two great Islamic celebrations. It is observed on the first day of Shawwal, marking the completion of Ramadan. Muslims offer the Eid prayer in congregation, pay Zakat al-Fitr before the prayer, and celebrate with family and community.",
    quranRefs: [
      {
        arabic:
          "وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا اللَّهَ عَلَىٰ مَا هَدَاكُمْ وَلَعَلَّكُمْ تَشْكُرُونَ",
        translation:
          "And so that you may complete the period and glorify Allah for that to which He has guided you; perhaps you will be grateful.",
        reference: "Al-Baqarah 2:185",
      },
    ],
    hadithRefs: [
      {
        text:
          "The Prophet ﷺ prescribed Zakat al-Fitr as a purification of the fasting person from any indecent act or speech, and as food for the poor.",
        source: "Abu Dawud 1609",
      },
    ],
  },
  {
    id: "arafah",
    name: "Day of Arafah",
    arabicName: "يوم عرفة",
    hijriDay: 9,
    hijriMonth: 12,
    color: "amber",
    emoji: "🕋",
    notificationKey: "arafah",
    importance: "Greatest day of the year — fasting expiates two years of sins",
    description:
      "The Day of Arafah (9th Dhu al-Hijjah) is the climax of the Hajj pilgrimage and considered the greatest day of the Islamic year. Pilgrims stand on the plain of Arafah in supplication. For non-pilgrims, fasting this day is highly recommended, as the Prophet ﷺ said it expiates sins of the past and coming year.",
    quranRefs: [
      {
        arabic: "الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِي",
        translation:
          "This day I have perfected for you your religion and completed My favour upon you.",
        reference: "Al-Ma'idah 5:3 (revealed on Arafah)",
      },
    ],
    hadithRefs: [
      {
        text:
          "Fasting on the Day of Arafah — I hope Allah will accept it as expiation for the year before it and the year after it.",
        source: "Sahih Muslim 1162",
      },
    ],
  },
  {
    id: "eid-adha",
    name: "Eid al-Adha",
    arabicName: "عيد الأضحى",
    hijriDay: 10,
    hijriMonth: 12,
    color: "amber",
    emoji: "🐑",
    notificationKey: "eid_adha",
    importance: "Festival of Sacrifice — commemorating Ibrahim's (AS) obedience",
    description:
      "Eid al-Adha (the Festival of Sacrifice) commemorates the willingness of Prophet Ibrahim (Abraham, AS) to sacrifice his son in obedience to Allah, before Allah substituted a ram in his place. Muslims worldwide offer the Eid prayer, perform Udhiyah (sacrifice), and share meat with family, neighbours, and the poor.",
    quranRefs: [
      {
        arabic:
          "فَلَمَّا أَسْلَمَا وَتَلَّهُ لِلْجَبِينِ ۝ وَنَادَيْنَاهُ أَن يَا إِبْرَاهِيمُ ۝ قَدْ صَدَّقْتَ الرُّؤْيَا",
        translation:
          "When they had both submitted and he put him down upon his forehead, We called to him: 'O Ibrahim, you have fulfilled the vision.'",
        reference: "As-Saffat 37:103–105",
      },
    ],
    hadithRefs: [
      {
        text:
          "There is no day on which good deeds are more beloved to Allah than on these ten days (first ten days of Dhu al-Hijjah).",
        source: "Sahih al-Bukhari 969",
      },
    ],
  },
];

// ── Hijri month descriptions ──────────────────────────────────────────────────

export const HIJRI_MONTH_DESCRIPTIONS: { name: string; description: string }[] = [
  {
    name: "Muharram",
    description:
      "Muharram is one of the four sacred months in Islam in which fighting is prohibited. It opens the Islamic year and holds the Day of Ashura (10th), on which Allah saved Prophet Musa (AS) from Pharaoh — a day of recommended fasting.",
  },
  {
    name: "Safar",
    description:
      "Safar is the second month of the Islamic year. It holds no particular religious observance, but Muslims are reminded that all months belong to Allah and that superstition about this month has no basis in Islam.",
  },
  {
    name: "Rabi' al-Awwal",
    description:
      "The third month is widely marked as the birth month of the Prophet Muhammad ﷺ (12th Rabi' al-Awwal). It is a time of reflection on the Seerah — the life, character, and mission of the final Messenger.",
  },
  {
    name: "Rabi' al-Thani",
    description:
      "Rabi' al-Thani (the second spring) is the fourth month of the Islamic year. It is a month of continuation and steadiness. Several notable scholars passed away in this month throughout Islamic history.",
  },
  {
    name: "Jumada al-Awwal",
    description:
      "The fifth month of the Islamic year. Jumada comes from the Arabic for dry land or frozen water, reflecting the pre-Islamic understanding of the seasons. It is a period for routine worship and gratitude.",
  },
  {
    name: "Jumada al-Thani",
    description:
      "The sixth month of the Islamic year. A notable event in this month is the Battle of Mu'tah (8 AH), in which three great companions — Zayd ibn Haritha, Ja'far ibn Abi Talib, and Abdullah ibn Rawaha — were martyred.",
  },
  {
    name: "Rajab",
    description:
      "Rajab is one of the four sacred months and holds great significance as the month of Isra wal Mi'raj — the miraculous night journey and ascension of the Prophet ﷺ (27th Rajab). Muslims increase in fasting, prayer, and supplication.",
  },
  {
    name: "Sha'ban",
    description:
      "Sha'ban is the month of the Prophet ﷺ. He would fast more in this month than any other outside Ramadan. The fifteenth night (Laylat al-Bara'ah) is a night of special mercy and forgiveness. It is also a time to prepare for Ramadan.",
  },
  {
    name: "Ramadan",
    description:
      "The blessed month of fasting, in which the Quran was first revealed. Muslims abstain from food, drink, and relations from dawn to sunset, intensify their worship, and seek the Night of Power (Laylat al-Qadr) in the last ten nights.",
  },
  {
    name: "Shawwal",
    description:
      "Shawwal begins with Eid al-Fitr, the celebration ending Ramadan. The Prophet ﷺ encouraged fasting six days of Shawwal, which combined with Ramadan equals the reward of fasting the entire year.",
  },
  {
    name: "Dhu al-Qa'dah",
    description:
      "One of the four sacred months, Dhu al-Qa'dah historically marked the beginning of the Hajj season. It is a month of peace and preparation. Warfare was prohibited in this month in pre-Islamic Arabia, a sanctity Islam upheld.",
  },
  {
    name: "Dhu al-Hijjah",
    description:
      "The twelfth and final month of the Islamic year is the month of Hajj — the pilgrimage to Makkah. The first ten days are considered the best days of the year. It contains the Day of Arafah (9th) and Eid al-Adha (10th–13th).",
  },
];

// ── Dynamic event resolver ────────────────────────────────────────────────────

/**
 * Compute upcoming events from today's date.
 * For each static event, finds the next occurrence (this Hijri year or next)
 * and attaches the Gregorian date and days remaining.
 */
export function getUpcomingEvents(today: Date = new Date()): ComputedEvent[] {
  const todayHijri = toHijri(today);
  const computed: ComputedEvent[] = [];

  for (const event of ISLAMIC_EVENTS) {
    let resolved: ComputedEvent | null = null;

    for (let yearOffset = 0; yearOffset <= 1 && !resolved; yearOffset++) {
      const hijriYear = todayHijri.year + yearOffset;
      try {
        const gregDate = findGregorianForHijri(hijriYear, event.hijriMonth, event.hijriDay);
        const remaining = daysUntil(gregDate, today);
        if (remaining >= 0) {
          resolved = { ...event, hijriYear, gregDate, daysRemaining: remaining };
        }
      } catch {
        // skip if conversion fails
      }
    }

    if (resolved) computed.push(resolved);
  }

  return computed.sort((a, b) => a.gregDate.getTime() - b.gregDate.getTime());
}
