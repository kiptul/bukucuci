# RAB Modul Rak IoT — Kelar

Rencana anggaran biaya untuk modul pemantauan rak: 3 saklar → ESP32 → WiFi →
sistem Kelar.

> **Harga di dokumen ini estimasi pasaran marketplace (Tokopedia/Shopee), belum
> diverifikasi ke penjual.** Sebelum masuk proposal atau pitch deck, cek ulang
> minimal 3 penjual dan ganti angkanya. Yang penting dan sudah pasti dari
> dokumen ini adalah **strukturnya** — komponen apa saja yang dibutuhkan dan
> bagaimana biaya berubah saat jumlah slot bertambah.

---

## 1. Prototipe — untuk demo lomba

Satu unit, 3 slot, dirakit tanpa solder supaya cepat.

| # | Item | Qty | Harga satuan | Jumlah |
|---|---|---:|---:|---:|
| 1 | ESP32 DevKit V1 (38 pin) | 1 | 55.000 | 55.000 |
| 2 | Limit switch KW11-3Z (bertuas) | 3 | 4.000 | 12.000 |
| 3 | Kabel serabut 2 core, 5 m | 1 | 12.000 | 12.000 |
| 4 | Kabel jumper male-female (isi 40) | 1 | 12.000 | 12.000 |
| 5 | Kotak proyek plastik | 1 | 15.000 | 15.000 |
| 6 | Adaptor 5V 2A + kabel USB **data** | 1 | 28.000 | 28.000 |
| 7 | Double tape busa + cable ties | 1 | 10.000 | 10.000 |
| 8 | Timah solder & consumable | 1 | 8.000 | 8.000 |
| | **Subtotal** | | | **152.000** |
| | Cadangan komponen rusak (15%) | | | 23.000 |
| | **Total prototipe** | | | **175.000** |

Cadangan 15% bukan formalitas: limit switch murah kadang cacat dari pabrik, dan
ESP32 bisa mati kalau salah colok. Kehabisan komponen H-2 rekaman jauh lebih
mahal daripada 23 ribu.

---

## 2. HPP produksi — per unit, 3 slot

Asumsi beli grosir (10 unit ke atas) dan disolder, jadi tidak perlu jumper.

| # | Item | Qty | Harga satuan | Jumlah |
|---|---|---:|---:|---:|
| 1 | ESP32 DevKit V1 | 1 | 45.000 | 45.000 |
| 2 | Limit switch | 3 | 3.000 | 9.000 |
| 3 | Kabel serabut 2 core, 6 m | 1 | 12.000 | 12.000 |
| 4 | Kotak proyek | 1 | 12.000 | 12.000 |
| 5 | Adaptor 5V + kabel | 1 | 22.000 | 22.000 |
| 6 | Terminal, timah, heatshrink | 1 | 8.000 | 8.000 |
| 7 | Label slot & kemasan | 1 | 7.000 | 7.000 |
| | **Material** | | | **115.000** |
| 8 | Tenaga rakit + uji (1,5 jam @ 20.000) | | | 30.000 |
| | **HPP per unit** | | | **145.000** |

Pemasangan di lokasi (transport + 1 jam kerja): **60.000** — bisa digratiskan
sebagai daya tarik, karena marginnya masih cukup menutupi.

---

## 3. Biaya bertambah jauh lebih lambat daripada nilainya

Ini angka terpenting di seluruh dokumen. Komponen mahal — ESP32, kotak,
adaptor, tenaga rakit — **jumlahnya tetap berapa pun slotnya**. Yang bertambah
cuma saklar dan kabel.

| Paket | Tambahan dari 3 slot | HPP | Kenaikan HPP |
|---|---|---:|---:|
| 3 slot | — | 145.000 | — |
| 6 slot | 3 saklar + 6 m kabel | 166.000 | +14% |
| 9 slot | 6 saklar + 12 m kabel | 187.000 | +29% |

