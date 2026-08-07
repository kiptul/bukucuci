"use client";

import Link from "next/link";
import LayarGalat from "@/components/ui/LayarGalat";

const TOMBOL_UTAMA =
  "flex w-full items-center justify-center bg-tinta py-3.5 text-sm font-medium text-kertas active:bg-tinta-2";

const TOMBOL_GARIS =
  "flex w-full items-center justify-center border border-garis py-3.5 text-sm font-medium text-tinta-2 active:bg-kertas";

export default function GalatAplikasi({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <LayarGalat
      kode="Gagal memuat"
      judul="Halaman ini tidak jadi terbuka."
      keterangan="Sambungan ke server terputus atau datanya gagal dibaca. Order yang sudah tersimpan tidak terpengaruh. Coba buka ulang halamannya."
      jejak={error.digest}
    >
      <button onClick={reset} className={TOMBOL_UTAMA}>
        Coba buka lagi
      </button>
      <Link href="/dashboard" className={TOMBOL_GARIS}>
        Kembali ke daftar order
      </Link>
    </LayarGalat>
  );
}
