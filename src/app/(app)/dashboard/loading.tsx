import Rangka from "@/components/ui/Rangka";

// Bentuknya sengaja meniru daftar order yang sebenarnya, supaya saat data
// datang halaman tidak melompat — hanya berganti isi. Termasuk bentuk
// kartunya: rangka bergaya baris rata-tepi di atas kartu bergaris membuat
// seluruh daftar bergeser beberapa piksel begitu data tiba.
export default function Memuat() {
  return (
    <div>
      <div className="border-b border-garis px-4 py-3.5 md:px-6">
        <Rangka kelas="h-12 w-full" />
      </div>

      <div className="grid grid-cols-5 gap-1.5 border-b border-garis px-4 py-3 md:px-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Rangka key={i} kelas="h-[34px] w-full" />
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <Rangka kelas="h-3 w-28" />
        <Rangka kelas="h-3 w-14" />
      </div>

      <ul className="flex flex-col gap-2 px-4 pt-3 md:grid md:grid-cols-2 md:gap-3 md:px-6">
        {["w-32", "w-40", "w-28", "w-36", "w-32", "w-24"].map((lebar, i) => (
          <li
            key={i}
            className="border border-garis border-l-[3px] border-l-garis bg-white py-3 pl-4 pr-3.5"
          >
            <div className="flex items-center justify-between">
              <Rangka kelas="h-4 w-20" />
              <Rangka kelas="h-4 w-16" />
            </div>
            <Rangka kelas={`mt-2.5 h-4 ${lebar}`} />
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
