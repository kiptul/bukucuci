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

  const { db, laundry } = await getProfil();

  const { data } = await db
    .from("pesanan")
    .select("id, kode, status, pelanggan:pelanggan_id(nama, no_hp)")
    .eq("id", id)
    .maybeSingle();

  const pesanan = data as unknown as (PesananKirim & { status: StatusPesanan }) | null;

  if (!pesanan) return;
  if (!LANJUTAN[pesanan.status]?.includes(tujuan)) return;

  // Trigger di database yang mencatat riwayat_status — bukan kode ini.
  await db.from("pesanan").update({ status: tujuan }).eq("id", id);

  // Pelanggan dikabari begitu cucian siap. Kalau WhatsApp-nya gagal, status
  // tetap berubah — kegagalannya tercatat di notifikasi_log, tidak menahan kasir.
  if (tujuan === "SIAP" && pesanan.pelanggan) {
    await kirimNotifikasi(
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
  }

  revalidatePath(`/order/${id}`);
  revalidatePath("/dashboard");
}
