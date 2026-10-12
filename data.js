/**
 * data.js
 * Data pembelajaran dan bank soalan bagi Kuiz Bahasa Arab Tahun 1 (Angka 1 - 10)
 * Aplikasi: Jom Belajar Angka Arab
 */

// Data Pembelajaran: Nota 10 Angka Arab
const ARABIC_NUMBERS_DATA = [
  {
    number: 1,
    arabicNumeral: '١',
    arabicWord: 'وَاحِدٌ',
    transliteration: 'Wāḥidun',
    meaning: 'Satu',
    objectName: 'Matahari',
    iconType: 'sun',
    colorTheme: '#f59e0b'
  },
  {
    number: 2,
    arabicNumeral: '٢',
    arabicWord: 'اِثْنَانِ',
    transliteration: 'Ithnāni',
    meaning: 'Dua',
    objectName: 'Pensel',
    iconType: 'pencil',
    colorTheme: '#3b82f6'
  },
  {
    number: 3,
    arabicNumeral: '٣',
    arabicWord: 'ثَلَاثَةٌ',
    transliteration: 'Thalāthatun',
    meaning: 'Tiga',
    objectName: 'Epal',
    iconType: 'apple',
    colorTheme: '#ef4444'
  },
  {
    number: 4,
    arabicNumeral: '٤',
    arabicWord: 'أَرْبَعَةٌ',
    transliteration: 'Arba‘atun',
    meaning: 'Empat',
    objectName: 'Bintang',
    iconType: 'star',
    colorTheme: '#eab308'
  },
  {
    number: 5,
    arabicNumeral: '٥',
    arabicWord: 'خَمْسَةٌ',
    transliteration: 'Khamsatun',
    meaning: 'Lima',
    objectName: 'Belon',
    iconType: 'balloon',
    colorTheme: '#ec4899'
  },
  {
    number: 6,
    arabicNumeral: '٦',
    arabicWord: 'سِتَّةٌ',
    transliteration: 'Sittatun',
    meaning: 'Enam',
    objectName: 'Buku',
    iconType: 'book',
    colorTheme: '#8b5cf6'
  },
  {
    number: 7,
    arabicNumeral: '٧',
    arabicWord: 'سَبْعَةٌ',
    transliteration: 'Sab‘atun',
    meaning: 'Tujuh',
    objectName: 'Bunga',
    iconType: 'flower',
    colorTheme: '#10b981'
  },
  {
    number: 8,
    arabicNumeral: '٨',
    arabicWord: 'ثَمَانِيَةٌ',
    transliteration: 'Thamāniyatun',
    meaning: 'Lapan',
    objectName: 'Cawan',
    iconType: 'cup',
    colorTheme: '#06b6d4'
  },
  {
    number: 9,
    arabicNumeral: '٩',
    arabicWord: 'تِسْعَةٌ',
    transliteration: 'Tis‘atun',
    meaning: 'Sembilan',
    objectName: 'Bola',
    iconType: 'ball',
    colorTheme: '#f97316'
  },
  {
    number: 10,
    arabicNumeral: '١٠',
    arabicWord: 'عَشَرَةٌ',
    transliteration: '‘Asharatun',
    meaning: 'Sepuluh',
    objectName: 'Segi Tiga',
    iconType: 'triangle',
    colorTheme: '#14b8a6'
  }
];

// Definisi Mod Permainan
const MODES_INFO = {
  mod1: {
    id: 'mod1',
    title: 'MOD 1 — NOTA PEMBELAJARAN',
    subtitle: 'Kenali angka Arab 1 hingga 10',
    description: 'Terokai 10 kad pembelajaran interaktif dengan angka, perkataan, dan sebutan.',
    badgeIcon: '📖',
    isQuiz: false
  },
  mod2: {
    id: 'mod2',
    title: 'MOD 2 — KENALI ANGKA ARAB',
    subtitle: 'Padankan angka biasa dengan angka Arab',
    description: 'Pilih padanan angka Arab yang betul bagi nombor 1 hingga 10.',
    badgeIcon: '🔢',
    isQuiz: true
  },
  mod3: {
    id: 'mod3',
    title: 'MOD 3 — KIRA DAN PILIH ANGKA ARAB',
    subtitle: 'Kira objek dan pilih angka Arab yang betul',
    description: 'Kira bilangan objek comel dan pilih simbol angka Arab yang tepat.',
    badgeIcon: '🍎',
    isQuiz: true
  },
  mod4: {
    id: 'mod4',
    title: 'MOD 4 — PILIH PERKATAAN BAGI ANGKA ARAB',
    subtitle: 'Kenali perkataan Bahasa Arab bagi setiap angka',
    description: 'Lihat angka Arab dan pilih perkataan Bahasa Arab yang betul.',
    badgeIcon: '✨',
    isQuiz: true
  }
};

/**
 * Pustaka Ikon Vektor SVG untuk Objek Mengira Mod 3
 * Direka khas supaya jelas, kemas dan berskala untuk murid Tahun 1 tanpa bergantung kepada imej luaran.
 */
