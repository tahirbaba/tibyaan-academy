/**
 * Quran metadata — the single source of truth for surahs, ayah counts and juz.
 *
 * Source: Tanzil.net Quran metadata (https://tanzil.net), Hafs ʿan ʿAsim /
 * Kufan ayah numbering — the numbering of the standard Madinah mushaf. This is
 * the same tradition the existing hifz records rest on (total 6236), so adopting
 * it renumbers nothing.
 *
 * Embedded as a static constant, not fetched and not a runtime dependency.
 *
 * It is verified ARITHMETICALLY against itself at module load (see
 * assertQuranMetadata below), not trusted because of its source: the per-surah
 * counts must sum to 6236, there must be 114 surahs and 30 juz, and the juz
 * boundaries must be continuous — no gap, no overlap, the last juz ending at
 * the last ayah of an-Nas. If any invariant fails, importing this module
 * throws, so broken Quran data can never reach a page a student reads.
 */

export interface Surah {
  number: number;
  /** Arabic name, e.g. الفاتحة */
  name: string;
  /** Latin transliteration, e.g. Al-Fatihah */
  transliteration: string;
  /** English meaning, e.g. The Opening */
  english: string;
  /** Number of ayaat (Hafs/Kufan). */
  ayahCount: number;
}

/** [number, arabic, transliteration, english, ayahCount] */
const RAW: Array<[number, string, string, string, number]> = [
  [1, "الفاتحة", "Al-Fatihah", "The Opening", 7],
  [2, "البقرة", "Al-Baqarah", "The Cow", 286],
  [3, "آل عمران", "Aal-E-Imran", "The Family of Imran", 200],
  [4, "النساء", "An-Nisa", "The Women", 176],
  [5, "المائدة", "Al-Ma'idah", "The Table Spread", 120],
  [6, "الأنعام", "Al-An'am", "The Cattle", 165],
  [7, "الأعراف", "Al-A'raf", "The Heights", 206],
  [8, "الأنفال", "Al-Anfal", "The Spoils of War", 75],
  [9, "التوبة", "At-Tawbah", "The Repentance", 129],
  [10, "يونس", "Yunus", "Jonah", 109],
  [11, "هود", "Hud", "Hud", 123],
  [12, "يوسف", "Yusuf", "Joseph", 111],
  [13, "الرعد", "Ar-Ra'd", "The Thunder", 43],
  [14, "إبراهيم", "Ibrahim", "Abraham", 52],
  [15, "الحجر", "Al-Hijr", "The Rocky Tract", 99],
  [16, "النحل", "An-Nahl", "The Bee", 128],
  [17, "الإسراء", "Al-Isra", "The Night Journey", 111],
  [18, "الكهف", "Al-Kahf", "The Cave", 110],
  [19, "مريم", "Maryam", "Mary", 98],
  [20, "طه", "Taha", "Ta-Ha", 135],
  [21, "الأنبياء", "Al-Anbiya", "The Prophets", 112],
  [22, "الحج", "Al-Hajj", "The Pilgrimage", 78],
  [23, "المؤمنون", "Al-Mu'minun", "The Believers", 118],
  [24, "النور", "An-Nur", "The Light", 64],
  [25, "الفرقان", "Al-Furqan", "The Criterion", 77],
  [26, "الشعراء", "Ash-Shu'ara", "The Poets", 227],
  [27, "النمل", "An-Naml", "The Ant", 93],
  [28, "القصص", "Al-Qasas", "The Stories", 88],
  [29, "العنكبوت", "Al-Ankabut", "The Spider", 69],
  [30, "الروم", "Ar-Rum", "The Romans", 60],
  [31, "لقمان", "Luqman", "Luqman", 34],
  [32, "السجدة", "As-Sajdah", "The Prostration", 30],
  [33, "الأحزاب", "Al-Ahzab", "The Combined Forces", 73],
  [34, "سبإ", "Saba", "Sheba", 54],
  [35, "فاطر", "Fatir", "Originator", 45],
  [36, "يس", "Ya-Sin", "Ya Sin", 83],
  [37, "الصافات", "As-Saffat", "Those Who Set The Ranks", 182],
  [38, "ص", "Sad", "The Letter Sad", 88],
  [39, "الزمر", "Az-Zumar", "The Troops", 75],
  [40, "غافر", "Ghafir", "The Forgiver", 85],
  [41, "فصلت", "Fussilat", "Explained In Detail", 54],
  [42, "الشورى", "Ash-Shura", "The Consultation", 53],
  [43, "الزخرف", "Az-Zukhruf", "The Ornaments Of Gold", 89],
  [44, "الدخان", "Ad-Dukhan", "The Smoke", 59],
  [45, "الجاثية", "Al-Jathiyah", "The Crouching", 37],
  [46, "الأحقاف", "Al-Ahqaf", "The Wind-Curved Sandhills", 35],
  [47, "محمد", "Muhammad", "Muhammad", 38],
  [48, "الفتح", "Al-Fath", "The Victory", 29],
  [49, "الحجرات", "Al-Hujurat", "The Rooms", 18],
  [50, "ق", "Qaf", "The Letter Qaf", 45],
  [51, "الذاريات", "Adh-Dhariyat", "The Winnowing Winds", 60],
  [52, "الطور", "At-Tur", "The Mount", 49],
  [53, "النجم", "An-Najm", "The Star", 62],
  [54, "القمر", "Al-Qamar", "The Moon", 55],
  [55, "الرحمن", "Ar-Rahman", "The Beneficent", 78],
  [56, "الواقعة", "Al-Waqi'ah", "The Inevitable", 96],
  [57, "الحديد", "Al-Hadid", "The Iron", 29],
  [58, "المجادلة", "Al-Mujadila", "The Pleading Woman", 22],
  [59, "الحشر", "Al-Hashr", "The Exile", 24],
  [60, "الممتحنة", "Al-Mumtahanah", "She That Is To Be Examined", 13],
  [61, "الصف", "As-Saff", "The Ranks", 14],
  [62, "الجمعة", "Al-Jumu'ah", "The Congregation, Friday", 11],
  [63, "المنافقون", "Al-Munafiqun", "The Hypocrites", 11],
  [64, "التغابن", "At-Taghabun", "The Mutual Disillusion", 18],
  [65, "الطلاق", "At-Talaq", "The Divorce", 12],
  [66, "التحريم", "At-Tahrim", "The Prohibition", 12],
  [67, "الملك", "Al-Mulk", "The Sovereignty", 30],
  [68, "القلم", "Al-Qalam", "The Pen", 52],
  [69, "الحاقة", "Al-Haqqah", "The Reality", 52],
  [70, "المعارج", "Al-Ma'arij", "The Ascending Stairways", 44],
  [71, "نوح", "Nuh", "Noah", 28],
  [72, "الجن", "Al-Jinn", "The Jinn", 28],
  [73, "المزمل", "Al-Muzzammil", "The Enshrouded One", 20],
  [74, "المدثر", "Al-Muddaththir", "The Cloaked One", 56],
  [75, "القيامة", "Al-Qiyamah", "The Resurrection", 40],
  [76, "الإنسان", "Al-Insan", "The Man", 31],
  [77, "المرسلات", "Al-Mursalat", "The Emissaries", 50],
  [78, "النبأ", "An-Naba", "The Tidings", 40],
  [79, "النازعات", "An-Nazi'at", "Those Who Drag Forth", 46],
  [80, "عبس", "Abasa", "He Frowned", 42],
  [81, "التكوير", "At-Takwir", "The Overthrowing", 29],
  [82, "الإنفطار", "Al-Infitar", "The Cleaving", 19],
  [83, "المطففين", "Al-Mutaffifin", "The Defrauding", 36],
  [84, "الإنشقاق", "Al-Inshiqaq", "The Sundering", 25],
  [85, "البروج", "Al-Buruj", "The Mansions Of The Stars", 22],
  [86, "الطارق", "At-Tariq", "The Nightcomer", 17],
  [87, "الأعلى", "Al-A'la", "The Most High", 19],
  [88, "الغاشية", "Al-Ghashiyah", "The Overwhelming", 26],
  [89, "الفجر", "Al-Fajr", "The Dawn", 30],
  [90, "البلد", "Al-Balad", "The City", 20],
  [91, "الشمس", "Ash-Shams", "The Sun", 15],
  [92, "الليل", "Al-Layl", "The Night", 21],
  [93, "الضحى", "Ad-Duha", "The Morning Hours", 11],
  [94, "الشرح", "Ash-Sharh", "The Relief", 8],
  [95, "التين", "At-Tin", "The Fig", 8],
  [96, "العلق", "Al-Alaq", "The Clot", 19],
  [97, "القدر", "Al-Qadr", "The Power", 5],
  [98, "البينة", "Al-Bayyinah", "The Clear Proof", 8],
  [99, "الزلزلة", "Az-Zalzalah", "The Earthquake", 8],
  [100, "العاديات", "Al-Adiyat", "The Courser", 11],
  [101, "القارعة", "Al-Qari'ah", "The Calamity", 11],
  [102, "التكاثر", "At-Takathur", "The Rivalry In World Increase", 8],
  [103, "العصر", "Al-Asr", "The Declining Day", 3],
  [104, "الهمزة", "Al-Humazah", "The Traducer", 9],
  [105, "الفيل", "Al-Fil", "The Elephant", 5],
  [106, "قريش", "Quraysh", "Quraysh", 4],
  [107, "الماعون", "Al-Ma'un", "The Small Kindnesses", 7],
  [108, "الكوثر", "Al-Kawthar", "The Abundance", 3],
  [109, "الكافرون", "Al-Kafirun", "The Disbelievers", 6],
  [110, "النصر", "An-Nasr", "The Divine Support", 3],
  [111, "المسد", "Al-Masad", "The Palm Fibre", 5],
  [112, "الإخلاص", "Al-Ikhlas", "The Sincerity", 4],
  [113, "الفلق", "Al-Falaq", "The Daybreak", 5],
  [114, "الناس", "An-Nas", "Mankind", 6],
];

