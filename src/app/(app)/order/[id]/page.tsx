import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import TombolAksi from "@/components/ui/TombolAksi";
import TombolBatal from "@/components/ui/TombolBatal";
import TombolKirimUlang from "@/components/ui/TombolKirimUlang";
import { getProfil } from "@/lib/profil";
import { hpCantik, rupiah, tanggalLengkap } from "@/lib/format";
import TandaBuku from "@/components/ui/TandaBuku";
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
      "id, kode, subtotal, total, status, sumber, catatan, created_at, pelanggan:pelanggan_id(nama, no_hp)",
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

  // Aksi berikutnya menyebut apa yang sedang dikerjakan saat ditunggu —
  // pengiriman WhatsApp butuh sedetik dua detik, dan diam tanpa keterangan
  // membuatnya terasa macet.
  const berikutnya =
    pesanan.status === "MASUK"
      ? {
          status: "SIAP" as const,
          label: "Tandai SIAP · kabari pelanggan",
          menunggu: "Mengirim WhatsApp...",
        }
      : pesanan.status === "SIAP"
        ? {
            status: "DIAMBIL" as const,
            label: "Tandai sudah DIAMBIL",
            menunggu: "Mengirim terima kasih...",
          }
        : null;

  const bisaBatal = pesanan.status === "MASUK" || pesanan.status === "SIAP";

  return (
    <div className="md:mx-auto md:max-w-2xl">
      <div className="border-b border-garis px-4 py-3">
        <Link
          href="/dashboard"
          className="font-mono text-[11px] uppercase tracking-wider text-tinta-3"
        >
          ← Daftar order
        </Link>
      </div>

      {/* Nota: satu lembar putih di atas latar kertas, lengkap dengan tepi
          sobek di bawahnya — bentuk yang sama dengan ikon aplikasi. */}
      <section className="px-4 pt-5 md:px-6">
        <div className="border border-garis bg-white px-5 pt-5 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="angka font-mono text-[26px] font-semibold leading-none tracking-tight">
                {pesanan.kode}
              </p>
              <p className="mt-2 font-mono text-[11px] text-tinta-3">
                {tanggalLengkap(pesanan.created_at)}
              </p>
              {pesanan.sumber === "DARI_BUKU" && (
                <div className="mt-2.5">
                  <TandaBuku />
                </div>
              )}
            </div>
            {/* Stempel dimiringkan sedikit supaya terasa dicap, bukan dicetak */}
            <span className="mt-1 shrink-0 -rotate-6">
              <StatusBadge status={pesanan.status} />
            </span>
          </div>

          <div className="mt-5 border-t border-dashed border-garis pt-4">
            <p className="text-lg font-semibold leading-snug">
              {pesanan.pelanggan?.nama ?? "—"}
            </p>
            <p className="angka mt-0.5 font-mono text-sm text-tinta-2">
              {pesanan.pelanggan ? hpCantik(pesanan.pelanggan.no_hp) : ""}
            </p>
          </div>

          <div className="mt-5 border-t border-dashed border-garis pt-4">
            <ul className="space-y-3.5">
              {(item ?? []).map((i) => (
                <li key={i.id}>
                  <div className="flex items-baseline gap-1">
                    <span className="font-medium leading-snug">
                      {i.nama_layanan}
                    </span>
                    <span className="penghubung" aria-hidden="true" />
                    <span className="angka shrink-0 font-mono text-sm">
                      {rupiah(i.subtotal)}
                    </span>
                  </div>
                  <p className="angka mt-0.5 font-mono text-xs text-tinta-3">
                    {i.qty} × {rupiah(i.harga_satuan)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex items-baseline justify-between border-t-2 border-tinta pb-5 pt-3.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
              Total
            </span>
            <span className="angka font-mono text-[26px] font-semibold tracking-tight">
              {rupiah(pesanan.total)}
            </span>
          </div>

          {pesanan.catatan && (
            <p className="border-t border-dashed border-garis pb-5 pt-4 text-sm italic leading-relaxed text-tinta-2">
              “{pesanan.catatan}”
            </p>
          )}
        </div>
        <div className="tepi-sobek" aria-hidden="true" />
      </section>

      <section className="px-4 pb-4 pt-5 md:px-6">
        <div className="border border-garis bg-white px-5 py-4">
          <h2 className="mb-3 border-b border-garis pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
            Riwayat
          </h2>
          <ul className="space-y-2">
            {(riwayat ?? []).map((r) => (
              <li
                key={r.id}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="font-mono text-[11px] uppercase tracking-wider text-tinta-2">
                  {r.status}
                </span>
                <span className="angka font-mono text-[11px] text-tinta-3">
                  {tanggalLengkap(r.waktu)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-5 md:px-6">
        <div className="border border-garis bg-white px-5 py-4">
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

          {/* Sejak pengiriman berjalan otomatis saat status berubah, tombol ini
            hanya berguna untuk satu hal: mengulang pesan yang gagal terkirim.
            Sengaja disembunyikan di luar keadaan itu — di order berstatus MASUK
            ia akan mengirim kabar "cucian sudah siap" padahal belum, sekaligus
            memakai jatah pesan SIAP sehingga pengiriman otomatis nanti ditolak
            sebagai duplikat. */}
          {notifikasi?.some((n) => n.status === "GAGAL") && (
            <div className="mt-4">
              <TombolKirimUlang id={pesanan.id} />
            </div>
          )}
        </div>
      </section>

      {(berikutnya || bisaBatal) && (
        // Dua form terpisah, bukan satu form dua tombol: dengan begitu tiap
        // tombol punya status menunggunya sendiri dan hanya yang ditekan
        // yang berputar.
        <div className="space-y-2 px-4 pb-5 md:px-6">
          {berikutnya && (
            <form action={ubahStatus}>
              <input type="hidden" name="id" value={pesanan.id} />
              <input type="hidden" name="status" value={berikutnya.status} />
              <TombolAksi gaya="aksen" saatMenunggu={berikutnya.menunggu}>
                {berikutnya.label}
              </TombolAksi>
            </form>
          )}
          {bisaBatal && (
            <form action={ubahStatus}>
              <input type="hidden" name="id" value={pesanan.id} />
              <input type="hidden" name="status" value="BATAL" />
              <TombolBatal />
            </form>
          )}
        </div>
      )}
    </div>
  );
}
