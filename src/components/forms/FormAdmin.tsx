"use client";

import { useActionState } from "react";
import TombolAksi from "@/components/ui/TombolAksi";
import type { Hasil } from "@/app/admin/actions";

// Kelas isian pindah ke gaya.ts — modul biasa, bukan "use client". Jangan
// dikembalikan ke sini: Server Component yang mengimpornya dari modul klien
// mendapat rujukan, bukan string, dan interpolasinya menghasilkan sampah.
// Alasan lengkapnya ada di berkas itu.

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
