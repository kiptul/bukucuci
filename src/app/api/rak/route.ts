import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type SlotMasuk = { kode: string; terisi: boolean };

// Setelah sekian kali dititipkan tanpa perangkat pernah muncul di jaringan
// tujuan, titipan dibatalkan sendiri. Tanpa batas ini, sandi yang salah ketik
// membentuk lingkaran: perangkat gagal menyambung, jatuh ke portal, pemilik
// menyambungkannya ke jaringan lain lewat portal, lalu titipan yang salah itu
// dikirim lagi dan memutusnya kembali — tanpa ujung.
const BATAS_PERCOBAAN = 3;

// Dipanggil ESP, bukan browser. Perangkat tidak punya sesi login, jadi
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
  let ssidSekarang: string | null = null;
  try {
    const isi = await request.json();
    slots = isi?.slots;
    // Firmware lama tidak mengirim ini. Ketiadaannya bukan galat — hanya
    // berarti penggantian WiFi lewat aplikasi tidak bisa disahkan, dan
    // perangkat itu tetap dilayani seperti biasa.
    if (typeof isi?.ssid === "string" && isi.ssid) ssidSekarang = isi.ssid;
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

  const { data: perangkat } = await db
    .from("rak_perangkat")
    .select("wifi_ssid_baru, wifi_sandi_baru, wifi_percobaan")
    .eq("laundry_id", laundryId)
    .maybeSingle();

  // Tanda perangkat masih hidup. Tanpa ini, ESP yang mati terbaca sama
  // dengan rak yang kebetulan tidak berubah.
  const ubah: Record<string, unknown> = {
    terakhir_kontak: new Date().toISOString(),
  };
  if (ssidSekarang) ubah.wifi_ssid = ssidSekarang;

  let titipan: { ssid: string; sandi: string } | null = null;

  if (perangkat?.wifi_ssid_baru) {
    if (ssidSekarang === perangkat.wifi_ssid_baru) {
      // Perangkat melapor dari jaringan tujuan — inilah satu-satunya bukti
      // yang sah bahwa perpindahannya berhasil. Balasan 200 saat titipan
      // dikirim tidak membuktikan apa pun: saat itu ia masih di jaringan lama.
      ubah.wifi_ssid_baru = null;
      ubah.wifi_sandi_baru = null;
      ubah.wifi_percobaan = 0;
      ubah.wifi_galat = null;
    } else if ((perangkat.wifi_percobaan ?? 0) >= BATAS_PERCOBAAN) {
      ubah.wifi_ssid_baru = null;
      ubah.wifi_sandi_baru = null;
      ubah.wifi_percobaan = 0;
      ubah.wifi_galat = `Perangkat tidak pernah muncul di jaringan "${perangkat.wifi_ssid_baru}" setelah ${BATAS_PERCOBAAN} kali dicoba. Periksa nama dan sandinya, atau atur lewat portal Kelar-Rak di perangkat.`;
    } else {
      titipan = {
        ssid: perangkat.wifi_ssid_baru,
        sandi: perangkat.wifi_sandi_baru ?? "",
      };
      ubah.wifi_percobaan = (perangkat.wifi_percobaan ?? 0) + 1;
    }
  }

  await db.from("rak_perangkat").update(ubah).eq("laundry_id", laundryId);

  return NextResponse.json({
    ok: true,
    diterima: baris.length,
    ...(titipan ? { wifi: titipan } : {}),
  });
}
