// Contekan. Salin jadi rahasia.h lalu isi nilainya:
//
//   cp rahasia.contoh.h rahasia.h
//
// rahasia.h diabaikan git, berkas ini tidak — jadi jangan pernah menaruh nilai
// asli di sini.

#pragma once

// Hanya bekal awal, dipakai sekali saat flash papan masih kosong. Begitu papan
// pernah tersambung, setelannya tersimpan di flash dan dua baris ini tidak
// dibaca lagi — menggantinya di sini tidak akan berpengaruh. Untuk mengganti
// WiFi, pakai halaman rak atau portal "Kelar-Rak"; lihat README.
//
// Boleh dikosongkan: papan akan langsung membuka portal saat pertama menyala.
#define WIFI_SSID_RAHASIA    "GANTI_NAMA_WIFI"
#define WIFI_PASS_RAHASIA    "GANTI_PASSWORD_WIFI"

// Harus sama persis dengan DEVICE_TOKEN di .env.local dan di Environment
// Variables Vercel. Kalau ketiganya tidak sama, API membalas 401.
#define DEVICE_TOKEN_RAHASIA "GANTI_TOKEN_SAMA_DENGAN_ENV"

// Saat uji lokal pakai IP laptop: http://192.168.1.10:3000/api/rak
#define API_URL_RAHASIA      "https://laundry.iptul.my.id/api/rak"
