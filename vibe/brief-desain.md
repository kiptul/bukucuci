# Brief desain — Kelar

Berkas ini untuk ditempel ke Claude saat meminta mockup UI/UX. Isinya sengaja
lengkap: tanpa konteks produk dan aturan visualnya, yang keluar adalah dasbor
SaaS generik yang tidak nyambung dengan aplikasi ini.

Cara pakai: tempel bagian **Brief** di bawah, lalu tambahkan satu halaman yang
sedang digarap dari bagian **Halaman**. Satu halaman per permintaan — meminta
delapan sekaligus menghasilkan delapan hal yang dangkal.

---

## Brief

> Saya sedang mendesain ulang aplikasi bernama **Kelar** — buku nota digital
> untuk laundry kecil di Karawang, Indonesia. Tolong buatkan mockup UI untuk
> satu halaman yang saya sebut di bawah.
>
> ### Siapa yang memakai
>
> Kasir laundry, kemungkinan besar hanya punya HP Android murah. Banyak yang
> sebelumnya mencatat di buku tulis. Riset kami ke 14 laundry: 8 masih pakai
> buku, 2 tidak mencatat sama sekali, dan **0 dari 10 laundry manual pernah
> berhasil pindah ke aplikasi**. Jadi aplikasi ini memposisikan diri
> **mengganti buku nota, bukan mengganti seluruh cara kerja**.
>
> Konsekuensinya ke desain: layar harus bisa dipakai sambil berdiri di konter,
> satu tangan, sering terburu-buru. Kalau ragu antara "terlihat canggih" dan
> "cepat dibaca", pilih yang kedua.
>
> ### Bahasa visual — metafora nota kertas
>
> Ini bukan tempelan tema, tapi aturan yang mengikat:
>
> - **Sudut siku. Tidak ada sudut membulat sama sekali.** Jangan pakai
>   `rounded-*` apa pun. Satu-satunya pengecualian yang ada di aplikasi adalah
>   titik indikator kecil yang memang lingkaran.
> - **Monospace untuk label, kode order, angka, dan status** — huruf kecil
>   ditulis kapital dengan jarak antarhuruf lebar (`letter-spacing` 0.22em),
>   ukuran 10–11px. Sans-serif untuk kalimat.
> - Angka memakai `font-variant-numeric: tabular-nums` supaya kolom angka lurus.
> - **Aksen hijau dipakai hemat**: garis pendek, titik, cincin fokus, penanda
>   status. Bukan untuk bidang besar.
> - Ada butiran serat kertas sangat tipis (opacity 0.035) di seluruh layar.
> - Garis titik-titik penghubung antara nama layanan dan harganya, seperti
>   daftar harga di nota cetak.
> - Tepi sobek bergerigi di dasar kartu nota.
> - Gerak pendek saja, 0.08–0.18 detik.
>
> ### Warna (jangan ganti, ini sudah dipakai di seluruh aplikasi)
>
> ```
> --color-kertas:        #e6e0d3   latar halaman
> --color-kertas-terang: #f5f2ea   bidang kerja
> --color-tinta:         #17161a   teks utama, tombol utama
> --color-tinta-2:       #575146   teks sekunder
> --color-tinta-3:       #8b8477   teks tersier, placeholder
> --color-garis:         #d2caba   garis pemisah, batas kotak
> --color-aksen:         #0b6b5b   aksen hijau
> --color-aksen-muda:    #dfeae5   latar aksen
> ```
>
> Tiga tingkat kedalaman, bukan dua: latar paling gelap, bidang kerja di
> tengah, kartu putih paling terang. Tanpa jarak warna itu kartu tidak terbaca
> sebagai lembar terpisah.
>
> Huruf: IBM Plex Sans dan IBM Plex Mono.
>
> ### Aturan teknis
>
> - **Mobile-first.** Desain lebar 375px dulu, baru versi lebarnya. Sasaran
>   sentuh minimal 3rem.
> - Hanya Tailwind. Jangan pakai pustaka komponen apa pun.
> - Seluruh teks antarmuka **bahasa Indonesia**.
> - Mode gelap tidak ada dan memang tidak diinginkan.
>
> ### Cara menulis teks antarmuka
>
> - Sebutkan apa yang terjadi dan langkah berikutnya. Pesan galat tidak minta
>   maaf dan tidak samar.
> - Kata kerja aktif. Satu nama untuk satu tindakan dari awal sampai akhir alur.
> - **Layar kosong adalah ajakan bertindak**, bukan pemberitahuan bahwa kosong.
>
> ### Yang sengaja TIDAK ada — jangan didesain
>
> Laporan keuangan, dashboard omzet, grafik apa pun, cetak nota thermal,
> halaman tracking untuk pelanggan, status cuci dan setrika terpisah,
> multi-cabang, ekspor Excel, mode gelap, dan **pendaftaran mandiri**.
>
> Ketiadaannya disengaja. Jangan pula menaruh tautan yang mengesankan hal-hal
> itu ada — elemen yang tidak berfungsi lebih buruk daripada elemen yang tidak
> ada.
>
> ### Yang saya minta
>
> Buatkan mockup HTML+Tailwind yang bisa saya lihat langsung, lebar 375px dan
> versi lebarnya. Sertakan **semua keadaan layar**, bukan cuma keadaan ideal:
> kosong, sedang memuat, galat, dan penuh data. Pakai data contoh berbahasa
> Indonesia yang masuk akal untuk laundry (nama orang Indonesia, harga rupiah,
> nomor HP 08xx).