ESP32 DevKit V1 punya cukup GPIO bebas untuk 9 slot tanpa komponen tambahan.

Artinya: naik dari 3 ke 9 slot hanya menambah biaya **29%**, padahal manfaatnya
bagi laundry naik tiga kali lipat. Paket besar justru yang paling menguntungkan
— dan itu kebalikan dari intuisi biasa.

---

## 4. Usulan harga jual

| Paket | HPP | Harga jual | Margin kotor | % Margin |
|---|---:|---:|---:|---:|
| Rak 3 slot | 145.000 | 399.000 | 254.000 | 64% |
| Rak 6 slot | 166.000 | 549.000 | 383.000 | 70% |
| Rak 9 slot | 187.000 | 699.000 | 512.000 | 73% |

Pemasangan gratis dalam kota, 75.000 untuk luar kota.

Angka ini **sekali bayar**, bukan langganan — dan itu bukan kebetulan. Riset
lapangan 14 laundry di Karawang menemukan tidak ada satu pun yang mau membayar
biaya bulanan. Kompetitor (CuciQu, Kasirco) semuanya berlangganan. Modul rak
inilah yang membuat Kelar bisa menghasilkan uang tanpa melanggar temuan itu.

---

## 5. Pendapatan berulang dari WhatsApp

Harga jual: **10.000 per 100 pesan** (Rp100/pesan), dibeli seperti pulsa.

Tiap order menghabiskan rata-rata 2 pesan — kabar cucian siap, dan ucapan
terima kasih saat diambil. Reminder H+1/H+3/H+7 hanya terpakai kalau pelanggan
telat mengambil, jadi tidak dihitung sebagai biaya tetap.

| Ukuran laundry | Order/hari | Pesan/bulan | Pendapatan/bulan |
|---|---:|---:|---:|
| Kecil | 10 | 600 | 60.000 |
| Sedang | 20 | 1.200 | 120.000 |
| Ramai | 40 | 2.400 | 240.000 |

Sifat pendapatan ini penting untuk pitch: **naik hanya kalau laundry-nya ramai.**
Laundry yang sepi membayar sedikit dan tidak merasa dirugikan — beda dengan
langganan bulanan yang tetap menagih walau usahanya sedang lesu.

**Yang belum terhitung:** harga paket Fonnte sebagai modal per pesan. Cek di
dashboard Fonnte, lalu isi tabel ini sebelum dipakai di proposal:

| | Per pesan |
|---|---:|
| Harga jual | 100 |
| Modal (Fonnte) | _cek_ |
| Margin | _hitung_ |

---

## 6. Ringkasan modal awal

Untuk mulai menjual ke 10 laundry pertama:

| Pos | Jumlah |
|---|---:|
| Prototipe demo (1 unit) | 175.000 |
| Stok produksi 10 unit @ 145.000 | 1.450.000 |
| Saldo WhatsApp awal | _sesuai paket Fonnte_ |
| **Total perkiraan** | **± 1.625.000** |

Hosting Vercel dan Supabase masih di paket gratis pada skala ini, jadi belum
menjadi pos biaya.

---

## 7. Asumsi yang harus diuji

Empat hal ini menentukan apakah RAB di atas realistis. Sebaiknya diverifikasi
sebelum dipakai di pitch deck:

1. **Harga komponen** — cek 3 penjual, ambil yang tengah, bukan yang termurah
2. **Modal per pesan WhatsApp** — dari paket Fonnte yang benar-benar dibeli
3. **Waktu rakit 1,5 jam** — ukur saat merakit prototipe pertama; kalau ternyata
   3 jam, HPP naik 30.000 per unit
4. **Kesediaan membayar** — tanyakan langsung ke laundry yang disurvei: apakah
   399.000 sekali bayar itu masuk akal bagi mereka? Angka dari mulut calon
   pembeli jauh lebih kuat di mata juri daripada perhitungan di atas kertas
