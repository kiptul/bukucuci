// Simpan sebagai: src/components/StatusRak.tsx
// Pakai di halaman dashboard: <StatusRak awal={dataDariServer} />

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Slot = {
  kode: string;
  terisi: boolean;
  terakhir_update: string;
};

export default function StatusRak({ awal }: { awal: Slot[] }) {
  const [slots, setSlots] = useState<Slot[]>(awal);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("rak")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rak_slot" },
        (payload) => {
          const baru = payload.new as Slot;
          setSlots((lama) =>
            lama.map((s) => (s.kode === baru.kode ? { ...s, ...baru } : s))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const terpakai = slots.filter((s) => s.terisi).length;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Rak A</h2>
        <span className="text-sm text-neutral-500">
          {terpakai} dari {slots.length} terisi
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot) => (
          <div
            key={slot.kode}
            className={[
              "rounded-2xl border p-4 text-center transition-colors duration-300",
              slot.terisi
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-dashed border-neutral-300 bg-neutral-50 text-neutral-400",
            ].join(" ")}
          >
            <div className="text-2xl font-bold tracking-tight">{slot.kode}</div>
            <div className="mt-1 text-xs font-medium">
              {slot.terisi ? "Terisi" : "Kosong"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
