// Dipakai bersama oleh navigasi bawah (HP) dan navigasi samping (layar besar),
// supaya menunya tidak perlu ditulis dua kali.
export const MENU = [
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
  {
    href: "/rak",
    label: "Rak",
    ikon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5h16v6H4zM4 13h16v6H4z"
      />
    ),
  },
  {
    href: "/order/baru",
    label: "Order Baru",
    ikon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    ),
  },
];

// /dashboard cocok juga untuk halaman detail order di bawahnya.
export function menuAktif(path: string, href: string): boolean {
  return path === href || path.startsWith(href + "/");
}
