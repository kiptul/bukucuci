// Simpan sebagai: src/app/api/rak/route.ts
//
// Endpoint ini dipanggil ESP32, bukan browser. Karena perangkat tidak login,
// akses database memakai secret key di sisi server dan dilindungi device token.

import { createClient } from "@supabase/supabase-js";

type SlotMasuk = { kode: string; terisi: boolean };

export async function POST(req: Request) {
  // 1. Validasi perangkat
  const token = req.headers.get("x-device-token");
  if (!token || token !== process.env.DEVICE_TOKEN) {
    return Response.json({ error: "Token perangkat tidak dikenali" }, { status: 401 });
  }

  // 2. Baca isi kiriman
  let slots: SlotMasuk[];
  try {
    const body = await req.json();
    slots = body?.slots;
    if (!Array.isArray(slots) || slots.length === 0) throw new Error();
  } catch {
    return Response.json({ error: "Format data tidak sesuai" }, { status: 400 });
  }

  // 3. Client server-side (bypass RLS — hanya boleh di route ini)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );

  const laundryId = process.env.LAUNDRY_ID!;
  const sekarang = new Date().toISOString();

  // 4. Perbarui status tiap slot
  const baris = slots.map((s) => ({
    laundry_id: laundryId,
    kode: String(s.kode),
    terisi: Boolean(s.terisi),
    terakhir_update: sekarang,
  }));

  const { error } = await supabase
    .from("rak_slot")
    .upsert(baris, { onConflict: "laundry_id,kode" });

  if (error) {
    console.error("Gagal memperbarui rak:", error.message);
    return Response.json({ error: "Gagal menyimpan status rak" }, { status: 500 });
  }

  // 5. Catat bahwa perangkat masih hidup
  await supabase
    .from("rak_perangkat")
    .update({ terakhir_kontak: sekarang })
    .eq("laundry_id", laundryId);

  return Response.json({ ok: true, diterima: baris.length });
}
