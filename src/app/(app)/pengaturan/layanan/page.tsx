import Link from "next/link";
import FormAdmin, { gayaInput, gayaLabel } from "@/components/forms/FormAdmin";
import { getProfil } from "@/lib/profil";
import { simpanLayanan, tambahLayanan } from "../actions";

export const dynamic = "force-dynamic";

type Layanan = {
  id: string;
  nama: string;
  satuan: string;
  harga: number;
  aktif: boolean;
};

export default async function PengaturanLayanan() {
  const { db, laundry } = await getProfil();

  const { data } = await db
    .from("layanan")
    .select("id, nama, satuan, harga, aktif")
    .eq("laundry_id", laundry.id)
    .order("created_at");

  const layanan = (data ?? []) as Layanan[];
  const adaHargaNol = layanan.some((l) => l.aktif && l.harga === 0);

  return (
    <div className="px-4 md:px-0">
      <Link
        href="/pengaturan"
        className="font-mono text-[11px] uppercase tracking-wider text-tinta-3"
      >
        ← Pengaturan
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight">Layanan & harga</h1>
      <p className="mt-1 text-sm leading-relaxed text-tinta-2">
        Yang aktif muncul sebagai pilihan saat mencatat order. Order lama tetap
        memakai harga saat order itu dibuat.
      </p>

      {adaHargaNol && (
        <p
          role="status"
          className="mt-5 border-l-[3px] border-amber-700 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-950"
        >
          Ada layanan aktif yang harganya masih 0. Order yang memakainya akan
          bertotal nol.
        </p>
      )}

      <section className="mt-7">
        {!layanan.length ? (
          <p className="py-6 text-sm leading-relaxed text-tinta-3">
            Belum ada layanan. Tambahkan minimal satu supaya order bisa dicatat.
          </p>
        ) : (
          <FormAdmin
            aksi={simpanLayanan}
            saatMenunggu="Menyimpan..."
            tombol="Simpan perubahan"
          >
            <div className="space-y-4">
              {layanan.map((l) => (
                <div key={l.id} className="border border-garis bg-white p-4">
                  <input type="hidden" name="id" value={l.id} />

                  <label htmlFor={`nama-${l.id}`} className={gayaLabel}>
                    Nama layanan
                  </label>
                  <input
                    id={`nama-${l.id}`}
                    name={`nama-${l.id}`}
                    defaultValue={l.nama}
                    required
                    minLength={2}
                    className={gayaInput}
                  />

                  <div className="mt-3 flex gap-3">
                    <div className="min-w-0 flex-1">
                      <label htmlFor={`harga-${l.id}`} className={gayaLabel}>
                        Harga
                      </label>
                      <input
                        id={`harga-${l.id}`}
                        name={`harga-${l.id}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={500}
                        defaultValue={l.harga}
                        required
                        className={`${gayaInput} angka font-mono`}
                      />
                    </div>
                    <div className="w-28 shrink-0">
                      <label htmlFor={`satuan-${l.id}`} className={gayaLabel}>
                        Satuan
                      </label>
                      <select
                        id={`satuan-${l.id}`}
                        name={`satuan-${l.id}`}
                        defaultValue={l.satuan}
                        className={gayaInput}
                      >
                        <option value="kg">kg</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </div>
                  </div>

                  <label className="mt-4 flex items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      name={`aktif-${l.id}`}
                      defaultChecked={l.aktif}
                      className="h-4 w-4 accent-aksen"
                    />
                    Tampilkan saat mencatat order
                  </label>
                </div>
              ))}
            </div>
          </FormAdmin>
        )}
      </section>

      <section className="mt-9">
        <h2 className="mb-4 border-b border-garis pb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
          Tambah layanan
        </h2>
        <div className="border border-garis bg-white p-5">
          <FormAdmin
            aksi={tambahLayanan}
            saatMenunggu="Menambah..."
            tombol="Tambah layanan"
          >
            <div>
              <label htmlFor="nama-baru" className={gayaLabel}>
                Nama layanan
              </label>
              <input
                id="nama-baru"
                name="nama"
                required
                minLength={2}
                autoComplete="off"
                className={gayaInput}
              />
            </div>
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <label htmlFor="harga-baru" className={gayaLabel}>
                  Harga
                </label>
                <input
                  id="harga-baru"
                  name="harga"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  defaultValue={0}
                  required
                  className={`${gayaInput} angka font-mono`}
                />
              </div>
              <div className="w-28 shrink-0">
                <label htmlFor="satuan-baru" className={gayaLabel}>
                  Satuan
                </label>
                <select
                  id="satuan-baru"
                  name="satuan"
                  defaultValue="kg"
                  className={gayaInput}
                >
                  <option value="kg">kg</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
            </div>
          </FormAdmin>
        </div>
      </section>
    </div>
  );
}
