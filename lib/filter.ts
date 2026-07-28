// Dipakai server (memvalidasi ?status=) dan klien (menggambar chip).
// Harus di modul netral: konstanta yang diekspor dari file "use client"
// tidak sampai utuh ke Server Component — yang boleh menyeberang batas itu
// hanya komponen, bukan nilai biasa.
export const FILTER = [
  "SEMUA",
  "MASUK",
  "SIAP",
  "DIAMBIL",
  "BATAL",
] as const;

export type PilihanFilter = (typeof FILTER)[number];
