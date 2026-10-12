/**
 * ============================================================================
 * KUIZ BAHASA ARAB TAHUN 1 — ANGKA 1 HINGGA 10
 * Backend Google Apps Script (Code.gs)
 * ============================================================================
 * 
 * Pangkalan Data: Google Sheets "KUIZ BAHASA ARAB TAHUN 1 — REKOD"
 * Tab Utama: "RekodKuiz"
 * 
 * Tanggungjawab:
 * 1. setupSheet()       — Inisialisasi tab dan lajur dengan format kemas.
 * 2. doGet(e)          — Mengambil 20 rekod terkini (JSON / JSONP) & status sistem.
 * 3. doPost(e)         — Menerima, mengesahkan (validasi), dan menyimpan rekod kuiz.
 */

// KONFIGURASI BACKEND
var CONFIG = {
  SHEET_NAME: "RekodKuiz",
  SPREADSHEET_TITLE: "KUIZ BAHASA ARAB TAHUN 1 — REKOD",
  ALLOWED_CLASSES: ["1 Alpha", "1 Gamma"],
  ALLOWED_MOD_IDS: ["mod2", "mod3", "mod4"],
  TOTAL_QUESTIONS: 10,
  MAX_RECENT_RECORDS: 30,
  TIMEZONE: "Asia/Kuala_Lumpur",
  // Jika skrip digunakan secara standalone (bukan Container-bound),
  // masukkan ID Spreadsheet di bawah atau dalam Script Properties.
  // Biarkan kosong jika skrip dibuka terus daripada Extensions -> Apps Script dalam Google Sheet.
  STANDALONE_SPREADSHEET_ID: ""
};

/**
 * Mendapatkan objek Spreadsheet sama ada daripada Active Spreadsheet
 * atau melalui Standalone ID.
 */
function getSpreadsheet() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    // Bukan container-bound
  }

  var scriptProp = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  var targetId = scriptProp || CONFIG.STANDALONE_SPREADSHEET_ID;

  if (targetId && targetId.trim() !== "") {
    return SpreadsheetApp.openById(targetId.trim());
  }

  throw new Error("Spreadsheet tidak ditemui. Sila buka Apps Script daripada Google Sheet berkaitan atau tetapkan SPREADSHEET_ID.");
}

/**
 * ----------------------------------------------------------------------------
 * 1. FUNGSI SETUP (Jalankan sekali oleh guru semasa pemasangan)
 * ----------------------------------------------------------------------------
 * Mewujudkan tab 'RekodKuiz', menulis tajuk lajur (headers),
 * menetapkan gaya format dan membekukan baris tajuk pertama.
 */
function setupSheet() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }

  var headers = [
    "timestamp",
    "attemptId",
    "namaMurid",
    "kelas",
    "modId",
    "namaMod",
    "jumlahSoalan",
    "jawapanBetul",
    "jawapanSalah",
    "markah",
    "peratus"
  ];

  // Periksa sama ada header sudah ada
  var existingHeaders = [];
  if (sheet.getLastRow() >= 1) {
    existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
  }

  if (existingHeaders.length === 0 || existingHeaders[0] === "") {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Gaya kemas untuk guru
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#2563eb");
    headerRange.setFontColor("#ffffff");
    headerRange.setHorizontalAlignment("center");
    
    // Bekukan baris tajuk
    sheet.setFrozenRows(1);

    // Tetapkan lebar lajur yang selesa
    sheet.setColumnWidth(1, 180); // timestamp
    sheet.setColumnWidth(2, 170); // attemptId
    sheet.setColumnWidth(3, 200); // namaMurid
    sheet.setColumnWidth(4, 110); // kelas
    sheet.setColumnWidth(5, 90);  // modId
    sheet.setColumnWidth(6, 220); // namaMod
    sheet.setColumnWidth(7, 100); // jumlahSoalan
    sheet.setColumnWidth(8, 100); // jawapanBetul
    sheet.setColumnWidth(9, 100); // jawapanSalah
    sheet.setColumnWidth(10, 90); // markah
    sheet.setColumnWidth(11, 90); // peratus

    // Kunci format lajur teks (attemptId, namaMurid, kelas) sebagai Plain Text ('@')
    // Ini mengelakkan Google Sheets daripada menukar input teks angka seperti "1" atau "01" kepada integer automatik
    try {
      sheet.getRange(2, 2, Math.max(sheet.getMaxRows() - 1, 100), 3).setNumberFormat("@");
    } catch (fmtErr) {
      // Abaikan jika tidak disokong
    }
  }

  Logger.log("Persediaan berjaya! Tab '" + CONFIG.SHEET_NAME + "' sedia digunakan.");
  return "Persediaan tab RekodKuiz berjaya!";
}

