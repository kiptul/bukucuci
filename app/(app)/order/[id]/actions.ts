"use server";

import { revalidatePath } from "next/cache";
import { getProfil } from "@/lib/profil";
import { kirimNotifikasi, type HasilNotifikasi } from "@/lib/notifikasi";
import type { StatusPesanan } from "@/lib/types";

type PesananKirim = {
  id: string;
  kode: string;
  pelanggan: { nama: string; no_hp: string } | null;
};

// Tombol tes di halaman detail: kirim template SIAP ke nomor pelanggan.
// Di Tugas 9 pemanggilan yang sama akan dijalankan otomatis saat status berubah.
export async function tesKirimWa(
  _prev: HasilNotifikasi | null,
  formData: FormData
): Promise<HasilNotifikasi> {
  const id = String(formData.get("id") ?? "");
  const { db, laundry } = await getProfil();

  const { data } = await db
    .from("pesanan")
    .select("id, kode, pelanggan:pelanggan_id(nama, no_hp)")
    .eq("id", id)
    .maybeSingle();

  const pesanan = data as unknown as PesananKirim | null;
  if (!pesanan?.pelanggan) {
    return { ok: false, alasan: "Order atau pelanggannya tidak ditemukan." };
  }

  const hasil = await kirimNotifikasi(
    db,
    {
      pesananId: pesanan.id,
      laundryId: laundry.id,
      kode: pesanan.kode,
      nama: pesanan.pelanggan.nama,
      noHp: pesanan.pelanggan.no_hp,
    },
    "SIAP"
  );

  revalidatePath(`/order/${id}`);
  return hasil;
}

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
