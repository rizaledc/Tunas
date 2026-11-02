import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function signOut(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let admin = false;
  if (user) {
    const { data } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
    admin = data?.role === "admin" || data?.role === "superadmin";
  }
  await supabase.auth.signOut({ scope: "local" });
  const alasan = request.nextUrl.searchParams.get("alasan");
  const to = new URL(admin ? "/login/admin" : "/login", request.url);
  if (alasan) to.searchParams.set("alasan", alasan);
  const res = NextResponse.redirect(to, { status: 303 });
  res.cookies.delete("sa_child");
  res.cookies.delete("sa_child_mode");
  return res;
}

export const GET = signOut;
export const POST = signOut;
