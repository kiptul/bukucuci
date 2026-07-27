import { keluar } from "@/app/login/actions";

export default function Header({ judul }: { judul: string }) {
  return (
    <header className="sticky top-0 z-10 bg-sky-600 text-white shadow">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-200">
            BukuCuci
          </p>
          <h1 className="text-lg font-bold leading-tight">{judul}</h1>
        </div>
        <form action={keluar}>
          <button className="rounded-lg bg-sky-700 px-3 py-1.5 text-sm font-medium active:bg-sky-800">
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
