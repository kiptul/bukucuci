import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BukuCuci",
    short_name: "BukuCuci",
    description:
      "Buku nota digital untuk laundry — catat order, kabari pelanggan lewat WhatsApp otomatis.",
    start_url: "/",
    display: "standalone",
    // Samakan dengan palet aplikasi: kertas untuk layar splash, tinta untuk
    // bilah status — kalau beda, aplikasi berkedip warna lain saat dibuka.
    background_color: "#f2efe8",
    theme_color: "#17161a",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
