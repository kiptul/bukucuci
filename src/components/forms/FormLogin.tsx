"use client";

import { useActionState, useEffect, useState } from "react";
import { masuk } from "@/app/login/actions";
import TombolAksi from "@/components/ui/TombolAksi";

// Tinggi minimum 3rem: sasaran sentuh di HP murah, bukan keputusan rupa.
const gayaInput =
  "min-h-12 w-full border border-garis bg-white px-3.5 py-3 text-base outline-none placeholder:text-tinta-3/70 focus:border-aksen focus:ring-2 focus:ring-aksen/20";

const gayaLabel =
  "mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-tinta-2";

export default function FormLogin({ pesanAwal }: { pesanAwal?: string }) {
  const [state, aksi] = useActionState(masuk, null);
  const [offline, setOffline] = useState(false);
  const galat = state?.error ?? pesanAwal;

  // Login menembak Supabase, jadi tanpa koneksi tombolnya pasti gagal. Lebih
  // baik dikatakan di depan daripada dibiarkan berputar lalu berujung galat.
  useEffect(() => {
    const perbaruiStatus = () => setOffline(!navigator.onLine);
    perbaruiStatus();
    window.addEventListener("online", perbaruiStatus);
    window.addEventListener("offline", perbaruiStatus);
    return () => {
      window.removeEventListener("online", perbaruiStatus);
      window.removeEventListener("offline", perbaruiStatus);
    };
  }, []);

  return (
    <form action={aksi} className="space-y-5">
      {offline && (
        <p
          role="status"
          aria-live="polite"
          className="border-l-[3px] border-amber-700 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-950"
        >
          Tidak ada koneksi. Sambungkan internet dulu — login diperiksa di
          server.
        </p>
      )}

      <div>
        <label htmlFor="email" className={gayaLabel}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="kasir@laundry.id"
          className={gayaInput}
          aria-describedby={galat ? "pesan-login" : undefined}
        />
      </div>

      <div>
        <label htmlFor="sandi" className={gayaLabel}>
          Password
        </label>
        <input
          id="sandi"
          name="sandi"
          type="password"
          required
          autoComplete="current-password"
          className={gayaInput}
          aria-describedby={galat ? "pesan-login" : undefined}
        />
      </div>

      {galat && (
        <p
          id="pesan-login"
          role="alert"
          aria-live="polite"
          className="border-l-[3px] border-red-800 bg-red-50 px-3 py-2.5 text-sm leading-relaxed text-red-900"
        >
          {galat}
        </p>
      )}

      <TombolAksi className="min-h-12" saatMenunggu="Memeriksa...">
        Masuk
      </TombolAksi>
    </form>
  );
}
