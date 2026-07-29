import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { Laundry, PeranPengguna } from "@/lib/types";

// Siapa yang sedang login, tanpa memaksa punya laundry. Superadmin memang
// tidak terikat satu laundry, jadi pemeriksaannya harus dipisah dari getProfil.
export const getPengguna = cache(async () => {
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

  const { data: baris } = await db
    .from("pengguna")
    .select("nama, peran, laundry:laundry_id(*)")
    .eq("id", user.id)
    .maybeSingle();

  return {
    db,
    user,
    nama: baris?.nama ?? user.email ?? "",
    peran: (baris?.peran ?? null) as PeranPengguna | null,
    laundry: (baris?.laundry ?? null) as Laundry | null,
  };
});

// Untuk halaman kasir: wajib punya laundry. Superadmin dilempar ke konsolnya,
// bukan ditolak — dia bukan akun cacat, cuma bukan penghuni halaman ini.
export const getProfil = cache(async () => {
  const { db, user, nama, peran, laundry } = await getPengguna();

  if (!laundry) {
    if (peran === "SUPER_ADMIN") redirect("/admin");
    // Akun ada tapi belum ditautkan ke laundry (lihat database/setup_akun.sql)
    redirect("/login?error=belum-terdaftar");
  }

  return { db, user, laundry, namaPengguna: nama };
});
