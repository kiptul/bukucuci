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

export interface HasilNotifikasi {
  ok: boolean;
  alasan: string;
}

// Kirim satu notifikasi WhatsApp untuk sebuah pesanan.
// Aman dipanggil berulang: baris log diklaim lebih dulu dan dipagari
// unique (pesanan_id, jenis), jadi jenis yang sama tidak pernah terkirim dua kali.
export async function kirimNotifikasi(
  db: SupabaseClient,
  target: TargetNotifikasi,
  jenis: JenisNotifikasi
): Promise<HasilNotifikasi> {
  const { data: templat } = await db
    .from("template_pesan")
    .select("isi, aktif")
    .eq("laundry_id", target.laundryId)
    .eq("jenis", jenis)
    .maybeSingle();

  if (!templat) {
    return { ok: false, alasan: `Template ${jenis} belum dibuat.` };
  }
  if (!templat.aktif) {
    return { ok: false, alasan: `Template ${jenis} sedang dinonaktifkan.` };
  }

  const isi = isiTemplate(templat.isi, { nama: target.nama, kode: target.kode });

  // Klaim slot kirim dulu, baru kirim. Urutannya sengaja begini: kalau dua
  // proses jalan bersamaan, yang kalah klaim langsung berhenti dan pelanggan
  // tidak menerima pesan dobel.
  const { error } = await db.from("notifikasi_log").insert({
    pesanan_id: target.pesananId,
    jenis,
    no_tujuan: target.noHp,
    isi,
  });

  if (error) {
    if (error.code !== "23505") {
      return { ok: false, alasan: `Gagal menulis log: ${error.message}` };
    }

    // Sudah ada barisnya. Yang pernah TERKIRIM tidak boleh dikirim ulang.
    // Yang GAGAL boleh dicoba lagi — mis. koneksi Fonnte sempat putus.
    const { data: lama } = await db
      .from("notifikasi_log")
      .select("status")
      .eq("pesanan_id", target.pesananId)
      .eq("jenis", jenis)
      .maybeSingle();

    if (lama?.status !== "GAGAL") {
      return { ok: false, alasan: `Pesan ${jenis} sudah pernah dikirim.` };
    }
  }

  const hasil = await kirimWhatsApp(target.noHp, isi);

  await db
    .from("notifikasi_log")
    .update({
      status: hasil.ok ? "TERKIRIM" : "GAGAL",
      keterangan: hasil.keterangan,
    })
    .eq("pesanan_id", target.pesananId)
    .eq("jenis", jenis);

  return { ok: hasil.ok, alasan: hasil.keterangan };
}
