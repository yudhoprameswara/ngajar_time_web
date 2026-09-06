# ⏱️ Ngajar Time Web (Mobile-First PWA)

Aplikasi Web Mobile-First untuk **Ngajar Time**, dibuat dengan **React 19 + Vite + TypeScript + Tailwind CSS** dan terhubung langsung ke **Firebase Firestore & Auth** yang sama dengan aplikasi mobile Flutter.

---

## 🚀 Cara Menjalankan Secara Lokal

1. Buka terminal di folder ini:
   ```bash
   cd /Users/yudhoprameswara/Projects/ngajar_time_web
   ```
2. Jalankan development server:
   ```bash
   npm run dev
   ```
3. Buka browser di URL yang muncul (biasanya `http://localhost:5173`).
4. Buka **Inspect Element / Toggle Device Toolbar (F12 / Cmd+Opt+I)** dan pilih mode iPhone 14/15/16 untuk melihat tampilan mobile yang 100% presisi dengan aplikasi iOS!

---

## 📱 Fitur yang Disediakan
* 🌟 **Splash Screen Animatif:** Animasi brand lockup dan cincin konsentris.
* 🔐 **Login & Registrasi Pengajar:** Terhubung ke Firebase Auth & data rekening.
* 👤 **Profil Akun & Unggah Foto:** Upload foto dari file (Base64) dengan fallback huruf inisial.
* 🏠 **Beranda & Hero Pendapatan:** Banner pendapatan bulan ini, total jam, total sesi, dan riwayat sesi.
* 👨‍🎓 **Manajemen Murid:** Tambah, edit tarif per jam (aman data lama), dan hapus murid.
* ⏱️ **Pencatatan Sesi:** Kalkulator durasi & honor instan.
* 📄 **Faktur Invoice & Cetak PDF A4:** Filter murid & bulan, tabel rincian sesi, instruksi transfer rekening bank, siap cetak / simpan sebagai PDF.
* 📊 **Analitik Pendapatan:** Grafik kontribusi per murid (bulanan & tahunan).

---

## ☁️ Cara Deploy Gratis (Vercel / Netlify / Firebase Hosting)

### Deploy ke Vercel (Rekomendasi - Cukup 1 Menit):
1. Install vercel CLI: `npm i -g vercel`
2. Jalankan: `vercel`
3. Ikuti petunjuk di terminal, aplikasi web Anda langsung live dengan link HTTPS gratis!
