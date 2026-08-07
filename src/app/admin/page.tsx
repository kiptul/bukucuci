import Link from "next/link";
import FormAdmin from "@/components/forms/FormAdmin";
import { gayaInput, gayaLabel } from "@/components/forms/gaya";
import { pastikanSuperAdmin } from "@/lib/admin";
import { tambahLaundry } from "./actions";
import { hpCantik } from "@/lib/format";

export const dynamic = "force-dynamic";

type BarisLaundry = {
  id: string;
  nama: string;
  alamat: string | null;
  telp: string | null;
};

export default async function KonsolAdmin() {
  const { db } = await pastikanSuperAdmin();

  const { data } = await db
    .from("laundry")
    .select("id, nama, alamat, telp")
    .order("nama");

  const laundry = (data ?? []) as BarisLaundry[];

  // Jumlah order dan ada-tidaknya akun per laundry. Dihitung sekali lalu
  // dipetakan, bukan satu query per baris.
  const [{ data: pesanan }, { data: pengguna }] = await Promise.all([
    db.from("pesanan").select("laundry_id"),
    db.from("pengguna").select("laundry_id"),
  ]);

  const hitung = (baris: { laundry_id: string | null }[] | null, id: string) =>
    (baris ?? []).filter((b) => b.laundry_id === id).length;

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-baseline justify-between gap-3 border-b border-garis pb-2">
          <h1 className="font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
            Semua laundry
          </h1>
          <span className="angka font-mono text-[11px] text-tinta-3">
            {laundry.length} laundry
          </span>
        </div>

        {!laundry.length ? (
          <p className="py-8 text-center text-sm text-tinta-3">
            Belum ada laundry terdaftar.
          </p>
        ) : (
          <ul className="divide-y divide-garis">
            {laundry.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/admin/laundry/${l.id}`}
                  className="block py-3.5 transition-colors hover:bg-white"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium leading-snug">{l.nama}</span>
                    {/* Jumlah akun tidak ditampilkan karena selalu 0 atau 1.
                        Yang perlu terlihat justru keadaan rusaknya: laundry
                        tanpa akun tidak bisa dibuka siapa pun. */}
                    <span className="angka shrink-0 font-mono text-[11px] text-tinta-3">
                      {!hitung(pengguna, l.id) && (
                        <span className="uppercase tracking-wider text-red-800">
                          tanpa akun ·{" "}
                        </span>
                      )}
                      {hitung(pesanan, l.id)} order
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-tinta-3">
                    {l.alamat ?? "alamat belum diisi"}
                    {l.telp ? ` · ${hpCantik(l.telp)}` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border border-garis bg-white p-5">
        <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
          Tambah laundry
        </h2>

        <FormAdmin
          aksi={tambahLaundry}
          saatMenunggu="Menyimpan..."
          tombol="Simpan laundry"
        >
          <div>
            <label htmlFor="nama" className={gayaLabel}>
              Nama laundry
            </label>
            <input
              id="nama"
              name="nama"
              required
              autoComplete="off"
              placeholder="Laundry Bersih Jaya"
              className={gayaInput}
            />
          </div>
          <div>
            <label htmlFor="alamat" className={gayaLabel}>
              Alamat · opsional
            </label>
            <input
              id="alamat"
              name="alamat"
              autoComplete="off"
              placeholder="Jl. Contoh No. 10, Karawang"
              className={gayaInput}
            />
          </div>
          <div>
            <label htmlFor="telp" className={gayaLabel}>
              Nomor WhatsApp · opsional
            </label>
            <input
              id="telp"
              name="telp"
              inputMode="tel"
              autoComplete="off"
              placeholder="0812..."
              className={`${gayaInput} angka font-mono`}
            />
          </div>
        </FormAdmin>
      </section>
    </div>
  );
}
