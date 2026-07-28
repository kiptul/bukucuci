import FormLogin from "@/components/FormLogin";

export default async function HalamanLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const pesanAwal =
    error === "belum-terdaftar"
      ? "Akun ini belum ditautkan ke laundry mana pun. Jalankan SQL penautan akun (setup_akun.sql) di Supabase, lalu login lagi."
      : undefined;

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-10">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-600 text-3xl">
          🧺
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-sky-700">
          BukuCuci
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Buku nota digital + kabar WhatsApp otomatis untuk laundry
        </p>
      </div>
      <FormLogin pesanAwal={pesanAwal} />
    </main>
  );
}
