// Service worker Kelar.
//
// Tugasnya cuma satu: menjadikan aplikasi bisa dipasang ke home screen.
// Chrome mensyaratkan service worker yang benar-benar sanggup membalas saat
// jaringan mati — handler fetch kosong tidak cukup, dan itu yang dulu membuat
// menu "Install app" tidak pernah muncul.
//
// Data order sendiri tidak di-cache: aplikasi tetap butuh Supabase, dan
// menyajikan daftar order basi dari cache lebih berbahaya daripada berguna.

const CACHE = "kelar-v3";
const HALAMAN_OFFLINE = "/offline.html";
const HALAMAN_LOGIN = "/login";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled([
        cache.add(new Request(HALAMAN_OFFLINE, { cache: "reload" })),
        cache.add(new Request(HALAMAN_LOGIN, { cache: "reload" })),
      ])
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

// PENTING: perpindahan halaman aplikasi sengaja TIDAK dicegat.
//
// Next.js mengirim halaman secara bertahap — kerangkanya lebih dulu, bagian
// yang menunggu data menyusul lewat aliran yang sama. Kalau aliran itu
// dilewatkan service worker, bagian penyusulnya tidak pernah sampai dan
// halaman berhenti selamanya di rangka pemuatan, tanpa satu pun error di
// konsol. Ini sudah terjadi sekali dan sangat sulit dilacak.
//
// Login adalah pengecualian: halaman login disimpan agar PWA tetap bisa
// terbuka ketika kasir sedang kehilangan koneksi. Submit tetap memerlukan
// koneksi karena autentikasi dilakukan oleh Supabase.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const pathname = new URL(req.url).pathname;

  if (req.mode === "navigate" && pathname === HALAMAN_LOGIN) {
    event.respondWith(
      fetch(req)
        .then((respons) => {
          // Hanya halaman login sungguhan yang boleh disimpan. Pemakai yang
          // sudah login dibalas pengalihan ke /dashboard, dan cache.put()
          // menolak respons hasil pengalihan — tanpa saringan ini baris di
          // bawah melempar penolakan yang tak tertangkap, dan yang tersimpan
          // sebagai "/login" justru kerangka dashboard.
          if (respons.ok && !respons.redirected) {
            const salinan = respons.clone();
            caches
              .open(CACHE)
              .then((cache) => cache.put(HALAMAN_LOGIN, salinan))
              .catch(() => {});
          }
          return respons;
        })
        .catch(() =>
          caches.match(HALAMAN_LOGIN, { ignoreSearch: true }).then(
            (cadangan) => cadangan ?? caches.match(HALAMAN_OFFLINE)
          )
        )
    );
    return;
  }

  if (pathname === HALAMAN_OFFLINE) {
    event.respondWith(
      caches.match(HALAMAN_OFFLINE).then((cadangan) => cadangan ?? fetch(req))
    );
  }
});
