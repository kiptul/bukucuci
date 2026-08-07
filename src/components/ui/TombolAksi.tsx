"use client";

import { useFormStatus } from "react-dom";
import Putaran from "@/components/ui/Putaran";

const GAYA = {
  utama: "bg-tinta text-kertas active:bg-tinta-2",
  aksen: "bg-aksen text-white active:opacity-90",
  garis: "border border-garis text-tinta-2 active:bg-kertas",
} as const;

export default function TombolAksi({
  children,
  saatMenunggu,
  gaya = "utama",
  nonaktif,
  className,
  onClick,
}: {
  children: React.ReactNode;
  // Teks pengganti selama menunggu. Sebutkan pekerjaannya, bukan sekadar
  // "Loading" — menunggu terasa lebih singkat kalau tahu yang ditunggu apa.
  saatMenunggu: string;
  gaya?: keyof typeof GAYA;
  nonaktif?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      onClick={onClick}
      disabled={pending || nonaktif}
      className={`flex w-full items-center justify-center gap-2 py-3.5 text-sm font-medium disabled:opacity-60 ${GAYA[gaya]} ${className ?? ""}`}
    >
      {pending && <Putaran />}
      {pending ? saatMenunggu : children}
    </button>
  );
}
