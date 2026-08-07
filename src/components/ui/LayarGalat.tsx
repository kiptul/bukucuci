// Tampilan penuh layar untuk keadaan yang menghentikan halaman: galat server,
// alamat yang tidak ada, sesi yang putus.
//
// Bentuknya sengaja mengulang kartu nota — bidang kertas terang di atas latar
// kertas, garis aksen pendek, tepi sobek di dasarnya. Halaman galat yang
// tampak berasal dari aplikasi lain membuat orang mengira aplikasinya rusak
// lebih parah daripada yang sebenarnya terjadi.
//
// Aturan teksnya: sebutkan apa yang terjadi dan apa langkah berikutnya.
// Jangan meminta maaf, jangan menyalahkan pemakai, jangan samar.
export default function LayarGalat({
  kode,
  judul,
  keterangan,
  jejak,
  children,
}: {
  // Label pendek di atas judul — bukan pesan, melainkan penanda jenis galat
  // supaya kasir bisa menyebutnya saat melapor.
  kode: string;
  judul: string;
  keterangan: string;
  jejak?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="border border-garis bg-kertas-terang px-6 py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-tinta-3">
            {kode}
          </p>

          <h1 className="mt-3.5 text-[26px] font-bold leading-[1.1] tracking-[-0.02em]">
            {judul}
          </h1>

          <span className="mt-5 block h-px w-12 bg-aksen" />

          <p className="mt-5 text-[15px] leading-relaxed text-tinta-2">
            {keterangan}
          </p>

          {children && <div className="mt-7 space-y-2.5">{children}</div>}

          {/* Digest dari Next.js. Pesan galat asli sengaja tidak ditampilkan:
              isinya bisa memuat detail basis data. Kode ini cukup untuk
              mencocokkan laporan kasir dengan catatan galat di server. */}
          {jejak && (
            <p className="mt-7 border-t border-garis pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-tinta-3">
              Kode kejadian {jejak}
            </p>
          )}
        </div>

        <div
          className="tepi-sobek [--warna-latar:var(--color-kertas)]"
          aria-hidden="true"
        />
      </div>
    </main>
  );
}
