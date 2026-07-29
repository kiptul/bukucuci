"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export type Slot = {
  kode: string;
  terisi: boolean;
  terakhir_update: string;
};

export default function StatusRak({ awal }: { awal: Slot[] }) {
  const [slots, setSlots] = useState<Slot[]>(awal);

  // Perubahan saklar di rak masuk lewat Realtime Supabase, bukan polling —
  // layar berubah sendiri tanpa perlu refresh.
  useEffect(() => {
    const db = supabaseBrowser();

    const kanal = db
      .channel("rak")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rak_slot" },
        (muatan) => {
          const baru = muatan.new as Slot;
          if (!baru?.kode) return;
          setSlots((lama) =>
            lama.map((s) => (s.kode === baru.kode ? { ...s, ...baru } : s))
          );
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(kanal);
    };
  }, []);

  const terisi = slots.filter((s) => s.terisi).length;

  return (
    <section className="border-b border-garis px-4 py-4 md:px-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
          Rak A
        </h2>
        <span className="angka font-mono text-[11px] text-tinta-3">
          {terisi} dari {slots.length} terisi
        </span>
      </div>

      <ul className="mt-3 grid grid-cols-3 gap-2">
        {slots.map((s) => (
          <li
            key={s.kode}
            className={`border px-3 py-3 text-center transition-colors duration-300 ${
              s.terisi
                ? "border-aksen bg-aksen-muda text-aksen"
                : "border-dashed border-garis bg-white text-tinta-3"
            }`}
          >
            <p className="angka font-mono text-xl font-semibold leading-none">
              {s.kode}
            </p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider">
              {s.terisi ? "Terisi" : "Kosong"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
