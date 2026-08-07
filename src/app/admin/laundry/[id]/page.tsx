import Link from "next/link";
import { notFound } from "next/navigation";
import FormAdmin from "@/components/forms/FormAdmin";
import { gayaInput, gayaLabel } from "@/components/forms/gaya";
import { pastikanSuperAdmin } from "@/lib/admin";
import { hpCantik, rupiah } from "@/lib/format";
import {
  resetSandi,
  tambahLayanan,
  tambahPengguna,
  ubahAktifLayanan,
} from "../../actions";

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

  const [{ data: layanan }, { data: akun }, { count: jumlahOrder }] =
    await Promise.all([
      db
        .from("layanan")
        .select("id, nama, satuan, harga, aktif")
        .eq("laundry_id", id)
        .order("created_at"),
      // maybeSingle, bukan daftar: satu laundry hanya boleh punya satu akun,
      // dijaga unique index idx_pengguna_satu_akun_per_laundry.
      db
        .from("pengguna")
        .select("id, nama")
        .eq("laundry_id", id)
        .maybeSingle(),
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
          Akun laundry
        </h2>

        {/* Formulirnya hanya muncul selagi laundry ini belum punya akun.
            Satu laundry satu akun, jadi menampilkan form "tambah" di sebelah
            akun yang sudah ada cuma menjanjikan sesuatu yang akan ditolak. */}
        {akun ? (
          <div className="mt-5 space-y-5">
            <div className="border border-garis bg-white p-5">
              <p className="font-medium">{akun.nama ?? "—"}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-tinta-2">
                Satu-satunya akun yang bisa membuka laundry ini.
              </p>
            </div>

            {/* Kelar tidak punya alur lupa-password lewat email, dan laundry
                tidak bisa mengganti passwordnya sendiri. Formulir ini satu-
                satunya jalan pulih kalau pemiliknya lupa. */}
            <div className="border border-garis bg-white p-5">
              <h3 className="mb-1 font-mono text-[11px] uppercase tracking-wider text-tinta-2">
                Reset password
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-tinta-3">
                Dipakai kalau pemilik laundry lupa passwordnya. Password lama
                langsung berhenti berlaku.
              </p>
              <FormAdmin
                aksi={resetSandi}
                saatMenunggu="Mengganti..."
                tombol="Ganti password"
              >
                <input type="hidden" name="pengguna_id" value={akun.id} />
                <input type="hidden" name="laundry_id" value={id} />
                <div>
                  <label htmlFor="sandi-baru" className={gayaLabel}>
                    Password baru · minimal 8 karakter
                  </label>
                  <input
                    id="sandi-baru"
                    name="sandi"
                    type="text"
                    required
                    minLength={8}
                    autoComplete="off"
                    className={`${gayaInput} font-mono`}
                  />
                </div>
              </FormAdmin>
            </div>
          </div>
        ) : (
          <>
            <p className="py-6 text-sm leading-relaxed text-tinta-3">
              Belum ada akun. Selama belum dibuat, tidak ada yang bisa masuk ke
              laundry ini.
            </p>

            <div className="border border-garis bg-white p-5">
              <h3 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-tinta-2">
                Buat akun
              </h3>
              <FormAdmin
                aksi={tambahPengguna}
                saatMenunggu="Membuat akun..."
                tombol="Buat akun"
              >
                <input type="hidden" name="laundry_id" value={id} />
                <div>
                  <label htmlFor="nama-akun" className={gayaLabel}>
                    Nama pemilik
                  </label>
                  <input
                    id="nama-akun"
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
                  Password ini sengaja terlihat supaya bisa langsung
                  diberitahukan ke pemilik laundry. Minta dia menggantinya
                  setelah masuk.
                </p>
              </FormAdmin>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
