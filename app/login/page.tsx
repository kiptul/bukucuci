import FormLogin from "@/components/FormLogin";

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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-14">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-tinta-3">
          BukuCuci
        </p>
        <h1 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-0.02em]">
          Buku nota
          <br />
          laundry Anda.
        </h1>
        <p className="mt-3.5 max-w-[32ch] text-[15px] leading-relaxed text-tinta-2">
          Catat order seperti biasa. Pelanggan dikabari lewat WhatsApp otomatis.
        </p>
      </div>

      {/* Formnya sendiri berupa lembar nota, senada dengan halaman detail order */}
      <div className="mt-9">
        <div className="border border-garis bg-white px-6 py-7 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.55)]">
          <FormLogin pesanAwal={pesanAwal} />
        </div>
        <div
          className="tepi-sobek [--warna-latar:var(--color-kertas)]"
          aria-hidden="true"
        />
      </div>

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-tinta-3">
        Karawang · 2026
      </p>
    </main>
  );
}
