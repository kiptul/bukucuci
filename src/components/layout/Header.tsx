import Link from "next/link";
import { keluar } from "@/app/login/actions";

export default function Header({ judul }: { judul: string }) {
  return (
    // Hanya untuk HP. Di layar besar identitas & tombol keluar ada di sidebar.
    <header className="sticky top-0 z-20 bg-tinta text-kertas shadow-[0_8px_24px_-16px_rgba(0,0,0,0.5)] md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        {/* Nama usaha jadi pintu ke pengaturan. Sengaja tidak dijadikan menu
            keempat di bawah: pengaturan dibuka dua kali setahun sementara
            "Order Baru" puluhan kali sehari, dan menaruh keduanya berdampingan
            dengan bobot yang sama berbohong soal kepentingannya. */}
        <Link href="/pengaturan" className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-kertas/40">
            Kelar
          </p>
          <h1 className="flex items-center gap-1.5 truncate text-[17px] font-semibold leading-tight tracking-tight">
            <span className="truncate">{judul}</span>
            <span aria-hidden="true" className="shrink-0 text-kertas/40">
              ›
            </span>
          </h1>
          <span className="sr-only">Buka pengaturan</span>
        </Link>

        <form action={keluar}>
          <button className="border border-kertas/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-kertas/70 hover:border-kertas/40 hover:text-kertas active:bg-kertas/10">
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
