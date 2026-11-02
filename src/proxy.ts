import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const CHILD_MODE_COOKIE = "sa_child_mode";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  // Mode anak: perangkat terkunci di halaman mode anak sampai orang tua keluar.
  if (request.cookies.get(CHILD_MODE_COOKIE) && pathname.startsWith("/app") && !pathname.startsWith("/app/mode-anak")) {
    return NextResponse.redirect(new URL("/app/mode-anak", request.url));
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && pathname.startsWith("/app")) {
    const to = new URL("/login", request.url);
    to.searchParams.set("next", pathname);
    return NextResponse.redirect(to);
  }
  if (!user && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login/admin", request.url));
  }
  return response;
}

export const config = {
  // Halaman publik tidak melewati proxy agar landing page tetap cepat.
  matcher: ["/app/:path*", "/admin/:path*", "/login/:path*", "/daftar/:path*", "/reset-password", "/api/:path*"],
};
