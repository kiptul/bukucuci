"use server";

import { revalidatePath } from "next/cache";
import { getProfil } from "@/lib/profil";
import type { Hasil } from "@/app/admin/actions";

// Bentuk kode slot dikunci sama dengan yang diterima api/rak. Kalau di sini
// lebih longgar, kasir bisa membuat slot yang selamanya tidak pernah dilapori
// perangkat — tampil di layar, tapi tidak pernah berubah status.
const POLA_KODE = /^[A-Z]\d{1,2}$/;

// Tautkan satu slot ke satu order. Yang ditulis kode ordernya, bukan id-nya,
// karena itu yang tertempel di nota dan yang dibaca kasir dari rak fisik.
export async function tautkanSlot(_prev: Hasil, formData: FormData): Promise<Hasil> {
  const kodeSlot = String(formData.get("kode") ?? "").trim();
  const kodeOrder = String(formData.get("pesanan") ?? "").trim();

  if (!kodeSlot) return { error: "Slot tidak dikenali." };
  if (!kodeOrder) return { error: "Pilih dulu ordernya." };

  const { db, laundry } = await getProfil();

  const { data: pesanan } = await db
    .from("pesanan")
    .select("id, kode, status")
    .eq("laundry_id", laundry.id)
    .eq("kode", kodeOrder)
    .maybeSingle();

  if (!pesanan) return { error: `Order ${kodeOrder} tidak ditemukan.` };

  // Order yang sudah diambil atau dibatalkan tidak punya cucian di rak.
  // Menautkannya cuma membuat layar berbohong.
  if (pesanan.status === "DIAMBIL" || pesanan.status === "BATAL") {
    return { error: `Order ${kodeOrder} sudah ${pesanan.status.toLowerCase()}.` };
  }

  // Satu order satu slot — ditegakkan juga oleh unique index di database.
  // Tautan lama dilepas dulu supaya pemindahan rak tidak ditolak mentah.
  await db
    .from("rak_slot")
    .update({ pesanan_id: null })
    .eq("laundry_id", laundry.id)
    .eq("pesanan_id", pesanan.id);

  const { error } = await db
    .from("rak_slot")
    .update({ pesanan_id: pesanan.id })
    .eq("laundry_id", laundry.id)
    .eq("kode", kodeSlot);

  if (error) return { error: "Gagal menautkan order ke slot." };

  revalidatePath("/rak");
  return { pesan: `Order ${pesanan.kode} ditaruh di slot ${kodeSlot}.` };
}

// Lepas tautan tanpa menyentuh status terisi. Sensor yang menentukan slot itu
// kosong atau tidak — tombol ini cuma bilang "cucian ini bukan punya order itu".
export async function lepasSlot(formData: FormData) {
  const kode = String(formData.get("kode") ?? "").trim();
  if (!kode) return;

  const { db, laundry } = await getProfil();

  await db
    .from("rak_slot")
    .update({ pesanan_id: null })
    .eq("laundry_id", laundry.id)
    .eq("kode", kode);

  revalidatePath("/rak");
}

export async function tambahSlot(_prev: Hasil, formData: FormData): Promise<Hasil> {
  const kode = String(formData.get("kode") ?? "").trim().toUpperCase();

  if (!POLA_KODE.test(kode)) {
    return { error: "Kode slot berbentuk satu huruf lalu angka, misalnya A4 atau B12." };
  }

  const { db, laundry } = await getProfil();

  const { error } = await db
    .from("rak_slot")
    .insert({ laundry_id: laundry.id, kode });

  // 23505 = unique violation. Ini bukan kegagalan sistem, cuma slot yang
  // sudah ada — dijawab sebagai kalimat biasa, bukan galat.
  if (error?.code === "23505") return { error: `Slot ${kode} sudah ada.` };
  if (error) return { error: "Gagal menambah slot." };

  revalidatePath("/rak");
  return { pesan: `Slot ${kode} ditambahkan. Pasang sensornya, lalu daftarkan pinnya di firmware.` };
}

export async function hapusSlot(formData: FormData) {
  const kode = String(formData.get("kode") ?? "").trim();
  if (!kode) return;

  const { db, laundry } = await getProfil();

  // Slot yang sedang terisi tidak dihapus. Menghapusnya membuat cucian yang
  // nyata-nyata ada di rak menghilang dari layar, dan perangkat akan
  // membuatnya muncul lagi pada laporan berikutnya lewat upsert — jadi
  // penghapusannya pun tidak bertahan.
  await db
    .from("rak_slot")
    .delete()
    .eq("laundry_id", laundry.id)
    .eq("kode", kode)
    .eq("terisi", false);

  revalidatePath("/rak");
}
