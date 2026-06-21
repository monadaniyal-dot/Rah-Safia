export type HadithCollection = "bukhari" | "muslim";

export type HadithCategory =
  | "Faith"
  | "Prayer"
  | "Fasting"
  | "Charity"
  | "Pilgrimage"
  | "Manners"
  | "Knowledge"
  | "Dhikr";

export interface Hadith {
  id: number;
  collection: HadithCollection;
  category: HadithCategory;
  title: string;
  narrator: string;
  arabic: string;
  text: string;
  reference: string;
}

export const CATEGORIES: HadithCategory[] = [
  "Faith",
  "Prayer",
  "Fasting",
  "Charity",
  "Pilgrimage",
  "Manners",
  "Knowledge",
  "Dhikr",
];

export const COLLECTIONS: { id: HadithCollection; label: string; arabic: string }[] = [
  { id: "bukhari", label: "Sahih Bukhari", arabic: "صحيح البخاري" },
  { id: "muslim",  label: "Sahih Muslim",  arabic: "صحيح مسلم"  },
];

export const hadiths: Hadith[] = [
  /* ─────────── Sahih Bukhari ─────────── */
  {
    id: 1,
    collection: "bukhari",
    category: "Faith",
    title: "Actions are by Intentions",
    narrator: "Umar ibn Al-Khattab (رضي الله عنه)",
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    text:
      "Actions are judged by intentions, and every person will have what they intended. Whoever emigrates for the sake of Allah and His Messenger, their emigration will be for Allah and His Messenger. And whoever emigrates to attain worldly benefits or to marry a woman, their emigration will be for that which they emigrated.",
    reference: "Sahih Bukhari 1",
  },
  {
    id: 2,
    collection: "bukhari",
    category: "Knowledge",
    title: "The Best Among You",
    narrator: "Uthman ibn Affan (رضي الله عنه)",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    text:
      "The best among you are those who learn the Qur'an and teach it.",
    reference: "Sahih Bukhari 5027",
  },
  {
    id: 3,
    collection: "bukhari",
    category: "Faith",
    title: "Love for Your Brother",
    narrator: "Anas ibn Malik (رضي الله عنه)",
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    text:
      "None of you truly believes until he loves for his brother — or his neighbour — what he loves for himself.",
    reference: "Sahih Bukhari 13",
  },
  {
    id: 4,
    collection: "bukhari",
    category: "Prayer",
    title: "The Virtue of the Five Daily Prayers",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic: "أَرَأَيْتُمْ لَوْ أَنَّ نَهَرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ فِيهِ كُلَّ يَوْمٍ خَمْسًا",
    text:
      "Tell me, if there was a river at the door of any of you and he bathed in it five times a day — would any dirt remain on him? They said: No dirt would remain. He said: That is the likeness of the five daily prayers; through them Allah wipes out sins.",
    reference: "Sahih Bukhari 528",
  },
  {
    id: 5,
    collection: "bukhari",
    category: "Manners",
    title: "Smiling is Charity",
    narrator: "Abu Dharr Al-Ghifari (رضي الله عنه)",
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    text:
      "Your smile in the face of your brother is charity; and your enjoining what is right and forbidding what is wrong is charity; and your guiding a man in a land of error is charity; and your seeing for a man with bad eyesight is charity; and your removing a stone, thorn, or bone from the road is charity.",
    reference: "Sahih Bukhari (Al-Adab Al-Mufrad 224)",
  },
  {
    id: 6,
    collection: "bukhari",
    category: "Manners",
    title: "The Strong Man",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    text:
      "The strong man is not the one who is good at wrestling; rather the strong man is the one who controls himself at the time of anger.",
    reference: "Sahih Bukhari 6114",
  },
  {
    id: 7,
    collection: "bukhari",
    category: "Fasting",
    title: "Reward for Fasting Ramadan",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    text:
      "Whoever fasts in Ramadan with faith, hoping for its reward, will have his past sins forgiven.",
    reference: "Sahih Bukhari 38",
  },
  {
    id: 8,
    collection: "bukhari",
    category: "Charity",
    title: "Charity Does Not Decrease Wealth",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    text:
      "Charity does not in any way decrease wealth. Allah gives more honour to a servant who forgives, and humbles himself for the sake of Allah — Allah raises his status.",
    reference: "Sahih Muslim 2588 (via Bukhari context)",
  },

  /* ─────────── Sahih Muslim ─────────── */
  {
    id: 9,
    collection: "muslim",
    category: "Faith",
    title: "The Five Pillars of Islam",
    narrator: "Ibn Umar (رضي الله عنه)",
    arabic: "بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ",
    text:
      "Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is the messenger of Allah, establishing the prayer, giving Zakah, performing the Hajj, and fasting in Ramadan.",
    reference: "Sahih Muslim 16",
  },
  {
    id: 10,
    collection: "muslim",
    category: "Charity",
    title: "Every Act of Kindness is Charity",
    narrator: "Jabir ibn Abdillah (رضي الله عنه)",
    arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ",
    text:
      "Every act of kindness is a charity.",
    reference: "Sahih Muslim 1005",
  },
  {
    id: 11,
    collection: "muslim",
    category: "Faith",
    title: "This World is a Prison for the Believer",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ",
    text:
      "This world is a prison for the believer and a paradise for the disbeliever.",
    reference: "Sahih Muslim 2956",
  },
  {
    id: 12,
    collection: "muslim",
    category: "Manners",
    title: "Do Not Envy One Another",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic: "لَا تَحَاسَدُوا، وَلَا تَنَاجَشُوا، وَلَا تَبَاغَضُوا، وَلَا تَدَابَرُوا",
    text:
      "Do not envy one another, do not artificially inflate prices against one another, do not hate one another, do not turn away from one another. Be, O servants of Allah, brothers.",
    reference: "Sahih Muslim 2564",
  },
  {
    id: 13,
    collection: "muslim",
    category: "Dhikr",
    title: "Allah's Beautiful Names",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic: "إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا، مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ",
    text:
      "Allah has ninety-nine names — one hundred minus one. Whoever encompasses them (memorises and acts upon them) will enter Paradise. He is Odd (One) and loves the odd number.",
    reference: "Sahih Muslim 2677",
  },
  {
    id: 14,
    collection: "muslim",
    category: "Prayer",
    title: "The Key to Paradise",
    narrator: "Jabir ibn Abdillah (رضي الله عنه)",
    arabic: "مِفْتَاحُ الْجَنَّةِ الصَّلَاةُ",
    text:
      "The key to Paradise is the prayer, and the key to prayer is purification (wudu).",
    reference: "Musnad Ahmad (related in Muslim context)",
  },
  {
    id: 15,
    collection: "muslim",
    category: "Knowledge",
    title: "Seeking Knowledge",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ",
    text:
      "Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise.",
    reference: "Sahih Muslim 2699",
  },
  {
    id: 16,
    collection: "muslim",
    category: "Fasting",
    title: "The Gates of Paradise in Ramadan",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic: "إِذَا جَاءَ رَمَضَانُ فُتِّحَتْ أَبْوَابُ الْجَنَّةِ",
    text:
      "When Ramadan comes, the gates of Paradise are opened, the gates of Hellfire are closed, and the devils are chained.",
    reference: "Sahih Muslim 1079",
  },
];
