import Header from "@/components/Header";
import NavBawah from "@/components/NavBawah";
import { getProfil } from "@/lib/profil";

// Kerangka semua halaman setelah login: header di atas, navigasi di bawah.
export default async function LayoutApl({
  children,
}: {
  children: React.ReactNode;
}) {
  const { laundry } = await getProfil();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header judul={laundry.nama} />
      {/* pb menyisakan ruang untuk navigasi bawah yang posisinya fixed */}
      <main className="flex-1 pb-24">{children}</main>
      <NavBawah />
    </div>
  );
}
