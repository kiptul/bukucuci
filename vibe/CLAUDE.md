# Kelar

Aplikasi pencatatan order laundry + notifikasi WhatsApp otomatis.

Sasarannya perangkat lunak yang dipakai laundry sungguhan tiap hari, bukan
purwarupa demo. Kalau ragu antara "cepat selesai" dan "aman dipakai orang
lain", pilih yang kedua.

## Posisi Produk (memengaruhi keputusan desain)

Riset lapangan 14 laundry di Karawang:
- 8 masih catat di buku tulis, 2 tidak mencatat sama sekali, 4 sudah digital
- **0 dari 10 laundry manual pernah berhasil pindah ke digital.** Yang digital,
  digital sejak hari pertama berdiri.
- Tidak ada yang mau bayar langganan bulanan
- Kompetitor (CuciQu, Kasirco, dll) semua pakai model langganan + minta pemilik
  mengubah seluruh cara kerja sekaligus

Maka posisi Kelar: **mengganti buku nota, bukan mengganti seluruh sistem.**
Referensi model: Khatabook (India) & BukuWarung (Indonesia).

Konsekuensi ke produk:
- **Mode berdampingan** — pemilik boleh tetap pakai buku; order lama bisa
  diinput belakangan (`pesanan.sumber = 'DARI_BUKU'`). Ini fitur pembeda utama.
- **Mobile-first.** Kasir laundry kemungkinan hanya punya HP Android murah.
  Desain untuk layar kecil dulu. Tombol besar (sasaran sentuh minimal 3rem),
  form pendek.
- **Tanpa printer.** Nota dikirim sebagai link/pesan WhatsApp, bukan cetak
  thermal.
- Nomor HP adalah pintu masuk order, bukan field tambahan. Alur input:
  ketik nomor HP → kalau sudah ada, data pelanggan terpanggil; kalau belum,
  buat baru → lanjut pilih layanan.

## Dua peran saja

| Peran | `laundry_id` | Artinya |
|---|---|---|
| `SUPER_ADMIN` | NULL | pengelola Kelar. Melihat dan mengurus semua laundry lewat `/admin`. |
| `LAUNDRY` | terisi | akun milik satu laundry. **Satu laundry tepat satu akun.** |

`LAUNDRY` adalah akun laundry-nya, bukan jabatan seseorang. Tidak ada hierarki
pemilik/kasir dan tidak ada pembagian hak per orang. Batasan satu akun ditegakkan
oleh unique index `idx_pengguna_satu_akun_per_laundry`, bukan cuma oleh kebiasaan
— jadi konsol admin menyembunyikan formulir pembuatan akun begitu laundry sudah
punya satu.

Jangan membangun manajemen pegawai, pembagian hak per orang, atau jejak "siapa
mengubah apa". Semuanya memecahkan masalah yang tidak ada di model ini.

## Banyak laundry, satu pintu pendaftaran

Satu pasang aplikasi melayani banyak laundry sekaligus, dipisah oleh
`laundry_id` dan dijaga RLS. Tapi **tidak ada pendaftaran mandiri**: akun hanya
dibuat lewat konsol superadmin di `/admin`. Jangan membangun halaman daftar,
verifikasi email, atau alur lupa password tanpa diminta — ketiadaannya
disengaja, bukan pekerjaan yang belum selesai.

Artinya juga: jangan menaruh tautan yang mengesankan hal-hal itu ada. Elemen
yang tidak berfungsi lebih buruk daripada elemen yang tidak ada.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (PostgreSQL + Auth), RLS aktif di semua tabel
- Deploy: Vercel
- WhatsApp gateway: Fonnte (HTTP POST, non-resmi)
- PWA (manifest + service worker minimal), bukan APK

Env var (pakai penamaan bawaan Supabase, jangan diubah):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

⚠️ Secret key Supabase TIDAK BOLEH dipakai di client atau diberi prefix
`NEXT_PUBLIC_`. Ia hanya boleh disentuh di balik `pastikanSuperAdmin()`.

## Database

Schema di `database/schema_laundry.sql`, ditambah `rak_slot.sql` dan
`jaga_hak_pengguna.sql`. Semua dijalankan manual di Supabase SQL Editor.

