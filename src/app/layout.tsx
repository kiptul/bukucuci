import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import DaftarkanSW from "@/components/DaftarkanSW";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
});

// Dipakai untuk kode order, angka, dan label status — biar terbaca seperti nota
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Kelar",
  description:
    "Buku nota digital untuk laundry — catat order, kabari pelanggan lewat WhatsApp otomatis.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Kelar",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#17161a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh bg-kertas font-sans text-tinta antialiased">
        {/* Lebar diatur per-halaman: HP satu kolom, layar besar melebar. */}
        {children}
        <DaftarkanSW />
      </body>
    </html>
  );
}
