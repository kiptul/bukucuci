import Rangka from "@/components/ui/Rangka";

export default function Memuat() {
  return (
    <div className="md:mx-auto md:max-w-2xl">
      <div className="border-b border-garis px-4 py-3">
        <Rangka kelas="h-3 w-28" />
      </div>

      <section className="px-4 py-5">
        <div className="flex items-start justify-between">
          <div>
            <Rangka kelas="h-7 w-32" />
            <Rangka kelas="mt-2 h-3 w-40" />
          </div>
          <Rangka kelas="h-5 w-16" />
        </div>
        <div className="mt-4 border-t border-garis pt-4">
          <Rangka kelas="h-5 w-36" />
          <Rangka kelas="mt-2 h-4 w-32" />
        </div>
      </section>

      <section className="px-4 pb-5">
        <Rangka kelas="h-3 w-20" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <Rangka kelas="h-4 w-40" />
                <Rangka kelas="mt-2 h-3 w-24" />
              </div>
              <Rangka kelas="h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t-2 border-tinta pt-3">
          <Rangka kelas="h-3 w-12" />
          <Rangka kelas="h-7 w-28" />
        </div>
      </section>
    </div>
  );
}
