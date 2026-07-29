"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function masuk(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const db = await supabaseServer();
  const { error } = await db.auth.signInWithPassword({ email, password });

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
