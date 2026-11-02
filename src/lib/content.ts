import "server-only";
import { createPublicClient } from "./supabase/public";
import { createAdminClient } from "./supabase/admin";
import { SUPABASE_SERVICE_KEY, isSupabaseConfigured } from "./supabase/env";

export type EventRow = { id: string; title: string; slug: string; date: string; location: string | null; description: string | null; cover_photo: string | null; featured: boolean; published: boolean };
export type PhotoRow = { id: string; url: string; caption: string | null; category: string; event_id: string | null; publish_consent: boolean };
export type ArticleRow = { id: string; title: string; slug: string; excerpt: string | null; body: string; cover: string | null; published_at: string | null };

export async function getEvents(opts: { upcoming?: boolean; past?: boolean; featured?: boolean; limit?: number } = {}): Promise<EventRow[]> {
  const db = createPublicClient();
  if (!db) return [];
  let q = db.from("events").select("*").eq("published", true);
  const now = new Date().toISOString();
  if (opts.upcoming) q = q.gte("date", now).order("date", { ascending: true });
  else if (opts.past) q = q.lt("date", now).order("date", { ascending: false });
  else q = q.order("date", { ascending: false });
  if (opts.featured) q = q.eq("featured", true);
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data ?? []) as EventRow[];
}

export async function getEvent(slug: string): Promise<EventRow | null> {
  const db = createPublicClient();
  if (!db) return null;
  const { data } = await db.from("events").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  return (data as EventRow) ?? null;
}

export async function getPhotos(opts: { category?: string; eventId?: string; limit?: number } = {}): Promise<PhotoRow[]> {
  const db = createPublicClient();
  if (!db) return [];
  let q = db.from("gallery_photos").select("id,url,caption,category,event_id,publish_consent").eq("publish_consent", true).order("created_at", { ascending: false });
  if (opts.category) q = q.eq("category", opts.category);
  if (opts.eventId) q = q.eq("event_id", opts.eventId);
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data ?? []) as PhotoRow[];
}

export async function getArticles(limit?: number): Promise<ArticleRow[]> {
  const db = createPublicClient();
  if (!db) return [];
  let q = db.from("articles").select("*").not("published_at", "is", null).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as ArticleRow[];
}

export async function getArticle(slug: string): Promise<ArticleRow | null> {
  const db = createPublicClient();
  if (!db) return null;
  const { data } = await db.from("articles").select("*").eq("slug", slug).not("published_at", "is", null).lte("published_at", new Date().toISOString()).maybeSingle();
  return (data as ArticleRow) ?? null;
}

/** Jumlah keluarga aktif (orang tua aktif 30 hari terakhir), hanya angka agregat. */
export async function countActiveFamilies(): Promise<number | null> {
  if (!isSupabaseConfigured || !SUPABASE_SERVICE_KEY) return null;
  try {
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { count } = await createAdminClient()
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "parent")
      .eq("status", "active")
      .gte("last_active_at", since);
    return count ?? 0;
  } catch {
    return null;
  }
}
