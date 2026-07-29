/*
 * Kelar — Pemantauan Rak Laundry
 * ESP32 DevKit V1
 *
 * Wiring per slot (tanpa resistor tambahan):
 *   saklar kaki 1  -> GPIO
 *   saklar kaki 2  -> GND
 *
 * Saklar tertekan (ada cucian) = LOW  -> terisi
 * Saklar lepas   (kosong)      = HIGH -> kosong
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

// ================= KONFIGURASI =================
const char* WIFI_SSID    = "GANTI_NAMA_WIFI";
const char* WIFI_PASS    = "GANTI_PASSWORD_WIFI";

// Saat masih lokal, pakai IP laptop: http://192.168.1.10:3000/api/rak
// Setelah deploy: https://kelar.vercel.app/api/rak
const char* API_URL      = "https://kelar.vercel.app/api/rak";
const char* DEVICE_TOKEN = "GANTI_TOKEN_SAMA_DENGAN_ENV";

const int   JUMLAH_SLOT  = 3;
const int   PIN_SLOT[]   = { 4, 5, 18 };
const char* KODE_SLOT[]  = { "A1", "A2", "A3" };

const unsigned long DEBOUNCE_MS  = 50;
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

  WiFiClientSecure client;
  client.setInsecure();          // cukup untuk prototipe

  HTTPClient http;
  http.begin(client, API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", DEVICE_TOKEN);
  http.setTimeout(8000);

  int kode = http.POST(body);
  Serial.printf("Respons: %d\n", kode);
  if (kode > 0) Serial.println(http.getString());

  http.end();
}
