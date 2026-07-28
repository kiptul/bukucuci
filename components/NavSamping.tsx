"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU, menuAktif } from "@/components/menu";

// Navigasi untuk layar besar. Di HP digantikan NavBawah.
export default function NavSamping() {
  const path = usePathname();

  return (
    <aside className="hidden shrink-0 flex-col border-r border-garis bg-kertas md:flex md:w-56">
      <div className="px-5 pb-4 pt-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-tinta-3">
          BukuCuci
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
                      ? "bg-tinta font-medium text-kertas"
                      : "text-tinta-2 hover:bg-kertas-terang"
                  }`}
                >
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
