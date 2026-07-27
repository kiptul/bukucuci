"use client";

// Membatalkan order tidak bisa diurungkan, jadi minta konfirmasi dulu.
// Dipakai di dalam form yang sudah membawa id pesanan.
export default function TombolBatal() {
  return (
    <button
      name="status"
      value="BATAL"
      onClick={(e) => {
        if (!confirm("Batalkan order ini? Tidak bisa dikembalikan.")) {
          e.preventDefault();
        }
      }}
      className="w-full border border-garis py-3 text-sm text-tinta-2 active:bg-kertas"
    >
      Batalkan order
    </button>
  );
}
