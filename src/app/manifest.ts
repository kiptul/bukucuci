import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kelar",
    short_name: "Kelar",
    description:
      "Buku nota digital untuk laundry — catat order, kabari pelanggan lewat WhatsApp otomatis.",
    // id dan scope ditulis tegas supaya Chrome mengenali ini sebagai satu
    // aplikasi yang sama di tiap kunjungan, bukan situs baru.
    id: "/",
    scope: "/",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "id",
    // Samakan dengan palet aplikasi: kertas untuk layar splash, tinta untuk
    // bilah status — kalau beda, aplikasi berkedip warna lain saat dibuka.
    background_color: "#e6e0d3",
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
