import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Halaman sementara untuk Tugas 1: verifikasi koneksi Supabase.
// Akan diganti oleh daftar order pada Tugas 6.
export default async function Beranda() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Cek Koneksi Supabase</h1>
        <p className="mt-4 rounded-lg bg-amber-100 p-4 text-amber-800">
          <code>.env.local</code> belum terisi. Salin <code>.env.example</code>{" "}
          jadi <code>.env.local</code> lalu isi URL dan publishable key dari
          dashboard Supabase.
        </p>
      </main>
    );
  }

  const db = await supabaseServer();
  const { data, error } = await db.from("layanan").select();

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Cek Koneksi Supabase</h1>
      {error ? (
        <p className="mt-4 rounded-lg bg-rose-100 p-4 text-rose-800">
          Gagal: {error.message}
        </p>
      ) : (
        <p className="mt-4 rounded-lg bg-emerald-100 p-4 text-emerald-800">
          Koneksi OK — dapat {data.length} baris dari tabel <code>layanan</code>.
          Hasil kosong itu wajar: RLS menutup akses karena belum login.
        </p>
      )}
    </main>
  );
}
