# Modul Rak IoT — Kelar

3 sensor → papan → WiFi → API Next.js → Supabase → tampil realtime di layar.

Ada dua varian firmware. Sisi server sama persis untuk keduanya — kontrak
`api/rak`, tabel, dan komponen layar tidak berubah:

| Folder | Papan | Sensor |
|---|---|---|
| `esp32_kelar/` | ESP32 DevKit V1 | saklar mekanis |
| `esp8266_kelar/` | ESP8266 NodeMCU / ESP-12E | modul IR MH-Sensor-Series "Flying-Fish" |

## Wiring — ESP32 + saklar

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

## Wiring — ESP8266 + sensor IR

Tiap modul IR butuh 3 kabel:

| Slot | Pin NodeMCU | GPIO |
|------|-------------|------|
| A1   | D1          | 5    |
| A2   | D2          | 4    |
| A3   | D5          | 14   |

VCC tiap modul → **3V3**, GND → GND, OUT → pin di tabel.

Modul IR ini active-LOW, jadi polaritasnya kebetulan sama dengan saklar:
- ada objek di depan sensor = **LOW** → terisi
- tidak ada objek = **HIGH** → kosong

⚠️ Ambil VCC dari pin **3V3, bukan VIN/5V**. Modul memang jalan di 5V, tapi
kalau diberi 5V pin OUT-nya ikut mengeluarkan 5V — sementara GPIO ESP8266 bukan
5V-tolerant.

⚠️ Jangan pakai D3, D4, D8 — strapping pin, bisa bikin papan gagal boot. D0
(GPIO16) juga tidak bisa: pin itu tidak punya pull-up internal, jadi
`INPUT_PULLUP` diam-diam tidak berpengaruh di sana.

Jangkauan deteksi diatur lewat potensio di modul, kira-kira 2–30 cm. Setel
sambil melihat LED indikator di modul: LED menyala saat objek terdeteksi.

## Langkah Pemasangan

### 1. Database
Jalankan `database/rak_slot.sql` di Supabase SQL Editor.
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

### 4a. ESP32 (Arduino IDE)
Buka `esp32_kelar/esp32_kelar.ino` di Arduino IDE.
- Board: **ESP32 Dev Module**
- Isi `WIFI_SSID`, `WIFI_PASS`, `DEVICE_TOKEN`
- `API_URL`: saat uji lokal pakai `http://<IP-laptop>:3000/api/rak`,
  setelah deploy ganti ke `https://laundry.iptul.my.id/api/rak`

Upload, lalu buka Serial Monitor di **115200 baud**.

### 4b. ESP8266 (PlatformIO)
Buka folder `esp8266_kelar/` sebagai project PlatformIO — **folder itu saja,
bukan akar repo Kelar**. Papan, port, dan baud sudah diatur di `platformio.ini`.

Kredensialnya tidak ditulis di `.ino`, tapi di `rahasia.h` yang diabaikan git —
pola yang sama dengan `.env.local`. Repo ini punya remote di GitHub, dan
`DEVICE_TOKEN` adalah satu-satunya pengaman `api/rak`; sekali ter-commit ia
harus dianggap bocor dan diganti.

Kalau `rahasia.h` belum ada (mis. sehabis clone), salin contekannya lalu isi:

```bash
cp rahasia.contoh.h rahasia.h
```

Setelah itu:

```bash
cd ~/Project/kelar/perangkat/esp8266_kelar
pio run -t upload && pio device monitor
```

Kalau upload gagal dengan `Permission denied`, akun belum masuk grup
`dialout` — jalankan `sudo usermod -aG dialout $USER` lalu logout–login.

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

**3b. Perangkat diam total setelah buka serial monitor?**
Gejalanya khas: lampu daya menyala, tapi tidak ada satu pun laporan masuk dan
Serial Monitor kosong. Ini bukan firmware hang.

Pada NodeMCU, jalur **RTS tersambung ke RST** lewat rangkaian auto-reset. Program
yang menutup port serial dengan RTS masih ditegaskan meninggalkan papan dalam
kondisi reset — hidup listriknya, berhenti prosesornya, dan tidak ada gejala
lain yang menunjukkan sebabnya.

Lepaskan dengan mencabut-colok USB, atau dari Python:

```python
import serial
s = serial.Serial("/dev/ttyUSB0", 115200)
s.dtr = False; s.rts = False
s.close()
```

Kalau menulis skrip pembaca serial sendiri, lepaskan kedua jalur itu di blok
`finally` — bukan cuma saat membuka port.

**4. Realtime?**
Buka dashboard, tekan saklar. Kotak slot harus berubah warna **tanpa refresh**.
Kalau tidak berubah: pastikan `alter publication supabase_realtime add table rak_slot;`
sudah dijalankan.

## Catatan Rancangan

Tiga hal ini sengaja, dan bisa dijelaskan kalau juri bertanya:

1. **Debounce** — 50 ms di varian saklar, 150 ms di varian IR. Saklar mekanis
   memantul saat ditekan sehingga satu tekanan terbaca beberapa kali. Sensor IR
   tidak memantul, tapi cucian yang bergoyang di batas jangkauan membuat
   pembacaan bergetar lebih lambat, jadi ambangnya justru perlu lebih longgar.
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
