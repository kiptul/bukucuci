"use server";

import { revalidatePath } from "next/cache";
import { pastikanSuperAdmin } from "@/lib/admin";
import { normalisasiHp } from "@/lib/format";

export type Hasil = { error?: string; pesan?: string } | null;

const TEMPLATE_AWAL = [
  {
    jenis: "SIAP",
    isi: "Halo {nama}, cucian Anda ({kode}) sudah selesai dan siap diambil. Terima kasih.",
  },
  {
    jenis: "REMINDER_H1",
    isi: "Halo {nama}, cucian Anda ({kode}) sudah siap sejak kemarin. Kami tunggu ya.",
  },
  {
    jenis: "REMINDER_H3",
    isi: "Halo {nama}, cucian Anda ({kode}) masih kami simpan. Silakan diambil kapan saja.",
  },
  {
    jenis: "REMINDER_H7",
    isi: "Halo {nama}, cucian Anda ({kode}) sudah seminggu siap diambil. Mohon dikonfirmasi ya.",
  },
  {
    jenis: "TERIMA_KASIH",
    isi: "Terima kasih {nama} sudah menggunakan layanan kami. Sampai jumpa lagi!",
  },
];

export async function tambahLaundry(_prev: Hasil, formData: FormData): Promise<Hasil> {
  const { db } = await pastikanSuperAdmin();

  const nama = String(formData.get("nama") ?? "").trim();
  const alamat = String(formData.get("alamat") ?? "").trim();
  const telp = String(formData.get("telp") ?? "").trim();

  if (nama.length < 3) {
    return { error: "Nama laundry minimal 3 huruf." };
  }

  const { data: laundry, error } = await db
    .from("laundry")
    .insert({
      nama,
      alamat: alamat || null,
      telp: telp ? normalisasiHp(telp) : null,
      footer_nota: "Komplain maksimal 2x24 jam setelah cucian diambil.",
    })
    .select("id")
    .single();

  if (error || !laundry) {
    return { error: "Gagal menyimpan laundry." };
  }

  // Laundry baru tanpa template pesan akan gagal mengirim WhatsApp sama sekali,
  // dan kegagalannya baru terasa jauh di kemudian hari. Jadi diisi sejak awal.
  await db.from("template_pesan").insert(
    TEMPLATE_AWAL.map((t) => ({ ...t, laundry_id: laundry.id }))
  );

  revalidatePath("/admin");
  return { pesan: `Laundry "${nama}" dibuat beserta 5 template pesannya.` };
}

export async function tambahPengguna(_prev: Hasil, formData: FormData): Promise<Hasil> {
  const { db } = await pastikanSuperAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const sandi = String(formData.get("sandi") ?? "");
  const nama = String(formData.get("nama") ?? "").trim();
  const laundryId = String(formData.get("laundry_id") ?? "");

  if (!email.includes("@")) return { error: "Email tidak sah." };
  if (sandi.length < 8) return { error: "Password minimal 8 karakter." };
  if (!nama) return { error: "Nama wajib diisi." };
  if (!laundryId) return { error: "Pilih laundry dulu." };

  // Akun login dibuat lewat Admin API — perangkat lunak ini memegang kuasa itu
  // hanya di dalam pagar pastikanSuperAdmin().
  const { data: akun, error: galatAkun } = await db.auth.admin.createUser({
    email,
    password: sandi,
    email_confirm: true,
  });

  if (galatAkun || !akun?.user) {
    return { error: `Gagal membuat akun: ${galatAkun?.message ?? "tidak diketahui"}` };
  }

  const { error: galatBaris } = await db.from("pengguna").insert({
    id: akun.user.id,
    laundry_id: laundryId,
    nama,
    peran: "PETUGAS",
  });

  if (galatBaris) {
    // Jangan tinggalkan akun login yang tidak tertaut ke laundry mana pun —
    // pemiliknya bisa masuk tapi tidak bisa berbuat apa-apa.
    await db.auth.admin.deleteUser(akun.user.id);
    return { error: "Gagal menautkan akun ke laundry." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/laundry/${laundryId}`);
  return { pesan: `Akun ${email} dibuat sebagai petugas.` };
}

export async function tambahLayanan(_prev: Hasil, formData: FormData): Promise<Hasil> {
  const { db } = await pastikanSuperAdmin();

  const laundryId = String(formData.get("laundry_id") ?? "");
  const nama = String(formData.get("nama") ?? "").trim();
  const satuan = String(formData.get("satuan") ?? "kg");
  const harga = Number(formData.get("harga") ?? 0);

  if (!laundryId || !nama) return { error: "Nama layanan wajib diisi." };
  if (!(harga > 0)) return { error: "Harga harus lebih dari nol." };

  const { error } = await db
    .from("layanan")
    .insert({ laundry_id: laundryId, nama, satuan, harga });

  if (error) return { error: "Gagal menyimpan layanan." };

  revalidatePath(`/admin/laundry/${laundryId}`);
  return { pesan: `Layanan "${nama}" ditambahkan.` };
}

// Menonaktifkan, bukan menghapus: pesanan lama menyimpan layanan_id, dan
// menghapusnya membuat riwayat harga ikut hilang.
export async function ubahAktifLayanan(formData: FormData) {
  const { db } = await pastikanSuperAdmin();

  const id = String(formData.get("id") ?? "");
  const laundryId = String(formData.get("laundry_id") ?? "");
  const aktif = formData.get("aktif") === "true";

  if (!id) return;

  await db.from("layanan").update({ aktif }).eq("id", id);
  revalidatePath(`/admin/laundry/${laundryId}`);
}
