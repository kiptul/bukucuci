import { keluar } from "@/app/login/actions";

export default function Header({ judul }: { judul: string }) {
  return (
    // Hanya untuk HP. Di layar besar identitas & tombol keluar ada di sidebar.
    <header className="sticky top-0 z-20 bg-tinta text-kertas shadow-[0_8px_24px_-16px_rgba(0,0,0,0.5)] md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-kertas/40">
            Kelar
          </p>
          <h1 className="truncate text-[17px] font-semibold leading-tight tracking-tight">
            {judul}
          </h1>
        </div>

        <form action={keluar}>
          <button className="border border-kertas/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-kertas/70 hover:border-kertas/40 hover:text-kertas active:bg-kertas/10">
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
