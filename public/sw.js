// Service worker Kelar.
//
// Tugasnya cuma satu: menjadikan aplikasi bisa dipasang ke home screen.
// Chrome mensyaratkan service worker yang benar-benar sanggup membalas saat
// jaringan mati — handler fetch kosong tidak cukup, dan itu yang dulu membuat
// menu "Install app" tidak pernah muncul.
//
// Data order sendiri tidak di-cache: aplikasi tetap butuh Supabase, dan
// menyajikan daftar order basi dari cache lebih berbahaya daripada berguna.

const CACHE = "kelar-v2";
const HALAMAN_OFFLINE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.add(new Request(HALAMAN_OFFLINE, { cache: "reload" }))
      )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const kunci = await caches.keys();
      await Promise.all(
        kunci.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// PENTING: perpindahan halaman sengaja TIDAK dicegat.
//
// Next.js mengirim halaman secara bertahap — kerangkanya lebih dulu, bagian
// yang menunggu data menyusul lewat aliran yang sama. Kalau aliran itu
// dilewatkan service worker, bagian penyusulnya tidak pernah sampai dan
// halaman berhenti selamanya di rangka pemuatan, tanpa satu pun error di
// konsol. Ini sudah terjadi sekali dan sangat sulit dilacak.
//
// Handler ini tetap ada karena Chrome mensyaratkannya untuk "Install app",
// tapi ia hanya melayani halaman offline dari cache. Konsekuensinya: saat
// benar-benar tanpa koneksi, yang tampil halaman error bawaan browser, bukan
// halaman offline kita. Itu tukar-tambah yang disengaja — aplikasi yang selalu
// terbuka dengan benar jauh lebih penting daripada halaman offline yang cantik.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (new URL(req.url).pathname === HALAMAN_OFFLINE) {
    event.respondWith(
      caches.match(HALAMAN_OFFLINE).then((cadangan) => cadangan ?? fetch(req))
    );
  }
});
