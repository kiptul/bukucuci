import { getProfil } from "@/lib/profil";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

// Form input order menyusul di Tugas 5. Untuk sekarang daftar layanan dulu:
// kalau baris-baris ini muncul, artinya RLS dan relasi pengguna → laundry benar.
export default async function OrderBaru() {
  const { db } = await getProfil();

  const { data: layanan, error } = await db
    .from("layanan")
    .select("id, nama, satuan, harga")
    .eq("aktif", true)
    .order("created_at");

  return (
    <div className="px-4 py-5">
      <div className="flex items-baseline justify-between gap-3 border-b border-garis pb-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
          Daftar Layanan
        </h2>
        <span className="angka font-mono text-[11px] text-tinta-3">
          {layanan?.length ?? 0} layanan
        </span>
      </div>

      {error ? (
        <p className="mt-4 border-l-[3px] border-red-800 bg-red-50 px-3 py-2.5 text-sm text-red-900">
          Gagal memuat layanan: {error.message}
        </p>
      ) : !layanan?.length ? (
        <p className="mt-6 text-sm text-tinta-3">
          Belum ada layanan yang aktif.
        </p>
      ) : (
        <ul className="divide-y divide-garis">
          {layanan.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-4 py-3.5">
              <span className="font-medium leading-snug">{l.nama}</span>
              <span className="angka shrink-0 font-mono text-sm">
                {rupiah(l.harga)}
                <span className="text-tinta-3">/{l.satuan}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 border-t border-dashed border-garis pt-4 text-sm text-tinta-3">
        Form input order menyusul.
      </p>
    </div>
  );
}
