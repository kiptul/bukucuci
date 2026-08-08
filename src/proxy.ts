import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresh sesi Supabase + pagar halaman: semua rute wajib login kecuali /login.
// Nama file & export ikut konvensi Next 16 (dulu middleware.ts).
export async function proxy(request: NextRequest) {
  // Server Action datang sebagai POST berheader "next-action" dan responsnya
  // bukan HTML biasa. Kalau di-redirect dari sini, klien menerima respons yang
  // tidak bisa dibaca ("An unexpected response was received from the server")
  // dan aksinya batal jalan — ini yang dulu bikin tombol Keluar mati.
  // Otentikasi tiap action sudah ditangani di dalam action itu sendiri.
  if (request.method === "POST" && request.headers.has("next-action")) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Token kedaluwarsa/dipakai ulang akan melempar AuthApiError. Itu bukan
  // kondisi fatal — anggap saja belum login supaya user diarahkan ke /login.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  const path = request.nextUrl.pathname;

  // Dua halaman yang boleh dilihat tamu. Beranda ikut di sini sejak ia berisi
  // penjelasan produk: kalau tetap dipagari, calon pengguna yang membuka
  // tautannya langsung mendarat di form login tanpa pernah tahu ini aplikasi
  // apa. Beranda sendiri yang melempar pengunjung ber-sesi ke /dashboard.
  const PUBLIK = new Set(["/", "/login"]);

  if (!user && !PUBLIK.has(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Sudah login tapi buka /login → lempar ke dashboard.
  // Kecuali sedang membawa pesan error (mis. akun belum ditautkan ke laundry),
  // supaya tidak bolak-balik redirect.
  if (user && path === "/login" && !request.nextUrl.searchParams.has("error")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Semua rute kecuali aset statis, berkas PWA (manifest, service worker,
    // ikon, halaman offline — semuanya harus terbaca sebelum login supaya
    // Chrome mau memasang aplikasi), dan dua endpoint mesin yang punya
    // otentikasi sendiri: cron (CRON_SECRET) dan rak (x-device-token).
    //
    // api/rak wajib dikecualikan: ESP32 tidak punya sesi login, jadi kalau
    // ikut dipagari, POST-nya dibalas pengalihan ke /login dan perangkat
    // menerima HTML — gagalnya tidak terlihat sebagai 401, tapi 307.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|sw.js|offline.html|manifest.webmanifest|icons/|api/cron/|api/rak).*)",
  ],
};
