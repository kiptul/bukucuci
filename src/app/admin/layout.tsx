import Link from "next/link";
import { keluar } from "@/app/login/actions";
import { pastikanSuperAdmin } from "@/lib/admin";

// Konsol superadmin. Sengaja dibuat berbeda dari halaman kasir — bilah atasnya
// gelap penuh dan tidak ada navigasi bawah — supaya jelas ini bukan tempat
// kasir bekerja, dan tidak ada yang salah masuk tanpa sadar.
export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { nama } = await pastikanSuperAdmin();

  return (
    <div className="min-h-dvh bg-kertas-terang">
      <header className="sticky top-0 z-20 bg-tinta text-kertas">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3.5 md:px-6">
          <Link href="/admin" className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-kertas/40">
              Kelar · konsol
            </p>
            <p className="truncate text-[17px] font-semibold leading-tight tracking-tight">
              {nama}
            </p>
          </Link>

          <form action={keluar}>
            <button className="border border-kertas/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-kertas/70 hover:border-kertas/40 hover:text-kertas">
              Keluar
            </button>
          </form>
        </div>
      </header>

      <main className="muncul mx-auto max-w-4xl px-4 pb-14 pt-6 md:px-6">
        {children}
      </main>
    </div>
  );
}
