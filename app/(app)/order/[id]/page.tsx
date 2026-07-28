import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import TombolBatal from "@/components/TombolBatal";
import TombolTesWa from "@/components/TombolTesWa";
import { getProfil } from "@/lib/profil";
import { hpCantik, rupiah, tanggalLengkap } from "@/lib/format";
import TandaBuku from "@/components/TandaBuku";
import type { StatusPesanan, SumberPesanan } from "@/lib/types";
import { ubahStatus } from "./actions";

export const dynamic = "force-dynamic";

type Detail = {
  id: string;
  kode: string;
  subtotal: number;
  total: number;
  status: StatusPesanan;
  sumber: SumberPesanan;
  catatan: string | null;
  created_at: string;
  pelanggan: { nama: string; no_hp: string } | null;
};

export default async function DetailOrder({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { db } = await getProfil();

  const { data } = await db
    .from("pesanan")
    .select(
      "id, kode, subtotal, total, status, sumber, catatan, created_at, pelanggan:pelanggan_id(nama, no_hp)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const pesanan = data as unknown as Detail;

  const [{ data: item }, { data: riwayat }, { data: notifikasi }] =
    await Promise.all([
      db
        .from("pesanan_item")
        .select("id, nama_layanan, qty, harga_satuan, subtotal")
        .eq("pesanan_id", id),
      db
        .from("riwayat_status")
        .select("id, status, waktu")
        .eq("pesanan_id", id)
        .order("waktu"),
      db
        .from("notifikasi_log")
        .select("id, jenis, status, keterangan, waktu")
        .eq("pesanan_id", id)
        .order("waktu"),
    ]);

  const berikutnya =
    pesanan.status === "MASUK"
      ? { status: "SIAP" as const, label: "Tandai SIAP · kabari pelanggan" }
      : pesanan.status === "SIAP"
        ? { status: "DIAMBIL" as const, label: "Tandai sudah DIAMBIL" }
        : null;

  const bisaBatal = pesanan.status === "MASUK" || pesanan.status === "SIAP";

  return (
    <div>
      <div className="border-b border-garis px-4 py-3">
        <Link
          href="/dashboard"
          className="font-mono text-[11px] uppercase tracking-wider text-tinta-3"
        >
          ← Daftar order
        </Link>
      </div>

      <section className="px-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="angka font-mono text-2xl font-semibold">
              {pesanan.kode}
            </p>
            <p className="mt-1 font-mono text-[11px] text-tinta-3">
              {tanggalLengkap(pesanan.created_at)}
            </p>
            {pesanan.sumber === "DARI_BUKU" && (
              <div className="mt-2">
                <TandaBuku />
              </div>
            )}
          </div>
          <StatusBadge status={pesanan.status} />
        </div>

        <div className="mt-4 border-t border-garis pt-4">
          <p className="text-lg font-semibold leading-snug">
            {pesanan.pelanggan?.nama ?? "—"}
          </p>
          <p className="angka mt-0.5 font-mono text-sm text-tinta-2">
            {pesanan.pelanggan ? hpCantik(pesanan.pelanggan.no_hp) : ""}
          </p>
        </div>
      </section>

      <section className="px-4 pb-5">
        <h2 className="mb-1 border-b border-garis pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
          Rincian
        </h2>
        <ul className="divide-y divide-garis">
          {(item ?? []).map((i) => (
            <li key={i.id} className="flex items-baseline justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium leading-snug">{i.nama_layanan}</p>
                <p className="angka mt-0.5 font-mono text-xs text-tinta-3">
                  {i.qty} × {rupiah(i.harga_satuan)}
                </p>
              </div>
              <span className="angka shrink-0 font-mono text-sm">
                {rupiah(i.subtotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-1 flex items-baseline justify-between border-t-2 border-tinta pt-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
            Total
          </span>
          <span className="angka font-mono text-2xl font-semibold">
            {rupiah(pesanan.total)}
          </span>
        </div>

        {pesanan.catatan && (
          <p className="mt-4 border-l-[3px] border-garis bg-kertas px-3 py-2.5 text-sm text-tinta-2">
            {pesanan.catatan}
          </p>
        )}
      </section>

      <section className="px-4 pb-5">
        <h2 className="mb-3 border-b border-garis pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
          Riwayat
        </h2>
        <ul className="space-y-2">
          {(riwayat ?? []).map((r) => (
            <li key={r.id} className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-tinta-2">
                {r.status}
              </span>
              <span className="angka font-mono text-[11px] text-tinta-3">
                {tanggalLengkap(r.waktu)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 pb-5">
        <h2 className="mb-3 border-b border-garis pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
          Notifikasi WhatsApp
        </h2>
        {!notifikasi?.length ? (
          <p className="text-sm text-tinta-3">Belum ada pesan terkirim.</p>
        ) : (
          <ul className="space-y-2">
            {notifikasi.map((n) => (
              <li key={n.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-tinta-2">
                    {n.jenis}
                  </span>
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wider ${
                      n.status === "TERKIRIM" ? "text-aksen" : "text-red-800"
                    }`}
                  >
                    {n.status}
                  </span>
                </div>
                <p className="angka font-mono text-[11px] text-tinta-3">
                  {tanggalLengkap(n.waktu)}
                  {n.status !== "TERKIRIM" && n.keterangan
                    ? ` · ${n.keterangan}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* Hanya tampil kalau masih ada gunanya: order belum selesai, atau ada
            pesan yang gagal dan perlu dikirim ulang. Di order yang sudah
            beres dan semua pesannya terkirim, tombol ini cuma jadi gangguan. */}
        {(berikutnya || notifikasi?.some((n) => n.status === "GAGAL")) && (
          <div className="mt-4">
            <TombolTesWa id={pesanan.id} />
          </div>
        )}
      </section>

      {(berikutnya || bisaBatal) && (
        <form action={ubahStatus} className="space-y-2 border-t border-garis px-4 py-5">
          <input type="hidden" name="id" value={pesanan.id} />
          {berikutnya && (
            <button
              name="status"
              value={berikutnya.status}
              className="w-full bg-aksen py-4 font-medium text-white active:opacity-90"
            >
              {berikutnya.label}
            </button>
          )}
          {bisaBatal && <TombolBatal />}
        </form>
      )}
    </div>
  );
}
