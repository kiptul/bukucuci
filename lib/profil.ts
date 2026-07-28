import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { Laundry } from "@/lib/types";

// Ambil user login + profil laundry-nya. Redirect ke /login kalau belum masuk.
export async function getProfil() {
  const db = await supabaseServer();

  // Sama seperti di proxy.ts: error token dianggap belum login, bukan crash.
  let user = null;
  try {
    const { data } = await db.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }
  if (!user) redirect("/login");

  const { data: pengguna } = await db
    .from("pengguna")
    .select("nama, peran, laundry:laundry_id(*)")
    .eq("id", user.id)
    .maybeSingle();

  const laundry = (pengguna?.laundry ?? null) as Laundry | null;
  if (!laundry) {
    // Akun ada tapi belum ditautkan ke laundry (lihat README bagian setup akun)
    redirect("/login?error=belum-terdaftar");
  }

  return { db, user, laundry, namaPengguna: pengguna?.nama ?? user.email ?? "" };
}
