import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { getProfil } from "@/lib/profil";
import { hpCantik, normalisasiHp, rupiah, tanggalPendek } from "@/lib/format";
import type { StatusPesanan } from "@/lib/types";

export const dynamic = "force-dynamic";

const FILTER = ["SEMUA", "MASUK", "SIAP", "DIAMBIL", "BATAL"] as const;

type BarisPesanan = {
  id: string;
  kode: string;
  total: number;
  status: StatusPesanan;
  created_at: string;
  pelanggan: { nama: string; no_hp: string } | null;
};

// Karakter di bawah punya arti khusus di filter PostgREST — buang dulu
// supaya pencarian tidak bisa merusak query.
function amankan(teks: string): string {
  return teks.replace(/[,()\\%*]/g, " ").trim();
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const cari = amankan(q);
  const statusAktif = FILTER.includes(status as (typeof FILTER)[number])
    ? status
    : "SEMUA";

  const { db } = await getProfil();

  let kueri = db
    .from("pesanan")
    .select(
      "id, kode, total, status, created_at, pelanggan:pelanggan_id(nama, no_hp)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (statusAktif !== "SEMUA") {
    kueri = kueri.eq("status", statusAktif);
  }

  if (cari) {
    // Nama dan nomor HP ada di tabel lain, jadi cari id-nya dulu,
    // baru gabungkan dengan pencarian kode order.
    const hp = /\d{3,}/.test(cari) ? normalisasiHp(cari) : "";
    const { data: cocok } = await db
      .from("pelanggan")
      .select("id")
      .or(
        [`nama.ilike.%${cari}%`, hp && `no_hp.ilike.%${hp}%`]
          .filter(Boolean)
          .join(","),
      );

    const idPelanggan = (cocok ?? []).map((p) => p.id);
    kueri = kueri.or(
      [
        `kode.ilike.%${cari}%`,
        idPelanggan.length && `pelanggan_id.in.(${idPelanggan.join(",")})`,
      ]
        .filter(Boolean)
        .join(","),
    );
  }

  const { data } = await kueri;
  const pesanan = (data ?? []) as unknown as BarisPesanan[];

  const tautanFilter = (f: string) => {
    const p = new URLSearchParams();
    if (cari) p.set("q", cari);
    if (f !== "SEMUA") p.set("status", f);
    const s = p.toString();
    return s ? `/dashboard?${s}` : "/dashboard";
  };

  return (
    <div className="pb-2">
      <form action="/dashboard" className="border-b border-garis px-4 py-3">
        <input type="hidden" name="status" value={statusAktif} />
        <input
          name="q"
          defaultValue={cari}
          autoComplete="off"
          placeholder="Cari nama, nomor HP, atau kode"
          className="w-full border border-garis bg-white px-3.5 py-2.5 text-base outline-none focus:border-aksen focus:ring-1 focus:ring-aksen"
        />
      </form>

      <div className="flex gap-1.5 overflow-x-auto border-b border-garis px-4 py-2.5">
        {FILTER.map((f) => (
          <Link
            key={f}
            href={tautanFilter(f)}
            className={`shrink-0 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
              f === statusAktif
                ? "border-tinta bg-tinta text-kertas"
                : "border-garis text-tinta-2"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="flex items-baseline justify-between px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
          {cari ? "Hasil Pencarian" : "Order Terbaru"}
        </span>
        <span className="angka font-mono text-[11px] text-tinta-3">
          {pesanan.length} order
        </span>
      </div>

      {!pesanan.length ? (
        <p className="px-4 py-8 text-center text-sm text-tinta-3">
          {cari || statusAktif !== "SEMUA"
            ? "Tidak ada order yang cocok."
            : "Belum ada order."}
        </p>
      ) : (
        <ul className="divide-y divide-garis border-t border-garis">
          {pesanan.map((p) => (
            <li key={p.id}>
              <Link
                href={`/order/${p.id}`}
                className="block px-4 py-3.5 active:bg-kertas"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="angka font-mono text-sm font-semibold">
                    {p.kode}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-1.5 font-medium leading-snug">
                  {p.pelanggan?.nama ?? "—"}
                </p>
                <div className="mt-0.5 flex items-baseline justify-between gap-3">
                  <span className="angka font-mono text-xs text-tinta-3">
                    {p.pelanggan ? hpCantik(p.pelanggan.no_hp) : ""} ·{" "}
                    {tanggalPendek(p.created_at)}
                  </span>
                  <span className="angka font-mono text-sm">
                    {rupiah(p.total)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
