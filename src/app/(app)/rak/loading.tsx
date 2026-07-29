import Rangka from "@/components/Rangka";

export default function Memuat() {
  return (
    <div className="md:mx-auto md:max-w-xl">
      <section className="border-b border-garis px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <Rangka kelas="h-3 w-12" />
          <Rangka kelas="h-3 w-28" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Rangka key={i} kelas="h-[70px] w-full" />
          ))}
        </div>
      </section>

      <section className="px-4 py-4 md:px-6">
        <Rangka kelas="h-3 w-40" />
        <Rangka kelas="mt-2 h-3 w-52" />
      </section>
    </div>
  );
}
