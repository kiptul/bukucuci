"use client";

import TombolAksi from "@/components/TombolAksi";

// Membatalkan order tidak bisa diurungkan, jadi minta konfirmasi dulu.
// Dipakai di dalam form yang sudah membawa id pesanan dan status tujuan.
export default function TombolBatal() {
  return (
    <TombolAksi
      gaya="garis"
      saatMenunggu="Membatalkan..."
      onClick={(e) => {
        if (!confirm("Batalkan order ini? Tidak bisa dikembalikan.")) {
          e.preventDefault();
        }
      }}
    >
      Batalkan order
    </TombolAksi>
  );
}
