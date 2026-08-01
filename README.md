# Kelar

Aplikasi operasional laundry berbasis Next.js dan Supabase.

## Struktur utama

- `src/app` — halaman, route API, dan layout Next.js
- `src/components/layout` — header dan navigasi aplikasi
- `src/components/forms` — form login, admin, dan order
- `src/components/ui` — komponen UI yang dipakai lintas halaman
- `src/components/navigation` — konfigurasi menu navigasi
- `src/lib` — helper, akses Supabase, logika bisnis, dan tipe data
- `database` — schema dan script setup database
- `perangkat` — dokumentasi serta firmware ESP32
- `public` — aset statis dan service worker

## Menjalankan lokal

Salin `.env.example` menjadi `.env.local`, isi kredensial yang diperlukan, lalu jalankan:

```bash
npm install
npm run dev
```

Perintah lain yang tersedia:

```bash
npm run lint
npm run build
npm start
```
