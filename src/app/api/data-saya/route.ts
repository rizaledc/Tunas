import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fileResponse, toXlsx, XLSX_TYPE } from "@/lib/excel";
import { todayStr } from "@/lib/date";

/** Unduh seluruh data milik orang tua yang login (hak akses data, UU PDP). */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Harus masuk" }, { status: 401 });

  const [{ data: profile }, { data: family }, { data: children }] = await Promise.all([
    supabase.from("users").select("nama,no_hp,email,created_at").eq("id", user.id).single(),
    supabase.from("families").select("id,rt,consent_at,consent_version").eq("parent_id", user.id).single(),
    supabase.from("children").select("id,nickname,birth_year,school_level,created_at"),
  ]);
  const ids = (children ?? []).map((c) => c.id);
  const [{ data: logs }, { data: checkins }, { data: agreements }, { data: insights }, { data: reflections }] = await Promise.all([
    supabase.from("activity_logs").select("*").in("child_id", ids).order("log_date"),
    supabase.from("daily_checkins").select("*").in("child_id", ids).order("date"),
    supabase.from("agreements").select("*").in("child_id", ids),
    supabase.from("ai_insights").select("id,child_id,period_start,period_end,output,model,rating,created_at").in("child_id", ids),
    supabase.from("reflections").select("*").in("child_id", ids),
  ]);
  const nick = (id: string) => children?.find((c) => c.id === id)?.nickname ?? id;
  const withNick = <T extends { child_id: string }>(rows: T[] | null) => (rows ?? []).map(({ child_id, ...r }) => ({ anak: nick(child_id), ...r }));

  const payload = {
    diekspor_pada: new Date().toISOString(),
    akun: profile,
    keluarga: family,
    anak: children,
    kesepakatan: withNick(agreements),
    catatan_aktivitas: withNick(logs),
    check_in: withNick(checkins),
    insight: withNick(insights),
    refleksi: withNick(reflections),
  };
  const name = `data-sahabat-anak-${todayStr()}`;
  if (request.nextUrl.searchParams.get("format") === "xlsx") {
    const buf = await toXlsx([
      { name: "Akun", rows: [{ ...profile, ...family }] },
      { name: "Anak", rows: children ?? [] },
      { name: "Kesepakatan", rows: payload.kesepakatan },
      { name: "Catatan", rows: payload.catatan_aktivitas },
      { name: "Check-in", rows: payload.check_in },
      { name: "Insight", rows: payload.insight },
      { name: "Refleksi", rows: payload.refleksi },
    ]);
    return fileResponse(buf, `${name}.xlsx`, XLSX_TYPE);
  }
  return fileResponse(JSON.stringify(payload, null, 2), `${name}.json`, "application/json");
}
