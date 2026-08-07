// Kelas Tailwind untuk isian form, dipakai bersama Server Component dan
// Client Component.
//
// BERKAS INI SENGAJA TIDAK BERTANDA "use client" — jangan tambahkan.
//
// Sebelumnya kedua konstanta ini diekspor dari FormAdmin.tsx yang bertanda
// "use client". Diimpor ke Server Component, yang didapat bukan stringnya
// melainkan rujukan klien. Diteruskan apa adanya sebagai prop ia masih
// diselesaikan di browser dan terlihat baik-baik saja, tapi begitu
// diinterpolasi ke template literal di server:
//
//     className={`${gayaInput} font-mono`}
//
// JavaScript memanggil String() pada rujukan itu saat itu juga, dan yang
// tertulis ke atribut class adalah teks fungsi error — bukan kelas Tailwind.
// Isian jadi tampil polos tanpa kotak, tanpa satu pun peringatan di build,
// TypeScript, ESLint, maupun konsol browser.
//
// Karena berkas ini modul biasa, nilainya sungguhan di kedua sisi dan pola di
// atas aman lagi.

export const gayaInput =
  "w-full border border-garis bg-white px-3.5 py-2.5 text-base outline-none focus:border-aksen focus:ring-1 focus:ring-aksen";

export const gayaLabel =
  "mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-tinta-2";
