"use client";

import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/client";

export type Slot = {
  kode: string;
  terisi: boolean;
  terakhir_update: string;
};

export default function StatusRak({ awal }: { awal: Slot[] }) {
  const [slots, setSlots] = useState<Slot[]>(awal);

  // Perubahan saklar di rak masuk lewat Realtime Supabase — layar berubah
  // sendiri tanpa refresh.
  useEffect(() => {
    const db = supabaseBrowser();
    let kanal: RealtimeChannel | null = null;
    let jam: ReturnType<typeof setInterval> | null = null;

    const ambilUlang = async () => {
      const { data } = await db
        .from("rak_slot")
        .select("kode, terisi, terakhir_update")
        .order("kode");
      if (data) setSlots(data as Slot[]);
    };

    (async () => {
      // Token sesi harus diserahkan ke Realtime SEBELUM berlangganan. Kalau
      // tidak, koneksinya dianggap anonim, RLS menutup semuanya, dan kabar
      // perubahan tidak pernah datang — tanpa error apa pun di konsol.
      const { data: sesi } = await db.auth.getSession();
      if (sesi.session) {
        db.realtime.setAuth(sesi.session.access_token);
      }

      kanal = db
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
        .subscribe((status) => {
          // Realtime bisa gagal karena hal di luar kendali aplikasi: publikasi
          // belum aktif, atau websocket diblokir jaringan laundry. Kalau itu
          // terjadi, status rak diambil berkala supaya layar tetap benar —
          // lebih lambat, tapi tidak pernah menampilkan rak yang salah.
          if (status === "SUBSCRIBED") {
            if (jam) {
              clearInterval(jam);
              jam = null;
            }
          } else if (!jam) {
            jam = setInterval(ambilUlang, 4000);
          }
        });
    })();

    return () => {
      if (jam) clearInterval(jam);
      if (kanal) db.removeChannel(kanal);
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
