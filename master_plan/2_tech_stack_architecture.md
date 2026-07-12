# Tech Stack & Architecture Blueprint

## 1. System Architecture: Serverless & Real-time
Aplikasi ini beroperasi tanpa database relasional (SQL) tradisional. Semuanya mengandalkan ekosistem serverless, edge network, dan WebSockets untuk menjamin *performance-first* dan interaktivitas.

### Core Stack
- **Frontend Framework**: Next.js (App Router). Sangat optimal untuk routing, *caching*, dan deployment mudah di Vercel.
- **UI & Canvas Engine**: React Flow (`@xyflow/react`). Ringan, sangat kustomisasi untuk membuat diagram dan topologi jaringan (*node-based*).
- **Styling**: Tailwind CSS. Digunakan dengan prinsip *Modern Techy Minimalist* (tanpa gradient, *flat design*, hemat ruang).
- **Icons**: Lucide React.
- **State Management (Lokal)**: Zustand. Dipilih karena ukurannya sangat kecil dan performanya lebih cepat dari Redux atau Context API. LocalStorage digunakan murni untuk menyimpan status login statis guru (`787898`).

## 2. Deployment & Hosting Strategy
- **Platform**: Vercel. Sangat ideal untuk Next.js. Vercel Edge Network menjamin aplikasi termuat seketika di gawai siswa di mana pun mereka berada.
- **Zero-DB Approach**: Karena ini difokuskan pada simulasi, state tidak perlu disimpan permanen secara cloud untuk tahap awal. Setiap sesi (*playground*) bersifat *ephemeral* (sementara), atau tersimpan di *browser cache/local storage* masing-masing anak.

## 3. Real-time Engine (Live Simulator Mode)
Untuk mengatasi keterbatasan *LocalStorage* yang tidak bisa berbagi *state* antar perangkat, kita menggunakan layanan *Real-time BaaS (Backend as a Service)* yang sangat ringan:
- **Pilihan Utama**: **Pusher** atau **PartyKit**.
- **Mekanisme**:
  - Saat guru Usman Aziz login (via LocalStorage token verifikasi `787898`), ia memicu status `online` di *room* WebSocket (misal channel `kelas-tjkt-2`).
  - Browser siswa mendengarkan *event* `online` tersebut dan menampilkan tombol "Join Kelas".
  - Saat mode *Live Simulator* aktif, setiap pergeseran *node* (PC/Switch) atau pengaturan IP oleh guru akan mengirim *event WebSocket* yang langsung merender ulang *React Flow Canvas* di browser siswa dalam hitungan milidetik (*delay* 0).
  - Siswa dalam mode ini hanya memiliki hak akses *read-only* pada kanvas.
