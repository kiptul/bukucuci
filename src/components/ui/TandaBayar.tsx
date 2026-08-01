// Penanda order yang cuciannya sudah selesai tapi uangnya belum masuk.
//
// Sengaja hanya menandai yang BELUM, bukan keduanya: kalau tiap baris punya
// penanda, tidak ada yang menonjol. Yang perlu ditangkap sekilas cuma satu —
// jangan serahkan cucian ini sebelum ditagih.
export default function TandaBayar() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 border border-red-800/40 bg-red-50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-red-900">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-2.5 w-2.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
        />
      </svg>
      Belum bayar
    </span>
  );
}
