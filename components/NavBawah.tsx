"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  {
    href: "/order/baru",
    label: "Order Baru",
    ikon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 5v14M5 12h14"
      />
    ),
  },
  {
    href: "/dashboard",
    label: "Daftar Order",
    ikon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h10"
      />
    ),
  },
];

export default function NavBawah() {
  const path = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="flex">
        {menu.map((m) => {
          // /dashboard cocok juga untuk halaman detail order di bawahnya
          const aktif = path === m.href || path.startsWith(m.href + "/");
          return (
            <li key={m.href} className="flex-1">
              <Link
                href={m.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                  aktif ? "text-sky-600" : "text-slate-500"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={aktif ? 2.5 : 2}
                  className="h-6 w-6"
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
  );
}
