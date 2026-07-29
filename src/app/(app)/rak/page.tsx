import StatusRak, { type Slot } from "@/components/StatusRak";
import { getProfil } from "@/lib/profil";
import { tanggalLengkap } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HalamanRak() {
  const { db } = await getProfil();

  const [{ data: slot }, { data: perangkat }] = await Promise.all([
    db.from("rak_slot").select("kode, terisi, terakhir_update").order("kode"),
    db.from("rak_perangkat").select("nama, terakhir_kontak").maybeSingle(),
  ]);

  // Laundry yang belum memasang perangkat tidak punya barisnya sama sekali.
  if (!slot?.length) {
    return (
      <div className="px-4 py-6 md:mx-auto md:max-w-xl md:px-6">
        <h1 className="font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
          Rak
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-tinta-2">
          Modul rak belum terpasang di laundry ini. Rak fisik dipantau lewat
          perangkat kecil yang dipasang di setiap slot, lalu statusnya tampil di
          sini tanpa perlu dicatat manual.
        </p>
      </div>
    );
  }

  // Perangkat melapor tiap 30 detik. Lewat 90 detik tanpa kabar berarti mati,
  // dan itu harus dibedakan dari rak yang kebetulan kosong.
  const kontak = perangkat?.terakhir_kontak
    ? new Date(perangkat.terakhir_kontak)
    : null;
  const hidup = kontak ? Date.now() - kontak.getTime() < 90_000 : false;

  return (
    <div className="md:mx-auto md:max-w-xl">
      <StatusRak awal={slot as Slot[]} />

      <section className="px-4 py-4 md:px-6">
        <div className="flex items-baseline justify-between gap-3">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                hidup ? "bg-aksen" : "bg-tinta-3"
              }`}
              aria-hidden="true"
            />
            <span className={hidup ? "text-aksen" : "text-tinta-3"}>
              {hidup ? "Perangkat terhubung" : "Perangkat tidak melapor"}
            </span>
          </span>
        </div>
        <p className="angka mt-1.5 font-mono text-[11px] text-tinta-3">
          {kontak ? `Kabar terakhir ${tanggalLengkap(kontak.toISOString())}` : "Belum pernah melapor"}
        </p>
      </section>
    </div>
  );
}
