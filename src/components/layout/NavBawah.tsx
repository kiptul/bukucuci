"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU, menuAktif } from "@/components/navigation/menu";
import PenandaMuat from "@/components/ui/PenandaMuat";

// Navigasi untuk HP. Di layar besar digantikan NavSamping.
export default function NavBawah() {
  const path = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-garis bg-kertas-terang/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-20px_rgba(0,0,0,0.6)] backdrop-blur-sm md:hidden">
      <ul className="flex">
        {MENU.map((m) => {
          const aktif = menuAktif(path, m.href);
          return (
            <li key={m.href} className="flex-1">
              <Link
                href={m.href}
                className={`relative flex flex-col items-center gap-1.5 py-3 ${
                  aktif ? "text-aksen" : "text-tinta-3"
                }`}
              >
                {/* penanda aktif: garis tebal di atas, bukan sekadar beda warna */}
                <span
                  className={`absolute inset-x-0 top-0 h-[3px] ${
                    aktif ? "bg-aksen" : "bg-transparent"
                  }`}
                />
                <PenandaMuat
                  anak={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      {m.ikon}
                    </svg>
                  }
                />
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  {m.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