---

## Halaman

Tambahkan **satu** dari daftar ini ke akhir brief.

### 1. `/dashboard` — daftar order
Layar utama, dibuka berpuluh kali sehari. Isinya: kolom pencarian (nama, nomor
HP, atau kode order), saringan status (Semua / Masuk / Siap / Diambil / Batal),
lalu daftar order terbaru. Tiap baris: kode order, nama pelanggan, nomor HP,
tanggal, total harga, lencana status, dan penanda belum bayar.
Keadaan: belum ada order sama sekali; hasil pencarian kosong; daftar panjang.

### 2. `/order/baru` — catat order
**Nomor HP adalah pintu masuk, bukan field tambahan.** Alurnya: ketik nomor HP →
kalau pelanggan sudah ada, datanya terpanggil → kalau belum, buat baru → lanjut
pilih layanan dan jumlahnya → total muncul.
Ada juga penanda "order lama dari buku" untuk memasukkan order yang terlanjur
tercatat di buku tulis — ini fitur pembeda utama, jangan disembunyikan.

### 3. `/order/[id]` — detail order
Berbentuk nota: kode order, pelanggan, daftar layanan dengan garis titik-titik
ke harganya, subtotal, diskon, total, dan tepi sobek di dasarnya.
Tindakan: ubah status (Masuk → Siap → Diambil, satu arah), tandai lunas (boleh
bolak-balik), kirim ulang pesan WhatsApp yang gagal.
Keadaan: belum bayar; sudah lunas; dibatalkan; ada pesan WhatsApp gagal terkirim.

### 4. `/rak` — rak IoT
Rak fisik berisi sensor yang melaporkan slot mana terisi. Isinya: status
perangkat (terhubung / tidak melapor), kisi slot A1–A3 yang bisa dibaca
sekilas, daftar "perlu dibereskan" (slot terisi tapi belum ketahuan punya
siapa, atau cucian sudah menginap lebih dari 3 hari), daftar tautan slot↔order,
kelola slot, dan setelan WiFi perangkat.
Keadaan: perangkat mati; belum ada slot terpasang; rak penuh; ada cucian
mengendap.

### 5. `/pengaturan` — menu
Halaman menu sederhana, bercabang ke tiga halaman di bawah. Juga tempat keluar
dari akun.

### 6. `/pengaturan/layanan` — layanan & harga
Daftar layanan yang bisa diubah: nama, harga, satuan (kg/pcs), aktif/tidak.
Ada tambah layanan baru. Peringatan kalau ada layanan aktif berharga 0.
Keadaan: belum ada layanan sama sekali.

### 7. `/pengaturan/pesan` — template WhatsApp
Teks pesan otomatis per jenis (cucian siap, terima kasih, pengingat H+1/H+3/H+7)
dengan placeholder `{nama}` dan `{kode}`. Perlu ada cara melihat contoh hasil
jadinya.

### 8. `/pengaturan/usaha` — profil usaha
Nama laundry, alamat, telepon, dan footer nota.
