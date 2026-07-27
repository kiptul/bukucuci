"use client";

import { useActionState } from "react";
import { tesKirimWa } from "@/app/(app)/order/[id]/actions";

export default function TombolTesWa({ id }: { id: string }) {
  const [hasil, aksi, menunggu] = useActionState(tesKirimWa, null);

  return (
    <form action={aksi}>
      <input type="hidden" name="id" value={id} />
      <button
        disabled={menunggu}
        className="w-full border border-tinta py-3 text-sm font-medium active:bg-kertas disabled:opacity-50"
      >
        {menunggu ? "Mengirim..." : "Tes kirim WhatsApp"}
      </button>

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
