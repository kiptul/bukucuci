import type { JenisNotifikasi } from "@/lib/types";

// Aturan kapan reminder dikirim. Sengaja dipisah dari kode yang menyentuh
// database supaya bisa diuji sendiri tanpa Supabase.
//
// Diurutkan dari yang paling lama, karena yang dicari adalah tahap tertinggi
// yang sudah terlewati.
export const TAHAP = [
  { hari: 7, jenis: "REMINDER_H7" },
  { hari: 3, jenis: "REMINDER_H3" },
  { hari: 1, jenis: "REMINDER_H1" },
] as const satisfies readonly { hari: number; jenis: JenisNotifikasi }[];

// Tahap mana yang pantas dikirim untuk order yang siap sejak `sejakSiap`.
//
// Sengaja hanya mengembalikan SATU tahap — yang tertinggi. Kalau cron sempat
// mati beberapa hari, order berumur 5 hari cukup dikirimi H+3 sekali, bukan
// H+1 dan H+3 sekaligus. Pelanggan tidak diberondong pesan susulan.
export function tahapReminder(
  sejakSiap: Date,
  sekarang: Date
): JenisNotifikasi | null {
  const hari = (sekarang.getTime() - sejakSiap.getTime()) / 86_400_000;
  return TAHAP.find((t) => hari >= t.hari)?.jenis ?? null;
}
