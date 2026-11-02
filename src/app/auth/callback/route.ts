import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicOrigin } from "@/lib/site";

/** Callback OAuth (Google) & tautan reset password. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = publicOrigin(request);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/app";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/app";
  if (searchParams.get("error")) return NextResponse.redirect(`${origin}/login?alasan=google_batal`);
  if (!code) return NextResponse.redirect(`${origin}/login`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/login?alasan=google_gagal`);
  if (next === "/reset-password") return NextResponse.redirect(`${origin}${next}`);

  const { data: profile } = await createAdminClient().from("users").select("role,status").eq("id", data.user.id).maybeSingle();
  if (!profile) {
    // Akun Google baru: lengkapi kode undangan, nomor HP, dan persetujuan.
    const kode = next.startsWith("/daftar/lengkapi") ? next : "/daftar/lengkapi";
    return NextResponse.redirect(`${origin}${kode}`);
  }
  if (profile.role !== "parent") {
    // Admin wajib lewat /login/admin (batas percobaan & verifikasi dua langkah).
    await supabase.auth.signOut({ scope: "local" });
    return NextResponse.redirect(`${origin}/login/admin?alasan=google`);
  }
  if (profile.status !== "active") {
    await supabase.auth.signOut({ scope: "local" });
    return NextResponse.redirect(`${origin}/login?alasan=nonaktif`);
  }
  return NextResponse.redirect(`${origin}${next.startsWith("/daftar") ? "/app" : next}`);
}
