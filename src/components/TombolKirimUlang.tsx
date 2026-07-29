"use client";

import { useActionState } from "react";
import { kirimUlangWa } from "@/app/(app)/order/[id]/actions";
import TombolAksi from "@/components/TombolAksi";

// Muncul hanya kalau ada pesan berstatus GAGAL di order ini.
export default function TombolKirimUlang({ id }: { id: string }) {
  const [hasil, aksi] = useActionState(kirimUlangWa, null);

  return (
    <form action={aksi}>
      <input type="hidden" name="id" value={id} />
      <TombolAksi gaya="garis" saatMenunggu="Mengirim ulang...">
        Kirim ulang pesan yang gagal
      </TombolAksi>

      {hasil && (
        <p
          className={`mt-2 border-l-[3px] px-3 py-2.5 text-sm ${
            hasil.ok
              ? "border-aksen bg-aksen-muda text-aksen"
              : "border-red-800 bg-red-50 text-red-900"
          }`}
        >
          {hasil.ok ? "Terkirim. " : ""}
          {hasil.alasan}
        </p>
      )}
    </form>
  );
}
