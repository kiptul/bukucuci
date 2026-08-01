import Rangka from "@/components/ui/Rangka";

// Bentuknya sengaja meniru daftar order yang sebenarnya, supaya saat data
// datang halaman tidak melompat — hanya berganti isi.
export default function Memuat() {
  return (
    <div>
      <div className="border-b border-garis px-4 py-3">
        <Rangka kelas="h-11 w-full" />
      </div>

      <div className="flex gap-1.5 border-b border-garis px-4 py-2.5">
        {["w-14", "w-16", "w-12", "w-20", "w-14"].map((lebar, i) => (
          <Rangka key={i} kelas={`h-6 ${lebar}`} />
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-2.5">
        <Rangka kelas="h-3 w-28" />
        <Rangka kelas="h-3 w-14" />
      </div>

      <ul className="border-t border-garis md:grid md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="border-b border-garis px-4 py-3.5 md:odd:border-r"
          >
            <div className="flex items-center justify-between">
              <Rangka kelas="h-4 w-20" />
              <Rangka kelas="h-4 w-16" />
            </div>
            <Rangka kelas="mt-2.5 h-4 w-32" />
            <div className="mt-2 flex items-center justify-between">
              <Rangka kelas="h-3 w-36" />
              <Rangka kelas="h-4 w-20" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
