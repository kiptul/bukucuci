import { createBrowserClient } from "@supabase/ssr";

// Client untuk kode yang berjalan di browser. Sejauh ini hanya dipakai
// StatusRak, untuk mendengarkan perubahan rak secara realtime — halaman lain
// mengambil datanya di server. Memakai publishable key, jadi RLS tetap berlaku.
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
