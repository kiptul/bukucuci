"use client";

import "./globals.css";
import LayarGalat from "@/components/ui/LayarGalat";

const TOMBOL_UTAMA =
  "flex w-full items-center justify-center bg-tinta py-3.5 text-sm font-medium text-kertas active:bg-tinta-2";

// Jaring terakhir: dipakai hanya kalau layout akar sendiri yang gagal, jadi ia
// harus membangun <html> dan <body>-nya sendiri.
//
// Karena layout akar tidak ikut terpasang, variabel font dari next/font juga
// tidak ada. Font ditulis eksplisit di sini supaya halaman ini tetap terbaca
// rapi, bukan jatuh ke Times New Roman — memuat font web di halaman yang
// muncul justru ketika ada yang rusak bukan pertukaran yang sepadan.
export default function GalatGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        className="min-h-dvh bg-kertas text-tinta antialiased"
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <LayarGalat
          kode="Aplikasi berhenti"
          judul="Kelar gagal dijalankan."
          keterangan="Aplikasinya berhenti sebelum sempat menampilkan apa pun. Data di server tidak terpengaruh. Muat ulang halamannya; kalau tetap sama, laporkan kode kejadian di bawah."
          jejak={error.digest}
        >
          <button onClick={reset} className={TOMBOL_UTAMA}>
            Muat ulang
          </button>
        </LayarGalat>
      </body>
    </html>
  );
}
