# Alur & Use Case — Kelar

Peta siapa melakukan apa. Ditulis 7 Agustus 2026, setelah menelusuri seluruh
halaman dan Server Action yang benar-benar ada di kode.

Sasaran yang dipakai menilai: **laundry baru bisa dipasang dan dipakai tanpa
seorang pun menyentuh SQL.**

## Aktor

| Aktor | Punya akun? | Masuk lewat |
|---|---|---|
| **Superadmin** | ya, `peran = SUPER_ADMIN` | `/admin` |
| **Laundry** | ya, `peran = LAUNDRY`, satu per laundry | `/dashboard` |
| **Pelanggan** | tidak | hanya menerima WhatsApp |
| **Cron Vercel** | tidak, pakai `CRON_SECRET` | `/api/cron/reminder` |
| **ESP32 rak** | tidak, pakai `DEVICE_TOKEN` | `/api/rak` |

Pelanggan sengaja tidak punya akun dan tidak punya halaman. Itu keputusan
produk, bukan pekerjaan yang belum selesai.

## Use case: Laundry (pemakai harian)

| # | Use case | Status |
|---|---|---|
| L1 | Masuk dan keluar | ✅ ada |
| L2 | Catat order baru: nomor HP → nama → layanan → qty → total | ✅ ada |
| L3 | Catat order lama dari buku, tanggal mundur | ✅ ada |
| L4 | Lihat daftar order, cari nama/HP/kode, saring status | ✅ ada |
| L5 | Buka detail order | ✅ ada |
| L6 | Ubah status `MASUK → SIAP → DIAMBIL`, atau `BATAL` | ✅ ada |
| L7 | Tandai lunas / kembalikan ke belum bayar | ✅ ada |
| L8 | Kirim ulang WhatsApp yang gagal | ✅ ada |
| L9 | Lihat status rak | ✅ ada |
| **L10** | **Ubah harga layanan** | ❌ **tidak ada — lihat catatan** |
| **L11** | **Tambah / nonaktifkan layanan** | ❌ hanya superadmin |
| **L12** | **Ubah profil usaha** (nama, alamat, telp, footer nota) | ❌ tidak ada di mana pun |
| **L13** | **Ubah template pesan WhatsApp** | ❌ tidak ada di mana pun |
| L14 | Ganti password sendiri | ⛔ **sengaja tidak dibuat** — diarahkan menghubungi admin |
| L15 | Atur slot rak (tambah/ubah kode) | ❌ hanya lewat SQL |
| **L16** | **Terima nota bergambar saat order dibuat** | ❌ belum ada — lihat catatan |

## Use case: Superadmin

| # | Use case | Status |
|---|---|---|
| S1 | Lihat semua laundry beserta kondisinya | ✅ ada |
| S2 | Daftarkan laundry baru (+ 5 template otomatis) | ✅ ada |
| S3 | Buat akun untuk sebuah laundry | ✅ ada |
| S4 | Tambah layanan sebuah laundry | ✅ ada — akan dipindah ke sisi laundry |
| S5 | Aktif/nonaktifkan layanan | ✅ ada — akan dipindah ke sisi laundry |
| S7 | Reset password laundry yang lupa | ✅ ada, 8 Agustus 2026 |
| **S6** | **Ubah profil laundry setelah dibuat** | ❌ tidak ada |
| **S8** | **Nonaktifkan laundry yang berhenti** | ❌ tidak ada |
| **S9** | **Ubah harga layanan** | ❌ tidak ada |

S7 naik jadi wajib begitu diputuskan laundry tidak bisa mengganti passwordnya
sendiri: ia kini satu-satunya jalan pulih dari lupa password, karena alur lewat
email memang sengaja tidak ada.

## Temuan utama: harga tidak bisa diubah siapa pun

Ada `tambahLayanan` dan `ubahAktifLayanan`, tapi **tidak ada** cara mengubah
harga layanan yang sudah ada — tidak oleh laundry, tidak juga oleh superadmin.
Satu-satunya jalan sekarang: nonaktifkan layanan lama, buat layanan baru dengan
harga baru, atau `update` lewat SQL Editor.

Harga laundry berubah. Itu bukan kemungkinan, itu kepastian. Selama celah ini
terbuka, Kelar tidak bisa ditawarkan ke laundry mana pun.

Mengubah harga **aman** dan tidak merusak riwayat, karena `pesanan_item`
menyimpan salinan `nama_layanan` dan harga saat order dibuat. Order lama tetap
memakai harga lamanya.

## Temuan kedua: pembagian kuasa terbalik

Semua pengaturan laundry — layanan, harga, aktif/nonaktif — dikerjakan di
konsol **superadmin**. Artinya tiap kali sebuah laundry menaikkan harga, mereka
harus menghubungi pemilik Kelar.

Itu tidak bisa dijalankan begitu ada lebih dari dua laundry, dan bertentangan
langsung dengan sasaran "siap ditawarkan ke laundry baru".

### Pembagian yang diusulkan

**Superadmin mengurus hal yang memulai atau mengakhiri hubungan:**
daftarkan laundry baru, buat akunnya, reset password kalau lupa, nonaktifkan
yang berhenti, dan lihat kesehatan semua laundry.

