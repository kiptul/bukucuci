// Cermin dari fungsi normalisasi_hp() di database — dipakai untuk pencarian
// dan pengecekan pelanggan sebelum data sampai ke trigger.
export function normalisasiHp(hp: string): string {
  const bersih = hp.replace(/\D/g, "");
  if (bersih.startsWith("62")) return bersih;
  if (bersih.startsWith("0")) return "62" + bersih.slice(1);
  if (bersih.startsWith("8")) return "62" + bersih;
  return bersih;
}

export function rupiah(n: number): string {
  return "Rp" + new Intl.NumberFormat("id-ID").format(n);
}

export function tanggalPendek(ts: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(ts));
}

export function tanggalLengkap(ts: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(ts));
}

// 6281234567890 -> 0812-3456-7890 (biar enak dibaca kasir)
export function hpCantik(noHp: string): string {
  const lokal = noHp.startsWith("62") ? "0" + noHp.slice(2) : noHp;
  return lokal.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
}
