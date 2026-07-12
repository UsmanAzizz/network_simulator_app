# Global-Level App Standards & Scalability

Untuk menjadikan **Network Simulator App** sebagai aplikasi berskala global (*world-class application*), kita tidak bisa hanya berfokus pada fitur utama. Kita harus menerapkan standar rekayasa perangkat lunak internasional.

## 1. Progressive Web App (PWA) & Offline-First
- **Tujuan**: Siswa dapat "menginstal" aplikasi ini di layar utama (*home screen*) *smartphone* mereka (Android/iOS) layaknya aplikasi *native*, tanpa melalui Play Store.
- **Implementasi**: Mengonfigurasi `next-pwa` dan `manifest.json`. Karena algoritma *Grader* berjalan murni di JavaScript klien, siswa tetap bisa belajar merakit jaringan (mode *Playground*) **walaupun kuota internet habis atau sedang *offline***.

## 2. Accessibility (a11y) & Inclusivity
- **Tujuan**: Aplikasi harus bisa digunakan oleh siapa saja, termasuk mereka yang memiliki keterbatasan visual atau motorik.
- **Implementasi**: 
  - Navigasi penuh menggunakan *Keyboard* (Tab, Enter, Panah) untuk mode *Playground*.
  - Dukungan warna dengan rasio kontras tinggi dan opsi penyesuaian untuk buta warna (*Color-blind mode*).
  - Label ARIA (`aria-label`) pada setiap perangkat dan sambungan kabel.

## 3. Internationalization (i18n)
- **Tujuan**: Meskipun saat ini targetnya SMK lokal, aplikasi ini memiliki potensi untuk digunakan secara global oleh penggiat IT pemula.
- **Implementasi**: Menggunakan modul translasi (misal: `next-intl`) sejak awal untuk mengelola teks statis.

## 4. Telemetry & Error Tracking
- **Tujuan**: Mengukur bagian mana yang paling sulit dipahami oleh siswa dan melacak jika ada *bug* atau *error* di sisi klien tanpa perlu siswa melapor manual.
- **Implementasi**: Integrasi alat pemantauan ringan (seperti *Sentry* atau *Vercel Web Analytics*) yang patuh pada privasi (GDPR compliant).

## 5. Security & Rate Limiting
- Perlindungan pada API Vercel Edge Function agar tidak di-spam atau disalahgunakan (mengingat kita menggunakan API Groq berbayar/berkuota).
- Mengenkripsi dan mengamankan *Static Key* Guru di dalam *Environment Variables*.
