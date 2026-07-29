import Header from "@/components/Header";
import NavBawah from "@/components/NavBawah";
import NavSamping from "@/components/NavSamping";
import { getProfil } from "@/lib/profil";

// Kerangka semua halaman setelah login.
// HP: header di atas, navigasi menempel di dasar layar.
// Layar besar: navigasi pindah ke samping kiri, isi halaman melebar.
export default async function LayoutApl({
  children,
}: {
  children: React.ReactNode;
}) {
  const { laundry } = await getProfil();

  return (
    <div className="min-h-dvh md:flex">
      <NavSamping judul={laundry.nama} />

      <div className="flex min-h-dvh w-full min-w-0 flex-col bg-kertas-terang">
        <Header judul={laundry.nama} />
        {/* pb besar di HP menyisakan ruang untuk navigasi bawah yang fixed */}
        <main className="muncul mx-auto w-full max-w-md flex-1 pb-24 md:max-w-3xl md:pb-14 md:pt-8">
          {children}
        </main>
      </div>

      <NavBawah />
    </div>
  );
}
