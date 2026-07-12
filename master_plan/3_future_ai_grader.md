# Future Projection: Auto-Grader & ML/AI Integration

## Latar Belakang
Di masa depan, setelah siswa membangun topologi jaringan di *Playground*, diperlukan sistem "Review" otomatis untuk menilai apakah konfigurasi IP, Subnetting, dan desain jaringan mereka sudah tepat atau belum.

## Permasalahan Penggunaan Python (Traditional ML)
Menggunakan Machine Learning tradisional berbasis Python (seperti TensorFlow/Scikit-learn) untuk sistem penilaian ini **sangat tidak disarankan** (berlebihan/overkill). Konsep *networking* (seperti IP yang harus 1 subnet agar bisa diping via Switch) merupakan **hukum matematika deterministik**, bukan pola probabilistik yang membutuhkan pelatihan model saraf tiruan. 

Memaksa penggunaan Python akan memaksa kita membuat Backend API Server tersendiri, yang berlawanan dengan arsitektur *Zero-DB / Serverless* yang sudah efisien di Vercel.

## Solusi Tech Lead: Deterministic Algorithm + LLM API
Sistem "Auto-Grader" akan dirancang menggunakan kombinasi dua lapisan ringan:

### 1. Lapisan Logika Deterministik (JavaScript/TypeScript)
- Algoritma *Graph Traversal* sederhana (DFS/BFS) akan berjalan secara instan di browser (sisi klien) untuk memvalidasi:
  - Apakah PC 1 dan PC 2 terhubung ke *node* Switch yang sama?
  - Apakah IP PC 1 dan IP PC 2 berada dalam *network range* yang sama (Subnet Mask Check)?
- Algoritma ini akan langsung menghasilkan skor pasti (Misal: 100/100).

### 2. Lapisan Analisis Kualitatif (LLM / Generative AI API)
- Alih-alih membuat model Python sendiri, Next.js cukup memanggil API eksternal (seperti OpenAI GPT-4o-mini atau Google Gemini Flash) via Vercel Edge Function.
- Kita mengirimkan JSON berisi topologi jaringan siswa (Nilai Skor, IP yang digunakan, kesalahan koneksi) dan mem-prompt AI untuk memberikan narasi *feedback* pedagogis yang ramah.
- **Contoh Prompt Engine:**
  > "Berperanlah sebagai guru SMK. Siswa ini mendapatkan nilai 80. Mereka menggunakan IP 192.168.1.1 dan 192.168.2.1 di Switch yang sama, yang mana beda network. Beri pujian singkat karena mereka berhasil menyambung kabel, tapi jelaskan dengan bahasa sederhana anak SMK kenapa IP-nya tidak bisa saling PING."
- **Output:** AI akan membalas dengan teks, "Bagus sekali kerjamu menyambung kabel! Tapi coba cek lagi IP-nya ya, supaya bisa nyambung, ketiganya harus di angka 192.168.1.x."

### 3. Visual Feedback Mechanism (Status Emoticon)
Sebagai pelengkap narasi teks, sistem akan memodifikasi UI dari *node* (perangkat) di *React Flow Canvas* dengan menyematkan status emoji untuk merepresentasikan kondisi jaringan secara kaya dan intuitif (tanpa teks rumit):

**Kondisi Koneksi & Sukses:**
- 🟢 / ✅ **Centang Hijau**: Perangkat terhubung sempurna, PING sukses, konfigurasi IP benar.
- 🚀 **Roket**: Jalur jaringan sangat optimal (kecepatan maksimal tanpa hambatan).
- 🤝 **Jabat Tangan**: Negosiasi sukses (misal: *DHCP Request* berhasil mendapat IP, atau koneksi TCP/IP terbentuk).

**Kondisi Gangguan & Kesalahan (*Warnings*):**
- 😰 **Keringetan**: Sedikit masalah (*bottleneck*, paket agak lambat, atau Gateway belum diisi namun IP lokal sudah benar).
- 🐢 **Kura-kura**: Koneksi sangat lambat (*High Latency/Ping*).
- 👯 **Orang Kembar (Duplicate)**: Terjadi *IP Conflict* (dua PC diset dengan IP Address yang sama persis).
- ❓ **Tanda Tanya**: *Host Unreachable* (Berada di network yang berbeda, tidak ada router yang menghubungkan).

**Kondisi Fatal & Mati (*Errors*):**
- ❌ **Tanda Silang**: Topologi tidak valid, beda segmen IP sama sekali, atau kabel salah port.
- ✂️ **Gunting**: Kabel terputus (*Link Down* / *Cable Disconnected*).
- 💀 **Tengkorak (Dead)**: Terjadi *broadcast storm* (akibat *looping* Switch), perangkat mati, atau *overload* sangat parah.

Pendekatan visual instan dengan banyak *case* ini akan merangsang rasa ingin tahu siswa layaknya bermain *game*.

## Kesimpulan Keunggulan
- **Tanpa Server Python**: Hemat biaya server, tetap serverless di Vercel.
- **Lebih Cerdas & Humanis**: Teks dari LLM API jauh lebih natural daripada *if-else* teks statis, cocok dengan kebutuhan siswa yang susah diajak berpikir keras.
