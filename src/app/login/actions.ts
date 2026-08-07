"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function masuk(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  // Nama field-nya "sandi", seragam dengan form lain di proyek ini. Jangan
  // diselaraskan dengan nama parameter Supabase di bawah — keduanya kebetulan
  // berdekatan artinya, tapi yang satu milik markup kita dan yang satu milik
  // pustaka. Pernah tertukar sekali, dan gejalanya "Email dan password wajib
  // diisi." padahal keduanya terisi: FormData tidak bertipe, jadi TypeScript,
  // lint, maupun build sama sekali tidak menangkapnya.
  const email = String(formData.get("email") ?? "").trim();
  const sandi = String(formData.get("sandi") ?? "");

  if (!email || !sandi) {
    return { error: "Email dan password wajib diisi." };
  }

  const db = await supabaseServer();
  const { error } = await db.auth.signInWithPassword({
    email,
    password: sandi,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/dashboard");
}

export async function keluar() {
  const db = await supabaseServer();
  // Kalau token sudah kedaluwarsa, signOut bisa melempar error. Sesi tetap
  // dianggap habis — yang penting user dikembalikan ke halaman login.
  try {
    await db.auth.signOut({ scope: "local" });
  } catch {
    // abaikan
  }
  redirect("/login");
}
