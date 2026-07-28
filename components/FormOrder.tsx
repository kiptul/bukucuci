"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { cariPelanggan, simpanOrder } from "@/app/(app)/order/baru/actions";
import TombolAksi from "@/components/TombolAksi";
import { rupiah } from "@/lib/format";
import type { Layanan } from "@/lib/types";

// "3,5" dan "3.5" sama-sama diterima; kosong dianggap 0.
function keAngka(teks: string): number {
  const n = parseFloat(teks.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const gayaInput =
  "w-full border border-garis bg-white px-3.5 py-3 text-base outline-none focus:border-aksen focus:ring-1 focus:ring-aksen";

const gayaLabel =
  "mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-tinta-2";

// Tanggal hari ini menurut WIB, untuk batas atas input tanggal.
function hariIniJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

type StatusPelanggan = "kosong" | "mencari" | "terdaftar" | "baru";

export default function FormOrder({ layanan }: { layanan: Layanan[] }) {
  const [state, aksi] = useActionState(simpanOrder, null);

  const [noHp, setNoHp] = useState("");
  const [namaKetik, setNamaKetik] = useState("");
  const [qty, setQty] = useState<Record<string, string>>({});
  const [dariBuku, setDariBuku] = useState(false);
  const hariIni = hariIniJakarta();
  // Hasil pencarian disimpan bersama nomor yang dicari, supaya status bisa
  // diturunkan dari state — bukan di-set dari dalam effect.
  const [hasil, setHasil] = useState<{
    untuk: string;
    nama: string | null;
  } | null>(null);

  const status: StatusPelanggan =
    noHp.replace(/\D/g, "").length < 9
      ? "kosong"
      : hasil?.untuk !== noHp
        ? "mencari"
        : hasil.nama
          ? "terdaftar"
          : "baru";

  const nama = status === "terdaftar" ? (hasil?.nama ?? "") : namaKetik;

  // Cari pelanggan setelah nomor berhenti diketik sebentar.
  useEffect(() => {
    if (noHp.replace(/\D/g, "").length < 9) return;

    let batal = false;
    const jeda = setTimeout(async () => {
      const ketemu = await cariPelanggan(noHp);
      if (!batal) setHasil({ untuk: noHp, nama: ketemu?.nama ?? null });
    }, 500);

    return () => {
      batal = true;
      clearTimeout(jeda);
    };
  }, [noHp]);

  const total = useMemo(
    () =>
      layanan.reduce(
        (n, l) => n + Math.round(l.harga * keAngka(qty[l.id] ?? "")),
        0,
      ),
    [layanan, qty],
  );

  const jumlahItem = layanan.filter((l) => keAngka(qty[l.id] ?? "") > 0).length;

  return (
    <form
      action={aksi}
      className="pb-4 md:mx-auto md:max-w-xl md:border md:border-garis md:bg-white md:pb-0 md:shadow-[0_24px_50px_-40px_rgba(0,0,0,0.55)]"
    >
      {/* Mode berdampingan: pemilik boleh tetap pakai buku, order lamanya
          disalin ke sini belakangan tanpa kehilangan tanggal aslinya. */}
      <section className="border-b border-garis bg-kertas px-4 py-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="dari_buku"
            checked={dariBuku}
            onChange={(e) => setDariBuku(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#0b6b5b]"
          />
          <span>
            <span className="block font-medium leading-snug">
              Order lama dari buku
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-tinta-2">
              Untuk menyalin catatan yang sudah terlanjur ditulis di buku nota.
            </span>
          </span>
        </label>

        {dariBuku && (
          <div className="mt-4">
            <label htmlFor="tanggal" className={gayaLabel}>
              Tanggal masuk · sesuai buku
            </label>
            <input
              id="tanggal"
              name="tanggal"
              type="date"
              required
              max={hariIni}
              defaultValue={hariIni}
              className={`${gayaInput} angka font-mono`}
            />
          </div>
        )}
      </section>

      <section className="px-4 py-5">
        <h2 className="mb-4 border-b border-garis pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
          1 · Pelanggan
        </h2>

        <label htmlFor="no_hp" className={gayaLabel}>
          Nomor HP
        </label>
        <input
          id="no_hp"
          name="no_hp"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          required
          placeholder="0812..."
          value={noHp}
          onChange={(e) => setNoHp(e.target.value)}
          className={`${gayaInput} angka font-mono`}
        />

        {status === "mencari" && (
          <p className="mt-2 text-xs text-tinta-3">Mencari pelanggan...</p>
        )}

        {status === "terdaftar" && (
          <div className="mt-3 border-l-[3px] border-aksen bg-aksen-muda px-3 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-aksen">
              Pelanggan terdaftar
            </p>
            <p className="mt-0.5 font-medium">{nama}</p>
            <input type="hidden" name="nama" value={nama} />
          </div>
        )}

        {status === "baru" && (
          <div className="mt-4">
            <label htmlFor="nama" className={gayaLabel}>
              Nama · pelanggan baru
            </label>
            <input
              id="nama"
              name="nama"
              required
              autoComplete="off"
              placeholder="Nama pelanggan"
              value={namaKetik}
              onChange={(e) => setNamaKetik(e.target.value)}
              className={gayaInput}
            />
          </div>
        )}
      </section>

      <section className="px-4 pb-5">
        <h2 className="mb-1 border-b border-garis pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
          2 · Layanan
        </h2>

        <ul className="divide-y divide-garis">
          {layanan.map((l) => {
            const dipilih = keAngka(qty[l.id] ?? "") > 0;
            return (
              <li
                key={l.id}
                className={`flex items-center gap-3 py-3 ${
                  dipilih ? "border-l-[3px] border-aksen pl-3" : "pl-[3px]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{l.nama}</p>
                  <p className="angka mt-0.5 font-mono text-xs text-tinta-3">
                    {rupiah(l.harga)}/{l.satuan}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <input
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    aria-label={`Jumlah ${l.nama}`}
                    value={qty[l.id] ?? ""}
                    onChange={(e) => setQty({ ...qty, [l.id]: e.target.value })}
                    className="angka w-16 border border-garis bg-white px-2 py-2.5 text-center font-mono text-base outline-none focus:border-aksen focus:ring-1 focus:ring-aksen"
                  />
                  <span className="w-6 font-mono text-xs text-tinta-3">
                    {l.satuan}
                  </span>
                  {/* nilai yang benar-benar dikirim, sudah dinormalkan */}
                  <input
                    type="hidden"
                    name={`qty-${l.id}`}
                    value={keAngka(qty[l.id] ?? "")}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-t-2 border-tinta px-4 py-5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
            Total
          </span>
          <span className="angka font-mono text-2xl font-semibold">
            {rupiah(total)}
          </span>
        </div>
        <p className="mt-1 text-right font-mono text-[11px] text-tinta-3">
          {jumlahItem} layanan dipilih
        </p>

        <div className="mt-5">
          <label htmlFor="catatan" className={gayaLabel}>
            Catatan · opsional
          </label>
          <input
            id="catatan"
            name="catatan"
            autoComplete="off"
            placeholder="mis. jangan pakai pewangi"
            className={gayaInput}
          />
        </div>

        {state?.error && (
          <p className="mt-4 border-l-[3px] border-red-800 bg-red-50 px-3 py-2.5 text-sm text-red-900">
            {state.error}
          </p>
        )}

        <div className="mt-5">
          <TombolAksi saatMenunggu="Menyimpan order..." nonaktif={total === 0}>
            Simpan Order
          </TombolAksi>
        </div>
      </section>
    </form>
  );
}
