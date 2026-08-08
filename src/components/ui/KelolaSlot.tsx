"use client";

import { useActionState } from "react";
import TombolAksi from "@/components/ui/TombolAksi";
import { gayaInput, gayaLabel } from "@/components/forms/gaya";
import { hapusSlot, tambahSlot } from "@/app/(app)/rak/actions";

// Dibungkus <details> supaya tidak ikut memenuhi layar setiap hari. Menambah
// atau menghapus slot itu pekerjaan sekali pasang, bukan pekerjaan harian —
// yang harian adalah melihat isi rak di atasnya.
//
// <details> dipilih daripada state buka-tutup sendiri karena ia sudah bisa
// dibuka lewat keyboard, sudah diumumkan pembaca layar, dan tetap berfungsi
// sebelum JavaScript sempat termuat.
export default function KelolaSlot({
  slots,
}: {
  slots: { kode: string; terisi: boolean }[];
}) {
  const [hasil, jalankan] = useActionState(tambahSlot, null);

  return (
    <details className="border-b border-garis px-4 py-4 md:px-6">
      <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
        Kelola slot
      </summary>

      <p className="mt-3 text-sm leading-relaxed text-tinta-2">
        Kode slot berbentuk satu huruf lalu angka. Hurufnya menandai raknya, jadi
        A1–A3 dan B1–B3 tampil sebagai dua rak terpisah.
      </p>

      {slots.length > 0 && (
        <ul className="mt-4 divide-y divide-garis border border-garis bg-white">
          {slots.map((s) => (
            <li key={s.kode} className="flex items-center justify-between gap-3 px-3.5 py-3">
              <span className="angka font-mono text-sm font-semibold">{s.kode}</span>

              {s.terisi ? (
                // Slot terisi tidak bisa dihapus. Menghapusnya membuat cucian
                // yang nyata ada di rak hilang dari layar — dan perangkat akan
                // memunculkannya lagi lewat upsert pada laporan berikutnya,
                // jadi penghapusannya pun tidak bertahan.
                <span className="font-mono text-[11px] uppercase tracking-wider text-tinta-3">
                  Sedang terisi
                </span>
              ) : (
                <form action={hapusSlot}>
                  <input type="hidden" name="kode" value={s.kode} />
                  <button className="font-mono text-[11px] uppercase tracking-wider text-tinta-2 underline underline-offset-4 active:opacity-70">
                    Hapus
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}

      <form action={jalankan} className="mt-4">
        <label htmlFor="kode-slot-baru" className={gayaLabel}>
          Tambah slot
        </label>
        <input
          id="kode-slot-baru"
          name="kode"
          required
          maxLength={3}
          placeholder="A4"
          autoCapitalize="characters"
          className={`${gayaInput} angka font-mono uppercase`}
        />

        {hasil?.error && (
          <p className="mt-2 border-l-[3px] border-red-800 bg-red-50 px-3 py-2 text-sm text-red-900">
            {hasil.error}
          </p>
        )}
        {hasil?.pesan && (
          <p className="mt-2 border-l-[3px] border-aksen bg-aksen-muda px-3 py-2 text-sm text-aksen">
            {hasil.pesan}
          </p>
        )}

        <div className="mt-3">
          <TombolAksi saatMenunggu="Menambah..." gaya="garis">
            Tambah slot
          </TombolAksi>
        </div>
      </form>
    </details>
  );
}
