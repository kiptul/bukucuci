# Modul Rak IoT — Kelar

3 saklar → ESP32 → WiFi → API Next.js → Supabase → tampil realtime di layar.

## Wiring

Tanpa resistor tambahan. Tiap saklar cukup 2 kabel:

| Slot | GPIO ESP32 | Kaki lain saklar |
|------|-----------|------------------|
| A1   | GPIO 4    | GND              |
| A2   | GPIO 5    | GND              |
| A3   | GPIO 18   | GND              |

Pakai `INPUT_PULLUP`, jadi:
- saklar tertekan (ada cucian) = **LOW** → terisi
- saklar lepas (kosong) = **HIGH** → kosong

⚠️ Jangan pakai GPIO 0, 2, 12, 15 — itu strapping pin, bisa bikin ESP32 gagal boot.

## Langkah Pemasangan

### 1. Database
Jalankan `rak_slot.sql` di Supabase SQL Editor.
Cek hasilnya: harus muncul 3 baris (A1, A2, A3) dengan status kosong.

### 2. Environment variable
Tambahkan ke `.env.local` (dan ke Vercel saat deploy):

```
SUPABASE_SECRET_KEY=sb_secret_xxxxx
LAUNDRY_ID=uuid_laundry_dari_tabel_laundry
DEVICE_TOKEN=buat_string_acak_panjang
```

Ambil `LAUNDRY_ID` dengan:
```sql
select id from laundry limit 1;
```

Buat `DEVICE_TOKEN` acak:
```bash
openssl rand -hex 24
```

⚠️ `SUPABASE_SECRET_KEY` **tidak boleh** diberi awalan `NEXT_PUBLIC_`.
Kalau bocor ke browser, seluruh database terbuka.

### 3. File aplikasi
- `route.ts` → sudah terpasang di `src/app/api/rak/route.ts`
- `StatusRak.tsx` → sudah terpasang di `src/components/StatusRak.tsx`

Di halaman dashboard (server component):

```tsx
import { createClient } from "@/utils/supabase/server";
import StatusRak from "@/components/StatusRak";

const supabase = await createClient();
const { data } = await supabase
  .from("rak_slot")
  .select("kode, terisi, terakhir_update")
  .order("kode");

<StatusRak awal={data ?? []} />
```

### 4. ESP32
Buka `esp32_kelar/esp32_kelar.ino` di Arduino IDE.
- Board: **ESP32 Dev Module**
- Isi `WIFI_SSID`, `WIFI_PASS`, `DEVICE_TOKEN`
- `API_URL`: saat uji lokal pakai `http://<IP-laptop>:3000/api/rak`,
  setelah deploy ganti ke `https://kelar.vercel.app/api/rak`

Upload, lalu buka Serial Monitor di **115200 baud**.

## Pengujian Bertahap

Uji satu per satu, jangan langsung semua:

**1. Saklar terbaca?**
Buka Serial Monitor, tekan-lepas saklar. Harus muncul `Slot A1 -> TERISI` / `KOSONG`.
Kalau tidak berubah: cek kabel ke GND.
Kalau berubah sendiri berkali-kali: naikkan `DEBOUNCE_MS` ke 100.

**2. API jalan?**
Tes tanpa ESP32 dulu:
```bash
curl -X POST http://localhost:3000/api/rak \
  -H "Content-Type: application/json" \
  -H "x-device-token: TOKEN_KAMU" \
  -d '{"slots":[{"kode":"A1","terisi":true}]}'
```
Harus balas `{"ok":true,"diterima":1}`. Cek Supabase, A1 jadi `terisi = true`.

**3. ESP32 → API?**
Serial Monitor harus menampilkan `Respons: 200`.
- `401` → token tidak cocok
- `-1` → salah URL, atau ESP32 tidak satu jaringan dengan laptop

**4. Realtime?**
Buka dashboard, tekan saklar. Kotak slot harus berubah warna **tanpa refresh**.
Kalau tidak berubah: pastikan `alter publication supabase_realtime add table rak_slot;`
sudah dijalankan.

## Catatan Rancangan

Tiga hal ini sengaja, dan bisa dijelaskan kalau juri bertanya:

1. **Debounce 50 ms** — saklar mekanis memantul saat ditekan; tanpa ini satu tekanan
   terbaca beberapa kali.
2. **Kirim hanya saat berubah**, bukan tiap detik — hemat data dan baterai.
   Ini pemrosesan di sisi perangkat (edge), bukan sekadar sensor pasif.
3. **Heartbeat 30 detik** — supaya sistem tahu perangkat mati, bukan sekadar
   "tidak ada perubahan". Tanpa ini, ESP32 mati terbaca sebagai rak kosong.

## Untuk Video Demo

- Tempel label kertas **A1 / A2 / A3** di tiap slot — tanpa itu penonton tidak
  menghubungkan slot fisik dengan yang di layar
- Kondisi awal dibuat beragam: 1 terisi, 2 kosong
- Adegan inti: taruh cucian di A2 → layar berubah. Angkat → kembali kosong
- Pakai cucian sungguhan (handuk/baju terlipat), jangan kardus
- Rekam split screen: rak di kiri, layar di kanan, satu frame
- Durasi cukup 15–20 detik dari total video 3–5 menit