| Tabel | Catatan |
|---|---|
| `laundry` | profil usaha, footer nota |
| `pengguna` | terhubung ke `auth.users`, punya `laundry_id` & `peran` |
| `pelanggan` | `no_hp` unik per laundry, **auto-normalisasi ke format 62...** |
| `layanan` | nama, satuan (kg/pcs), harga |
| `pesanan` | punya `sumber` (BARU/DARI_BUKU) dan `slot_rak` |
| `pesanan_item` | snapshot `nama_layanan` & harga |
| `riwayat_status` | **terisi otomatis via trigger** tiap status berubah |
| `notifikasi_log` | `unique (pesanan_id, jenis)` — pengaman anti kirim dobel |
| `template_pesan` | teks pesan per jenis, placeholder `{nama}` dan `{kode}` |
| `rak_slot`, `rak_perangkat` | modul rak IoT |

Enum status pesanan: `MASUK` → `SIAP` → `DIAMBIL` (+ `BATAL`).

RLS memakai fungsi `laundry_saya()` yang membaca `laundry_id` dari tabel
`pengguna` berdasarkan `auth.uid()`.

## Empat pengaman yang jangan diubah tanpa alasan kuat

1. **Trigger `riwayat_status`** — dipakai cron untuk hitung H+1/H+3/H+7
2. **`unique (pesanan_id, jenis)` di `notifikasi_log`** — kalau dilepas, cron
   bisa spam pelanggan dan nomor WhatsApp bisa diblokir
3. **Fungsi `normalisasi_hp()`** — mencegah satu pelanggan terdaftar berkali-kali
4. **Trigger `jaga_hak_pengguna`** — mencegah pengguna mengubah `peran` miliknya
   sendiri jadi `SUPER_ADMIN`. Tanpa ini, satu akun laundry bisa mengambil alih data
   seluruh laundry. Fungsinya wajib tetap *security invoker*; menambahkan
   `security definer` membuatnya lolos diam-diam. Baca komentarnya sebelum
   menyentuh.

## Yang sengaja tidak dibuat

Laporan keuangan, dashboard omzet, grafik, cetak nota thermal, halaman tracking
untuk pelanggan, status cuci & setrika terpisah, multi-cabang, ekspor Excel,
dark mode, pendaftaran mandiri.

Kalau salah satunya terasa perlu, tanya dulu — jangan langsung kerjakan.

## Bahasa Visual

Metafornya **nota kertas**, dan itu bukan tempelan: `--color-kertas` /
`--color-tinta`, butiran serat kertas di `body::after`, garis titik-titik
`.penghubung` seperti daftar harga di nota cetak, dan `.tepi-sobek` — tepi
robek di dasar kartu yang mengulang bentuk ikon aplikasi.

Konsekuensinya, dan ini gampang dilanggar tanpa sadar:
- **Sudut siku.** Jangan menambah `rounded-lg`, `rounded-2xl`, dan sejenisnya.
  Satu-satunya pembulatan yang ada `rounded-[2px]` di rangka pemuatan.
- **Mono untuk label, kode order, angka, dan status** — huruf kecil-kapital
  berjarak lebar. Sans untuk kalimat.
- Aksen `--color-aksen` dipakai hemat: garis pendek, titik, cincin fokus.
- Gerak pendek (0.08–0.18s) dan `prefers-reduced-motion` dihormati.

Sebelum menambah gaya baru, cari dulu apakah bahasanya sudah ada. Halaman yang
memakai kosakata visual sendiri membuat aplikasi terasa seperti tambal sulam.

## Gaya Kode

- Penamaan tabel/kolom database: **bahasa Indonesia** (sudah terlanjur,
  konsisten saja)
- Komentar & pesan UI: bahasa Indonesia
- Utamakan Server Component; pakai `"use client"` hanya untuk bagian interaktif
- Mutasi data pakai Server Actions
- Jangan install library UI baru — cukup Tailwind
- Komentar menjelaskan **kenapa**, bukan apa. Kalau ada keputusan yang pernah
  bikin bug halus, tulis bugnya di komentar (lihat `proxy.ts` dan `sw.js`).

## Menulis teks antarmuka

- Sebut apa yang terjadi dan langkah berikutnya. Pesan galat tidak minta maaf
  dan tidak samar.
- Kata kerja aktif, satu nama untuk satu tindakan dari awal sampai akhir alur.
- Layar kosong adalah ajakan bertindak, bukan pemberitahuan bahwa kosong.
