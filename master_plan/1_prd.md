# Product Requirements Document (PRD)

## 1. Project Overview
**Network Simulator App** adalah simulasi jaringan berbasis web interaktif yang ditargetkan untuk siswa SMK Kelas 2 jurusan Teknik Jaringan Komputer dan Telekomunikasi (TJKT). Aplikasi ini dirancang sebagai pengganti presentasi pasif (proyektor) dengan mengutamakan pembelajaran *hands-on*.

## 2. Target Audience
- **Siswa**: SMK Kelas 2. Pemahaman awal mengenai komputer dasar dan aplikasi perkantoran, sedang mulai serius mendalami konsep jaringan (*networking*). Cenderung visual dan cepat bosan dengan instruksi yang rumit.
- **Guru**: Usman Aziz, S.Kom. Membutuhkan sarana pengajaran yang praktis dan modern untuk memantau pemahaman siswa secara interaktif.

## 3. Core Features (MVP)
### A. Live Simulator (Broadcast Mode)
- **Konsep**: Guru melakukan simulasi (drag & drop PC, Switch, setting IP) di kanvasnya, dan pergerakan tersebut diproyeksikan/disinkronkan secara *real-time* ke perangkat (gawai/browser) semua siswa di kelas.
- **Tujuan**: Siswa dapat melihat langsung apa yang dilakukan guru tanpa harus menatap proyektor di depan kelas.

### B. Playground Mode
- **Konsep**: Mode mandiri (*sandbox*) di mana siswa dapat membangun topologi jaringan mereka sendiri, mengatur IP, Gateway, dan menguji koneksi (Ping).
- **Perangkat Jaringan (Network Devices)**:
  - **End Devices**: PC Siswa, Server (contoh: Server YouTube lokal/publik).
  - **Intermediary Devices**: Switch (L2 Hub), Router (L3), Modem ISP.
- **Tujuan**: Memberikan pengalaman *hands-on* yang aman dan ringan tanpa perlu menginstal aplikasi desktop berat seperti Cisco Packet Tracer, dari sekadar konsep LAN hingga WAN/Routing.

### C. Guru Login & Class Session
- **Konsep**: Otentikasi sangat sederhana menggunakan *Static Key* (`787898`) untuk login Guru. Disimpan sementara di *Local Storage*.
- **Alur**: Jika Guru *online*, maka di aplikasi siswa akan muncul indikator "Guru Sedang Online" dan tombol "Join Kelas" untuk masuk ke mode Live Simulator.

## 4. UI/UX Principles
- **Mobile-First & Responsif**: Berjalan mulus di *smartphone* maupun tablet, karena tidak semua siswa memiliki laptop spesifikasi tinggi.
- **Modern Techy Minimalist**: Antarmuka bersih (*clean*), menghemat ruang (*tidak boros ruang*), dan bebas dari elemen dekoratif yang berlebihan (*no-gradient*).
- **Low Cognitive Load**: Minimalkan teks panjang; gunakan ikonografi dan visual yang intuitif agar siswa tidak perlu berpikir keras untuk menggunakan alatnya.
- **Performance-First**: Memuat instan, interaksi tanpa jeda (*lag-free*).

## 5. Success Metrics
- Waktu muat (*load time*) awal di bawah 2 detik.
- 0 *delay* yang dirasakan saat interaksi drag & drop.
- Siswa dapat menghubungkan 2 PC dalam waktu kurang dari 1 menit setelah mencoba.
