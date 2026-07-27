# TASKS — BukuCuci

## Cara Kerja (WAJIB DIIKUTI)

1. Kerjakan **satu tugas saja** per giliran. Jangan lompat, jangan gabung dua tugas.
2. Sebelum mulai, sebutkan tugas nomor berapa yang sedang dikerjakan.
3. Setelah selesai, berhenti dan laporkan. Tunggu konfirmasi sebelum lanjut ke tugas berikutnya.
4. Kalau tugas selesai dan sudah dites, centang kotaknya di file ini.
5. Jangan mengerjakan apa pun di daftar "JANGAN dibuat" pada `CLAUDE.md`.
6. Kalau merasa ada yang perlu ditambahkan di luar daftar ini — tanya dulu, jangan langsung kerjakan.

Setelah tiap tugas selesai, jalankan:

```bash
git add -A && git commit -m "tugas N: <nama tugas>"
```

## Tahap 1 — Fondasi

- [x] **1. Verifikasi koneksi Supabase**
  Pastikan `.env.local` terbaca dan client Supabase berfungsi. Selesai kalau: halaman utama bisa memanggil `supabase.from("layanan").select()` tanpa error koneksi. Hasil `data: []` (kosong karena RLS) sudah dianggap benar.

- [x] **2. Halaman login**
  Email + password via Supabase Auth. Ada middleware yang menjaga sesi dan mengarahkan user belum login ke `/login`. Selesai kalau: bisa login pakai user yang sudah dibuat di Supabase, lalu diarahkan ke `/dashboard`. Logout juga berfungsi.

- [x] **3. Layout dashboard**
  Kerangka halaman setelah login: header (nama laundry + tombol logout) dan navigasi bawah untuk mobile (Order Baru · Daftar Order). Selesai kalau: tampil rapi di layar HP (lebar 375px) tanpa scroll horizontal.

- [x] **4. Daftar layanan tampil**
  Tarik data dari tabel `layanan` dan tampilkan. Selesai kalau: 3 layanan contoh muncul di layar setelah login. Ini bukti RLS dan relasi `pengguna → laundry` sudah benar.

## Tahap 2 — Inti Order

- [x] **5. Form input order**
  Alur: ketik nomor HP → kalau pelanggan sudah ada, nama terisi otomatis; kalau belum, minta nama → pilih layanan → isi qty → total dihitung otomatis → simpan. Kode order dibuat otomatis. Selesai kalau: order tersimpan di tabel `pesanan` + `pesanan_item`, dan `riwayat_status` otomatis terisi status `MASUK` oleh trigger.

- [x] **6. Daftar order**
  Tampilkan order terbaru di atas. Ada pencarian berdasarkan nama, nomor HP, atau kode order. Ada filter status. Selesai kalau: order yang dibuat di tugas 5 muncul, dan pencarian berfungsi.

- [x] **7. Detail order + ubah status**
  Halaman detail berisi info order dan tombol untuk mengubah status: `MASUK → SIAP → DIAMBIL`. Ada juga tombol `BATAL`. Selesai kalau: status berubah dan tercatat di `riwayat_status` beserta waktunya.

## Tahap 3 — WhatsApp (ini nilai jual produk)

- [x] **8. Fungsi kirim WhatsApp**
  Buat helper `kirimWA()` yang memanggil API Fonnte, lalu mencatat hasilnya ke `notifikasi_log`. Ambil isi pesan dari `template_pesan`, ganti `{nama}` dan `{kode}`. Selesai kalau: ada tombol tes yang berhasil mengirim 1 pesan ke nomor sendiri, dan barisnya tercatat di `notifikasi_log` dengan status `TERKIRIM`.

- [x] **9. Kirim otomatis saat status SIAP**
  Sambungkan perubahan status ke `kirimWA()`. Selesai kalau: klik tombol SIAP → pesan masuk ke HP. Klik dua kali tidak mengirim pesan dobel (dijaga oleh unique constraint).

- [x] **10. Pesan terima kasih saat DIAMBIL**
  Sama seperti tugas 9, tapi untuk status `DIAMBIL`. Selesai kalau: pesan terima kasih terkirim dan tercatat di log.

- [ ] **11. Reminder terjadwal H+1, H+3, H+7**
  Buat route yang bisa dipanggil cron: cari order berstatus `SIAP` yang waktunya sudah lewat 1/3/7 hari (baca dari `riwayat_status`), lalu kirim reminder yang belum pernah dikirim. Selesai kalau: route bisa dipanggil manual dan mengirim reminder yang tepat. Dipanggil dua kali tidak mengirim dobel. Setelah itu daftarkan di `vercel.json` sebagai cron harian.

## Tahap 4 — Pembeda & Finishing

- [ ] **12. Mode berdampingan**
  Di form order, ada opsi "Order lama dari buku": bisa mengisi tanggal masuk secara manual dan menandai `sumber = 'DARI_BUKU'`. Di daftar order, order seperti ini diberi penanda visual. Selesai kalau: bisa memasukkan order lama bertanggal mundur, dan penandanya terlihat jelas di daftar. Ini fitur pembeda utama, jangan dilewat.

- [ ] **13. PWA**
  Tambahkan `manifest.json`, ikon, meta tag, dan service worker minimal. Selesai kalau: di Chrome Android muncul opsi "Add to Home Screen", dan saat dibuka tampil layar penuh tanpa address bar.

- [ ] **14. Data demo + rapikan tampilan**
  Isi 8-10 order contoh dengan status beragam dan tanggal yang masuk akal. Rapikan spasi, ukuran font, dan status kosong. Selesai kalau: aplikasi terlihat seperti sudah dipakai beberapa hari, siap direkam untuk video demo.

## Catatan

- Tugas 8 dan 9 adalah inti video demo. Adegan kuncinya: klik SIAP di layar, lalu notifikasi WhatsApp masuk di HP. Pastikan bagian ini mulus.
- Kalau waktu mepet, yang boleh dikorbankan: tugas 13 dan 14. Yang tidak boleh dikorbankan: tugas 5-12.
