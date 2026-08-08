"use client";

import { useActionState } from "react";
import TombolAksi from "@/components/ui/TombolAksi";
import { gayaInput } from "@/components/forms/gaya";
import { tautkanSlot } from "@/app/(app)/rak/actions";
import type { OrderAktif } from "@/components/ui/StatusRak";

// Menautkan satu slot ke satu order. Sengaja tidak memakai FormAdmin: kerangka
// itu menaruh tombol selebar layar di dasar form, cocok untuk halaman
// pengaturan tapi terlalu berat di dalam kartu per-slot yang berjajar.
export default function TautkanSlot({
  kode,
  orderAktif,
}: {
  kode: string;
  orderAktif: OrderAktif[];
}) {
  const [hasil, jalankan] = useActionState(tautkanSlot, null);

  if (!orderAktif.length) {
    return (
      <p className="mt-3 text-sm leading-relaxed text-tinta-3">
        Belum ada order berjalan yang bisa ditaruh di sini. Catat ordernya dulu,
        nanti slot ini bisa ditautkan.
      </p>
    );
  }

  return (
    <form action={jalankan} className="mt-3">
      <input type="hidden" name="kode" value={kode} />

      <label htmlFor={`pesanan-${kode}`} className="sr-only">
        Order untuk slot {kode}
      </label>
      <select
        id={`pesanan-${kode}`}
        name="pesanan"
        defaultValue=""
        required
        className={`${gayaInput} angka font-mono text-sm`}
      >
        <option value="" disabled>
          Pilih order…
        </option>
        {orderAktif.map((o) => (
          <option key={o.kode} value={o.kode}>
            {o.kode} — {o.nama}
          </option>
        ))}
      </select>

      {hasil?.error && (
        <p className="mt-2 border-l-[3px] border-red-800 bg-red-50 px-3 py-2 text-sm text-red-900">
          {hasil.error}
        </p>
      )}

      <div className="mt-2.5">
        <TombolAksi saatMenunggu="Menautkan..." gaya="garis">
          Tautkan ke slot {kode}
        </TombolAksi>
      </div>
    </form>
  );
}
