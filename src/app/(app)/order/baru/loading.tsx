import Rangka from "@/components/ui/Rangka";

export default function Memuat() {
  return (
    <div className="md:mx-auto md:max-w-xl">
      <div className="border-b border-garis bg-kertas px-4 py-4">
        <div className="flex gap-3">
          <Rangka kelas="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <Rangka kelas="h-4 w-44" />
            <Rangka kelas="mt-2 h-3 w-full max-w-[16rem]" />
          </div>
        </div>
      </div>

      <section className="px-4 py-5">
        <Rangka kelas="h-3 w-28" />
        <Rangka kelas="mt-5 h-3 w-20" />
        <Rangka kelas="mt-2 h-12 w-full" />
      </section>

      <section className="px-4 pb-5">
        <Rangka kelas="h-3 w-24" />
        <div className="mt-4 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <Rangka kelas="h-4 w-40" />
                <Rangka kelas="mt-2 h-3 w-24" />
              </div>
              <Rangka kelas="h-11 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t-2 border-tinta px-4 py-5">
        <div className="flex items-center justify-between">
          <Rangka kelas="h-3 w-12" />
          <Rangka kelas="h-8 w-28" />
        </div>
        <Rangka kelas="mt-6 h-12 w-full" />
      </section>
    </div>
  );
}
