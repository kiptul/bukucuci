import { keluar } from "@/app/login/actions";

export default function Header({ judul }: { judul: string }) {
  return (
    <header className="sticky top-0 z-10 bg-tinta text-kertas">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-kertas/45">
            BukuCuci
          </p>
          <h1 className="truncate text-[17px] font-semibold leading-tight">
            {judul}
          </h1>
        </div>
        <form action={keluar}>
          <button className="border border-kertas/25 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-kertas/75 active:bg-kertas/10">
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