**Laundry mengurus seluruh urusan hariannya sendiri:**
profil usaha, layanan dan harga, template pesan WhatsApp, password sendiri,
serta order dan rak yang memang sudah ada.

Alasannya: harga dan teks pesan adalah suara bisnis mereka, bukan suara
pengelola Kelar. Reset password tetap di superadmin karena tidak ada alur lupa
password lewat email — dan memang sengaja tidak dibuat.

## Nota bergambar (L16)

Kelar bernama "buku nota digital" tapi belum pernah mengirim satu pun nota.
Sekarang tidak ada pesan apa pun saat order dibuat — pesan pertama baru muncul
saat status jadi `SIAP`.

**Keputusan: nota dikirim saat order dibuat**, bukan ditempelkan ke pesan
`SIAP`. Itu momen "bukti cucianmu saya terima", pengganti langsung sobekan
kertas yang sekarang. Digabung ke pesan `SIAP`, ia bercampur dengan "cucian
siap diambil" dan kehilangan fungsinya sebagai bukti terima.

Berarti perlu jenis notifikasi baru di enum `jenis_notifikasi`, template baru,
dan satu pesan yang selama ini memang tidak ada.

Tiga ganjalan yang harus dijawab sebelum membangun:

1. **Fonnte mengambil gambar dari URL publik.** Isi nota memuat nama pelanggan,
   nomor HP, rincian, dan total — jadi rutenya perlu token HMAC dari id order
   supaya URL-nya tidak bisa ditebak atau diurutkan, dan harus dikecualikan
   dari proxy seperti `api/cron` dan `api/rak`. **Cek dulu** apakah Fonnte
   menerima unggahan berkas langsung; kalau iya, seluruh masalah ini hilang.
2. **WhatsApp mengompresi gambar.** Notanya harus dirancang untuk layar —
   sedikit baris, angka besar, kontras tinggi — bukan meniru nota thermal
   58 mm yang teksnya rapat.
3. **Menambah waktu.** Render menambah beberapa ratus milidetik ke aksi yang
   sudah punya batas 10 detik ke Fonnte.

Tidak butuh dependensi baru: `next/og` ikut di dalam Next.js, lengkap dengan
satori dan resvg wasm-nya.

## Alur onboarding laundry baru (sasaran)

1. **Superadmin** mendaftarkan laundry: nama, alamat, telp, footer nota.
   Template pesan dan 3 layanan awal ikut tersemai otomatis. ✅
2. **Superadmin** membuat akunnya: email + password awal yang terlihat. ✅
3. **Superadmin** menyerahkan email dan password itu ke pemilik laundry. ✅
4. **Pemilik** masuk, lalu mengisi harga tiga layanan yang sudah ada.
   *(belum ada — L10)*
5. **Pemilik** memeriksa dan menyesuaikan 5 template pesan. *(belum ada — L13)*
6. **Pemilik** mulai mencatat order.

Layanan disemai dengan **harga 0** supaya angka nol di layar menuntut
perhatian. Harga karangan yang kelihatan wajar jauh lebih berbahaya: ia bisa
diam-diam dipakai menagih pelanggan.

## Urutan yang disepakati

Sisanya ditahan sampai 10 Agustus lewat — sebelum itu prioritasnya menjaga alur
demo tidak rusak.

1. ✅ **Semai layanan awal** — dikerjakan 8 Agustus 2026
2. ✅ **S7 reset password di konsol admin** — dikerjakan 8 Agustus 2026
3. **L10 + L11 — layanan & harga di sisi laundry.** Paling menentukan; tanpa
   ini produknya tidak bisa ditawarkan.
4. **L12 — profil usaha**, termasuk baris "untuk ganti password, hubungi admin"
   dengan tautan WhatsApp. Footer nota ikut terkirim ke pelanggan, jadi ini
   terlihat keluar.
5. **L16 — nota bergambar.** Ditaruh setelah L12 karena footer nota ikut
   tercetak di gambarnya; dikerjakan duluan berarti dikerjakan dua kali.
6. **L13 — template pesan.**
7. **S8 — nonaktifkan laundry yang berhenti.**
8. **S6 — ubah profil laundry dari sisi superadmin.** Sebagian tertutup oleh
   L12; kerjakan terakhir.

## Rancangan navigasi pengaturan

Menu bawah tetap tiga item. Pengaturan dipakai dua kali setahun sementara
"Order Baru" dipakai puluhan kali sehari — menaruhnya berdampingan dengan bobot
visual yang sama berbohong soal kepentingannya.

Sebagai gantinya, **nama laundry di header jadi tautan ke `/pengaturan`**,
dengan tanda panah kecil. Di layar besar, "Pengaturan" masuk sidebar, dipisah
garis dari tiga menu utama.

```
/pengaturan            → tiga baris besar
/pengaturan/layanan    → daftar, ubah harga, tambah, nonaktifkan
/pengaturan/pesan      → 5 template WhatsApp
/pengaturan/usaha      → nama, alamat, telp, footer nota
```

Bukan satu halaman panjang: form pendek dan tombol besar lebih ramah di HP
murah daripada satu halaman yang harus digulir melewati tiga bagian.

## Yang tetap tidak dibuat

Pendaftaran mandiri, lupa password lewat email, manajemen pegawai dalam satu
laundry, laporan keuangan, halaman tracking pelanggan. Alasannya di
`vibe/CLAUDE.md`.
