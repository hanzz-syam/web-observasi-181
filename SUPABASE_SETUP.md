# Menghubungkan database (Supabase)

Tanpa langkah ini, aplikasi tetap berjalan dalam **mode lokal**: data hanya ada di browser
perangkat yang dipakai, dan tidak ada login. Ikuti langkah di bawah agar guru dan kepala
sekolah membuka website yang sama dan melihat data yang sama, tersimpan di database.

Supabase punya paket gratis yang cukup untuk kebutuhan satu sekolah.

## 1. Buat proyek Supabase

1. Buka [supabase.com](https://supabase.com) → **Start your project** → daftar/masuk.
2. **New project** → beri nama (contoh: `si-observasi-181`) → pilih region terdekat (Singapore) →
   buat kata sandi database yang kuat dan simpan → **Create new project**. Tunggu 1-2 menit.

## 2. Jalankan skema database

1. Di sidebar proyek, buka **SQL Editor** → **New query**.
2. Buka file `supabase/schema.sql` dari proyek ini, salin seluruh isinya, tempel ke editor.
3. Klik **Run**. Perintah ini membuat tabel `profiles` dan `observations`, serta aturan keamanan
   supaya guru hanya bisa melihat data miliknya sendiri.

## 3. Ambil kunci API

1. Buka **Project Settings** (ikon gerigi) → **API**.
2. Salin **Project URL** dan kunci **anon public**. Jangan pernah memakai kunci `service_role`.

## 4. Isi variabel lingkungan

Di folder proyek (sejajar dengan `package.json`), buat file bernama **`.env`** (salin dari
`.env.example`) berisi:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=isi-dengan-anon-public-key
```

Simpan, lalu jalankan ulang:
```bash
npm run dev
```
Kalau muncul halaman **Masuk / Daftar**, koneksi ke Supabase berhasil.

## 5. Buat akun kepala sekolah

1. Buka aplikasi → tab **Daftar** → isi nama, email, dan kata sandi kepala sekolah → **Buat akun**.
2. **Akun pertama yang mendaftar otomatis menjadi kepala sekolah** dan langsung aktif tanpa
   perlu persetujuan.
3. Jika Supabase meminta konfirmasi email, buka kotak masuk dan klik tautannya, lalu masuk.
   Untuk mematikan wajib-konfirmasi-email saat mencoba: Supabase → **Authentication** →
   **Providers** → **Email** → matikan **Confirm email**.

## 6. Guru mendaftar dan disetujui

1. Guru membuka alamat yang sama → tab **Daftar** → isi data mereka.
2. Setelah daftar, guru melihat halaman **Menunggu persetujuan**.
3. Kepala sekolah masuk → menu **Pengguna** → klik **Setujui** pada nama guru tersebut.
4. Guru menekan **Cek lagi** di halamannya, dan langsung masuk ke dashboard miliknya.

## 7. Menautkan observasi ke guru yang benar

Saat kepala sekolah membuka **Input Observasi**, kolom "Guru" berubah menjadi daftar pilihan
berisi guru yang sudah disetujui (bukan lagi kolom teks bebas). Ini penting agar guru yang
bersangkutan bisa melihat observasi tersebut di akunnya. Jika nama guru belum muncul di daftar,
setujui akunnya dulu di menu Pengguna.

## Publikasi ke internet (opsional)

Supaya bisa dibuka dari HP dan laptop mana pun tanpa menjalankan `npm run dev`:

1. `npm run build` menghasilkan folder `dist/`.
2. Unggah ke hosting statis gratis seperti **Netlify**, **Vercel**, atau **Cloudflare Pages**.
   Saat mengatur build di sana, isi juga variabel `VITE_SUPABASE_URL` dan
   `VITE_SUPABASE_ANON_KEY` di pengaturan environment variables situs tersebut (bukan di file
   `.env`, karena `.env` tidak ikut diunggah).
3. Build command: `npm run build`. Output directory: `dist`.

## Keamanan data murid

- Guru dan murid tidak memiliki login sendiri di sistem ini; hanya kepala sekolah dan guru yang
  login. Suara murid dicatat oleh kepala sekolah sebagai observer.
- Gunakan nama depan atau inisial untuk kutipan murid pada kolom yang bersifat terbuka.
- Jangan membagikan kunci `service_role` ke siapa pun atau menaruhnya di kode.
- Untuk mencabut akses seorang guru (misalnya sudah pindah sekolah), buka menu **Pengguna** dan
  klik **Cabut akses**. Data yang sudah tersimpan tidak ikut terhapus.
