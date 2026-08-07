import Link from "next/link";
import { getProfil } from "@/lib/profil";

export const dynamic = "force-dynamic";

const ISI = [
  {
    href: "/pengaturan/layanan",
    judul: "Layanan & harga",
    ket: "Daftar layanan yang muncul saat mencatat order",
  },
  {
    href: "/pengaturan/pesan",
    judul: "Pesan WhatsApp",
    ket: "Teks yang dikirim otomatis ke pelanggan",
  },
  {
    href: "/pengaturan/usaha",
    judul: "Profil usaha",
    ket: "Nama, alamat, nomor telepon, dan catatan di bawah nota",
  },
];

export default async function Pengaturan() {
  const { laundry } = await getProfil();

  return (
    <div className="px-4 md:px-0">
      <h1 className="border-b border-garis pb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
        Pengaturan
      </h1>

      <ul className="divide-y divide-garis">
        {ISI.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              className="baris flex items-center justify-between gap-4 py-4 active:bg-white"
            >
              <span className="min-w-0">
                <span className="block font-medium leading-snug">
                  {i.judul}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-tinta-3">
                  {i.ket}
                </span>
              </span>
              <span aria-hidden="true" className="shrink-0 text-tinta-3">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Ganti password sengaja tidak ada di sini. Kelar tidak punya alur
          lupa-password lewat email, jadi satu-satunya jalan yang benar adalah
          lewat pengelola — dan itu dikatakan terus terang, bukan disembunyikan
          di balik tombol yang ujungnya buntu. */}
      <div className="mt-8 border border-garis bg-white p-5">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-tinta-2">
          Ganti password
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-tinta-2">
          Password akun {laundry.nama} diatur oleh pengelola Kelar. Hubungi admin
          untuk menggantinya.
        </p>
      </div>
    </div>
  );
}
