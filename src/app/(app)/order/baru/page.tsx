import FormOrder from "@/components/forms/FormOrder";
import { getProfil } from "@/lib/profil";
import type { Layanan } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrderBaru({
  searchParams,
}: {
  searchParams: Promise<{ buku?: string }>;
}) {
  const { buku } = await searchParams;
  const { db } = await getProfil();

  const { data: layanan } = await db
    .from("layanan")
    .select("id, laundry_id, nama, satuan, harga, aktif")
    .eq("aktif", true)
    .order("created_at");

  if (!layanan?.length) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-tinta-3">
          Belum ada layanan aktif. Tambahkan layanan dulu lewat Supabase.
        </p>
      </div>
    );
  }

  return (
    <FormOrder layanan={layanan as Layanan[]} dariBukuAwal={buku === "1"} />
  );
}
