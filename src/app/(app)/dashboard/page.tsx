import Link from "next/link";
import KontrolDaftar from "@/components/ui/KontrolDaftar";
import StatusBadge, { pitaStatus } from "@/components/ui/StatusBadge";
import TandaBayar from "@/components/ui/TandaBayar";
import TandaBuku from "@/components/ui/TandaBuku";
import { getProfil } from "@/lib/profil";
import { hpCantik, normalisasiHp, rupiah, tanggalPendek } from "@/lib/format";
import { FILTER, type PilihanFilter } from "@/lib/filter";
import type {
  StatusPembayaran,
  StatusPesanan,
  SumberPesanan,
} from "@/lib/types";

export const dynamic = "force-dynamic";

type BarisPesanan = {
  id: string;
  kode: string;
  total: number;
  status: StatusPesanan;
  status_bayar: StatusPembayaran;
  sumber: SumberPesanan;
  created_at: string;
  pelanggan: { nama: string; no_hp: string } | null;
};

// Hanya order yang cuciannya sudah keluar tapi uangnya belum masuk.
//
// Sempat ikut menandai yang berstatus SIAP, sampai data menunjukkan itu 9 dari
// 20 order — dan memang begitu seharusnya: di kebanyakan laundry pembayaran
// jatuh saat pengambilan, jadi SIAP + BELUM adalah keadaan normal, bukan
// masalah. Menandainya membuat penanda ini kehilangan artinya. Yang tersisa
// setelah disaring adalah utang yang sesungguhnya.
//
// Untuk order yang belum diambil, keterangan bayarnya tetap terbaca di halaman
// detail — tempat kasir memang membuka saat melayani pengambilan.
function perluDitagih(p: BarisPesanan): boolean {
  return p.status === "DIAMBIL" && p.status_bayar === "BELUM";
}

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
  const statusAktif = FILTER.includes(status as PilihanFilter)
    ? status
    : "SEMUA";

  const { db } = await getProfil();

  let kueri = db
    .from("pesanan")
    .select(
      "id, kode, total, status, status_bayar, sumber, created_at, pelanggan:pelanggan_id(nama, no_hp)",
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

  return (
    <div className="pb-2">
      <KontrolDaftar cari={cari} status={statusAktif}>
        <div className="flex items-baseline justify-between px-4 py-3 md:px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
            {cari ? "Hasil Pencarian" : "Order Terbaru"}
          </span>
          <span className="angka font-mono text-[11px] text-tinta-3">
            {pesanan.length} order
          </span>
        </div>

        {!pesanan.length ? (
          <div className="px-4 py-10 text-center">
            {cari || statusAktif !== "SEMUA" ? (
              <p className="text-sm text-tinta-3">
                Tidak ada order yang cocok.
              </p>
            ) : (
              <>
                <p className="text-sm text-tinta-2">
                  Belum ada order tercatat.
                </p>
                <Link
                  href="/order/baru"
                  className="mt-4 inline-block bg-tinta px-5 py-3 text-sm font-medium text-kertas active:bg-tinta-2"
                >
                  Catat order pertama
                </Link>
              </>
            )}
          </div>
        ) : (
          <ul className="border-t border-garis md:grid md:grid-cols-2">
            {pesanan.map((p) => (
              <li key={p.id} className="border-b border-garis md:odd:border-r">
                <Link
                  href={`/order/${p.id}`}
                  className="baris relative block px-4 py-4 pl-5 transition-colors hover:bg-white active:bg-white md:px-6 md:pl-7"
                >
                  <span
                    className={`absolute left-0 top-0 h-full w-[3px] ${pitaStatus[p.status]}`}
                    aria-hidden="true"
                  />
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-baseline gap-2">
                      <span className="angka font-mono text-sm font-semibold">
                        {p.kode}
                      </span>
                      {p.sumber === "DARI_BUKU" && <TandaBuku />}
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
                    {/* Ditaruh menempel pada nominal, bukan di baris kode:
                        keduanya soal uang dan dibaca bersamaan. Di baris atas
                        ia harus berebut tempat dengan stempel status dan tanda
                        buku, yang di layar 375px sudah penuh. */}
                    <span className="flex shrink-0 items-baseline gap-2">
                      {perluDitagih(p) && <TandaBayar />}
                      <span className="angka font-mono text-sm">
                        {rupiah(p.total)}
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </KontrolDaftar>
    </div>
  );
}
