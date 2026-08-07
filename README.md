# Kelar

Buku nota digital untuk laundry: catat order, ubah statusnya, dan pelanggan
dikabari sendiri lewat WhatsApp. Dibangun dengan Next.js dan Supabase.

Satu pemasangan melayani banyak laundry sekaligus, dipisah per `laundry_id` dan
dijaga Row Level Security. Tidak ada pendaftaran mandiri — akun dibuat lewat
konsol superadmin.

## Memasang dari nol

### 1. Siapkan Supabase

Buat project baru di [supabase.com](https://supabase.com), lalu jalankan berkas
SQL di folder `database/` sesuai urutan di
[`database/README.md`](database/README.md). Urutannya penting dan tidak dijaga
alat apa pun — baca berkas itu dulu, ada beberapa jebakan yang tidak
memunculkan pesan galat.

### 2. Isi kredensial

```bash
cp .env.example .env.local
```

Isi nilainya mengikuti keterangan di dalam berkas itu. Yang wajib ada supaya
aplikasi bisa jalan: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, dan `SUPABASE_SECRET_KEY`.
`FONNTE_TOKEN` hanya dibutuhkan kalau ingin WhatsApp benar-benar terkirim.

> `SUPABASE_SECRET_KEY` menembus seluruh RLS. Ia hanya dipakai di server, di
> balik `pastikanSuperAdmin()`. Jangan pernah memberinya awalan `NEXT_PUBLIC_`.

### 3. Jalankan

```bash
npm install
npm run dev
```

### 4. Buat superadmin pertama

Konsol di `/admin` adalah satu-satunya pintu untuk mendaftarkan laundry dan
akunnya, jadi akun ini harus ada sebelum aplikasi bisa dipakai siapa pun.

Buat akunnya di dashboard Supabase — **Authentication → Users → Add user**,
centang **Auto Confirm User** — lalu tautkan:

```sql
insert into pengguna (id, laundry_id, nama, peran)
select id, null, 'Nama Anda', 'SUPER_ADMIN'
from auth.users
where email = 'email-yang-tadi-didaftarkan'
on conflict (id) do update
  set laundry_id = null, peran = 'SUPER_ADMIN';
```

Login dengan akun itu akan langsung mendarat di `/admin`.

## Menaikkan ke Vercel

Impor repo ini di Vercel, salin semua isi `.env.local` ke **Settings →
Environment Variables**, lalu deploy.

Reminder terjadwal berjalan lewat cron yang sudah terdaftar di `vercel.json`
(tiap hari pukul 02:00). Ia memanggil `/api/cron/reminder`, yang menolak
permintaan tanpa `CRON_SECRET` yang benar — jadi pastikan variabel itu terisi,
kalau tidak remindernya tidak akan pernah jalan.

## Perintah

```bash
npm run dev
npm run build
npm run lint
npm start
```

## Peta folder

| Folder | Isi |
|---|---|
| `src/app` | halaman, route API, layout, dan Server Actions |
| `src/components` | `forms/`, `layout/`, `navigation/`, `ui/` |
| `src/lib` | akses Supabase, logika bisnis, format, tipe data |
| `database` | berkas SQL — dijalankan manual, lihat README di dalamnya |
| `perangkat` | firmware ESP32 modul rak IoT dan panduan pasangnya |
| `public` | aset statis, ikon PWA, service worker |
| `vibe` | aturan kerja dan daftar tugas |
| `bisnis` | hitungan biaya modul rak IoT |

## Catatan teknis

Beberapa keputusan yang tampak aneh sebenarnya disengaja dan ada alasannya di
komentar berkas terkait:

- **Service worker tidak mencegat perpindahan halaman** (`public/sw.js`).
  Next.js mengirim halaman secara bertahap; mencegatnya membuat halaman
  berhenti selamanya di rangka pemuatan tanpa satu pun error di konsol.
- **Server Action dilewatkan begitu saja oleh proxy** (`src/proxy.ts`).
  Mengalihkannya membuat klien menerima respons yang tidak bisa dibaca dan
  aksinya batal jalan.
- **`api/cron` dan `api/rak` dikecualikan dari proxy.** Keduanya dipanggil
  mesin, bukan browser, dan punya otentikasi sendiri.
