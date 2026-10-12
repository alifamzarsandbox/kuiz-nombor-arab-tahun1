# 🌟 Jom Belajar Angka Arab — Bahasa Arab Tahun 1

Aplikasi kuiz pendidikan interaktif yang dibina khas untuk murid **Tahun 1 Sekolah Rendah Malaysia** bagi mempelajari dan menguasai **Angka Arab 1 hingga 10** (\١ hingga \١٠).

Aplikasi ini menggunakan teknologi web standard (**HTML5, CSS3, Vanilla JavaScript**) yang ringan, pantas dan responsif, dengan **Google Apps Script** sebagai backend percuma dan **Google Sheets** sebagai pangkalan data rekod murid, sedia untuk diterbitkan melalui **GitHub Pages**.

---

## 📑 Kandungan

1. [Ciri-Ciri Utama Aplikasi](#1-ciri-ciri-utama-aplikasi)
2. [Struktur Fail Projek](#2-struktur-fail-projek)
3. [Panduan Persediaan Google Sheets & Google Apps Script](#3-panduan-persediaan-google-sheets--google-apps-script)
4. [Konfigurasi Frontend (`config.js`)](#4-konfigurasi-frontend-configjs)
5. [Panduan Penerbitan ke GitHub Pages](#5-panduan-penerbitan-ke-github-pages)
6. [Struktur Pangkalan Data Google Sheets](#6-struktur-pangkalan-data-google-sheets)
7. [Keselamatan & Privasi Murid](#7-keselamatan--privasi-murid)
8. [Senarai Semak Pengujian & Status Semasa](#8-senarai-semak-pengujian--status-semasa)
9. [Penyelesaian Masalah (Troubleshooting)](#9-penyelesaian-masalah-troubleshooting)

---

## 1. Ciri-Ciri Utama Aplikasi

- **Mesra Kanak-Kanak & Guru:** Butang besar, kad bulat, warna ceria (biru, hijau lembut, kuning, putih) dan tipografi jelas.
- **Tipografi Arab Asli:** Menggunakan fon *Noto Naskh Arabic* dan *Amiri* dengan atribut `dir="rtl"` dan `lang="ar"` serta tanda baris lengkap (tashkeel/harakat) tanpa terpotong.
- **Sintesis Audio Tanpa Kebergantungan Luaran:** Kesan bunyi (chime betul, amaran salah, klik) dijana terus menggunakan *Web Audio API* — tidak memerlukan fail MP3 luaran dan boleh dimatikan melalui butang bunyi di header.
- **4 Mod Pembelajaran & Kuiz:**
  - **MOD 1 — Nota Pembelajaran:** 10 kad interaktif dengan angka biasa, angka Arab, perkataan Arab berbaris, sebutan (transliterasi) dan maksud Bahasa Melayu berserta ilustrasi objek.
  - **MOD 2 — Kenali Angka Arab:** Memadankan angka biasa (1-10) dengan angka Arab (\١-\١٠).
  - **MOD 3 — Kira dan Pilih Angka Arab:** Mengira objek SVG (epal, pensel, bintang, belon, dll.) dan memilih simbol angka Arab yang sepadan.
  - **MOD 4 — Pilih Perkataan bagi Angka Arab:** Mengenali perkataan Bahasa Arab berbaris lengkap bagi setiap angka Arab.
- **Pilihan Kelas Terbuka:** Murid boleh menaip nama kelas secara bebas (cth. 1 Alpha, 2 Bestari, dll.) membolehkan aplikasi digunakan merentas aliran tahun dan sekolah berbeza.
- **Pemarkahan Adil & Mesra Murid:** 10 soalan setiap mod, 10 mata setiap soalan betul (maksimum 100 mata). Soalan dan pilihan jawapan diacak secara rawak pada setiap sesi.
- **Papan Kehadiran Murid Automatik:** Tiada elemen persaingan atau kedudukan nombor (#1, #2, #3). Sebaik sahaja murid memasukkan nama dan kelas, kehadiran mereka terus direkodkan secara automatik ke dalam senarai sehingga 30 murid terkini (dengan status `✅ Hadir`). Murid boleh menyemak nama mereka pada bila-bila masa melalui butang **PAPAN KEHADIRAN MURID**.
- **Navigasi Cepat & Mesra:** Butang arahan bertukar kepada **TERUSKAN** untuk melancarkan proses murid memulakan kuiz.

---

## 2. Struktur Fail Projek

```text
KUIZ 3 MOD NOMBOR TAHUN 1/
├── index.html          # Struktur HTML5 aplikasi & 8 skrin dalaman (SPA)
├── style.css           # Reka bentuk responsif mobile-first & tema ceria
├── script.js           # Enjin kuiz, audio synthesizer, navigasi & API
├── data.js             # Data 10 angka Arab, ikon SVG & penjana soalan
├── config.js           # Tetapan URL Web App & senarai kelas murid
├── README.md           # Panduan lengkap dokumentasi & deployment
└── apps-script/
    └── Code.gs         # Kod backend Google Apps Script & validasi server
```

---

## 3. Panduan Persediaan Google Sheets & Google Apps Script

Panduan langkah demi langkah ini disediakan khas untuk guru atau pentadbir sekolah tanpa memerlukan kemahiran pengaturcaraan.

### Langkah 3.1: Cipta Google Spreadsheet Baharu
1. Buka pelayar web dan layari [Google Sheets](https://sheets.google.com).
2. Log masuk menggunakan akaun Google anda.
   > **Nota Penting Akaun Sekolah / KPM:** Jika akaun Google Workspace sekolah (cth. `@moe-dl.edu.my`) menyekat tetapan Web App kepada akses awam, anda disyorkan menggunakan akaun Google peribadi (`@gmail.com`) untuk pangkalan data kuiz ini supaya murid boleh menghantar rekod tanpa perlu log masuk.
3. Cipta hamparan kosong baharu (*Blank spreadsheet*).
4. Namakan spreadsheet tersebut di bahagian kiri atas sebagai:
   ```text
   KUIZ BAHASA ARAB TAHUN 1 — REKOD
   ```

### Langkah 3.2: Buka Editor Apps Script
1. Pada menu atas Google Sheets, klik **Extensions** (Sambungan) → **Apps Script**.
2. Padamkan sebarang kod lalai `function myFunction() { ... }` yang ada di dalam editor.

### Langkah 3.3: Masukkan Kod Backend (`Code.gs`)
1. Buka fail [`apps-script/Code.gs`](file:///H:/Other%20computers/HUAWEI%20HOME/HUAWEI/ANTIGRAVITY/KUIZ%203%20MOD%20NOMBOR%20TAHUN%201/apps-script/Code.gs) dari folder projek ini.
2. Salin keseluruhan kod dan tampal ke dalam editor Apps Script.
3. Klik ikon simpan 💾 (*Save project*) atau tekan `Ctrl + S`.
4. Namakan projek Apps Script sebagai: `Kuiz Angka Arab Backend`.

### Langkah 3.4: Jalankan Fungsi `setupSheet`
1. Pada bar alat atas editor Apps Script, cari kotak dropdown fungsi di sebelah butang **Run** (Jalankan).
2. Pilih fungsi `setupSheet`.
3. Klik butang **Run** (Jalankan).
4. Kotak dialog kebenaran (*Authorization Required*) akan dipaparkan:
   - Klik **Review Permissions** (Semak Kebenaran).
   - Pilih akaun Google anda.
   - Jika amaran *"Google hasn't verified this app"* muncul, klik **Advanced** (Lanjutan) di bahagian bawah, kemudian klik **Go to Kuiz Angka Arab Backend (unsafe)**.
   - Klik **Allow** (Benarkan).
5. Buka semula tab Google Sheets anda. Anda akan melihat satu tab baharu bernama **RekodKuiz** telah diwujudkan secara automatik lengkap dengan tajuk lajur berwarna biru dan saiz lajur yang kemas!

### Langkah 3.5: Buat Deployment Sebagai Web App
1. Di bahagian atas kanan editor Apps Script, klik butang biru **Deploy** → **New deployment** (Penyebaran baharu).
2. Pada ikon gear ⚙️ di sebelah kiri *Select type*, pastikan **Web app** dipilih.
3. Isikan maklumat berikut:
   - **Description:** `Versi 1.0 - Kuiz Angka Arab`
   - **Execute as:** `Me (emel.anda@gmail.com)` *(Wajib pilih ini supaya skrip berjalan menggunakan hak akses spreadsheet anda)*
   - **Who has access:** `Anyone` (Sesiapa sahaja) *(Wajib pilih ini supaya murid pada telefon pintar/laptop boleh menghantar kuiz tanpa perlu log masuk ke akaun Google)*
4. Klik butang **Deploy**.
5. Salin **Web app URL** yang dipaparkan.
   > URL yang sah mestilah berakhir dengan `/exec`, contohnya:
   > `https://script.google.com/macros/s/AKfycbxAbCdEf123456789/exec`
   > *(Jangan gunakan URL yang berakhir dengan `/dev`)*

---

## 4. Konfigurasi Frontend (`config.js`)

1. Buka fail [`config.js`](file:///H:/Other%20computers/HUAWEI%20HOME/HUAWEI/ANTIGRAVITY/KUIZ%203%20MOD%20NOMBOR%20TAHUN%201/config.js) dalam folder projek anda.
2. Tampalkan Web App URL yang disalin pada Langkah 3.5 ke dalam pemboleh ubah `API_URL`:
   ```javascript
   const API_URL = "https://script.google.com/macros/s/AKfycbxAbCdEf123456789/exec";
   ```
3. Jika anda ingin mengubah atau menambah nama kelas murid, kemas kini senarai `ALLOWED_CLASSES`:
   ```javascript
   const ALLOWED_CLASSES = [
     "1 Alpha",
     "1 Beta",
     "1 Gamma",
     "1 Delta"
   ];
   ```
   > **Perhatian:** Jika anda menambah kelas baharu dalam `config.js`, pastikan anda juga mengemas kini array `ALLOWED_CLASSES` dalam fail `apps-script/Code.gs` dan deploy versi baharu agar pengesahan server sepadan.
4. Simpan fail `config.js`.

---

## 5. Panduan Penerbitan ke GitHub Pages

Aplikasi ini tidak memerlukan server Node.js atau pangkalan data berbayar. Anda boleh menerbitkannya secara percuma melalui **GitHub Pages**.

### Langkah 5.1: Cipta Repositori GitHub
1. Log masuk ke [GitHub.com](https://github.com).
2. Klik butang **New repository** (Repositori Baharu).
3. Namakan repositori, contohnya: `kuiz-bahasa-arab-tahun-1`.
4. Tetapkan status repositori sebagai **Public** (Awam).
5. Klik **Create repository**.

### Langkah 5.2: Muat Naik Fail Frontend
Muat naik 6 fail utama berikut ke cawangan (*branch*) `main`:
- `index.html` (Mesti berada di folder akar / root)
- `style.css`
- `script.js`
- `data.js`
- `config.js` (dengan `API_URL` yang telah diisi)
- `README.md`

*(Folder `apps-script/` boleh turut disimpan dalam repositori sebagai sandaran kod backend).*

### Langkah 5.3: Aktifkan GitHub Pages
1. Pada laman repositori GitHub anda, klik tab **Settings** (Tetapan).
2. Pada menu bar sisi sebelah kiri, klik **Pages**.
3. Di bawah bahagian **Build and deployment**:
   - **Source:** Pilih `Deploy from a branch`.
   - **Branch:** Pilih `main` dan folder `/(root)`.
4. Klik butang **Save**.
5. Tunggu sekitar 1 hingga 2 minit. Muat semula halaman tersebut sehingga pautan URL Pages hijau muncul, contohnya:
   ```text
   https://username-anda.github.io/kuiz-bahasa-arab-tahun-1/
   ```
6. Aplikasi anda kini boleh dibuka dan dimainkan oleh murid pada telefon pintar, tablet, dan komputer riba di mana-mana sahaja!

---

## 6. Struktur Pangkalan Data Google Sheets

Data murid disimpan dalam tab **`RekodKuiz`** dengan struktur 11 lajur berikut:

| Lajur | Nama Medan | Jenis Data | Penerangan |
| :---: | :--- | :--- | :--- |
| **A** | `timestamp` | String (ISO / Tarikh) | Masa rasmi pelayan Google Apps Script direkodkan |
| **B** | `attemptId` | String | ID unik bagi setiap percubaan kuiz (idempotensi) |
| **C** | `namaMurid` | String | Nama murid (maksimum 60 aksara) |
| **D** | `kelas` | String | Kelas murid yang dipilih (cth: 1 Alpha) |
| **E** | `modId` | String | Kod mod kuiz (`mod2`, `mod3`, `mod4`) |
| **F** | `namaMod` | String | Tajuk mod kuiz penuh |
| **G** | `jumlahSoalan` | Integer | Tepat 10 soalan |
| **H** | `jawapanBetul` | Integer | Bilangan soalan dijawab dengan betul (0-10) |
| **I** | `jawapanSalah` | Integer | Bilangan soalan yang salah (0-10) |
| **J** | `markah` | Integer | Markah kuiz (10 mata bagi setiap jawapan betul, maks 100) |
| **K** | `peratus` | Integer | Peratusan markah (0% - 100%) |

---

## 7. Keselamatan & Privasi Murid

1. **Maklumat Minimum:** Sistem ini hanya meminta **Nama** dan **Kelas**. Sistem tidak sama sekali meminta Nombor Kad Pengenalan (MyKid), kata laluan, nombor telefon, atau sebarang maklumat peribadi sensitif murid.
2. **Tiada Pengesahan Identiti Rasmi:** Aplikasi ini tidak mempunyai sistem log masuk rasmi murid. Pengenalan murid dibuat semata-mata atas nama dan kelas yang dimasukkan bagi tujuan paparan rekod sekolah rendah.
3. **Pencegahan XSS:** Semua nama murid dan input disanitasi menggunakan fungsi `escapeHTML()` sebelum dipaparkan pada DOM skrin.
4. **Validasi Pelayan (Server-Side Enforcement):** Google Apps Script mengesahkan semula bahawa jumlah soalan mestilah 10, markah adalah konsisten dengan jawapan betul, kelas adalah sah, dan `attemptId` tidak berulang. Pengguna tidak boleh memanipulasi markah secara haram dari konsol pelayar.
5. **Kawalan Hak Milik Google Sheets:** Data murid di Google Sheets adalah hak milik persendirian akaun Google guru. Hanya guru yang mempunyai capaian ke fail spreadsheet tersebut boleh melihat keseluruhan data. Antara muka awam hanya memaparkan maksimum 30 rekod kehadiran murid bagi memastikan murid tahu kehadiran mereka telah direkodkan.

---

## 8. Senarai Semak Pengujian & Status Semasa

### A. Pengujian Frontend (Telah Disahkan & Berfungsi)
- [x] **Skrin Permulaan:** Paparan tajuk besar, banner angka Arab \١-\١٠, butang MULA dan butang **PAPAN KEHADIRAN MURID**.
- [x] **Skrin Maklumat Murid:** Validasi nama dan input kelas terbuka (menyokong sebarang nama kelas mengikut tahun/sekolah). Merekod kehadiran secara automatik sebaik sahaja nama dan kelas dimasukkan.
- [x] **Skrin Arahan Permainan:** 5 panduan wajib berserta butang **TERUSKAN ➡️** untuk terus ke menu mod.
- [x] **Mod 1 (Nota Pembelajaran):** 10 kad pembelajaran lengkap (1 hingga 10) dengan angka biasa, angka Arab, perkataan Arab berbaris, sebutan transliterasi, maksud Melayu dan ikon visual. Butang navigasi disusun responsif (Sebelumnya & Seterusnya bersebelahan seimbang, penunjuk 10 titik di atas) supaya tidak terpotong pada telefon pintar.
- [x] **Mod 2 (Kenali Angka Arab):** 10 soalan padanan nombor biasa ke angka Arab \١-\١٠, 4 pilihan diacak, 1 jawapan betul, pilihan dikunci selepas ditekan, maklum balas segera dipaparkan.
- [x] **Mod 3 (Kira dan Pilih Angka Arab):** 10 soalan mengira objek vektor SVG (1 hingga 10 objek) tanpa bertindih dan pilihan angka Arab yang tepat.
- [x] **Mod 4 (Pilih Perkataan bagi Angka Arab):** 10 soalan angka Arab besar (\١-\١٠) dan 4 pilihan perkataan Arab berbaris lengkap dengan teks RTL.
- [x] **Sistem Pemarkahan:** 10 mata setiap jawapan betul, maksimum 100 mata. Soalan dan pilihan diacak pada setiap pusingan baharu.
- [x] **Skrin Keputusan:** Skor X/10, peratusan %, pecahan betul/salah, mesej galakan mengikut tahap, butang cuba lagi mod dan pilih mod lain. Penyimpanan rekod ke Google Sheets berlaku secara senyap di latar belakang tanpa mesej teknikal yang mengganggu murid.
- [x] **Papan Kehadiran Murid:** Memaparkan kad nama murid dan kelas yang kemas (tanpa sebarang nombor ranking #1, #2, #3 dan tanpa markah), status `✅ Hadir`, paparan sehingga 30 murid terkini dengan butang **Refresh**.
- [x] **Kawalan Audio:** Web Audio API berfungsi menjana chime betul dan salah, dengan butang pembatalan bunyi (Mute/Unmute) di header.
- [x] **Footer Rasmi:** Mengandungi kredit yang kemas: `Jom Belajar Bahasa Arab | Kelas Ustaz Alif`.
- [x] **Kebolehcapaian & Responsif:** Sesuai untuk paparan telefon pintar, tablet, dan desktop tanpa sebarang horizontal scrolling. Menyokong `prefers-reduced-motion`.

### B. Pengujian Backend & Integrasi Cloud (Status Semasa)
- [x] **Kod Backend Apps Script (`Code.gs`):** Siap sepenuhnya merangkumi `setupSheet()`, `doGet()`, `doPost()`, `LockService`, pencegahan rekod duplikasi (`attemptId`), sokongan kelas terbuka sehingga 30 rekod, dan penjanaan timestamp pelayan.
- [ ] **Deployment Sebenar Google Apps Script:** *Memerlukan tindakan pengguna* (Guru perlu menampal kod ke Google Sheets dan mendapatkan Web App URL seperti panduan di Seksyen 3).
- [ ] **Penyimpanan Rekod Sebenar & Paparan dari Cloud:** *Memerlukan tindakan pengguna* (Aplikasi kini berfungsi dengan lancar bersama Papan Kehadiran tempatan dan akan terus menyambung ke pangkalan data cloud sebaik sahaja `API_URL` dimasukkan ke dalam `config.js`).

---

## 9. Penyelesaian Masalah (Troubleshooting)

### 1. Paparan Rekod Menggunakan Papan Kehadiran Tempatan
- **Penerangan:** Jika `API_URL` belum diisi dalam `config.js`, aplikasi secara automatik merekodkan kehadiran murid dalam peranti pelayar dan memaparkan senarai kehadiran terkini (lengkap dengan nama murid dan kelas). Untuk menyambungkannya ke Google Sheets sebenar, ikuti panduan di [Seksyen 3](#3-panduan-persediaan-google-sheets--google-apps-script) dan masukkan Web App URL ke dalam `config.js`.

### 2. Ralat "Who has access" / Murid Tidak Boleh Menghantar Rekod
- **Punca:** Semasa membuat deployment di Apps Script, pilihan *Who has access* ditetapkan kepada *"Only myself"* atau *"Anyone within organization"*.
- **Penyelesaian:** Pastikan ia ditetapkan kepada **Anyone** (Sesiapa sahaja). Jika menggunakan akaun MOE yang menyekat pilihan ini, gunakan akaun `@gmail.com` peribadi.

### 3. Perubahan pada `Code.gs` Tidak Berkesan
- **Punca:** Google Apps Script memerlukan deployment versi baharu setiap kali kod diubah.
- **Penyelesaian:** Di editor Apps Script, klik **Deploy** → **Manage deployments** → klik ikon pensel ✏️ (Edit) → tukar *Version* kepada **New version** → klik **Deploy**. URL Web App kekal sama.

### 4. Sokongan Penuh Input Angka pada Nama Kelas (cth: "1", "2")
- **Penerangan:** Aplikasi dan backend telah direka khas dengan sistem keselamatan penukaran jenis data (*data type sanitization*). Jika murid memasukkan angka tulen seperti `1` pada kotak kelas, sistem automatik mengekalkannya sebagai teks string (*Plain Text*) di frontend dan Google Sheets tanpa sebarang isu kerosakan paparan atau ralat pemprosesan pelayan.

---

*Hak Cipta Terpelihara © 2026 — Dibangunkan untuk Pendidikan Murid Tahun 1 Sekolah Rendah Malaysia.*
