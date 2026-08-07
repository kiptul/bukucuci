# Database Kelar

Semua berkas di folder ini dijalankan **manual** lewat Supabase SQL Editor.
Proyek ini tidak memakai alat migrasi — jadi urutannya tidak dijaga siapa pun
kecuali berkas ini.

## Pasang dari nol

Untuk project Supabase yang masih kosong, jalankan berurutan:

| # | Berkas | Isinya |
|---|---|---|
| 1 | `schema_laundry.sql` | 9 tabel, enum, fungsi, trigger, RLS, dan satu laundry contoh |
| 2 | `jaga_hak_pengguna.sql` | pagar agar akun laundry tidak bisa mengangkat dirinya jadi superadmin |
| 3 | `rak_slot.sql` | modul rak IoT — **lewati kalau tidak memakai rak** |
| 4 | `setup_akun.sql` | menautkan akun login ke laundry |

**Jangan jalankan `peran_laundry.sql`.** Berkas itu migrasi untuk database yang
dibuat sebelum 7 Agustus 2026. Di database baru ia pasti gagal, karena nilai
enum `PETUGAS` yang hendak diganti namanya memang sudah tidak ada.

## Sebelum langkah 4: buat akun loginnya dulu

`setup_akun.sql` hanya **menautkan** akun yang sudah ada — ia tidak membuat akun
login. Buat dulu di dashboard: **Authentication → Users → Add user**, dan
**centang "Auto Confirm User"**. Tanpa centang itu akunnya ada tapi tidak bisa
masuk karena dianggap belum memverifikasi email.

Lalu sesuaikan isi `setup_akun.sql` — email dan nama laundry di dalamnya masih
data demo (`semut@laundry.id`, `Nurul Laundry`, dan seterusnya). Penautannya
mencocokkan berdasarkan email dan nama laundry, jadi kalau tidak diganti, tidak
ada yang cocok dan tidak ada yang tertaut.

Kegagalan seperti itu **pernah terjadi dan tidak terlihat**: `join` yang tidak
dapat baris menghasilkan insert nol baris, dan SQL menganggapnya sukses. Akibatnya
superadmin tidak pernah terbuat dan `/admin` tidak bisa dibuka siapa pun. Karena
itu `setup_akun.sql` sekarang berhenti dengan galat kalau superadmin masih kosong.

## Aturan yang jangan dilanggar

Empat hal ini menopang perilaku yang sudah terbukti. Mengubahnya tanpa alasan
kuat akan merusak sesuatu yang tidak langsung kelihatan:

1. **Trigger `riwayat_status`** — mengisi riwayat tiap status berubah. Cron
   membaca tabel itu untuk menghitung H+1/H+3/H+7. Tanpa trigger, reminder
   berhenti bekerja diam-diam.
2. **`unique (pesanan_id, jenis)` di `notifikasi_log`** — penahan kiriman
   WhatsApp dobel. Kalau dilepas, cron bisa mengirim berkali-kali dan nomor
   WhatsApp bisa diblokir.
3. **Fungsi `normalisasi_hp()`** — menyeragamkan nomor ke format `62...`.
   Tanpa itu satu pelanggan bisa terdaftar berkali-kali dengan nomor yang
   sebenarnya sama.
4. **Trigger `jaga_hak_pengguna`** — menahan akun laundry mengangkat perannya
   sendiri. Fungsinya **wajib tetap `security invoker`**. Menambahkan
   `security definer` membuat `current_user` berubah jadi pemilik fungsi,
   pemeriksaannya selalu lolos, dan pagarnya berhenti bekerja tanpa satu pun
   pesan galat.

## Model peran

| Peran | `laundry_id` | Artinya |
|---|---|---|
| `SUPER_ADMIN` | NULL | pengelola Kelar, mengurus semua laundry lewat `/admin` |
| `LAUNDRY` | terisi | akun milik satu laundry |

Satu laundry hanya boleh punya satu akun, dijaga unique index parsial
`idx_pengguna_satu_akun_per_laundry`. Parsial karena baris `SUPER_ADMIN`
ber-`laundry_id` NULL dan tidak boleh saling bentrok.

Isolasi antar laundry dijaga RLS lewat fungsi `laundry_saya()`, yang membaca
`laundry_id` dari tabel `pengguna` berdasarkan `auth.uid()`.

## Migrasi

Berkas yang hanya berlaku untuk database lama, bukan bagian pemasangan baru:

- `peran_laundry.sql` — mengganti nilai enum `PETUGAS` jadi `LAUNDRY` dan
  menambah batasan satu akun per laundry. Jalankan bagian CEK-nya lebih dulu:
  kalau ada laundry yang terlanjur punya dua akun, batasan uniknya akan gagal.
