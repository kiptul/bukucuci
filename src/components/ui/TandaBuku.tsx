// Penanda order yang disalin dari buku nota kertas (mode berdampingan).
// Dibedakan dari stempel status: warnanya netral dan tulisannya lebih kecil,
// supaya menerangkan asal order tanpa mengalahkan status di sebelahnya.
export default function TandaBuku() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 border border-tinta-3 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-tinta-2">
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
          d="M4 5h9a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H4zM20 5h-1a3 3 0 0 0-3 3v11a2 2 0 0 1 2-2h2z"
        />
      </svg>
      Dari buku
    </span>
  );
}
