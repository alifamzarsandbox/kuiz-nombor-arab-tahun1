/**
 * config.js
 * Konfigurasi Utama Aplikasi Jom Belajar Angka Arab
 * Guru boleh mengubah URL Google Apps Script dan senarai kelas di sini dengan mudah.
 */

// TAMPAL URL DEPLOYMENT GOOGLE APPS SCRIPT ANDA DI BAWAH:
// URL mestilah berakhir dengan "/exec" (bukan /dev)
// Contoh: "https://script.google.com/macros/s/AKfycbx.../exec"
const API_URL = "https://script.google.com/macros/s/AKfycbwd8-fQo_gomCN781nDQuEpyDS9XGeE1_PcIJsaVLvIGQiV-MerrWTs1jaCgmPKm-bW/exec"; 

// Senarai cadangan kelas pantas bagi murid.
// Murid juga boleh menulis nama kelas masing-masing secara bebas.
const ALLOWED_CLASSES = [
  "1 Alpha",
  "1 Gamma"
];

// Tetapan aplikasi umum
const APP_CONFIG = {
  appName: "Jom Belajar Angka Arab",
  subject: "Bahasa Arab Tahun 1",
  topic: "Angka Arab 1 hingga 10",
  questionsPerQuiz: 10,
  pointsPerQuestion: 10,
  maxScore: 100,
  maxRecentRecords: 30,
  enableSoundDefault: true,
  fetchTimeoutMs: 12000 // 12 saat had masa rangkaian
};
