import Link from "next/link";
import LayarGalat from "@/components/ui/LayarGalat";

const TOMBOL_UTAMA =
  "flex w-full items-center justify-center bg-tinta py-3.5 text-sm font-medium text-kertas active:bg-tinta-2";

export default function TidakDitemukan() {
  return (
    <LayarGalat
      kode="Alamat tidak dikenal"
      judul="Halaman ini tidak ada."
      keterangan="Alamatnya salah ketik, atau ordernya sudah dihapus. Daftar order masih berisi semuanya yang tercatat."
    >
      <Link href="/dashboard" className={TOMBOL_UTAMA}>
        Buka daftar order
      </Link>
    </LayarGalat>
  );
}
