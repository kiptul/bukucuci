"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Putaran from "@/components/Putaran";
import { FILTER } from "@/lib/filter";

// Kotak cari + filter status + daftarnya sekalian, disatukan supaya ketiganya
// berbagi satu status "sedang mengambil data".
//
// Kuncinya ada di dua hal: chip yang ditekan langsung menyala tanpa menunggu
// server (tampilannya diambil dari tekanan terakhir, bukan dari URL), dan
// daftar di bawahnya meredup selama menunggu. Tanpa itu, menekan chip terasa
// seperti tidak ada yang terjadi sampai halaman tiba-tiba berganti.
export default function KontrolDaftar({
  cari,
  status,
  children,
}: {
  cari: string;
  status: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [menunggu, mulai] = useTransition();
  const [teks, setTeks] = useState(cari);
  const [diklik, setDiklik] = useState<string | null>(null);

  // Selama menunggu, ikuti tekanan terakhir. Setelah selesai, URL yang jadi acuan.
  const statusTampil = menunggu && diklik ? diklik : status;

  const buka = (q: string, s: string) => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (s !== "SEMUA") p.set("status", s);
    const gabungan = p.toString();
    mulai(() =>
      router.push(gabungan ? `/dashboard?${gabungan}` : "/dashboard"),
    );
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          buka(teks, statusTampil);
        }}
        className="relative border-b border-garis px-4 py-3.5 md:px-6"
      >
        <input
          name="q"
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          autoComplete="off"
          placeholder="Cari nama, nomor HP, atau kode"
          className="w-full border border-garis bg-white px-3.5 py-2.5 pr-11 text-base outline-none focus:border-aksen focus:ring-1 focus:ring-aksen"
        />
        {teks.trim() !== cari && !menunggu && (
          <button
            type="submit"
            aria-label="Cari"
            className="absolute right-7 top-1/2 -translate-y-1/2 p-1 text-tinta-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </button>
        )}
      </form>

      <div className="flex gap-1.5 overflow-x-auto border-b border-garis px-4 py-3 md:px-6">
        {FILTER.map((f) => {
          const aktif = f === statusTampil;
          return (
            <button
              key={f}
              onClick={() => {
                setDiklik(f);
                buka(teks, f);
              }}
              className={`flex shrink-0 items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                aktif
                  ? "border-tinta bg-tinta text-kertas shadow-[0_6px_14px_-10px_rgba(0,0,0,0.8)]"
                  : "border-garis text-tinta-2 hover:border-tinta-3 hover:text-tinta"
              }`}
            >
              {aktif && menunggu && <Putaran kelas="h-3 w-3" />}
              {f}
            </button>
          );
        })}
      </div>

      {/* Daftar ikut meredup supaya jelas isinya sedang diperbarui */}
      <div
        className={`transition-opacity duration-150 ${
          menunggu ? "pointer-events-none opacity-40" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}