const SVG_ICONS = {
  sun: `<svg viewBox="0 0 48 48" class="quiz-item-icon" aria-label="Matahari" role="img">
    <circle cx="24" cy="24" r="11" fill="#f59e0b"/>
    <g stroke="#d97706" stroke-width="3" stroke-linecap="round">
      <line x1="24" y1="4" x2="24" y2="9"/>
      <line x1="24" y1="39" x2="24" y2="44"/>
      <line x1="4" y1="24" x2="9" y2="24"/>
      <line x1="39" y1="24" x2="44" y2="24"/>
      <line x1="10" y1="10" x2="14" y2="14"/>
      <line x1="34" y1="34" x2="38" y2="38"/>
      <line x1="10" y1="38" x2="14" y2="34"/>
      <line x1="34" y1="14" x2="38" y2="10"/>
    </g>
    <circle cx="20" cy="22" r="2" fill="#78350f"/>
    <circle cx="28" cy="22" r="2" fill="#78350f"/>
    <path d="M19 26 Q24 31 29 26" stroke="#78350f" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  pencil: `<svg viewBox="0 0 48 48" class="quiz-item-icon" aria-label="Pensel" role="img">
    <g transform="rotate(45 24 24)">
      <rect x="20" y="10" width="8" height="24" rx="2" fill="#3b82f6"/>
      <polygon points="20,10 28,10 24,3" fill="#fbbf24"/>
      <polygon points="23,5 25,5 24,3" fill="#1e293b"/>
      <rect x="20" y="34" width="8" height="4" fill="#cbd5e1"/>
      <rect x="20" y="38" width="8" height="4" rx="2" fill="#f43f5e"/>
    </g>
  </svg>`,

  apple: `<svg viewBox="0 0 48 48" class="quiz-item-icon" aria-label="Epal" role="img">
    <path d="M24 16 C20 10 12 12 12 22 C12 34 20 42 24 42 C28 42 36 34 36 22 C36 12 28 10 24 16 Z" fill="#ef4444"/>
    <path d="M24 16 C24 11 26 7 30 6" stroke="#15803d" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="30" cy="8" rx="4" ry="2" fill="#22c55e" transform="rotate(-20 30 8)"/>
    <circle cx="18" cy="22" r="2" fill="#fee2e2" opacity="0.6"/>
  </svg>`,

  star: `<svg viewBox="0 0 48 48" class="quiz-item-icon" aria-label="Bintang" role="img">
    <polygon points="24,4 30,17 44,18 33,28 36,42 24,35 12,42 15,28 4,18 18,17" fill="#eab308" stroke="#ca8a04" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="20" cy="22" r="1.5" fill="#713f12"/>
    <circle cx="28" cy="22" r="1.5" fill="#713f12"/>
    <path d="M21 26 Q24 29 27 26" stroke="#713f12" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </svg>`,

  balloon: `<svg viewBox="0 0 48 48" class="quiz-item-icon" aria-label="Belon" role="img">
    <ellipse cx="24" cy="20" rx="14" ry="17" fill="#ec4899"/>
    <polygon points="22,37 26,37 24,35" fill="#db2777"/>
    <path d="M24 37 Q22 41 25 45" stroke="#94a3b8" stroke-width="2" fill="none"/>
    <ellipse cx="19" cy="15" rx="3" ry="6" fill="#fdf2f8" opacity="0.6" transform="rotate(-25 19 15)"/>
  </svg>`,

  book: `<svg viewBox="0 0 48 48" class="quiz-item-icon" aria-label="Buku" role="img">
    <rect x="8" y="10" width="32" height="28" rx="3" fill="#8b5cf6"/>
    <path d="M24 10 L24 38" stroke="#6d28d9" stroke-width="2"/>
    <rect x="12" y="14" width="9" height="3" rx="1" fill="#ede9fe"/>
    <rect x="12" y="20" width="9" height="2" rx="1" fill="#ede9fe"/>
    <rect x="27" y="14" width="9" height="3" rx="1" fill="#ede9fe"/>
    <rect x="27" y="20" width="9" height="2" rx="1" fill="#ede9fe"/>
    <rect x="6" y="8" width="5" height="32" rx="2" fill="#7c3aed"/>
  </svg>`,

  flower: `<svg viewBox="0 0 48 48" class="quiz-item-icon" aria-label="Bunga" role="img">
    <circle cx="24" cy="15" r="7" fill="#f43f5e"/>
    <circle cx="33" cy="24" r="7" fill="#f43f5e"/>
    <circle cx="24" cy="33" r="7" fill="#f43f5e"/>
    <circle cx="15" cy="24" r="7" fill="#f43f5e"/>
    <circle cx="24" cy="24" r="7" fill="#fbbf24"/>
    <circle cx="24" cy="24" r="4" fill="#f59e0b"/>
  </svg>`,

  cup: `<svg viewBox="0 0 48 48" class="quiz-item-icon" aria-label="Cawan" role="img">
    <path d="M12 14 L14 36 C14 39 18 41 24 41 C30 41 34 39 34 36 L36 14 Z" fill="#06b6d4"/>
    <path d="M34 18 C39 18 41 24 39 30 C37 34 34 34 33 34" stroke="#0891b2" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="24" cy="14" rx="12" ry="3" fill="#22d3ee"/>
    <path d="M18 9 Q19 5 21 8" stroke="#cbd5e1" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M24 8 Q25 4 27 7" stroke="#cbd5e1" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,

  ball: `<svg viewBox="0 0 48 48" class="quiz-item-icon" aria-label="Bola" role="img">
    <circle cx="24" cy="24" r="18" fill="#f97316"/>
    <circle cx="24" cy="24" r="18" fill="none" stroke="#c2410c" stroke-width="2"/>
    <path d="M6 24 C14 18 34 18 42 24" stroke="#ffedd5" stroke-width="3" fill="none"/>
    <path d="M24 6 C18 14 18 34 24 42" stroke="#ffedd5" stroke-width="3" fill="none"/>
    <circle cx="24" cy="24" r="6" fill="#ea580c"/>
  </svg>`,

  triangle: `<svg viewBox="0 0 48 48" class="quiz-item-icon" aria-label="Segi Tiga" role="img">
    <polygon points="24,6 42,40 6,40" fill="#14b8a6" stroke="#0f766e" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="24" cy="26" r="3" fill="#ccfbf1"/>
  </svg>`
};

