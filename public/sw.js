// Service worker minimal — cukup untuk memenuhi syarat "installable" PWA.
// Tidak ada caching macam-macam; aplikasi tetap butuh koneksi ke Supabase.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // pass-through: biarkan browser menangani request seperti biasa
});
