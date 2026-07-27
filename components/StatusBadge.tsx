import type { StatusPesanan } from "@/lib/types";

const gaya: Record<StatusPesanan, string> = {
  MASUK: "bg-amber-100 text-amber-800",
  SIAP: "bg-sky-100 text-sky-800",
  DIAMBIL: "bg-emerald-100 text-emerald-800",
  BATAL: "bg-slate-200 text-slate-600",
};

export default function StatusBadge({ status }: { status: StatusPesanan }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${gaya[status]}`}
    >
      {status}
    </span>
  );
}
