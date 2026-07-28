// Service worker Kelar.
//
// Tugasnya cuma satu: menjadikan aplikasi bisa dipasang ke home screen.
// Chrome mensyaratkan service worker yang benar-benar sanggup membalas saat
// jaringan mati — handler fetch kosong tidak cukup, dan itu yang dulu membuat
// menu "Install app" tidak pernah muncul.
//
// Data order sendiri tidak di-cache: aplikasi tetap butuh Supabase, dan
// menyajikan daftar order basi dari cache lebih berbahaya daripada berguna.

const CACHE = "kelar-v1";
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

self.addEventListener("fetch", (event) => {
  // Hanya perpindahan halaman yang ditangani. Request data dibiarkan apa adanya
  // supaya kegagalannya tetap terlihat oleh aplikasi, bukan disamarkan.
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch {
        const cache = await caches.open(CACHE);
        const cadangan = await cache.match(HALAMAN_OFFLINE);
        return cadangan ?? Response.error();
      }
    })()
  );
});
