"use client";

import { useLinkStatus } from "next/link";
import Putaran from "@/components/ui/Putaran";

// Harus dipasang sebagai anak dari <Link>. Selama halaman tujuan masih
// dimuat, ikon menu berganti jadi putaran — jadi tekanan jari langsung
// dibalas walaupun servernya belum selesai.
export default function PenandaMuat({ anak }: { anak: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return pending ? <Putaran kelas="h-5 w-5" /> : <>{anak}</>;
}