export const SURAHS: readonly Surah[] = RAW.map(
  ([number, name, transliteration, english, ayahCount]) => ({
    number,
    name,
    transliteration,
    english,
    ayahCount,
  })
);

/**
 * The total ayah count, Hafs/Kufan: 6236.
 *
 * Confirmed by the academy (1 Oct 2026) as the count of the standard mushaf and
 * the basis of every existing hifz record. Derived from the dataset, not typed
 * again — and asserted to equal 6236 below, so the two can never disagree.
 */
export const TOTAL_AYAT = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);
export const TOTAL_SURAHS = SURAHS.length;

/**
 * Where each of the 30 juz begins, as [juz, surah, ayah] (Hafs/Kufan, Tanzil).
 * A juz runs from its start up to (but not including) the next juz's start;
 * juz 30 runs to the end of an-Nas.
 */
const JUZ_STARTS: ReadonlyArray<readonly [number, number, number]> = [
  [1, 1, 1], [2, 2, 142], [3, 2, 253], [4, 3, 92], [5, 4, 24],
  [6, 4, 148], [7, 5, 82], [8, 6, 111], [9, 7, 88], [10, 8, 41],
  [11, 9, 93], [12, 11, 6], [13, 12, 53], [14, 15, 1], [15, 17, 1],
  [16, 18, 75], [17, 21, 1], [18, 23, 1], [19, 25, 21], [20, 27, 56],
  [21, 29, 46], [22, 33, 31], [23, 36, 28], [24, 39, 32], [25, 41, 47],
  [26, 46, 1], [27, 51, 31], [28, 58, 1], [29, 67, 1], [30, 78, 1],
];