/**
 * ----------------------------------------------------------------------------
 * 2. doGet(e)
 * ----------------------------------------------------------------------------
 * Menyokong:
 * - action=getRecentRecords: Mengembalikan 20 rekod terkini mengikut masa
 * - action=ping atau status sistem
 * - Sokongan JSONP melalui parameter callback
 */
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || "ping";
    var callback = params.callback;

    var responseData = {};

    if (action === "getRecentRecords") {
      responseData = getRecentRecordsInternal();
    } else if (action === "ping") {
      responseData = {
        success: true,
        status: "online",
        message: "Backend Kuiz Bahasa Arab Tahun 1 aktif dan sedia menerima rekod.",
        serverTime: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss")
      };
    } else {
      responseData = {
        success: false,
        message: "Tindakan 'action' tidak dikenali."
      };
    }

    return createOutput(responseData, callback);

  } catch (err) {
    var errResponse = {
      success: false,
      message: "Ralat pelayan: " + err.toString()
    };
    return createOutput(errResponse, (e && e.parameter && e.parameter.callback));
  }
}

/**
 * Mengambil sehingga 20 rekod percubaan terakhir daripada tab RekodKuiz.
 * Disusun dari yang paling baharu ke yang paling lama.
 */
function getRecentRecordsInternal() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    return {
      success: true,
      records: []
    };
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    // Hanya ada baris header atau tiada data
    return {
      success: true,
      records: []
    };
  }

  var numDataRows = lastRow - 1;
  var rowsToFetch = Math.min(numDataRows, 50); // Ambil sehingga 50 rekod terakhir untuk disemak
  var startRow = lastRow - rowsToFetch + 1;

  var range = sheet.getRange(startRow, 1, rowsToFetch, 11);
  var values = range.getValues();
  var displayValues = [];
  try {
    displayValues = range.getDisplayValues(); // Dapatkan nilai paparan teks sebenar dari setiap sel
  } catch (dispErr) {
    displayValues = [];
  }

  var cleanRecords = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var dispRow = (displayValues && displayValues[i]) ? displayValues[i] : [];

    var ts = row[0];
    // Pastikan attId, name, sClass diekstrak sebagai rentetan teks (String) yang selamat
    var attId = dispRow[1] !== undefined && dispRow[1] !== "" ? dispRow[1] : (row[1] !== null && row[1] !== undefined ? String(row[1]) : "");
    var name = dispRow[2] !== undefined && dispRow[2] !== "" ? dispRow[2] : (row[2] !== null && row[2] !== undefined ? String(row[2]) : "");
    var sClass = dispRow[3] !== undefined && dispRow[3] !== "" ? dispRow[3] : (row[3] !== null && row[3] !== undefined ? String(row[3]) : "");
    var modId = dispRow[4] || (row[4] !== null && row[4] !== undefined ? String(row[4]) : "");
    var modName = dispRow[5] || (row[5] !== null && row[5] !== undefined ? String(row[5]) : "");
    var totalQ = row[6];
    var correct = row[7];
    var wrong = row[8];
    var score = row[9];
    var percent = row[10];

    // Format tarikh jika berbentuk objek Date
    var tsStr = ts;
    if (ts instanceof Date) {
      tsStr = Utilities.formatDate(ts, CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
    } else {
      tsStr = String(tsStr || "");
    }

    var cleanName = String(name || "").trim();
    // Pastikan kelas sentiasa String bersih, tidak kira murid letak "1", "1 Alpha", ataupun nombor tulen
    var cleanClass = String(sClass || "").trim();

    if (cleanName !== "") {
      cleanRecords.push({
        timestamp: tsStr,
        attemptId: String(attId || "").trim(),
        namaMurid: cleanName,
        kelas: cleanClass || "-",
        modId: String(modId || "").trim(),
        namaMod: String(modName || "").trim(),
        jumlahSoalan: Number(totalQ) || 10,
        jawapanBetul: Number(correct) || 0,
        jawapanSalah: Number(wrong) || 0,
        markah: Number(score) || 0,
        peratus: Number(percent) || 0
      });
    }
  }

  // Susun rekod paling baharu dahulu (menurun mengikut masa)
  cleanRecords.reverse();

  // Hadkan kepada 30 rekod sahaja
  var top30 = cleanRecords.slice(0, CONFIG.MAX_RECENT_RECORDS);

  return {
    success: true,
    totalCount: top30.length,
    records: top30
  };
}

