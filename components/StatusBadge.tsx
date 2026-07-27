import type { StatusPesanan } from "@/lib/types";

// Tampil seperti stempel di nota: kotak, bergaris, huruf kapital monospace
const gaya: Record<StatusPesanan, string> = {
  MASUK: "border-tinta-2 text-tinta-2",
  SIAP: "border-aksen bg-aksen-muda text-aksen",
  DIAMBIL: "border-garis text-tinta-3",
  BATAL: "border-garis text-tinta-3 line-through",
};

export default function StatusBadge({ status }: { status: StatusPesanan }) {
  return (
    <span
      className={`inline-block border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${gaya[status]}`}
    >
      {status}
    </span>
  );
}
