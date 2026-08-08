/*
 * Kelar — Pemantauan Rak Laundry
 * ESP8266 (NodeMCU / ESP-12E) + sensor IR MH-Sensor-Series "Flying-Fish"
 *
 * Wiring per slot:
 *   modul VCC -> 3V3      (JANGAN dari VIN/5V — lihat catatan di bawah)
 *   modul GND -> GND
 *   modul OUT -> pin slot
 *
 * Modul IR ini active-LOW: ada objek = LOW -> terisi, kosong = HIGH.
 * Polaritasnya kebetulan sama persis dengan saklar INPUT_PULLUP di
 * esp32_kelar.ino, jadi logika di bawah tidak perlu dibalik.
 *
 * ⚠️ Modul jalan di 3.3V maupun 5V, tapi kalau diberi 5V pin OUT-nya ikut
 * mengeluarkan 5V — sementara GPIO ESP8266 bukan 5V-tolerant. Ambil VCC dari
 * pin 3V3, bukan VIN.
 *
 * --- WiFi ---
 * Setelan WiFi TIDAK lagi ditanam di firmware. Ada dua jalur menggantinya:
 *
 *   1. Portal — kalau gagal menyambung, papan memancarkan WiFi "Kelar-Rak".
 *      Sambungkan HP ke situ, halaman setelan terbuka sendiri. Ini jalur
 *      darurat: dipakai saat WiFi sudah terlanjur berganti dan papan tidak
 *      bisa lagi dihubungi dari mana pun.
 *
 *   2. Titipan dari aplikasi — selagi papan masih online, halaman rak bisa
 *      menitipkan setelan baru lewat balasan api/rak. Berguna kalau kita tahu
 *      WiFi AKAN berganti sebelum ia benar-benar berganti.
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <WiFiManager.h>
#include <memory>

// Password WiFi dan DEVICE_TOKEN ditaruh di berkas terpisah yang diabaikan git.
// Repo ini punya remote di GitHub, dan token itu satu-satunya pengaman
// api/rak — sekali ter-commit ia harus dianggap bocor dan wajib diganti.
//
// Berkas belum ada? Jalankan: cp rahasia.contoh.h rahasia.h
#include "rahasia.h"

// ================= KONFIGURASI =================
const char* API_URL      = API_URL_RAHASIA;
const char* DEVICE_TOKEN = DEVICE_TOKEN_RAHASIA;

// Nama WiFi yang dipancarkan papan saat gagal menyambung. Ini yang dicari
// pemilik laundry di daftar WiFi HP-nya, jadi jangan diubah tanpa memperbarui
// petunjuk di halaman rak dan di perangkat/README.md.
const char* AP_NAMA      = "Kelar-Rak";

// Portal tidak dibiarkan menunggu selamanya. Kalau tidak ada yang mengaturnya
// dalam 3 menit, papan menyalakan ulang dan mencoba lagi — supaya gangguan
// WiFi sesaat tidak berujung papan tersangkut di mode portal sampai ada orang
// yang kebetulan lewat.
const unsigned long PORTAL_TIMEOUT_DETIK = 180;

const int   JUMLAH_SLOT  = 3;

// D1, D2, D5 pada papan NodeMCU. Hindari D0/D3/D4/D8 — D3, D4, dan D8 adalah
// strapping pin yang menentukan mode boot, dan D0 (GPIO16) tidak punya pull-up
// internal sehingga INPUT_PULLUP diam-diam tidak berpengaruh di pin itu.
const int   PIN_SLOT[]   = { 5, 4, 14 };
const char* KODE_SLOT[]  = { "A1", "A2", "A3" };

// Lebih longgar daripada 50 ms milik saklar mekanis. Pantulan saklar selesai
// dalam hitungan milidetik, sedangkan cucian yang bergoyang di batas jangkauan
// sensor membuat pembacaan bergetar jauh lebih lambat.
const unsigned long DEBOUNCE_MS  = 150;
const unsigned long HEARTBEAT_MS = 30000;   // lapor tiap 30 detik walau tidak berubah
// ===============================================

bool bacaanTerakhir[JUMLAH_SLOT];
bool statusStabil[JUMLAH_SLOT];
unsigned long waktuBerubah[JUMLAH_SLOT];
unsigned long heartbeatTerakhir = 0;

void setup() {
  Serial.begin(115200);
  delay(300);

  for (int i = 0; i < JUMLAH_SLOT; i++) {
    // Keluaran modul bertipe push-pull, jadi pull-up sebenarnya tidak
    // diperlukan. Tetap dipasang supaya kabel OUT yang lepas terbaca HIGH
    // (kosong) alih-alih mengambang dan melompat-lompat sendiri.
    pinMode(PIN_SLOT[i], INPUT_PULLUP);
    bool awal = (digitalRead(PIN_SLOT[i]) == LOW);
    bacaanTerakhir[i] = awal;
    statusStabil[i]   = awal;
    waktuBerubah[i]   = 0;
  }

  sambungWifi();
  kirimStatus();
  heartbeatTerakhir = millis();
}

void loop() {
  bool adaPerubahan = false;

  for (int i = 0; i < JUMLAH_SLOT; i++) {
    bool bacaan = (digitalRead(PIN_SLOT[i]) == LOW);

    if (bacaan != bacaanTerakhir[i]) {
      bacaanTerakhir[i] = bacaan;
      waktuBerubah[i]   = millis();
    }

    if (millis() - waktuBerubah[i] > DEBOUNCE_MS && statusStabil[i] != bacaan) {
      statusStabil[i] = bacaan;
      adaPerubahan    = true;
      Serial.printf("Slot %s -> %s\n", KODE_SLOT[i], bacaan ? "TERISI" : "KOSONG");
    }
  }

  if (adaPerubahan || (millis() - heartbeatTerakhir > HEARTBEAT_MS)) {
    kirimStatus();
    heartbeatTerakhir = millis();
  }

  delay(10);
}

void sambungWifi() {
  // Kredensial sengaja DIBIARKAN tersimpan di flash. Versi sebelumnya memakai
  // WiFi.persistent(false) supaya SSID lama tidak dipakai diam-diam — tapi
  // begitu setelan bisa diganti lewat portal dan lewat aplikasi, justru
  // penyimpanan itulah yang membuat gantinya bertahan setelah papan mati.
  WiFi.persistent(true);
  WiFi.mode(WIFI_STA);

  // Bekal awal: kalau flash masih kosong (papan baru, atau baru naik dari
  // firmware yang tidak menyimpan apa-apa) dan rahasia.h masih mencantumkan
  // WiFi, pakai itu sekali supaya pemasangan pertama tidak wajib lewat portal.
#ifdef WIFI_SSID_RAHASIA
  if (WiFi.SSID().length() == 0 && strlen(WIFI_SSID_RAHASIA) > 0) {
    Serial.println("Flash kosong — memakai WiFi dari rahasia.h sebagai bekal awal.");
    WiFi.begin(WIFI_SSID_RAHASIA, WIFI_PASS_RAHASIA);
    delay(100);
  }
#endif

  WiFiManager wm;
  wm.setConfigPortalTimeout(PORTAL_TIMEOUT_DETIK);
  wm.setTitle("Kelar — Modul Rak");

  Serial.println("Menyambung WiFi...");

  // autoConnect memakai kredensial tersimpan. Gagal, ia memancarkan AP_NAMA
  // dan menahan eksekusi di sini sampai ada yang mengaturnya atau waktunya
  // habis — itu memang yang diinginkan: papan tanpa jaringan tidak punya
  // pekerjaan lain yang berguna.
  if (wm.autoConnect(AP_NAMA)) {
    Serial.printf("Tersambung ke %s. IP: %s\n",
                  WiFi.SSID().c_str(), WiFi.localIP().toString().c_str());
  } else {
    Serial.println("Gagal menyambung dan portal kedaluwarsa. Menyalakan ulang.");
    delay(1000);
    ESP.restart();
  }
}

String susunJson() {
  String json = "{\"ssid\":\"";
  json += WiFi.SSID();

  // SSID dilaporkan supaya server bisa membedakan "titipan sudah terkirim"
  // dari "papan benar-benar pindah". Balasan 200 saat titipan dikirim tidak
  // membuktikan apa pun — saat itu papan masih di jaringan lama.
  json += "\",\"slots\":[";

  for (int i = 0; i < JUMLAH_SLOT; i++) {
    if (i > 0) json += ",";
    json += "{\"kode\":\"";
    json += KODE_SLOT[i];
    json += "\",\"terisi\":";
    json += statusStabil[i] ? "true" : "false";
    json += "}";
  }
  json += "]}";
  return json;
}

// Ambil satu nilai string dari balasan JSON server.
//
// Sengaja tidak memakai ArduinoJson: satu-satunya JSON yang pernah dibaca
// papan ini datang dari api/rak — bentuknya kita sendiri yang tentukan dan
// tidak pernah bersarang. Pustaka penuh berarti belasan KB heap tambahan di
// saat yang sama dengan TLS, dan heap itulah sumber daya paling sempit di
// ESP8266.
String ambilNilai(const String& sumber, const String& kunci) {
  String pola = "\"" + kunci + "\":\"";
  int mulai = sumber.indexOf(pola);
  if (mulai < 0) return "";
  mulai += pola.length();
  int akhir = sumber.indexOf('"', mulai);
  if (akhir < 0) return "";
  return sumber.substring(mulai, akhir);
}

// Terapkan setelan WiFi titipan dari aplikasi, lalu nyalakan ulang.
//
// Menyalakan ulang bukan kemalasan: dengan begitu keberhasilan maupun
// kegagalannya melewati satu jalur yang sama dengan boot biasa — autoConnect,
// dan portal kalau gagal. Kalau ditangani di tempat, kita punya dua jalur
// pemulihan yang harus sama-sama benar, dan yang jarang terpakai akan busuk
// tanpa ketahuan.
void terapkanWifi(const String& ssid, const String& sandi) {
  Serial.printf("Titipan setelan WiFi diterima: %s\n", ssid.c_str());

  WiFi.persistent(true);
  WiFi.begin(ssid.c_str(), sandi.c_str());
  delay(500);

  Serial.println("Menyalakan ulang untuk memakai setelan baru.");
  delay(500);
  ESP.restart();
}

void kirimStatus() {
  if (WiFi.status() != WL_CONNECTED) {
    sambungWifi();
    if (WiFi.status() != WL_CONNECTED) return;
  }

  String body = susunJson();
  Serial.println("Kirim: " + body);

  // TLS di ESP8266 memakan belasan KB heap sekali jalan — jauh lebih ketat
  // daripada ESP32. Angka ini dicetak supaya kalau nanti pengiriman gagal
  // hanya sesekali, ketahuan penyebabnya heap menipis, bukan jaringan.
  Serial.printf("Heap bebas: %u byte\n", ESP.getFreeHeap());

  // Jenis klien harus cocok dengan skema URL. Kalau alamat http:// tetap
  // diberi WiFiClientSecure, jabat tangan TLS gagal dan hasilnya -1 — gejalanya
  // sama persis dengan salah alamat, jadi mudah salah lacak. Ini terasa saat
  // menguji ke dev server laptop, yang memang berjalan tanpa TLS.
  std::unique_ptr<WiFiClient> client;

  if (strncmp(API_URL, "https:", 6) == 0) {
    auto* aman = new WiFiClientSecure();
    aman->setInsecure();         // cukup untuk prototipe
    client.reset(aman);
  } else {
    client.reset(new WiFiClient());
  }

  HTTPClient http;
  http.begin(*client, API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", DEVICE_TOKEN);
  http.setTimeout(8000);

  int kode = http.POST(body);
  Serial.printf("Respons: %d\n", kode);

  String balasan;
  if (kode > 0) {
    balasan = http.getString();
    Serial.println(balasan);
  }

  http.end();

  // Dibaca setelah http.end() supaya soket dan buffer TLS sudah dilepas
  // sebelum papan menyalakan ulang.
  if (kode == 200) {
    String ssidBaru = ambilNilai(balasan, "ssid");
    if (ssidBaru.length() > 0) {
      terapkanWifi(ssidBaru, ambilNilai(balasan, "sandi"));
    }
  }
}
