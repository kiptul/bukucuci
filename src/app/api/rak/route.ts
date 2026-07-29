import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type SlotMasuk = { kode: string; terisi: boolean };

// Dipanggil ESP32, bukan browser. Perangkat tidak punya sesi login, jadi
// rute ini dikecualikan dari proxy (lihat proxy.ts) dan menjaga dirinya
// sendiri dengan header x-device-token.
export async function POST(request: Request) {
  const token = process.env.DEVICE_TOKEN;
  const laundryId = process.env.LAUNDRY_ID;

  if (!token || !laundryId || !process.env.SUPABASE_SECRET_KEY) {
    return NextResponse.json(
      { error: "DEVICE_TOKEN, LAUNDRY_ID, atau SUPABASE_SECRET_KEY belum diisi." },
      { status: 500 }
    );
  }

  if (request.headers.get("x-device-token") !== token) {
    return NextResponse.json(
      { error: "Token perangkat tidak dikenali." },
      { status: 401 }
    );
  }

  let slots: SlotMasuk[];
  try {
    const isi = await request.json();
    slots = isi?.slots;
    if (!Array.isArray(slots) || !slots.length) throw new Error();
  } catch {
    return NextResponse.json(
      { error: "Format data tidak sesuai." },
      { status: 400 }
    );
  }

  // Kode slot dibatasi bentuknya (mis. A1, B12). Tanpa ini, perangkat yang
  // salah program bisa membuat baris sampah lewat upsert.
  const baris = slots
    .filter((s) => typeof s?.kode === "string" && /^[A-Z]\d{1,2}$/.test(s.kode))
    .map((s) => ({
      laundry_id: laundryId,
      kode: s.kode,
      terisi: Boolean(s.terisi),
      terakhir_update: new Date().toISOString(),
    }));

  if (!baris.length) {
    return NextResponse.json(
      { error: "Tidak ada kode slot yang sah." },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();

  const { error } = await db
    .from("rak_slot")
    .upsert(baris, { onConflict: "laundry_id,kode" });

  if (error) {
    console.error("Gagal memperbarui rak:", error.message);
    return NextResponse.json(
      { error: "Gagal menyimpan status rak." },
      { status: 500 }
    );
  }

  // Tanda perangkat masih hidup. Tanpa ini, ESP32 yang mati terbaca sama
  // dengan rak yang kebetulan tidak berubah.
  await db
    .from("rak_perangkat")
    .update({ terakhir_kontak: new Date().toISOString() })
    .eq("laundry_id", laundryId);

  return NextResponse.json({ ok: true, diterima: baris.length });
}
