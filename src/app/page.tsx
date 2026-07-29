import { redirect } from "next/navigation";

// Halaman utama cuma gerbang: middleware sudah memastikan user login,
// jadi tinggal teruskan ke dashboard.
export default function Beranda() {
  redirect("/dashboard");
}
