import type { SupabaseClient } from "@supabase/supabase-js";
import { kirimNotifikasi } from "@/lib/notifikasi";
import { tahapReminder } from "@/lib/tahap-reminder";

export interface HasilReminder {
  diperiksa: number;
  terkirim: number;
  dilewati: number;
}

type PesananSiap = {
  id: string;
  kode: string;
  laundry_id: string;
  pelanggan: { nama: string; no_hp: string } | null;
};

// Cari semua order yang masih SIAP, lalu kirim reminder yang sudah waktunya.
// Aman dipanggil berkali-kali: kirimNotifikasi menolak jenis yang sudah pernah
// terkirim untuk order yang sama.
export async function jalankanReminder(
  db: SupabaseClient,
  sekarang = new Date()
): Promise<HasilReminder> {
  const { data } = await db
    .from("pesanan")
    .select("id, kode, laundry_id, pelanggan:pelanggan_id(nama, no_hp)")
    .eq("status", "SIAP");

  const pesanan = (data ?? []) as unknown as PesananSiap[];
  if (!pesanan.length) return { diperiksa: 0, terkirim: 0, dilewati: 0 };

  // Kapan tiap order berubah jadi SIAP — dibaca dari riwayat yang ditulis trigger.
  const { data: riwayat } = await db
    .from("riwayat_status")
    .select("pesanan_id, waktu")
    .eq("status", "SIAP")
    .in(
      "pesanan_id",
      pesanan.map((p) => p.id)
    );

  const waktuSiap = new Map<string, Date>();
  for (const r of riwayat ?? []) {
    const waktu = new Date(r.waktu);
    const lama = waktuSiap.get(r.pesanan_id);
    // Order bisa bolak-balik SIAP; pakai yang paling akhir.
    if (!lama || waktu > lama) waktuSiap.set(r.pesanan_id, waktu);
  }

  let terkirim = 0;
  let dilewati = 0;

  for (const p of pesanan) {
    const sejak = waktuSiap.get(p.id);
    if (!sejak || !p.pelanggan) {
      dilewati++;
      continue;
    }

    const jenis = tahapReminder(sejak, sekarang);
    if (!jenis) {
      dilewati++;
      continue;
    }

    const hasil = await kirimNotifikasi(
      db,
      {
        pesananId: p.id,
        laundryId: p.laundry_id,
        kode: p.kode,
        nama: p.pelanggan.nama,
        noHp: p.pelanggan.no_hp,
      },
      jenis
    );

    if (hasil.ok) terkirim++;
    else dilewati++;
  }

  return { diperiksa: pesanan.length, terkirim, dilewati };
}
