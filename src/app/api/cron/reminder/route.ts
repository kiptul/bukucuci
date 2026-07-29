import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jalankanReminder } from "@/lib/reminder";

export const dynamic = "force-dynamic";

// Dipanggil Vercel Cron sekali sehari (lihat vercel.json).
// Rute ini dilewati proxy, jadi pengamanannya di sini: harus membawa CRON_SECRET.
export async function GET(request: Request) {
  const rahasia = process.env.CRON_SECRET;
  if (!rahasia) {
    return NextResponse.json(
      { error: "CRON_SECRET belum diisi di environment." },
      { status: 500 }
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${rahasia}`) {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 401 });
  }

  if (!process.env.SUPABASE_SECRET_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SECRET_KEY belum diisi di environment." },
      { status: 500 }
    );
  }

  // Cron jalan tanpa user login, jadi RLS tidak bisa dipakai — pakai secret key.
  const hasil = await jalankanReminder(supabaseAdmin());

  return NextResponse.json({ ok: true, ...hasil });
}
