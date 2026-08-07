# TASKS — Kelar

## Cara Kerja

1. Kerjakan satu tugas per giliran. Sebutkan nomornya sebelum mulai.
2. Selesai berarti sudah dites, bukan sudah ditulis. Centang setelah dites.
3. Kalau menemukan yang perlu dikerjakan di luar daftar ini — tambahkan ke
   bagian bawah dulu, jangan langsung kerjakan.
4. Jangan mengerjakan apa pun di "Yang sengaja tidak dibuat" pada `CLAUDE.md`.

```bash
git add -A && git commit -m "<ringkasan singkat>"
```

## Sudah jalan

Alur inti sudah terpasang dan terpakai: login, input order lewat nomor HP,
daftar order + pencarian + filter, ubah status `MASUK → SIAP → DIAMBIL`,
kirim WhatsApp otomatis saat `SIAP` dan `DIAMBIL`, reminder H+1/H+3/H+7 lewat
cron harian, mode berdampingan (`DARI_BUKU`), penanda lunas/belum bayar, PWA,
konsol superadmin, dan modul rak IoT.

## Menuju siap pakai banyak laundry

- [x] **1. Jalankan `database/jaga_hak_pengguna.sql` di Supabase**
  Menutup celah akun laundry mengangkat dirinya sendiri jadi `SUPER_ADMIN`.
  Terpasang 7 Agustus 2026. Terverifikasi dua lapis: trigger terdaftar di
  `pg_trigger` (`tgenabled` = `O`), dan percobaan naik pangkat dari sesi yang
  menyamar sebagai akun laundry ditolak dengan "Peran tidak bisa diubah dari
  sesi login biasa."

  Sisa satu pemastian: konsol superadmin **masih** bisa membuat akun laundry
  baru (membuktikan allowlist `service_role` tidak ikut terpagari). Hanya bisa
  diuji lewat UI `/admin`, tidak lewat SQL.

- [ ] **2. Ganti isi `.env.example` jadi placeholder**
  Sekarang berisi URL project dan publishable key sungguhan. Key itu memang
  dirancang publik dan dijaga RLS, jadi ini bukan kebocoran — tapi repo ini
  publik dan berkas contoh seharusnya tidak memancing orang memakai project
  orang lain. Selesai kalau: semua nilai jadi placeholder dan README
  menjelaskan cara mengisinya.

- [ ] **3. Uji isolasi antar-laundry**
  Dua laundry, dua akun. Pastikan akun laundry A tidak bisa membaca atau
  mengubah apa pun milik laundry B — lewat UI *dan* lewat PostgREST langsung
  dengan publishable key. Uji semua tabel, termasuk `pesanan_item`,
  `riwayat_status`, `notifikasi_log`, `rak_slot`. Selesai kalau: setiap
  percobaan lintas laundry mengembalikan kosong atau ditolak.

- [ ] **4. Tangani kegagalan Fonnte**
  Sekarang belum jelas apa yang terjadi kalau Fonnte mati, token kedaluwarsa,
  atau nomor pelanggan tidak sah. Tentukan: apakah statusnya tetap berubah
  kalau pesan gagal, apakah kasir diberi tahu, dan apakah ada cara mengirim
  ulang. Selesai kalau: token sengaja dibuat salah, dan aplikasi tetap jalan
  dengan pesan yang jelas ke kasir.

- [ ] **5. Kelola akun laundry dari konsol superadmin**
  Sekarang akun bisa dibuat. Lengkapi yang dibutuhkan untuk pemakaian nyata:
  reset password saat pemilik laundry lupa, nonaktifkan akun laundry yang
  berhenti berlangganan, dan hapus laundry beserta datanya kalau diminta.
  Semua lewat `pastikanSuperAdmin()`.

  Ingat modelnya satu akun satu laundry — jangan tergoda menambah manajemen
  pegawai atau pemindahan orang antar laundry.

- [ ] **6. Rampungkan modul rak IoT**
  Firmware dan endpoint sudah ada. Yang kurang: apa yang terjadi kalau ESP32
  mati atau token salah, cara memasang perangkat kedua, dan panduan pasang
  untuk orang yang bukan penulis kodenya. Selesai kalau: `perangkat/README.md`
  cukup untuk memasang dari nol tanpa bertanya.

- [ ] **7. Tes otomatis untuk bagian yang mahal kalau salah**
  Belum ada tes sama sekali. Prioritaskan yang diam-diam merusak:
  `normalisasiHp()`, `tahapReminder()`, `isiTemplate()`, dan penjaga kirim
  dobel di `notifikasi_log`. Tidak perlu meliputi seluruh UI.

- [ ] **8. README untuk yang memasang, bukan yang menulis**
  Sekarang README menjelaskan struktur folder. Yang dibutuhkan: urutan
  menjalankan berkas SQL, cara membuat superadmin pertama, cara mengisi env
  di Vercel, dan cara memasang cron. Selesai kalau: orang lain bisa memasang
  Kelar dari nol hanya dengan README.

## Ditemukan sambil jalan

Tulis di sini kalau menemukan sesuatu di luar daftar, supaya tidak hilang dan
tidak juga langsung dikerjakan.

- **7 Agu 2026 — `/admin` belum pernah bisa dibuka.** Tabel `pengguna` tidak
  punya baris `SUPER_ADMIN`, dan akun auth-nya pun belum pernah dibuat. Commit
  `eda9d2c` hanya jadi separuh: bagian superadmin di `setup_akun.sql` gagal
  diam-diam karena join ke `auth.users` tidak dapat baris. `setup_akun.sql`
  sekarang berhenti dengan galat kalau ini terulang.

  Konsekuensinya, seluruh konsol superadmin — termasuk pembuatan akun laundry
  yang jadi satu-satunya pintu pendaftaran — **belum pernah teruji sama sekali**.
  Uji menyeluruh begitu akun superadmin-nya ada.
