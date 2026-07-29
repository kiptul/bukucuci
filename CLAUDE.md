# Kelar

Aturan kerja proyek ini disimpan di `vibe/` supaya akar tetap rapi.
Berkas ini sengaja ditinggal di akar karena Claude Code hanya membaca
CLAUDE.md dari akar proyek — tanpa penunjuk ini, aturannya tidak terbaca.

@vibe/CLAUDE.md

Daftar tugas: `vibe/TASKS.md`

## Peta folder

| Folder | Isi |
|---|---|
| `src/` | kode aplikasi (`app/`, `components/`, `lib/`, `proxy.ts`) |
| `database/` | berkas SQL — dijalankan manual di Supabase SQL Editor |
| `perangkat/` | firmware ESP32 modul rak IoT + panduan pemasangannya |
| `vibe/` | aturan kerja (`CLAUDE.md`) dan daftar tugas (`TASKS.md`) |
| `public/` | aset statis, ikon PWA, service worker |

## Pengaman yang gampang terlanggar

Tiga hal ini bukan preferensi gaya — melanggarnya merusak perilaku yang sudah
terbukti jalan. Rinciannya ada di `vibe/CLAUDE.md`, diringkas di sini kalau-kalau
berkas itu tidak ikut terbaca:

1. Trigger `riwayat_status` — dipakai cron untuk menghitung H+1/H+3/H+7
2. `unique (pesanan_id, jenis)` di `notifikasi_log` — penahan kiriman WhatsApp dobel
3. Fungsi `normalisasi_hp()` — mencegah satu pelanggan terdaftar berkali-kali

Secret key Supabase tidak boleh dipakai di client atau diberi prefix
`NEXT_PUBLIC_`. Rute `api/cron` dan `api/rak` sengaja dikecualikan dari proxy
karena keduanya dipanggil mesin, bukan browser, dan punya otentikasi sendiri.