export interface JuzStart {
  juz: number;
  surah: number;
  ayah: number;
}

export const JUZ: readonly JuzStart[] = JUZ_STARTS.map(([juz, surah, ayah]) => ({
  juz,
  surah,
  ayah,
}));

export const TOTAL_JUZ = JUZ.length;

/** A flat running index for an (surah, ayah) pair: 1..6236. */
export function globalAyahIndex(surah: number, ayah: number): number {
  let idx = 0;
  for (const s of SURAHS) {
    if (s.number === surah) return idx + ayah;
    idx += s.ayahCount;
  }
  throw new Error(`Unknown surah ${surah}`);
}

/** The juz a given (surah, ayah) falls in, 1..30. */
export function juzForAyah(surah: number, ayah: number): number {
  const target = globalAyahIndex(surah, ayah);
  let result = 1;
  for (const j of JUZ) {
    if (globalAyahIndex(j.surah, j.ayah) <= target) result = j.juz;
    else break;
  }
  return result;
}

/** Inclusive global-index range [start, end] for a juz. */
export function juzAyahRange(juz: number): { start: number; end: number } {
  const j = JUZ.find((x) => x.juz === juz);
  if (!j) throw new Error(`Unknown juz ${juz}`);
  const start = globalAyahIndex(j.surah, j.ayah);
  const next = JUZ.find((x) => x.juz === juz + 1);
  const end = next ? globalAyahIndex(next.surah, next.ayah) - 1 : TOTAL_AYAT;
  return { start, end };
}

