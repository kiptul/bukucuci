// Dipakai bersama oleh navigasi bawah (HP) dan navigasi samping (layar besar),
// supaya menunya tidak perlu ditulis dua kali.
export const MENU = [
  {
    href: "/order/baru",
    label: "Order Baru",
    ikon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
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

// /dashboard cocok juga untuk halaman detail order di bawahnya.
export function menuAktif(path: string, href: string): boolean {
  return path === href || path.startsWith(href + "/");
}
