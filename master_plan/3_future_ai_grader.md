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

### 2. Lapisan Analisis Kualitatif (Groq LLM API)
- **JS-First Principle**: Untuk memastikan *feedback* yang instan (0 detik) dan tidak memboroskan kuota API, JS bertugas penuh memvonis status benar/salah dan merender Emoji. AI hanya dipanggil pada **kasus tertentu** ketika siswa meminta "Beri Saya Petunjuk/Review Akhir" secara sadar.
- **Efisiensi Token**: Kita akan meminimalkan *payload* JSON yang dikirim ke AI. Kita tidak akan mengirimkan seluruh *state node* React Flow. JS di *client* akan memeras data tersebut menjadi *string* sederhana yang padat.
  - *Contoh Payload Lemah (Boros Token)*: Mengirimkan array X,Y koordinat, properti *style*, dll.
  - *Contoh Payload Optimal (Hemat Token)*: `{"PC1":"192.168.1.1/24", "PC2":"192.168.2.1/24", "Link":"SwitchA", "Status":"Fail_DiffSubnet"}`
- **Penggunaan Groq**: Kita akan menggunakan **Groq API** (menjalankan Llama 3 atau Mixtral) karena arsitektur LPU (*Language Processing Unit*) mereka sangat cepat (*ultra-low latency*) dan batasan token per menit (*rate limit*) gratisnya jauh lebih lega dibanding OpenAI.
- **Contoh Prompt Engine Singkat:**
  > "Siswa mensimulasikan jaringan. Status: Fail_DiffSubnet (PC1 192.168.1.1, PC2 192.168.2.1). Beri petunjuk singkat 1-2 kalimat untuk anak SMK kenapa mereka tidak bisa PING tanpa memberi tahu jawaban spesifiknya."
- **Output:** AI akan membalas dengan teks singkat, "Bagus sekali menyambung kabelnya! Tapi coba cek angka ketiga di IP kalian, apakah sudah sama persis supaya bisa saling sapa?"

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
