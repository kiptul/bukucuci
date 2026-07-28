"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU, menuAktif } from "@/components/menu";
import PenandaMuat from "@/components/PenandaMuat";

// Navigasi untuk layar besar. Di HP digantikan NavBawah.
export default function NavSamping() {
  const path = usePathname();

  return (
    <aside className="hidden shrink-0 flex-col border-r border-garis bg-kertas md:flex md:w-60">
      <div className="px-5 pb-6 pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-tinta-3">
          BukuCuci
        </p>
        <p className="mt-1 text-[13px] leading-snug text-tinta-3">
          Buku nota digital
        </p>
      </div>

      <nav className="px-3">
        <ul className="space-y-1">
          {MENU.map((m) => {
            const aktif = menuAktif(path, m.href);
            return (
              <li key={m.href}>
                <Link
                  href={m.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm ${
                    aktif
                      ? "bg-tinta font-medium text-kertas shadow-[0_6px_16px_-12px_rgba(0,0,0,0.8)]"
                      : "text-tinta-2 hover:bg-kertas-terang hover:text-tinta"
                  }`}
                >
                  <PenandaMuat
                    anak={
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        className="h-5 w-5 shrink-0"
                        aria-hidden="true"
                      >
                        {m.ikon}
                      </svg>
                    }
                  />
                  {m.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
