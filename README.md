# SI-OBSERVASI 181

Dashboard untuk observasi kualitas pembelajaran guru, refleksi murid, dan refleksi guru.
Dibangun dengan **React 19 + Vite + Tailwind CSS 4 + lucide-react**, dan bisa dijalankan dalam
dua mode:

- **Mode lokal** (default, tanpa konfigurasi apa pun): data tersimpan di `localStorage`
  browser. Cocok untuk mencoba aplikasi atau dipakai sendiri di satu perangkat. Tidak ada login.
- **Mode online** (dengan Supabase): data tersimpan di database bersama. Kepala sekolah dan
  guru login dengan akun masing-masing dan membuka website yang sama dari perangkat mana pun.
  Guru hanya melihat observasi miliknya. Lihat **`SUPABASE_SETUP.md`** untuk langkah lengkap.

## Menjalankan (mode lokal, tanpa database)

Prasyarat: **Node.js 20.19+** (atau 22.12+).

```bash
npm install
npm run dev        # buka http://localhost:5173
```

Build produksi (hasil di folder `dist/`, bisa di-hosting statis di mana saja):

```bash
npm run build
npm run preview
```

Klik **Muat data contoh** di sidebar untuk mencoba seluruh fitur dengan 10 observasi fiktif.
Tombol ini hanya muncul di mode lokal.

## Menjalankan dengan database (mode online)

Ikuti **`SUPABASE_SETUP.md`** langkah demi langkah: buat proyek Supabase, jalankan
`supabase/schema.sql`, isi file `.env` (contoh di `.env.example`), lalu `npm run dev` seperti
biasa. Setelah `.env` terisi, aplikasi otomatis menampilkan halaman Masuk/Daftar.

## Fitur

| Halaman | Kepala sekolah | Guru (mode online) |
| --- | --- | --- |
| Dashboard | Ringkasan seluruh sekolah: total observasi, rata-rata skor, guru paling sering diobservasi, sebaran kategori, fokus coaching | Ringkasan observasi miliknya sendiri |
| Input Observasi | Form 4 langkah: Identitas, 12 Indikator (skor 1-4 + rubrik), Suara Murid, Refleksi Guru. Nilai akhir dihitung real-time; draf tersimpan otomatis | Tidak tersedia |
| Rekap Data / Observasi Saya | Pencarian, filter guru & mapel, modal detail, hapus, ekspor CSV | Melihat & mencari observasinya, **mengisi refleksi guru langsung dari modal detail** |
| Analisis | Tren skor, indikator terkuat/terlemah, peta indikator per guru, kutipan murid | Tersedia, mengikuti data yang dapat dilihat guru tersebut |
| Pengguna | Menyetujui akun guru baru, mengubah peran, mencabut akses | Tidak tersedia |

Di mode lokal (tanpa database) tidak ada konsep guru/kepala sekolah; siapa pun yang membuka
browser tersebut memiliki akses penuh, seperti kepala sekolah.

## Rumus skor

- **Rata-rata skor** = total skor 12 indikator / 12 (skala 1-4)
- **Nilai akhir** = total skor / 48 x 100
- **Kategori** mengikuti pembulatan rata-rata: >= 3,5 Sangat Baik, >= 2,5 Baik, >= 1,5 Cukup, di bawahnya Perlu Perbaikan

Rumus ini ada di `src/utils/score.js` dan bisa diubah bila sekolah memakai bobot lain.

## Ekspor CSV

Tombol **Ekspor CSV** (khusus kepala sekolah) mengunduh data yang sedang tampil (setelah
pencarian/filter). Tersedia dua pemisah kolom:

- **Titik koma** (default): untuk Microsoft Excel dengan pengaturan regional Indonesia.
- **Koma**: standar, untuk Google Sheets atau LibreOffice.

File memakai UTF-8 dengan BOM, sehingga huruf dan tanda baca terbaca benar di Excel.

## Struktur proyek

```
supabase/
  schema.sql                  skema database, keamanan per baris, akun pertama = kepala sekolah
.env.example                  contoh variabel Supabase
SUPABASE_SETUP.md             panduan menghubungkan database langkah demi langkah

src/
  App.jsx                     layout, routing hash, gerbang login (Gate)
  main.jsx                    entry point
  index.css                   Tailwind + animasi
  context/
    AuthContext.jsx           sesi login, profil, peran, daftar/masuk/keluar
  data/
    indicators.js             12 indikator + rubrik 1-4, daftar mapel/kelas  <-- edit di sini
    seed.js                   data contoh (mode lokal)
  hooks/
    useLocalStorage.js        state yang tersinkron ke localStorage
    useObservations.js        pilih otomatis: lokal (localStorage) atau Supabase, tergantung .env
    useProfiles.js             daftar & kelola pengguna (khusus kepala sekolah, mode online)
  lib/
    supabase.js                klien Supabase (null bila .env belum diisi)
    mappers.js                  konversi bentuk data aplikasi <-> baris tabel database
  utils/
    score.js                   rumus skor & kategori
    stats.js                    agregasi untuk dashboard dan analisis
    csv.js                      pembuat CSV & unduhan
    format.js                   format angka/tanggal Indonesia
  pages/
    Login.jsx  Pending.jsx  Users.jsx        halaman khusus mode online
    Dashboard.jsx  ObservationForm.jsx  Records.jsx  Analysis.jsx
  components/
    Sidebar.jsx  Modal.jsx  ConfirmDialog.jsx  Toast.jsx  StatCard.jsx  ObservationDetail.jsx  ui.jsx
    charts/    BarList.jsx  LineChart.jsx  StackedBar.jsx
    form/      Stepper.jsx  ScorePanel.jsx  ScoreRing.jsx  StepIdentity.jsx  StepIndicators.jsx
               StepStudentVoice.jsx  StepTeacherReflection.jsx  Field.jsx
```

## Penyimpanan data

**Mode lokal:** kunci `localStorage` `si-observasi-181:v1` (data) dan
`si-observasi-181:draft` (draf formulir). Data hanya ada di browser dan alamat (origin) yang
sama; mode penyamaran, pindah browser, atau membersihkan data situs akan menghilangkan data.
Ekspor CSV secara berkala sebagai cadangan.

**Mode online:** data ada di database Supabase Anda, bukan di browser. Supabase punya cadangan
otomatis di paket berbayarnya; di paket gratis, tetap disarankan ekspor CSV berkala dari menu
Rekap Data sebagai cadangan tambahan.

Untuk mengubah indikator atau rubrik, edit `src/data/indicators.js`. Data lama yang dibuat
dengan jumlah indikator berbeda tidak akan cocok dengan tampilan baru.

## Catatan

- Font Plus Jakarta Sans dimuat dari Google Fonts. Tanpa internet, aplikasi memakai font sistem.
- Di mode lokal, tidak ada data yang dikirim ke server mana pun.
- Di mode online, hanya Supabase (yang Anda kendalikan sendiri) yang menyimpan data; tidak ada
  pihak ketiga lain yang terlibat.
