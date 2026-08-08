"use client";

import { useActionState } from "react";
import TombolAksi from "@/components/ui/TombolAksi";
import { gayaInput, gayaLabel } from "@/components/forms/gaya";
import { batalGantiWifi, gantiWifi } from "@/app/(app)/rak/actions";

export type Wifi = {
  ssid: string | null;
  ssidBaru: string | null;
  percobaan: number;
  galat: string | null;
};

export default function SetelanWifi({
  wifi,
  hidup,
}: {
  wifi: Wifi;
  hidup: boolean;
}) {
  const [hasil, jalankan] = useActionState(gantiWifi, null);
  const menunggu = Boolean(wifi.ssidBaru);

  return (
    <details className="border-b border-garis px-4 py-4 md:px-6">
      <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.22em] text-tinta-2">
        WiFi perangkat
      </summary>

      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-tinta-3">
        Sekarang tersambung ke
      </p>
      <p className="mt-1 text-sm text-tinta">
        {wifi.ssid ?? "belum pernah dilaporkan"}
      </p>

      {wifi.galat && (
        <p className="mt-4 border-l-[3px] border-amber-700 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-950">
          {wifi.galat}
        </p>
      )}

      {menunggu ? (
        <div className="mt-4 border border-garis bg-white p-3.5">
          <p className="text-sm leading-relaxed text-tinta-2">
            Menunggu perangkat pindah ke{" "}
            <span className="font-semibold">{wifi.ssidBaru}</span>. Sudah
            dititipkan {wifi.percobaan}×.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-tinta-3">
            Perpindahan dianggap berhasil hanya setelah perangkat melapor dari
            jaringan itu — bukan saat titipan terkirim.
          </p>

          <form action={batalGantiWifi} className="mt-3">
            <button className="border border-garis px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-tinta-2 active:bg-kertas">
              Batalkan titipan
            </button>
          </form>
        </div>
      ) : (
        <form action={jalankan} className="mt-4">
          <label htmlFor="ssid" className={gayaLabel}>
            Nama WiFi baru
          </label>
          <input id="ssid" name="ssid" required className={gayaInput} />

          <label htmlFor="sandi" className={`${gayaLabel} mt-3`}>
            Sandi WiFi
          </label>
          <input
            id="sandi"
            name="sandi"
            type="password"
            minLength={8}
            className={gayaInput}
          />

          {hasil?.error && (
            <p className="mt-2 border-l-[3px] border-red-800 bg-red-50 px-3 py-2 text-sm text-red-900">
              {hasil.error}
            </p>
          )}
          {hasil?.pesan && (
            <p className="mt-2 border-l-[3px] border-aksen bg-aksen-muda px-3 py-2 text-sm text-aksen">
              {hasil.pesan}
            </p>
          )}

          <div className="mt-3">
            <TombolAksi saatMenunggu="Menitipkan..." gaya="garis" nonaktif={!hidup}>
              Titipkan setelan baru
            </TombolAksi>
          </div>

          {/* Menitipkan setelan lewat jalur ini mensyaratkan perangkat masih
              bisa menerima titipan. Kalau ia sudah telanjur di luar jaringan,
              satu-satunya jalan adalah portal di perangkat itu sendiri. */}
          {!hidup && (
            <p className="mt-3 text-sm leading-relaxed text-tinta-3">
              Perangkat sedang tidak melapor, jadi titipan tidak akan sampai.
              Pakai portal di perangkat — langkahnya ada di bawah.
            </p>
          )}
        </form>
      )}

      <div className="mt-6 border-t border-garis pt-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-tinta-2">
          Kalau WiFi sudah terlanjur berganti
        </p>
        <p className="mt-2 text-sm leading-relaxed text-tinta-2">
          Perangkat yang gagal menyambung akan memancarkan WiFi sendiri bernama{" "}
          <span className="font-mono font-semibold">Kelar-Rak</span>.
        </p>
        <ol className="mt-3 space-y-1.5 text-sm leading-relaxed text-tinta-2">
          <li>1. Sambungkan HP ke WiFi <span className="font-mono">Kelar-Rak</span></li>
          <li>2. Halaman setelan terbuka sendiri. Kalau tidak, buka <span className="font-mono">192.168.4.1</span></li>
          <li>3. Pilih WiFi baru, isi sandinya, simpan</li>
          <li>4. Perangkat menyambung ulang dan kembali melapor ke sini</li>
        </ol>
      </div>
    </details>
  );
}