/** Total ayaat in a juz. */
export function juzAyahCount(juz: number): number {
  const { start, end } = juzAyahRange(juz);
  return end - start + 1;
}

/**
 * Proves the dataset against itself. Throws on any violation. Called at module
 * load so inconsistent Quran data cannot be imported; also exported so a test
 * or script can run it explicitly and print the results.
 */
export function assertQuranMetadata(): void {
  if (TOTAL_SURAHS !== 114) {
    throw new Error(`Quran metadata: expected 114 surahs, got ${TOTAL_SURAHS}`);
  }
  // Surah numbers must be 1..114 with no gaps.
  SURAHS.forEach((s, i) => {
    if (s.number !== i + 1) throw new Error(`Quran metadata: surah at index ${i} is numbered ${s.number}`);
    if (!s.ayahCount || s.ayahCount < 1) throw new Error(`Quran metadata: surah ${s.number} has no ayah count`);
  });

  if (TOTAL_AYAT !== 6236) {
    throw new Error(`Quran metadata: ayah counts sum to ${TOTAL_AYAT}, expected 6236`);
  }

  if (TOTAL_JUZ !== 30) {
    throw new Error(`Quran metadata: expected 30 juz, got ${TOTAL_JUZ}`);
  }

  // Juz boundaries: strictly increasing, start at 1:1, continuous to the last
  // ayah of an-Nas — no gap, no overlap.
  let prev = 0;
  for (const j of JUZ) {
    const idx = globalAyahIndex(j.surah, j.ayah);
    if (j.juz === 1 && idx !== 1) throw new Error("Quran metadata: juz 1 does not start at 1:1");
    if (idx <= prev) throw new Error(`Quran metadata: juz ${j.juz} boundary (${idx}) not after the previous (${prev})`);
    prev = idx;
  }
  // Coverage: the juz ranges must tile 1..6236 exactly, each ayah in one juz.
  let covered = 0;
  for (let j = 1; j <= TOTAL_JUZ; j++) {
    const { start, end } = juzAyahRange(j);
    if (start !== covered + 1) {
      throw new Error(`Quran metadata: juz ${j} starts at ${start}, expected ${covered + 1} (gap or overlap)`);
    }
    covered = end;
  }
  if (covered !== TOTAL_AYAT) {
    throw new Error(`Quran metadata: juz coverage ends at ${covered}, expected ${TOTAL_AYAT}`);
  }
}

// Fail at import time rather than render a page from inconsistent Quran data.
assertQuranMetadata();
