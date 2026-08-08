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
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <memory>

// Password WiFi dan DEVICE_TOKEN ditaruh di berkas terpisah yang diabaikan git.
// Repo ini punya remote di GitHub, dan token itu satu-satunya pengaman
// api/rak — sekali ter-commit ia harus dianggap bocor dan wajib diganti.
//
// Berkas belum ada? Jalankan: cp rahasia.contoh.h rahasia.h
#include "rahasia.h"

// ================= KONFIGURASI =================
const char* WIFI_SSID    = WIFI_SSID_RAHASIA;
const char* WIFI_PASS    = WIFI_PASS_RAHASIA;
const char* API_URL      = API_URL_RAHASIA;
const char* DEVICE_TOKEN = DEVICE_TOKEN_RAHASIA;

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
  Serial.printf("Menyambung ke %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);

  // ESP8266 menyimpan kredensial WiFi terakhir di flash dan memakainya ulang
  // saat boot. Tanpa ini, SSID lama yang tersimpan bisa dipakai diam-diam dan
  // membuat perubahan WIFI_SSID di atas seolah-olah tidak berpengaruh.
  WiFi.persistent(false);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  unsigned long mulai = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nTersambung. IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nGagal menyambung WiFi.");
  }
}

String susunJson() {
  String json = "{\"slots\":[";
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
  if (kode > 0) Serial.println(http.getString());

  http.end();
}
