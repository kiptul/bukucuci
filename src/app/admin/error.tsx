"use client";

import Link from "next/link";
import LayarGalat from "@/components/ui/LayarGalat";

const TOMBOL_UTAMA =
  "flex w-full items-center justify-center bg-tinta py-3.5 text-sm font-medium text-kertas active:bg-tinta-2";

const TOMBOL_GARIS =
  "flex w-full items-center justify-center border border-garis py-3.5 text-sm font-medium text-tinta-2 active:bg-kertas";

export default function GalatAdmin({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <LayarGalat
      kode="Gagal memuat"
      judul="Konsol tidak jadi terbuka."
      keterangan="Perintah ke basis data gagal diselesaikan. Tidak ada perubahan yang tersimpan sebagian — kalau tadi sedang menyimpan, ulangi dari awal dan periksa hasilnya."
      jejak={error.digest}
    >
      <button onClick={reset} className={TOMBOL_UTAMA}>
        Coba buka lagi
      </button>
      <Link href="/admin" className={TOMBOL_GARIS}>
        Kembali ke daftar laundry
      </Link>
    </LayarGalat>
  );
}