/**
 * Menghasilkan soalan bagi Mod 2 (Kenali Angka Arab)
 * Soalan memaparkan nombor biasa 1..10, murid memilih angka Arab (١..١٠).
 */
function generateMod2Questions() {
  return ARABIC_NUMBERS_DATA.map((item) => {
    // Cari 3 pilihan salah daripada angka lain
    const otherItems = ARABIC_NUMBERS_DATA.filter((n) => n.number !== item.number);
    const shuffledOthers = shuffleArray([...otherItems]).slice(0, 3);
    
    const choices = shuffleArray([
      { text: item.arabicNumeral, isCorrect: true, isArabic: true },
      ...shuffledOthers.map((o) => ({ text: o.arabicNumeral, isCorrect: false, isArabic: true }))
    ]);

    return {
      modId: 'mod2',
      targetNumber: item.number,
      questionText: `Pilih angka Arab bagi nombor ${item.number}.`,
      displayType: 'digit',
      displayValue: `${item.number}`,
      choices: choices,
      correctAnswer: item.arabicNumeral,
      explanation: `Nombor ${item.number} ditulis sebagai angka Arab ${item.arabicNumeral} (${item.arabicWord} / ${item.meaning}).`
    };
  });
}

/**
 * Menghasilkan soalan bagi Mod 3 (Kira dan Pilih Angka Arab)
 * Soalan memaparkan objek sebanyak 1..10, murid mengira dan memilih angka Arab.
 */
function generateMod3Questions() {
  return ARABIC_NUMBERS_DATA.map((item) => {
    const otherItems = ARABIC_NUMBERS_DATA.filter((n) => n.number !== item.number);
    const shuffledOthers = shuffleArray([...otherItems]).slice(0, 3);

    const choices = shuffleArray([
      { text: item.arabicNumeral, isCorrect: true, isArabic: true },
      ...shuffledOthers.map((o) => ({ text: o.arabicNumeral, isCorrect: false, isArabic: true }))
    ]);

    return {
      modId: 'mod3',
      targetNumber: item.number,
      questionText: `Berapakah bilangan ${item.objectName.toLowerCase()} di bawah?`,
      displayType: 'objects',
      count: item.number,
      iconType: item.iconType,
      objectName: item.objectName,
      choices: choices,
      correctAnswer: item.arabicNumeral,
      explanation: `Terdapat ${item.number} ${item.objectName.toLowerCase()}. Angka Arabnya ialah ${item.arabicNumeral} (${item.arabicWord}).`
    };
  });
}

/**
 * Menghasilkan soalan bagi Mod 4 (Pilih Perkataan bagi Angka Arab)
 * Soalan memaparkan angka Arab (١..١٠), murid memilih perkataan Arab dengan baris lengkap.
 */
function generateMod4Questions() {
  return ARABIC_NUMBERS_DATA.map((item) => {
    const otherItems = ARABIC_NUMBERS_DATA.filter((n) => n.number !== item.number);
    const shuffledOthers = shuffleArray([...otherItems]).slice(0, 3);

    const choices = shuffleArray([
      { text: item.arabicWord, isCorrect: true, isArabic: true },
      ...shuffledOthers.map((o) => ({ text: o.arabicWord, isCorrect: false, isArabic: true }))
    ]);

    return {
      modId: 'mod4',
      targetNumber: item.number,
      questionText: `Apakah perkataan Bahasa Arab bagi angka berikut?`,
      displayType: 'arabicNumeral',
      displayValue: item.arabicNumeral,
      choices: choices,
      correctAnswer: item.arabicWord,
      explanation: `Angka ${item.arabicNumeral} ialah ${item.arabicWord} (${item.transliteration} = ${item.meaning}).`
    };
  });
}

/**
 * Pembantu Acak Susunan Array (Fisher-Yates Shuffle)
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
