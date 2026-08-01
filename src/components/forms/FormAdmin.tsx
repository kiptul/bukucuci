"use client";

import { useActionState } from "react";
import TombolAksi from "@/components/ui/TombolAksi";
import type { Hasil } from "@/app/admin/actions";

export const gayaInput =
  "w-full border border-garis bg-white px-3.5 py-2.5 text-base outline-none focus:border-aksen focus:ring-1 focus:ring-aksen";

export const gayaLabel =
  "mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-tinta-2";

// Kerangka bersama semua form di konsol admin: menjalankan action, menampilkan
// pesan berhasil atau gagal, dan mengosongkan isian setelah berhasil.
export default function FormAdmin({
  aksi,
  saatMenunggu,
  tombol,
  children,
}: {
  aksi: (prev: Hasil, data: FormData) => Promise<Hasil>;
  saatMenunggu: string;
  tombol: string;
  children: React.ReactNode;
}) {
  const [hasil, jalankan] = useActionState(aksi, null);

  return (
    <form action={jalankan} key={hasil?.pesan ?? "form"} className="space-y-4">
      {children}

      {hasil?.error && (
        <p className="border-l-[3px] border-red-800 bg-red-50 px-3 py-2.5 text-sm text-red-900">
          {hasil.error}
        </p>
      )}
      {hasil?.pesan && (
        <p className="border-l-[3px] border-aksen bg-aksen-muda px-3 py-2.5 text-sm text-aksen">
          {hasil.pesan}
        </p>
      )}

      <TombolAksi saatMenunggu={saatMenunggu}>{tombol}</TombolAksi>
    </form>
  );
}
