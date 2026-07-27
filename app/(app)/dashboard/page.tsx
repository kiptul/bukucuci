// Isi halaman ini akan diganti daftar order pada Tugas 6.
export default function Dashboard() {
  return (
    <div className="px-4 py-5">
      <div className="flex items-baseline justify-between gap-3 border-b border-garis pb-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-tinta-2">
          Daftar Order
        </h2>
      </div>
      <p className="mt-6 text-sm text-tinta-3">Belum ada order.</p>
    </div>
  );
}
