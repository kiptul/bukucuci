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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-20 md:justify-center md:pt-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-tinta-3">
        BukuCuci
      </p>
      <h1 className="mt-2 text-[32px] font-bold leading-[1.1] tracking-tight">
        Buku nota
        <br />
        laundry Anda.
      </h1>
      <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-tinta-2">
        Catat order seperti biasa. Pelanggan dikabari lewat WhatsApp otomatis.
      </p>

      <div className="mt-8 border-t border-garis pt-8">
        <FormLogin pesanAwal={pesanAwal} />
      </div>
    </main>
  );
}
