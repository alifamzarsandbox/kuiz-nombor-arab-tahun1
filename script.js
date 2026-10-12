/**
 * script.js
 * Logik Interaktif, Routing Dalaman, Pemarkahan, Audio Sintesis, dan Integrasi Google Apps Script
 * Aplikasi: Jom Belajar Angka Arab
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. STATE PENGURUSAN SESI APLIKASI & PAPAN KEHADIRAN MURID
     ========================================================================== */
  const DEFAULT_ATTENDANCE_LIST = [
    { namaMurid: "Ustaz Alif", kelas: "Guru Pembimbing" }
  ];

  const DUMMY_NAMES_TO_IGNORE = [
    "ahmad danish",
    "nur sarah",
    "muhammad haziq",
    "siti aisyah",
    "adam harith"
  ];

  const AppState = {
    // Maklumat Murid Semasa
    student: {
      name: '',
      studentClass: ''
    },

    // Status Nota & Mod
    notesReadInSession: false,
    modeStatus: {
      mod1: { completed: false, score: null },
      mod2: { completed: false, score: null },
      mod3: { completed: false, score: null },
      mod4: { completed: false, score: null }
    },

    // Sesi Kuiz Semasa
    quiz: {
      modId: null,
      modeTitle: '',
      questions: [],
      currentIndex: 0,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      isAnswered: false,
      attemptId: '',
      saveInProgress: false,
      isSavedSuccessfully: false
    },

    // Sesi Kad Nota Semasa
    notes: {
      currentIndex: 0
    },

    // Rekod Tempatan (Local Session / Storage)
    localRecords: [],

    // Tetapan Audio
    soundEnabled: APP_CONFIG.enableSoundDefault
  };

  /* ==========================================================================
     2. AUDIO SINTESIS (WEB AUDIO API)
     Sintesis nada audio tulen tanpa memerlukan fail MP3/WAV luaran.
     ========================================================================== */
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, delay = 0, gainLevel = 0.15) {
    if (!AppState.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      const startTime = ctx.currentTime + delay;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(gainLevel, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      // Audio tidak disokong atau disekat oleh pelayar
    }
  }

  // Bunyi jawapan betul (chime dua nada riang)
  function playCorrectSound() {
    playTone(523.25, 'triangle', 0.18, 0, 0.2); // C5
    playTone(659.25, 'triangle', 0.28, 0.12, 0.25); // E5
  }

  // Bunyi jawapan salah (nada rendah lembut)
  function playWrongSound() {
    playTone(261.63, 'sine', 0.15, 0, 0.15); // C4
    playTone(196.00, 'sine', 0.35, 0.12, 0.2); // G3
  }

  // Bunyi klik butang
  function playClickSound() {
    playTone(440, 'sine', 0.08, 0, 0.1);
  }

  // Bunyi kejayaan tamat kuiz (arpeggio kemenangan)
  function playCheerSound() {
    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      playTone(freq, 'triangle', 0.3, i * 0.1, 0.2);
    });
  }

  /* ==========================================================================
     3. PEMBANTU DOM & PENGENDALIAN KESELAMATAN (XSS SANITIZATION)
     ========================================================================== */
  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  // Sanitasi rentetan teks pengguna bagi mengelakkan XSS & selamat daripada ralat jenis nombor
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    const text = String(str);
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Umumkan mesej untuk pembaca skrin (Accessibility)
  function announceToScreenReader(message) {
    const announcer = $('#aria-announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  }

  /* ==========================================================================
     4. SISTEM NAVIGASI SKRIN (SINGLE PAGE APP ROUTING)
     ========================================================================== */
  function showScreen(screenId) {
    const screens = $$('.screen');
    screens.forEach(screen => {
      screen.classList.remove('screen-active');
    });

    const targetScreen = $(`#screen-${screenId}`);
    if (targetScreen) {
      targetScreen.classList.add('screen-active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Kemas kini maklumat pengguna pada skrin yang berkaitan
    updateUserGreetings();
  }

  function updateUserGreetings() {
    const name = escapeHTML(AppState.student.name) || '-';
    const sClass = escapeHTML(AppState.student.studentClass) || '-';

    const greetingText = `Murid: ${name} | Kelas: ${sClass}`;

    const elInstructionGreeting = $('#instruction-user-greeting');
    if (elInstructionGreeting) elInstructionGreeting.textContent = greetingText;

    const elModesGreeting = $('#modes-user-greeting');
    if (elModesGreeting) elModesGreeting.textContent = greetingText;

    const elQuizStudent = $('#quiz-student-display');
    if (elQuizStudent) elQuizStudent.textContent = `👤 Murid: ${name}`;

    const elQuizClass = $('#quiz-class-display');
    if (elQuizClass) elQuizClass.textContent = `Kelas: ${sClass}`;
  }

  /* ==========================================================================
     5. INISIALISASI BORANG MAKLUMAT MURID
     ========================================================================== */
  function initStudentInfoForm() {
    const inputClass = $('#input-student-class');
    const datalistClass = $('#class-suggestions');

    // Masukkan senarai cadangan kelas daripada config.js jika ada
    if (datalistClass && typeof ALLOWED_CLASSES !== 'undefined') {
      datalistClass.innerHTML = '';
      ALLOWED_CLASSES.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        datalistClass.appendChild(option);
      });
    }

    const form = $('#form-student-info');
    const inputName = $('#input-student-name');
    const errorBox = $('#student-info-error');
    const errorText = $('#student-info-error-text');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      playClickSound();

      const rawName = inputName.value.trim();
      const rawClass = inputClass ? inputClass.value.trim() : '';

      // Validasi Nama Murid
      if (!rawName) {
        showFormError('Sila masukkan nama murid.');
        inputName.focus();
        return;
      }

      if (rawName.length > 60) {
        showFormError('Nama murid tidak boleh melebihi 60 aksara.');
        inputName.focus();
        return;
      }

      // Validasi Kelas (boleh ditulis bebas oleh murid/sekolah mana-mana)
      if (!rawClass) {
        showFormError('Sila tulis nama kelas murid.');
        if (inputClass) inputClass.focus();
        return;
      }

      if (rawClass.length > 40) {
        showFormError('Nama kelas tidak boleh melebihi 40 aksara.');
        if (inputClass) inputClass.focus();
        return;
      }

      // Maklumat sah
      hideFormError();
      AppState.student.name = rawName;
      AppState.student.studentClass = rawClass;

      // Rekodkan kehadiran murid secara automatik serta-merta ke dalam papan kehadiran
      recordAttendance(rawName, rawClass);

      // Bawa murid ke skrin arahan (bukan terus memulakan kuiz)
      showScreen('instructions');
      announceToScreenReader(`Selamat datang ${rawName}. Sila baca arahan sebelum bermula.`);
    });

    function showFormError(msg) {
      errorText.textContent = msg;
      errorBox.classList.remove('is-hidden');
    }

    function hideFormError() {
      errorBox.classList.add('is-hidden');
    }
  }

  /* ==========================================================================
     6. MOD 1: NOTA PEMBELAJARAN (10 KAD INTERAKTIF)
     ========================================================================== */
  function initNotesMode() {
    const dotsContainer = $('#notes-dots-container');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      ARABIC_NUMBERS_DATA.forEach((item, index) => {
        const dot = document.createElement('span');
        dot.className = `note-dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('aria-label', `Lihat kad nombor ${item.number}`);
        dot.addEventListener('click', () => {
          playClickSound();
          AppState.notes.currentIndex = index;
          renderNoteCard();
        });
        dot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            playClickSound();
            AppState.notes.currentIndex = index;
            renderNoteCard();
          }
        });
        dotsContainer.appendChild(dot);
      });
    }

    const btnPrev = $('#btn-note-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        playClickSound();
        if (AppState.notes.currentIndex > 0) {
          AppState.notes.currentIndex--;
          renderNoteCard();
        }
      });
    }

    const btnNext = $('#btn-note-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        playClickSound();
        if (AppState.notes.currentIndex < ARABIC_NUMBERS_DATA.length - 1) {
          AppState.notes.currentIndex++;
          renderNoteCard();
        }
      });
    }

    // Selesai membaca nota
    const btnFinish = $('#btn-finish-notes');
    if (btnFinish) {
      btnFinish.addEventListener('click', () => {
        playClickSound();
        markNotesAsRead();
        showScreen('modes-menu');
      });
    }

    const btnBackNotes = $('#btn-back-to-modes-from-notes');
    if (btnBackNotes) {
      btnBackNotes.addEventListener('click', () => {
        playClickSound();
        markNotesAsRead();
        showScreen('modes-menu');
      });
    }
  }

  function startNotesMode() {
    AppState.notes.currentIndex = 0;
    renderNoteCard();
    showScreen('notes');
  }

  function markNotesAsRead() {
    AppState.notesReadInSession = true;
    AppState.modeStatus.mod1.completed = true;
    updateModeBadges();
  }

  function renderNoteCard() {
    const idx = AppState.notes.currentIndex;
    const item = ARABIC_NUMBERS_DATA[idx];
    if (!item) return;

    // Kemas kini teks dan nombor
    $('#notes-card-counter').textContent = `Kad ${idx + 1} daripada 10`;
    $('#note-digit-val').textContent = item.number;
    $('#note-meaning-val').textContent = item.meaning;
    $('#note-arabic-numeral').textContent = item.arabicNumeral;
    $('#note-arabic-word').textContent = item.arabicWord;
    $('#note-transliteration').textContent = item.transliteration;

    // Kemas kini objek visual contoh
    const visualBox = $('#note-visual-objects');
    visualBox.innerHTML = '';
    const svgIconMarkup = SVG_ICONS[item.iconType] || '';
    for (let i = 0; i < item.number; i++) {
      visualBox.insertAdjacentHTML('beforeend', svgIconMarkup);
    }

    // Kawalan butang Sebelumnya / Seterusnya
    $('#btn-note-prev').disabled = (idx === 0);
    $('#btn-note-next').disabled = (idx === ARABIC_NUMBERS_DATA.length - 1);

    // Kemas kini titik penunjuk
    const dots = $$('.note-dot');
    dots.forEach((dot, dIdx) => {
      dot.classList.toggle('active', dIdx === idx);
    });

    announceToScreenReader(`Kad ${item.number}. Angka Arab ${item.arabicNumeral}, ${item.arabicWord}, maksudnya ${item.meaning}.`);
  }

  /* ==========================================================================
     7. SISTEM KUIZ (MOD 2, MOD 3, MOD 4)
     ========================================================================== */
  function startQuizMode(modId) {
    if (!MODES_INFO[modId] || !MODES_INFO[modId].isQuiz) return;

    let generatedQuestions = [];
    if (modId === 'mod2') {
      generatedQuestions = generateMod2Questions();
    } else if (modId === 'mod3') {
      generatedQuestions = generateMod3Questions();
    } else if (modId === 'mod4') {
      generatedQuestions = generateMod4Questions();
    }

    // Acak susunan soalan supaya setiap pusingan berbeza
    const shuffledQuestions = shuffleArray(generatedQuestions);

    // Tetapkan state kuiz
    AppState.quiz = {
      modId: modId,
      modeTitle: MODES_INFO[modId].title,
      questions: shuffledQuestions,
      currentIndex: 0,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      isAnswered: false,
      attemptId: generateAttemptId(),
      saveInProgress: false,
      isSavedSuccessfully: false
    };

    // Kemas kini tajuk mod pada skrin kuiz
    $('#quiz-mode-tag').textContent = MODES_INFO[modId].title;

    showScreen('quiz');
    renderQuizQuestion();
  }

  function generateAttemptId() {
    // attemptId unik bagi setiap percubaan
    const timestampPart = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `att_${timestampPart}_${randomPart}`;
  }

  function renderQuizQuestion() {
    const qState = AppState.quiz;
    const currentQ = qState.questions[qState.currentIndex];
    if (!currentQ) return;

    qState.isAnswered = false;

    // Kemas kini penunjuk kemajuan
    const questionNum = qState.currentIndex + 1;
    const totalQ = qState.questions.length;
    $('#quiz-question-counter').textContent = `Soalan ${questionNum} daripada ${totalQ}`;
    $('#quiz-score-preview').textContent = `Markah: ${qState.score} / 100`;

    const progressPercent = (questionNum / totalQ) * 100;
    const progressFill = $('#quiz-progress-bar-fill');
    progressFill.style.width = `${progressPercent}%`;
    $('#quiz-progress-bar-container').setAttribute('aria-valuenow', questionNum);

    // Kemas kini teks soalan
    $('#quiz-question-text').textContent = currentQ.questionText;

    // Kemas kini paparan stimulus soalan mengikut jenis
    const stimulusBox = $('#quiz-stimulus-display');
    stimulusBox.innerHTML = '';

    if (currentQ.displayType === 'digit') {
      // Mod 2: Nombor biasa besar
      stimulusBox.innerHTML = `<span class="stimulus-digit">${currentQ.displayValue}</span>`;
    } else if (currentQ.displayType === 'objects') {
      // Mod 3: Objek SVG mengikut bilangan tepat
      const svgMarkup = SVG_ICONS[currentQ.iconType] || '';
      let objectsHtml = `<div class="stimulus-objects-grid">`;
      for (let i = 0; i < currentQ.count; i++) {
        objectsHtml += svgMarkup;
      }
      objectsHtml += `</div>`;
      stimulusBox.innerHTML = objectsHtml;
    } else if (currentQ.displayType === 'arabicNumeral') {
      // Mod 4: Angka Arab besar
      stimulusBox.innerHTML = `<span class="stimulus-arabic" dir="rtl" lang="ar">${currentQ.displayValue}</span>`;
    }

    // Kemas kini 4 pilihan jawapan (diacak)
    const choicesGrid = $('#quiz-choices-grid');
    choicesGrid.innerHTML = '';

    currentQ.choices.forEach((choice, cIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-choice';

      // Gaya fon Arab jika pilihan ialah tulisan Arab
      if (qState.modId === 'mod2' || qState.modId === 'mod3') {
        btn.classList.add('choice-arabic-numeral');
      } else if (qState.modId === 'mod4') {
        btn.classList.add('choice-arabic-word');
      }

      if (choice.isArabic) {
        btn.setAttribute('dir', 'rtl');
        btn.setAttribute('lang', 'ar');
      }

      btn.textContent = choice.text;
      btn.setAttribute('aria-label', `Pilihan ${cIdx + 1}: ${choice.text}`);

      btn.addEventListener('click', () => {
        handleChoiceClick(choice, btn, currentQ);
      });

      choicesGrid.appendChild(btn);
    });

    // Sembunyikan kotak maklum balas dan butang soalan seterusnya
    const feedbackBox = $('#quiz-feedback-box');
    feedbackBox.className = 'quiz-feedback-box is-hidden';

    const btnNext = $('#btn-next-question');
    btnNext.classList.add('is-hidden');

    announceToScreenReader(`Soalan ${questionNum}: ${currentQ.questionText}`);
  }

  function handleChoiceClick(selectedChoice, selectedBtn, currentQ) {
    const qState = AppState.quiz;
    if (qState.isAnswered) return; // Kunci jika sudah dijawab

    qState.isAnswered = true;

    // Kunci semua butang pilihan
    const allChoiceBtns = $$('.btn-choice');
    allChoiceBtns.forEach(btn => {
      btn.disabled = true;
    });

    const isCorrect = selectedChoice.isCorrect;
    const feedbackBox = $('#quiz-feedback-box');
    const feedbackIcon = $('#feedback-icon');
    const feedbackHeading = $('#feedback-heading');
    const feedbackDesc = $('#feedback-desc');
    const btnNext = $('#btn-next-question');

    if (isCorrect) {
      // Jawapan BETUL
      qState.correctCount++;
      qState.score += APP_CONFIG.pointsPerQuestion;
      selectedBtn.classList.add('state-correct');

      feedbackBox.className = 'quiz-feedback-box feedback-correct';
      feedbackIcon.textContent = '🎉';
      feedbackHeading.textContent = 'Tahniah! Jawapan betul.';
      feedbackDesc.textContent = currentQ.explanation;

      playCorrectSound();
      announceToScreenReader(`Tahniah! Jawapan betul. ${currentQ.explanation}`);
    } else {
      // Jawapan SALAH
      qState.wrongCount++;
      selectedBtn.classList.add('state-wrong');

      // Tunjukkan butang jawapan yang betul untuk pembelajaran
      allChoiceBtns.forEach(btn => {
        if (btn.textContent.trim() === currentQ.correctAnswer.trim()) {
          btn.classList.add('state-correct');
        }
      });

      feedbackBox.className = 'quiz-feedback-box feedback-wrong';
      feedbackIcon.textContent = '💡';
      feedbackHeading.textContent = 'Cuba lagi pada soalan seterusnya.';
      feedbackDesc.textContent = currentQ.explanation;

      playWrongSound();
      announceToScreenReader(`Kurang tepat. ${currentQ.explanation}`);
    }

    // Kemas kini skor pratonton
    $('#quiz-score-preview').textContent = `Markah: ${qState.score} / 100`;

    // Paparkan kotak maklum balas dan butang seterusnya
    feedbackBox.classList.remove('is-hidden');
    btnNext.classList.remove('is-hidden');
    btnNext.focus();
  }

  function handleNextQuestion() {
    playClickSound();
    const qState = AppState.quiz;

    if (qState.currentIndex < qState.questions.length - 1) {
      qState.currentIndex++;
      renderQuizQuestion();
    } else {
      // Semua 10 soalan telah selesai
      finishQuiz();
    }
  }

  /* ==========================================================================
     8. SKRIN KEPUTUSAN & PENGHANTARAN REKOD
     ========================================================================== */
  function finishQuiz() {
    const qState = AppState.quiz;
    const student = AppState.student;

    // Simpan status mod telah selesai dalam sesi
    AppState.modeStatus[qState.modId] = {
      completed: true,
      score: qState.score
    };
    updateModeBadges();

    // Rekodkan ke dalam pangkalan data tempatan (local session / storage)
    const localAttempt = {
      namaMurid: student.name,
      kelas: student.studentClass,
      namaMod: qState.modeTitle,
      jumlahSoalan: qState.questions.length,
      jawapanBetul: qState.correctCount,
      markah: qState.score,
      peratus: qState.score,
      timestamp: new Date().toISOString()
    };
    AppState.localRecords.unshift(localAttempt);
    try {
      localStorage.setItem('jom_arab_local_records', JSON.stringify(AppState.localRecords.slice(0, 30)));
    } catch (e) {}

    // Paparkan maklumat pada skrin keputusan
    $('#result-heading').textContent = `Tahniah, ${escapeHTML(student.name)}!`;
    $('#result-subtitle').textContent = `Kelas: ${escapeHTML(student.studentClass)} | Mod: ${escapeHTML(qState.modeTitle)}`;

    $('#result-score-val').textContent = qState.score;
    $('#result-fraction-val').textContent = `${qState.correctCount} / ${qState.questions.length}`;
    $('#result-percent-val').textContent = `${qState.score}%`;
    $('#result-correct-count').textContent = qState.correctCount;
    $('#result-wrong-count').textContent = qState.wrongCount;

    // Mesej galakan berdasarkan tahap skor
    const encouragementBox = $('#result-encouragement-text');
    let trophyEmoji = '🏆';
    let messageText = '';

    if (qState.score === 100) {
      trophyEmoji = '🌟';
      messageText = 'Cemerlang! Semua jawapan betul!';
    } else if (qState.score >= 80) {
      trophyEmoji = '👏';
      messageText = 'Bagus! Teruskan usaha!';
    } else if (qState.score >= 50) {
      trophyEmoji = '👍';
      messageText = 'Bagus mencuba! Baca nota sekali lagi.';
    } else {
      trophyEmoji = '💪';
      messageText = 'Jangan putus asa. Mari belajar dan cuba lagi!';
    }

    $('#result-trophy-badge').textContent = trophyEmoji;
    encouragementBox.textContent = messageText;

    showScreen('result');
    playCheerSound();
    announceToScreenReader(`Kuiz selesai. Markah anda ${qState.score} per 100. ${messageText}`);

    // Hantar rekod ke Google Apps Script jika URL ada
    saveQuizResultToBackend();
  }

  /**
   * Penghantaran rekod ke backend Google Apps Script.
   * Jika belum connect, kekal tersembunyi tanpa sebarang mesej ralat atau luar talian.
   */
  /**
   * Menyimpan rekod keputusan kuiz ke Google Sheets (Backend Google Apps Script)
   * secara senyap di latar belakang tanpa memaparkan sebarang mesej teknikal kepada murid.
   */
  async function saveQuizResultToBackend() {
    const qState = AppState.quiz;
    const student = AppState.student;

    // Jika URL API belum dikonfigurasi atau sedang menghantar, abaikan
    if (!API_URL || API_URL.trim() === '' || API_URL.includes('PASTE_YOUR_DEPLOYED')) {
      return;
    }

    if (qState.saveInProgress) return;
    qState.saveInProgress = true;

    // Sediakan data muatan (payload)
    const payload = {
      action: 'saveResult',
      attemptId: String(qState.attemptId || ''),
      namaMurid: String(student.name || '').trim(),
      kelas: String(student.studentClass || '').trim(),
      modId: qState.modId,
      namaMod: qState.modeTitle,
      jumlahSoalan: qState.questions.length,
      jawapanBetul: qState.correctCount,
      jawapanSalah: qState.wrongCount,
      markah: qState.score,
      peratus: qState.score
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.fetchTimeoutMs);

      // Penghantaran POST serasi dengan Google Apps Script Web App
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        if (result && result.success) {
          qState.isSavedSuccessfully = true;
        }
      }
    } catch (err) {
      console.warn('Penyimpanan latar belakang Google Sheets gagal:', err);
      qState.isSavedSuccessfully = false;
    } finally {
      qState.saveInProgress = false;
    }
  }

  /**
   * Merekodkan kehadiran murid secara automatik apabila nama dan kelas diisi.
   * Kebal terhadap sebarang format nombor (cth: murid masukkan "1" pada kelas).
   */
  function recordAttendance(name, className) {
    if (name === null || name === undefined || className === null || className === undefined) return;
    const strName = String(name).trim();
    const strClass = String(className).trim();
    if (!strName || !strClass) return;

    let saved = [];
    try {
      const raw = localStorage.getItem('jom_arab_attendance');
      if (raw) saved = JSON.parse(raw);
      if (!Array.isArray(saved)) saved = [];
    } catch (e) {
      saved = [];
    }

    // Tapis nama dummy dan rekod lama murid yang sama
    saved = saved.filter(item => {
      if (!item || !item.namaMurid) return false;
      const itemN = String(item.namaMurid || '').trim().toLowerCase();
      if (DUMMY_NAMES_TO_IGNORE.includes(itemN)) return false;
      const itemC = String(item.kelas !== undefined && item.kelas !== null ? item.kelas : '').trim().toLowerCase();
      return !(itemN === strName.toLowerCase() && itemC === strClass.toLowerCase());
    });

    // Masukkan rekod baharu murid (jika bukan Ustaz Alif)
    if (strName.toLowerCase() !== 'ustaz alif') {
      saved.unshift({
        namaMurid: strName,
        kelas: strClass,
        timestamp: new Date().toISOString()
      });
    }

    // Simpan sehingga 30 rekod kehadiran terkini
    try {
      localStorage.setItem('jom_arab_attendance', JSON.stringify(saved.slice(0, 30)));
    } catch (e) {}
  }

  /**
   * Mengambil senarai kehadiran murid tempatan (hanya Ustaz Alif dan murid sebenar sesi ini).
   */
  function getAttendanceList() {
    let saved = [];
    try {
      const raw = localStorage.getItem('jom_arab_attendance');
      if (raw) saved = JSON.parse(raw);
      if (!Array.isArray(saved)) saved = [];
    } catch (e) {
      saved = [];
    }

    // Tapis keluar sebarang nama dummy lama daripada localStorage pelayar
    saved = saved.filter(item => {
      if (!item || !item.namaMurid) return false;
      const n = String(item.namaMurid).trim().toLowerCase();
      return !DUMMY_NAMES_TO_IGNORE.includes(n);
    });

    // Kemas kini semula storan bersih
    try {
      localStorage.setItem('jom_arab_attendance', JSON.stringify(saved));
    } catch (e) {}

    // Senarai sentiasa bermula dengan Ustaz Alif sahaja
    const combined = [
      { namaMurid: "Ustaz Alif", kelas: "Guru Pembimbing" }
    ];

    saved.forEach(item => {
      if (item && item.namaMurid) {
        const itemN = String(item.namaMurid).trim();
        if (itemN.toLowerCase() !== 'ustaz alif' && !combined.some(c => c.namaMurid.toLowerCase() === itemN.toLowerCase())) {
          combined.push({
            namaMurid: itemN,
            kelas: String(item.kelas !== undefined && item.kelas !== null ? item.kelas : '-').trim(),
            timestamp: item.timestamp || ''
          });
        }
      }
    });

    return combined.slice(0, 30);
  }

  /* ==========================================================================
     9. SKRIN PAPAN KEHADIRAN MURID (SEHINGGA 30 MURID)
     ========================================================================== */
  async function loadRecentRecords() {
    showScreen('recent-records');

    const statusWrap = $('#records-status-container');
    const listWrap = $('#records-list-container');
    listWrap.innerHTML = '';

    // Paparkan terus senarai kehadiran tempatan jika belum konfigurasi API
    if (!API_URL || API_URL.trim() === '' || API_URL.includes('PASTE_YOUR_DEPLOYED')) {
      statusWrap.innerHTML = `
        <div style="margin-bottom: 0.85rem; text-align: center;">
          <span class="pill-tag" style="background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe;">
            📋 Kehadiran Murid Direkodkan
          </span>
        </div>
      `;
      renderAttendanceList(getAttendanceList());
      return;
    }

    // Jika ada API_URL, ambil rekod terus dari Google Sheets
    statusWrap.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
        <span class="sync-spinner" style="width: 24px; height: 24px;" aria-hidden="true"></span>
        <p style="font-size: 0.9rem; font-weight: 700; color: var(--color-primary-dark);">Menyemak kehadiran dari Google Sheets...</p>
      </div>
    `;

    try {
      const fetchUrl = `${API_URL}?action=getRecentRecords&t=${Date.now()}`;
      let records = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.fetchTimeoutMs);

        const res = await fetch(fetchUrl, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json && json.success) {
            records = json.records || [];
          }
        }
      } catch (fetchErr) {
        records = await fetchViaJsonp(API_URL);
      }

      statusWrap.innerHTML = `
        <div style="margin-bottom: 0.85rem; text-align: center;">
          <span class="pill-tag" style="background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe;">
            📋 Kehadiran Murid Direkodkan
          </span>
        </div>
      `;

      // Senarai bermula dengan Ustaz Alif di atas
      const merged = [
        { namaMurid: "Ustaz Alif", kelas: "Guru Pembimbing" }
      ];

      // Masukkan murid sesi semasa jika ada
      if (AppState.student.name) {
        const curName = String(AppState.student.name).trim();
        if (curName.toLowerCase() !== 'ustaz alif') {
          merged.push({
            namaMurid: curName,
            kelas: String(AppState.student.studentClass || '-').trim()
          });
        }
      }

      // Masukkan rekod murid sebenar yang disegerakkan dari Google Sheets
      if (records && records.length > 0) {
        records.forEach(r => {
          if (!r) return;
          const rName = String(r.namaMurid !== undefined && r.namaMurid !== null ? r.namaMurid : '').trim();
          const rClass = String(r.kelas !== undefined && r.kelas !== null ? r.kelas : '-').trim();
          
          if (rName && !DUMMY_NAMES_TO_IGNORE.includes(rName.toLowerCase()) &&
              !merged.some(m => String(m.namaMurid || '').trim().toLowerCase() === rName.toLowerCase())) {
            merged.push({ namaMurid: rName, kelas: rClass || '-' });
          }
        });
      }

      renderAttendanceList(merged.slice(0, 30));

    } catch (err) {
      statusWrap.innerHTML = `
        <div style="margin-bottom: 0.85rem; text-align: center;">
          <span class="pill-tag" style="background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe;">
            📋 Kehadiran Murid Direkodkan
          </span>
        </div>
      `;
      renderAttendanceList(getAttendanceList());
    }
  }

  // Fallback pembacaan data JSONP jika diperlukan
  function fetchViaJsonp(url) {
    return new Promise((resolve, reject) => {
      const callbackName = 'gasCallback_' + Math.round(100000 * Math.random());
      const script = document.createElement('script');
      
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Masa JSONP tamat'));
      }, APP_CONFIG.fetchTimeoutMs);

      function cleanup() {
        clearTimeout(timeout);
        if (script.parentNode) script.parentNode.removeChild(script);
        delete window[callbackName];
      }

      window[callbackName] = function (data) {
        cleanup();
        if (data && data.success) {
          resolve(data.records || []);
        } else {
          reject(new Error(data.message || 'Ralat JSONP'));
        }
      };

      const sep = url.includes('?') ? '&' : '?';
      script.src = `${url}${sep}action=getRecentRecords&callback=${callbackName}&t=${Date.now()}`;
      script.onerror = function () {
        cleanup();
        reject(new Error('Skrip JSONP gagal dimuatkan'));
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Paparan Papan Kehadiran Murid:
   * Bersih, ringkas, memaparkan nama dan kelas sahaja (tiada kedudukan #1, #2, #3, tiada markah).
   * Kebal terhadap ralat jenis data nombor (cth: kelas "1").
   */
  function renderAttendanceList(records) {
    const listWrap = $('#records-list-container');
    listWrap.innerHTML = '';

    if (!Array.isArray(records)) {
      records = [];
    }

    records.slice(0, 30).forEach((item) => {
      if (!item) return;
      const card = document.createElement('article');
      card.className = 'attendance-card-item';

      const rawN = (item.namaMurid !== undefined && item.namaMurid !== null) ? item.namaMurid : 'Murid';
      const rawC = (item.kelas !== undefined && item.kelas !== null && String(item.kelas).trim() !== '') ? item.kelas : '-';
      const safeName = escapeHTML(rawN);
      const safeClass = escapeHTML(rawC);

      card.innerHTML = `
        <div class="attendance-meta-info">
          <h4 class="attendance-pupil-name">${safeName}</h4>
          <span class="attendance-badge-class">Kelas: ${safeClass}</span>
        </div>
        <div class="attendance-status-badge">
          <span aria-hidden="true">✅</span> Hadir
        </div>
      `;

      listWrap.appendChild(card);
    });
  }

  function formatTimestamp(tsString) {
    if (!tsString) return 'Masa tidak tercatat';
    try {
      const d = new Date(tsString);
      if (isNaN(d.getTime())) return escapeHTML(tsString);
      return d.toLocaleString('ms-MY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return escapeHTML(tsString);
    }
  }

  /* ==========================================================================
     10. PENGEMAS KINIAN LENCANA MOD MENU
     ========================================================================== */
  function updateModeBadges() {
    Object.keys(AppState.modeStatus).forEach(modKey => {
      const badge = $(`#badge-status-${modKey}`);
      if (!badge) return;

      const st = AppState.modeStatus[modKey];
      if (st.completed) {
        badge.className = 'mode-status-badge badge-status-completed';
        if (st.score !== null) {
          badge.textContent = `Selesai (${st.score}/100)`;
        } else {
          badge.textContent = 'Selesai Dibaca';
        }
      } else {
        badge.className = 'mode-status-badge badge-status-not-played';
        badge.textContent = 'Belum dimainkan';
      }
    });
  }

  /* ==========================================================================
     11. PENGIKATAN ACARA (EVENT LISTENERS SETUP)
     ========================================================================== */
  function setupEventListeners() {
    // Kawalan Bunyi Header
    const btnSound = $('#btn-sound-toggle');
    const soundIcon = $('#sound-icon');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        AppState.soundEnabled = !AppState.soundEnabled;
        if (AppState.soundEnabled) {
          soundIcon.textContent = '🔊';
          btnSound.title = 'Bunyi: Hidup';
          playClickSound();
        } else {
          soundIcon.textContent = '🔇';
          btnSound.title = 'Bunyi: Dimatikan';
        }
      });
    }

    // Skrin 1: Butang MULA & Rekod Terkini
    const btnStart = $('#btn-start-game');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        playClickSound();
        showScreen('student-info');
      });
    }

    const btnViewRecords = $('#btn-view-recent-records');
    if (btnViewRecords) {
      btnViewRecords.addEventListener('click', () => {
        playClickSound();
        loadRecentRecords();
      });
    }

    // Skrin 2: Butang Kembali ke Laman Utama
    const btnBackHome = $('#btn-back-to-home');
    if (btnBackHome) {
      btnBackHome.addEventListener('click', () => {
        playClickSound();
        showScreen('start');
      });
    }

    // Skrin 3: Arahan Permainan
    const btnReadNotes = $('#btn-read-notes-now');
    if (btnReadNotes) {
      btnReadNotes.addEventListener('click', () => {
        playClickSound();
        markNotesAsRead();
        startNotesMode();
      });
    }

    const btnUnderstand = $('#btn-i-understand');
    if (btnUnderstand) {
      btnUnderstand.addEventListener('click', () => {
        playClickSound();
        showScreen('modes-menu');
      });
    }

    // Skrin 4: Menu Empat Mod
    $$('[data-action="open-mode"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        playClickSound();
        const modeId = btn.getAttribute('data-mode-id');
        if (modeId === 'mod1') {
          startNotesMode();
        } else {
          startQuizMode(modeId);
        }
      });
    });

    const btnEditStudent = $('#btn-edit-student-info');
    if (btnEditStudent) {
      btnEditStudent.addEventListener('click', () => {
        playClickSound();
        showScreen('student-info');
      });
    }

    const btnModesHome = $('#btn-modes-to-home');
    if (btnModesHome) {
      btnModesHome.addEventListener('click', () => {
        playClickSound();
        showScreen('start');
      });
    }

    // Skrin 6: Butang Seterusnya Kuiz
    const btnNextQ = $('#btn-next-question');
    if (btnNextQ) {
      btnNextQ.addEventListener('click', () => {
        handleNextQuestion();
      });
    }

    // Skrin 7: Tindakan Keputusan
    const btnReplay = $('#btn-replay-mode');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        playClickSound();
        const currentMod = AppState.quiz.modId;
        if (currentMod) {
          startQuizMode(currentMod);
        } else {
          showScreen('modes-menu');
        }
      });
    }

    const btnChooseOther = $('#btn-choose-other-mode');
    if (btnChooseOther) {
      btnChooseOther.addEventListener('click', () => {
        playClickSound();
        showScreen('modes-menu');
      });
    }

    const btnResultHome = $('#btn-result-to-home');
    if (btnResultHome) {
      btnResultHome.addEventListener('click', () => {
        playClickSound();
        showScreen('start');
      });
    }

    // Skrin 8: Rekod Terkini
    const btnRefresh = $('#btn-refresh-records');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        playClickSound();
        loadRecentRecords();
      });
    }

    const btnRecordsHome = $('#btn-records-to-home');
    if (btnRecordsHome) {
      btnRecordsHome.addEventListener('click', () => {
        playClickSound();
        showScreen('start');
      });
    }
  }

  /* ==========================================================================
     12. PERMULAAN APLIKASI (APPLICATION BOOTSTRAP)
     ========================================================================== */
  function initApp() {
    initStudentInfoForm();
    initNotesMode();
    setupEventListeners();
    updateModeBadges();
    showScreen('start');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
