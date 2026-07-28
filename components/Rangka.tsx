// Balok abu-abu berdenyut untuk rangka pemuatan.
export default function Rangka({ kelas }: { kelas: string }) {
  return <div className={`animate-pulse rounded-[2px] bg-garis ${kelas}`} />;
}
