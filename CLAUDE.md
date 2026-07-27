# BukuCuci

Aplikasi pencatatan order laundry + notifikasi WhatsApp otomatis.

## Konteks Penting

Ini karya lomba **GEMASTIK 2026 Divisi XI (Pengembangan Bisnis TIK)**.
**Deadline: 10 Agustus 2026.**

Yang dinilai juri: Problem 20%, Pasar 20%, Pitch Deck 20%, **Produk hanya 10%**.
Artinya: aplikasi ini **tidak perlu lengkap**. Cukup jalan mulus untuk direkam
jadi video demo 3-5 menit. Prioritaskan yang kelihatan di video.

**Jangan menambah fitur di luar daftar "Scope" di bawah**, sekalipun terlihat
berguna. Waktu lebih berharga daripada kelengkapan.

## Posisi Produk (memengaruhi keputusan desain)

Riset lapangan 14 laundry di Karawang:
- 8 masih catat di buku tulis, 2 tidak mencatat sama sekali, 4 sudah digital
- **0 dari 10 laundry manual pernah berhasil pindah ke digital.** Yang digital,
  digital sejak hari pertama berdiri.
- Tidak ada yang mau bayar langganan bulanan
- Kompetitor (CuciQu, Kasirco, dll) semua pakai model langganan + minta pemilik
  mengubah seluruh cara kerja sekaligus

Maka posisi BukuCuci: **mengganti buku nota, bukan mengganti seluruh sistem.**
Referensi model: Khatabook (India) & BukuWarung (Indonesia).

Konsekuensi ke produk:
- **Mode berdampingan** — pemilik boleh tetap pakai buku; order lama bisa
  diinput belakangan (`pesanan.sumber = 'DARI_BUKU'`). Ini fitur pembeda utama,
  wajib ada dan wajib kelihatan di demo.
- **Mobile-first.** Kasir laundry kemungkinan hanya punya HP Android murah.
  Desain untuk layar kecil dulu. Tombol besar, form pendek.
- **Tanpa printer.** Nota dikirim sebagai link/pesan WhatsApp, bukan cetak thermal.
- Nomor HP adalah pintu masuk order, bukan field tambahan. Alur input:
  ketik nomor HP → kalau sudah ada, data pelanggan terpanggil; kalau belum,
  buat baru → lanjut pilih layanan.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (PostgreSQL + Auth), RLS aktif di semua tabel
- Deploy: Vercel
- WhatsApp gateway: Fonnte (HTTP POST, non-resmi — cukup untuk lomba)
- PWA (manifest + service worker minimal), bukan APK

Env var (pakai penamaan bawaan Supabase, jangan diubah):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

⚠️ Secret key Supabase TIDAK BOLEH dipakai di client atau diberi prefix
`NEXT_PUBLIC_`. Semua akses data lewat RLS.

## Database

Schema sudah dibuat di Supabase (lihat `schema_laundry.sql`). 9 tabel:

| Tabel | Catatan |
|---|---|
| `laundry` | profil usaha, footer nota |
| `pengguna` | terhubung ke `auth.users`, punya `laundry_id` & `peran` |
| `pelanggan` | `no_hp` unik per laundry, **auto-normalisasi ke format 62...** |
| `layanan` | nama, satuan (kg/pcs), harga |
| `pesanan` | punya `sumber` (BARU/DARI_BUKU) dan `slot_rak` (belum dipakai) |
| `pesanan_item` | snapshot `nama_layanan` & harga |
| `riwayat_status` | **terisi otomatis via trigger** tiap status berubah |
| `notifikasi_log` | `unique (pesanan_id, jenis)` — pengaman anti kirim dobel |
| `template_pesan` | teks pesan per jenis, placeholder `{nama}` dan `{kode}` |

Enum status pesanan: `MASUK` → `SIAP` → `DIAMBIL` (+ `BATAL`).

Tiga hal yang jangan diubah tanpa alasan kuat:
1. Trigger `riwayat_status` — dipakai cron untuk hitung H+1/H+3/H+7
2. `unique (pesanan_id, jenis)` di `notifikasi_log` — kalau dilepas, cron bisa
   spam pelanggan dan nomor WhatsApp bisa diblokir
3. Fungsi `normalisasi_hp()` — mencegah satu pelanggan terdaftar berkali-kali

RLS memakai fungsi `laundry_saya()` yang membaca `laundry_id` dari tabel
`pengguna` berdasarkan `auth.uid()`.

## Scope — HANYA INI

- [ ] Login (email + password, Supabase Auth)
- [ ] Input order: nomor HP → nama → layanan → qty → total
- [ ] Daftar order + pencarian (nama / nomor HP / kode)
- [ ] Ubah status: MASUK → SIAP → DIAMBIL
- [ ] Kirim WhatsApp otomatis saat status jadi SIAP
- [ ] Reminder terjadwal H+1, H+3, H+7 (cron)
- [ ] Pesan terima kasih otomatis saat status jadi DIAMBIL
- [ ] Mode berdampingan: input order lama dari buku
- [ ] PWA (installable ke home screen)

## JANGAN dibuat

Laporan keuangan, dashboard omzet, grafik, cetak nota thermal, manajemen
multi-user/role, halaman tracking untuk pelanggan, status cuci & setrika
terpisah, fitur IoT rak, multi-cabang, ekspor Excel, dark mode.

Semua itu masuk slide roadmap, bukan kode.

## Gaya Kode

- Penamaan tabel/kolom database: **bahasa Indonesia** (sudah terlanjur, konsisten saja)
- Komentar & pesan UI: bahasa Indonesia
- Utamakan Server Component; pakai `"use client"` hanya untuk bagian interaktif
- Mutasi data pakai Server Actions
- Jangan install library UI baru — cukup Tailwind
