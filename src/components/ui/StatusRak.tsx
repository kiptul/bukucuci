"use client";

import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/client";
import { lamaSejak } from "@/lib/format";
import TautkanSlot from "@/components/ui/TautkanSlot";
import { lepasSlot } from "@/app/(app)/rak/actions";

export type Slot = {
  kode: string;
  terisi: boolean;
  terisi_sejak: string | null;
  terakhir_update: string;
  pesanan: { id: string; kode: string; pelanggan: { nama: string } | null } | null;
};

export type OrderAktif = { kode: string; nama: string };

// Kolom yang dibaca ulang saat ada kabar realtime. Disimpan sebagai konstanta
// supaya bentuknya tidak pernah menyimpang dari yang dipakai di halaman —
// ketidakcocokan di antara keduanya baru terasa saat slot berubah, jauh dari
// tempat salahnya.
const KOLOM = "kode, terisi, terisi_sejak, terakhir_update, pesanan:pesanan_id(id, kode, pelanggan:pelanggan_id(nama))";

// Cucian yang menginap selewat ini ditandai. Angkanya menyusul irama pengingat
// WhatsApp yang sudah ada (H+1/H+3/H+7): H+3 adalah titik ketika sistem mulai
// menganggap cucian benar-benar terlantar, bukan sekadar belum sempat diambil.
const AMBANG_MENGENDAP_JAM = 72;

function jamSejak(ts: string | null, sekarang: number): number {
  return ts ? (sekarang - new Date(ts).getTime()) / 3_600_000 : 0;
}

export default function StatusRak({
  awal,
  sekarang: sekarangAwal,
  orderAktif,
}: {
  awal: Slot[];
  sekarang: number;
  orderAktif: OrderAktif[];
}) {
  const [slots, setSlots] = useState<Slot[]>(awal);

  // Waktu acuan datang dari server untuk render pertama, lalu berjalan sendiri
  // di browser. Membaca Date.now() langsung saat render membuat hasil di server
  // dan di browser berbeda beberapa milidetik, dan React melaporkannya sebagai
  // ketidakcocokan hidrasi.
  const [sekarang, setSekarang] = useState(sekarangAwal);

  useEffect(() => {
    const jam = setInterval(() => setSekarang(Date.now()), 60_000);
    return () => clearInterval(jam);
  }, []);

  useEffect(() => {
    const db = supabaseBrowser();
    let kanal: RealtimeChannel | null = null;
    let jam: ReturnType<typeof setInterval> | null = null;

    const ambilUlang = async () => {
      const { data } = await db.from("rak_slot").select(KOLOM).order("kode");
      if (data) setSlots(data as unknown as Slot[]);
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
          // Muatan realtime hanya berisi baris rak_slot mentah — nama pelanggan
          // dan kode order ada di tabel lain, jadi tidak ikut. Menambal state
          // dari muatan akan membuat slot yang baru terisi tampil tanpa
          // pemiliknya sampai halaman dimuat ulang. Satu kueri ulang per
          // perubahan jauh lebih murah daripada layar yang setengah benar.
          () => void ambilUlang()
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

  // Kode slot berbentuk huruf-lalu-angka (A1, B12), jadi hurufnya sekaligus
  // menandai rak mana. Tidak perlu kolom terpisah di database untuk itu.
  const rak = [...new Set(slots.map((s) => s.kode[0]))].sort();

  // Yang butuh tindakan kasir, bukan sekadar dilihat: sudah terisi tapi belum
  // ketahuan punya siapa, atau sudah terlalu lama menginap.
  const perluTindakan = slots.filter(
    (s) =>
      s.terisi &&
      (!s.pesanan || jamSejak(s.terisi_sejak, sekarang) >= AMBANG_MENGENDAP_JAM)
  );

  return (
    <>
      <section className="border-b border-garis px-4 py-4 md:px-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
            Isi rak
          </h2>
          <span className="angka font-mono text-[11px] text-tinta-3">
            {terisi} dari {slots.length} terisi
          </span>
        </div>

        {rak.map((huruf) => {
          const isiRak = slots.filter((s) => s.kode[0] === huruf);

          return (
            <div key={huruf} className="mt-4 first:mt-3">
              {rak.length > 1 && (
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-tinta-3">
                  Rak {huruf}
                </h3>
              )}

              <ul className="grid grid-cols-3 gap-2">
                {isiRak.map((s) => {
                  const lama = jamSejak(s.terisi_sejak, sekarang);
                  const mengendap = s.terisi && lama >= AMBANG_MENGENDAP_JAM;

                  return (
                    <li
                      key={s.kode}
                      className={`border px-2 py-3 text-center transition-colors duration-300 ${
                        mengendap
                          ? "border-amber-700 bg-amber-50 text-amber-950"
                          : s.terisi
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

                      {/* Kode order jauh lebih berguna daripada kata "Terisi" —
                          itu yang dicocokkan kasir dengan nota di tangannya. */}
                      {s.pesanan && (
                        <p className="angka mt-2 truncate font-mono text-[11px] font-semibold">
                          {s.pesanan.kode}
                        </p>
                      )}
                      {s.pesanan?.pelanggan && (
                        <p className="mt-0.5 truncate text-[11px] leading-tight">
                          {s.pesanan.pelanggan.nama}
                        </p>
                      )}

                      {s.terisi && s.terisi_sejak && (
                        <p className="angka mt-1.5 font-mono text-[10px] opacity-70">
                          {lamaSejak(s.terisi_sejak, sekarang)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      {perluTindakan.length > 0 && (
        <section className="border-b border-garis px-4 py-4 md:px-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
            Perlu dibereskan
          </h2>

          <ul className="mt-3 space-y-3">
            {perluTindakan.map((s) => {
              const mengendap = jamSejak(s.terisi_sejak, sekarang) >= AMBANG_MENGENDAP_JAM;

              return (
                <li key={s.kode} className="border border-garis bg-white p-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="angka font-mono text-sm font-semibold">
                      Slot {s.kode}
                    </span>
                    {s.terisi_sejak && (
                      <span
                        className={`angka font-mono text-[11px] ${
                          mengendap ? "text-amber-800" : "text-tinta-3"
                        }`}
                      >
                        terisi {lamaSejak(s.terisi_sejak, sekarang)}
                      </span>
                    )}
                  </div>

                  {s.pesanan ? (
                    <>
                      <p className="mt-1.5 text-sm leading-relaxed text-tinta-2">
                        <span className="angka font-mono font-semibold">
                          {s.pesanan.kode}
                        </span>
                        {s.pesanan.pelanggan && ` — ${s.pesanan.pelanggan.nama}`}
                        {mengendap && " sudah lama menunggu di rak."}
                      </p>

                      <form action={lepasSlot} className="mt-3">
                        <input type="hidden" name="kode" value={s.kode} />
                        <button className="border border-garis px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-tinta-2 active:bg-kertas">
                          Lepas tautan
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <p className="mt-1.5 text-sm leading-relaxed text-tinta-2">
                        Ada cucian di slot ini, tapi belum ketahuan punya siapa.
                      </p>
                      <TautkanSlot kode={s.kode} orderAktif={orderAktif} />
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
