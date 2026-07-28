import FormLogin from "@/components/FormLogin";

const JANJI = [
  "Catat order secepat menulis di buku",
  "Pelanggan dikabari sendiri lewat WhatsApp",
  "Order lama dari buku tetap bisa dimasukkan",
];

export default async function HalamanLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const pesanAwal =
    error === "belum-terdaftar"
      ? "Akun ini belum ditautkan ke laundry mana pun. Jalankan setup_akun.sql di Supabase, lalu login lagi."
      : undefined;

  return (
    <main className="min-h-dvh md:grid md:grid-cols-[1.05fr_1fr]">
      {/* Bidang identitas. Di layar besar jadi bidang tinta penuh supaya
          halaman punya bobot — kolom sempit di tengah layar lebar terlihat
          seperti halaman HP yang dipaksa melebar. */}
      <section className="flex flex-col justify-center px-6 pt-16 md:bg-tinta md:px-14 md:pt-0 md:text-kertas">
        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-tinta-3 md:text-kertas/45">
          BukuCuci
        </p>
        <h1 className="mt-3.5 text-[34px] font-bold leading-[1.06] tracking-[-0.025em] md:text-[42px]">
          Buku nota
          <br />
          laundry Anda.
        </h1>

        <span className="mt-6 block h-px w-12 bg-aksen" />

        <ul className="mt-6 space-y-2.5 md:mt-7">
          {JANJI.map((j) => (
            <li
              key={j}
              className="flex gap-3 text-[15px] leading-relaxed text-tinta-2 md:text-kertas/70"
            >
              <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-aksen" />
              {j}
            </li>
          ))}
        </ul>

        <p className="mt-10 hidden font-mono text-[10px] uppercase tracking-[0.24em] text-kertas/30 md:block">
          Karawang · 2026
        </p>
      </section>

      {/* Bidang form */}
      <section className="flex flex-col justify-center px-6 pb-14 pt-9 md:px-14 md:pt-0">
        <div>
          <div className="border border-garis bg-white px-6 py-7 shadow-[0_24px_50px_-38px_rgba(0,0,0,0.6)] md:px-8">
            <FormLogin pesanAwal={pesanAwal} />
          </div>
          <div
            className="tepi-sobek [--warna-latar:var(--color-kertas)]"
            aria-hidden="true"
          />
        </div>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-tinta-3 md:hidden">
          Karawang · 2026
        </p>
      </section>
    </main>
  );
}