/**
 * ----------------------------------------------------------------------------
 * 3. doPost(e)
 * ----------------------------------------------------------------------------
 * Menerima rekod keputusan kuiz daripada frontend, mengesahkan kesahihan data,
 * menguatkuasakan kunci penulisan bersiri (LockService), mengelakkan rekod pendua (idempotency),
 * dan menulis ke baris baharu di Google Sheets.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  var lockAcquired = false;

  try {
    // Perolehi lock penulisan sehingga 20 saat bagi mengelakkan perlumbaan konkurensi (race condition)
    lockAcquired = lock.tryLock(20000);
    if (!lockAcquired) {
      return createOutput({
        success: false,
        message: "Pelayan sedang sibuk menerima rekod lain. Sila cuba sebentar lagi."
      });
    }

    if (!e || (!e.postData && !e.parameter)) {
      return createOutput({
        success: false,
        message: "Tiada data yang dihantar."
      });
    }

    // Ekstrak data muatan (JSON atau form post)
    var data = null;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    if (!data) {
      return createOutput({
        success: false,
        message: "Format data tidak sah."
      });
    }

    // ------------------------------------------------------------------------
    // VALIDASI KETAT DI PERINGKAT SERVER (Jangan percayai input mentah dari client)
    // ------------------------------------------------------------------------

    // 1. attemptId
    var attemptId = data.attemptId ? String(data.attemptId).trim() : "";
    if (!attemptId || attemptId.length < 5 || attemptId.length > 100) {
      return createOutput({
        success: false,
        message: "attemptId tidak sah."
      });
    }

    // 2. namaMurid
    var namaMurid = (data.namaMurid !== undefined && data.namaMurid !== null) ? String(data.namaMurid).trim() : "";
    if (!namaMurid || namaMurid.length > 60) {
      return createOutput({
        success: false,
        message: "Nama murid wajib diisi dan tidak melebihi 60 aksara."
      });
    }

    // 3. kelas (boleh ditulis secara fleksibel termasuk angka seperti "1")
    var kelas = (data.kelas !== undefined && data.kelas !== null) ? String(data.kelas).trim() : "";
    if (!kelas || kelas.length > 50) {
      return createOutput({
        success: false,
        message: "Kelas murid wajib diisi dan tidak melebihi 50 aksara."
      });
    }

    // 4. modId
    var modId = data.modId ? String(data.modId).trim() : "";
    if (!modId || CONFIG.ALLOWED_MOD_IDS.indexOf(modId) === -1) {
      return createOutput({
        success: false,
        message: "Mod kuiz tidak sah (" + modId + ")."
      });
    }

    var namaMod = data.namaMod ? String(data.namaMod).trim() : modId;

    // 5. Bilangan Soalan & Pemarkahan
    var jumlahSoalan = parseInt(data.jumlahSoalan, 10);
    var jawapanBetul = parseInt(data.jawapanBetul, 10);
    var jawapanSalah = parseInt(data.jawapanSalah, 10);
    var markah = parseInt(data.markah, 10);
    var peratus = parseInt(data.peratus, 10);

    if (isNaN(jumlahSoalan) || jumlahSoalan !== CONFIG.TOTAL_QUESTIONS) {
      return createOutput({
        success: false,
        message: "Jumlah soalan mestilah tepat 10."
      });
    }

    if (isNaN(jawapanBetul) || jawapanBetul < 0 || jawapanBetul > 10) {
      return createOutput({
        success: false,
        message: "Bilangan jawapan betul tidak sah."
      });
    }

    if (isNaN(jawapanSalah) || jawapanSalah < 0 || jawapanSalah > 10) {
      return createOutput({
        success: false,
        message: "Bilangan jawapan salah tidak sah."
      });
    }

    if ((jawapanBetul + jawapanSalah) !== CONFIG.TOTAL_QUESTIONS) {
      return createOutput({
        success: false,
        message: "Jumlah jawapan betul dan salah mestilah berjumlah 10."
      });
    }

    var expectedScore = jawapanBetul * 10;
    if (markah !== expectedScore || peratus !== expectedScore) {
      return createOutput({
        success: false,
        message: "Ketidakpadanan pengiraan markah dikesan."
      });
    }

    // ------------------------------------------------------------------------
    // SEMAKAN IDEMPOTENSI (Mencegah rekod berganda jika request dihantar semula)
    // ------------------------------------------------------------------------
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      setupSheet();
      sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var checkLimit = Math.min(lastRow - 1, 100);
      var startCheck = lastRow - checkLimit + 1;
      var existingAttemptIds = sheet.getRange(startCheck, 2, checkLimit, 1).getValues();

      for (var k = 0; k < existingAttemptIds.length; k++) {
        if (existingAttemptIds[k][0] === attemptId) {
          // Rekod ini telah pun disimpan sebelumnya
          return createOutput({
            success: true,
            isDuplicate: true,
            message: "Rekod percubaan ini telah pun direkodkan sebelumnya.",
            attemptId: attemptId
          });
        }
      }
    }

    // ------------------------------------------------------------------------
    // PENJANAAN TIMESTAMP SERVER & PENULISAN REKOD
    // ------------------------------------------------------------------------
    var serverTimestamp = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");

    var newRow = [
      serverTimestamp,
      String(attemptId),
      String(namaMurid),
      String(kelas),
      String(modId),
      String(namaMod),
      jumlahSoalan,
      jawapanBetul,
      jawapanSalah,
      markah,
      peratus
    ];

    sheet.appendRow(newRow);

    // Kunci format sel lajur teks (attemptId, namaMurid, kelas) kepada Plain Text ('@')
    // Ini memastikan data nombor seperti "1" tidak bertukar jenis format dalam Google Sheets
    try {
      var lastR = sheet.getLastRow();
      sheet.getRange(lastR, 2, 1, 3).setNumberFormat("@");
    } catch (eFmt) {
      // Abaikan jika persekitaran tidak membenarkan
    }

    return createOutput({
      success: true,
      message: "Rekod kuiz berjaya disimpan.",
      attemptId: attemptId,
      timestamp: serverTimestamp
    });

  } catch (err) {
    return createOutput({
      success: false,
      message: "Ralat pelayan semasa menyimpan: " + err.toString()
    });

  } finally {
    if (lockAcquired) {
      lock.releaseLock();
    }
  }
}

/**
 * Pembantu format output HTTP JSON / JSONP yang serasi dengan pelayar web.
 */
function createOutput(dataObj, callback) {
  var jsonStr = JSON.stringify(dataObj);

  if (callback && typeof callback === "string" && callback.trim() !== "") {
    // Output JSONP selamat
    var safeCallback = callback.replace(/[^a-zA-Z0-9_]/g, "");
    var jsonpStr = safeCallback + "(" + jsonStr + ");";
    return ContentService.createTextOutput(jsonpStr)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(jsonStr)
    .setMimeType(ContentService.MimeType.JSON);
}
