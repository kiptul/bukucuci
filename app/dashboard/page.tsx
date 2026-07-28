import Header from "@/components/Header";
import { getProfil } from "@/lib/profil";

export default async function Dashboard() {
  const { laundry } = await getProfil();

  return (
    <>
      <Header judul={laundry.nama} />
      <main className="p-4">
        <p className="rounded-xl bg-emerald-100 p-4 text-emerald-800">
          Login berhasil. Kerangka dashboard menyusul di Tugas 3.
        </p>
      </main>
    </>
  );
}
