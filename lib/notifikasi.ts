import type { SupabaseClient } from "@supabase/supabase-js";
import { kirimWhatsApp } from "@/lib/fonnte";
import type { JenisNotifikasi } from "@/lib/types";

export function isiTemplate(
  templat: string,
  data: { nama: string; kode: string }
): string {
  return templat.replaceAll("{nama}", data.nama).replaceAll("{kode}", data.kode);
}

export interface TargetNotifikasi {
  pesananId: string;
  laundryId: string;
  kode: string;
  nama: string;
  noHp: string;
}

// Kirim satu notifikasi WhatsApp untuk sebuah pesanan.
// Aman dipanggil berulang: insert ke notifikasi_log dipagari
// unique (pesanan_id, jenis), jadi jenis yang sama tidak pernah terkirim dua kali.
export async function kirimNotifikasi(
  db: SupabaseClient,
  target: TargetNotifikasi,
  jenis: JenisNotifikasi
): Promise<boolean> {
  const { data: templat } = await db
    .from("template_pesan")
    .select("isi, aktif")
    .eq("laundry_id", target.laundryId)
    .eq("jenis", jenis)
    .maybeSingle();

  if (!templat?.aktif) return false;

  const isi = isiTemplate(templat.isi, { nama: target.nama, kode: target.kode });

  // Klaim slot kirim dulu. Kalau gagal (duplikat), berarti sudah pernah — berhenti.
  const { error } = await db.from("notifikasi_log").insert({
    pesanan_id: target.pesananId,
    jenis,
    no_tujuan: target.noHp,
    isi,
  });
  if (error) return false;

  const hasil = await kirimWhatsApp(target.noHp, isi);

  await db
    .from("notifikasi_log")
    .update({
      status: hasil.ok ? "TERKIRIM" : "GAGAL",
      keterangan: hasil.keterangan,
    })
    .eq("pesanan_id", target.pesananId)
    .eq("jenis", jenis);

  return hasil.ok;
}
