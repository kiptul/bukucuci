import Link from "next/link";
import { notFound } from "next/navigation";
import FormAdmin, { gayaInput, gayaLabel } from "@/components/forms/FormAdmin";
import { pastikanSuperAdmin } from "@/lib/admin";
import { hpCantik, rupiah } from "@/lib/format";
import { tambahLayanan, tambahPengguna, ubahAktifLayanan } from "../../actions";

export const dynamic = "force-dynamic";

export default async function DetailLaundry({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { db } = await pastikanSuperAdmin();

  const { data: laundry } = await db
    .from("laundry")
    .select("id, nama, alamat, telp")
    .eq("id", id)
    .maybeSingle();

  if (!laundry) notFound();

  const [{ data: layanan }, { data: petugas }, { count: jumlahOrder }] =
    await Promise.all([
      db
        .from("layanan")
        .select("id, nama, satuan, harga, aktif")
        .eq("laundry_id", id)
        .order("created_at"),
      db.from("pengguna").select("id, nama, peran").eq("laundry_id", id),
      db
        .from("pesanan")
        .select("id", { count: "exact", head: true })
        .eq("laundry_id", id),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="font-mono text-[11px] uppercase tracking-wider text-tinta-3"
        >
          ← Semua laundry
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          {laundry.nama}
        </h1>
        <p className="mt-1 text-sm text-tinta-2">
          {laundry.alamat ?? "alamat belum diisi"}
          {laundry.telp ? ` · ${hpCantik(laundry.telp)}` : ""}
        </p>
        <p className="angka mt-1 font-mono text-[11px] text-tinta-3">
          {jumlahOrder ?? 0} order tercatat
        </p>
      </div>

      <section>
        <h2 className="mb-1 border-b border-garis pb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
          Layanan
        </h2>
        {!layanan?.length ? (
          <p className="py-6 text-sm text-tinta-3">
            Belum ada layanan. Tanpa layanan, kasir tidak bisa membuat order.
          </p>
        ) : (
          <ul className="divide-y divide-garis">
            {layanan.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p
                    className={`font-medium leading-snug ${l.aktif ? "" : "text-tinta-3 line-through"}`}
                  >
                    {l.nama}
                  </p>
                  <p className="angka mt-0.5 font-mono text-xs text-tinta-3">
                    {rupiah(l.harga)}/{l.satuan}
                  </p>
                </div>
                <form action={ubahAktifLayanan}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="laundry_id" value={id} />
                  <input
                    type="hidden"
                    name="aktif"
                    value={l.aktif ? "false" : "true"}
                  />
                  <button className="shrink-0 border border-garis px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-tinta-2 hover:border-tinta-3">
                    {l.aktif ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 border border-garis bg-white p-5">
          <h3 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-tinta-2">
            Tambah layanan
          </h3>
          <FormAdmin
            aksi={tambahLayanan}
            saatMenunggu="Menyimpan..."
            tombol="Simpan layanan"
          >
            <input type="hidden" name="laundry_id" value={id} />
            <div>
              <label htmlFor="nama-layanan" className={gayaLabel}>
                Nama layanan
              </label>
              <input
                id="nama-layanan"
                name="nama"
                required
                autoComplete="off"
                placeholder="Cuci Setrika Reguler"
                className={gayaInput}
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="harga" className={gayaLabel}>
                  Harga
                </label>
                <input
                  id="harga"
                  name="harga"
                  inputMode="numeric"
                  required
                  placeholder="7000"
                  className={`${gayaInput} angka font-mono`}
                />
              </div>
              <div className="w-28">
                <label htmlFor="satuan" className={gayaLabel}>
                  Satuan
                </label>
                <select id="satuan" name="satuan" className={gayaInput}>
                  <option value="kg">kg</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
            </div>
          </FormAdmin>
        </div>
      </section>

      <section>
        <h2 className="mb-1 border-b border-garis pb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
          Petugas
        </h2>
        {!petugas?.length ? (
          <p className="py-6 text-sm text-tinta-3">
            Belum ada petugas. Tanpa akun, laundry ini tidak bisa dipakai.
          </p>
        ) : (
          <ul className="divide-y divide-garis">
            {petugas.map((p) => (
              <li
                key={p.id}
                className="flex items-baseline justify-between gap-3 py-3"
              >
                <span className="font-medium">{p.nama ?? "—"}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-tinta-3">
                  {p.peran}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 border border-garis bg-white p-5">
          <h3 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-tinta-2">
            Tambah petugas
          </h3>
          <FormAdmin
            aksi={tambahPengguna}
            saatMenunggu="Membuat akun..."
            tombol="Buat akun petugas"
          >
            <input type="hidden" name="laundry_id" value={id} />
            <div>
              <label htmlFor="nama-petugas" className={gayaLabel}>
                Nama petugas
              </label>
              <input
                id="nama-petugas"
                name="nama"
                required
                autoComplete="off"
                className={gayaInput}
              />
            </div>
            <div>
              <label htmlFor="email" className={gayaLabel}>
                Email untuk login
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="off"
                className={gayaInput}
              />
            </div>
            <div>
              <label htmlFor="sandi" className={gayaLabel}>
                Password awal · minimal 8 karakter
              </label>
              <input
                id="sandi"
                name="sandi"
                type="text"
                required
                minLength={8}
                autoComplete="off"
                className={`${gayaInput} font-mono`}
              />
            </div>
            <p className="text-xs leading-relaxed text-tinta-3">
              Password ini terlihat supaya bisa langsung diberitahukan ke
              petugasnya. Minta dia menggantinya setelah masuk.
            </p>
          </FormAdmin>
        </div>
      </section>
    </div>
  );
}
