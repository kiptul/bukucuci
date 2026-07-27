import type { Metadata, Viewport } from "next";
import "./globals.css";
import DaftarkanSW from "@/components/DaftarkanSW";

export const metadata: Metadata = {
  title: "BukuCuci",
  description:
    "Buku nota digital untuk laundry — catat order, kabari pelanggan lewat WhatsApp otomatis.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "BukuCuci",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-slate-100 text-slate-900 antialiased">
        {/* Dibuat selebar HP; di desktop tampil sebagai kolom di tengah */}
        <div className="mx-auto min-h-dvh w-full max-w-md bg-slate-50 shadow-sm">
          {children}
        </div>
        <DaftarkanSW />
      </body>
    </html>
  );
}
