import { cache } from "react";
import { redirect } from "next/navigation";
import { getPengguna } from "@/lib/profil";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Pagar konsol superadmin.
//
// Urutannya penting dan tidak boleh dibalik: peran diperiksa lewat sesi login
// pengguna (yang tunduk RLS) DULU, baru client secret key diberikan. Kalau
// dibalik, siapa pun yang bisa memanggil kode ini ikut mendapat kuasa penuh
// atas seluruh database.
//
// Kontrol akses di sini ada di kode aplikasi, bukan di kebijakan RLS. Itu
// keputusan sadar: mengubah policy di 9 tabel yang sudah terbukti jalan lebih
// berisiko daripada satu pemeriksaan terpusat di fungsi ini. Konsekuensinya,
// SETIAP halaman dan action di /admin wajib memanggil fungsi ini lebih dulu.
export const pastikanSuperAdmin = cache(async () => {
  const { user, nama, peran } = await getPengguna();

  if (peran !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return { db: supabaseAdmin(), user, nama };
});
