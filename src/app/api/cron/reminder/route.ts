import { NextResponse, type NextRequest } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { todayStr } from "@/lib/date";
import { logError } from "@/lib/audit";

/**
 * Dipanggil Vercel Cron setiap sore (lihat vercel.json).
 * Mengirim notifikasi PWA ke orang tua yang mengaktifkan pengingat dan belum mencatat hari ini.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return NextResponse.json({ error: "VAPID belum diatur" }, { status: 500 });
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:admin@example.com", pub, priv);

  const db = createAdminClient();
  const today = todayStr();
  const message = await getSetting("reminder.message");
  const { data: subs } = await db.from("push_subscriptions").select("id,user_id,endpoint,keys,users!inner(reminder_enabled,status)").eq("users.reminder_enabled", true).eq("users.status", "active");
  const userIds = [...new Set((subs ?? []).map((s) => s.user_id))];
  if (!userIds.length) return NextResponse.json({ sent: 0 });

  const { data: fams } = await db.from("families").select("id,parent_id").in("parent_id", userIds);
  const { data: kids } = await db.from("children").select("id,family_id").in("family_id", (fams ?? []).map((f) => f.id));
  const { data: logged } = await db.from("activity_logs").select("child_id").eq("log_date", today).in("child_id", (kids ?? []).map((k) => k.id));
  const loggedFamilies = new Set((kids ?? []).filter((k) => logged?.some((l) => l.child_id === k.id)).map((k) => k.family_id));
  const loggedParents = new Set((fams ?? []).filter((f) => loggedFamilies.has(f.id)).map((f) => f.parent_id));

  let sent = 0;
  for (const s of subs ?? []) {
    if (loggedParents.has(s.user_id)) continue;
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys as { p256dh: string; auth: string } }, JSON.stringify({ title: "SAHABAT ANAK", body: message, url: "/app/catat" }));
      sent++;
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) await db.from("push_subscriptions").delete().eq("id", s.id);
      else await logError("cron.reminder", e);
    }
  }
  return NextResponse.json({ sent });
}
