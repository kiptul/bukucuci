"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { keluar } from "@/app/login/actions";
import { MENU, menuAktif } from "@/components/navigation/menu";
import PenandaMuat from "@/components/ui/PenandaMuat";

// Navigasi layar besar. Di sini juga tempat identitas laundry dan tombol
// keluar, supaya bilah atas tidak perlu ada di desktop — bilah hitam setinggi
// itu hanya untuk mengulang nama yang sudah tertulis di sini.
export default function NavSamping({ judul }: { judul: string }) {
  const path = usePathname();

  return (
    <aside className="hidden min-h-dvh shrink-0 flex-col border-r border-garis bg-kertas md:flex md:w-64">
      <div className="px-6 pb-7 pt-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-tinta-3">
          Kelar
        </p>
        <p className="mt-2.5 text-[17px] font-semibold leading-snug tracking-tight">
          {judul}
        </p>
        <span className="mt-3 block h-px w-10 bg-aksen" />
        <form action={keluar} className="mt-5">
          <button className="w-full border border-garis px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-tinta-3 transition-colors hover:border-tinta-3 hover:text-tinta">
            Keluar
          </button>
        </form>
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
                      ? "bg-tinta font-medium text-kertas shadow-[0_8px_18px_-14px_rgba(0,0,0,0.9)]"
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

        {/* Dipisah garis dari tiga menu utama: ini bukan pekerjaan harian. */}
        <ul className="mt-3 border-t border-garis pt-3">
          <li>
            <Link
              href="/pengaturan"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm ${
                menuAktif(path, "/pengaturan")
                  ? "bg-tinta font-medium text-kertas shadow-[0_8px_18px_-14px_rgba(0,0,0,0.9)]"
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.3 4.3h3.4l.4 2.2 2 1.2 2.1-.8 1.7 3-1.6 1.5v2.3l1.6 1.5-1.7 3-2.1-.8-2 1.2-.4 2.2h-3.4l-.4-2.2-2-1.2-2.1.8-1.7-3L5.7 14v-2.3L4.1 10.2l1.7-3 2.1.8 2-1.2z"
                    />
                    <circle cx="12" cy="12" r="2.4" />
                  </svg>
                }
              />
              Pengaturan
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
