"use server";

import { revalidatePath } from "next/cache";
import { getProfil } from "@/lib/profil";
import type { StatusPesanan } from "@/lib/types";

// Status hanya boleh maju satu arah. Tanpa aturan ini, order yang sudah
// diambil bisa dikembalikan jadi MASUK dan riwayatnya jadi tidak masuk akal.
const LANJUTAN: Record<StatusPesanan, StatusPesanan[]> = {
  MASUK: ["SIAP", "BATAL"],
  SIAP: ["DIAMBIL", "BATAL"],
  DIAMBIL: [],
  BATAL: [],
};

export async function ubahStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const tujuan = String(formData.get("status") ?? "") as StatusPesanan;

  const { db } = await getProfil();

  const { data: pesanan } = await db
    .from("pesanan")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (!pesanan) return;
  if (!LANJUTAN[pesanan.status as StatusPesanan]?.includes(tujuan)) return;

  // Trigger di database yang mencatat riwayat_status — bukan kode ini.
  await db.from("pesanan").update({ status: tujuan }).eq("id", id);

  revalidatePath(`/order/${id}`);
  revalidatePath("/dashboard");
}
