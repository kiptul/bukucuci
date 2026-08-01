"use server";

import { revalidatePath } from "next/cache";
import { getProfil } from "@/lib/profil";
import { kirimNotifikasi, type HasilNotifikasi } from "@/lib/notifikasi";
import type {
  JenisNotifikasi,
  StatusPembayaran,
  StatusPesanan,
} from "@/lib/types";

type PesananKirim = {
  id: string;
  kode: string;
  pelanggan: { nama: string; no_hp: string } | null;
};

// Kirim ulang pesan yang gagal terkirim — mis. koneksi ke Fonnte sempat putus.
// Yang diulang adalah jenis yang benar-benar tercatat GAGAL, bukan jenis tetap:
// order yang gagal di tahap TERIMA_KASIH tidak boleh malah dikirimi kabar SIAP.
export async function kirimUlangWa(
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

  const { data: gagal } = await db
    .from("notifikasi_log")
    .select("jenis")
    .eq("pesanan_id", id)
    .eq("status", "GAGAL");

  if (!gagal?.length) {
    return { ok: false, alasan: "Tidak ada pesan yang perlu dikirim ulang." };
  }

  const target = {
    pesananId: pesanan.id,
    laundryId: laundry.id,
    kode: pesanan.kode,
    nama: pesanan.pelanggan.nama,
    noHp: pesanan.pelanggan.no_hp,
  };

  let berhasil = 0;
  let alasanTerakhir = "";

  for (const g of gagal) {
    const hasil = await kirimNotifikasi(db, target, g.jenis as JenisNotifikasi);
    if (hasil.ok) berhasil++;
    else alasanTerakhir = hasil.alasan;
  }

  revalidatePath(`/order/${id}`);

  return berhasil
    ? { ok: true, alasan: `${berhasil} pesan dikirim ulang.` }
    : { ok: false, alasan: alasanTerakhir || "Masih gagal terkirim." };
}

// Status hanya boleh maju satu arah. Tanpa aturan ini, order yang sudah
// diambil bisa dikembalikan jadi MASUK dan riwayatnya jadi tidak masuk akal.
const LANJUTAN: Record<StatusPesanan, StatusPesanan[]> = {
  MASUK: ["SIAP", "BATAL"],
  SIAP: ["DIAMBIL", "BATAL"],
  DIAMBIL: [],
  BATAL: [],
};

// Status yang memicu WhatsApp otomatis, beserta template yang dipakai.
// BATAL sengaja tidak ada di sini — pelanggan tidak perlu dikabari pembatalan.
const PESAN_OTOMATIS: Partial<Record<StatusPesanan, JenisNotifikasi>> = {
  SIAP: "SIAP",
  DIAMBIL: "TERIMA_KASIH",
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

  // Pelanggan dikabari saat cucian siap dan saat sudah diambil. Kalau
  // WhatsApp-nya gagal, status tetap berubah — kegagalannya tercatat di
  // notifikasi_log dan tidak menahan kasir.
  const jenis = PESAN_OTOMATIS[tujuan];
  if (jenis && pesanan.pelanggan) {
    await kirimNotifikasi(
      db,
      {
        pesananId: pesanan.id,
        laundryId: laundry.id,
        kode: pesanan.kode,
        nama: pesanan.pelanggan.nama,
        noHp: pesanan.pelanggan.no_hp,
      },
      jenis
    );
  }

  revalidatePath(`/order/${id}`);
  revalidatePath("/dashboard");
}

// Tandai order lunas atau kembalikan ke belum bayar.
//
// Berbeda dari `ubahStatus` yang sengaja satu arah, penanda ini bolak-balik.
// Alasannya praktis: salah pencet "Lunas" itu wajar terjadi di konter yang
// ramai, dan kalau tidak ada jalan pulang, kasir akan berhenti mempercayai
// layar lalu kembali membuka buku — persis yang ingin dihindari aplikasi ini.
export async function ubahBayar(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const tujuan = String(formData.get("bayar") ?? "") as StatusPembayaran;

  if (tujuan !== "LUNAS" && tujuan !== "BELUM") return;

  const { db } = await getProfil();

  const { data: pesanan } = await db
    .from("pesanan")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (!pesanan) return;

  // Order yang dibatalkan tidak pernah menagih apa pun. Membiarkannya
  // ditandai lunas cuma menciptakan baris yang membingungkan saat ditengok
  // lagi berminggu-minggu kemudian.
  if (pesanan.status === "BATAL") return;

  await db.from("pesanan").update({ status_bayar: tujuan }).eq("id", id);

  revalidatePath(`/order/${id}`);
  revalidatePath("/dashboard");
}
