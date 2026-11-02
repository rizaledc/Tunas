import "server-only";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { getSettings, referenceForAge } from "./settings";
import { addDays, todayStr } from "./date";
import { computeIndicators, parseInsight, ruleBasedInsight, type CategoryRow, type CheckinRow, type Indicators, type InsightOutput, type LogRow } from "./indicators";
import { sha256 } from "./crypto";
import { logError } from "./audit";
import { SCHOOL_LEVELS } from "./utils";

export type InsightResult =
  | { ok: true; id: string; cached: boolean; fallback: boolean }
  | { ok: false; error: string };

export async function buildIndicators(childId: string): Promise<Indicators | null> {
  const supabase = await createClient();
  const end = todayStr();
  const start = addDays(end, -13);
  const [{ data: child }, { data: agreement }, { data: logs }, { data: checkins }, { data: cats }, { data: refl }, settings] = await Promise.all([
    supabase.from("children").select("id,birth_year,school_level").eq("id", childId).maybeSingle(),
    supabase.from("agreements").select("target_screen_min").eq("child_id", childId).maybeSingle(),
    supabase.from("activity_logs").select("log_date,type,category_id,duration_min,accompanied,follows_agreement,start_at,end_at").eq("child_id", childId).gte("log_date", start).lte("log_date", end),
    supabase.from("daily_checkins").select("date,mood,stop_response,sleep_time,device_before_sleep").eq("child_id", childId).gte("date", addDays(end, -6)),
    supabase.from("categories").select("id,type,name,icon"),
    supabase.from("reflections").select("action_text,outcome").eq("child_id", childId).order("created_at", { ascending: false }).limit(1),
    getSettings(["screen_time.reference"]),
  ]);
  if (!child) return null;
  const age = Number(end.slice(0, 4)) - child.birth_year;
  const ref = referenceForAge(settings["screen_time.reference"], age);
  return computeIndicators({
    endDate: end,
    logs: (logs ?? []) as LogRow[],
    checkins: (checkins ?? []) as CheckinRow[],
    categories: (cats ?? []) as CategoryRow[],
    targetMin: agreement?.target_screen_min ?? ref?.max_min ?? 120,
    childAge: age,
    schoolLevel: SCHOOL_LEVELS[child.school_level] ?? child.school_level,
    reference: ref,
    lastReflection: refl?.[0] ?? null,
  });
}

type AiCall = { output: InsightOutput; model: string; tokensIn: number; tokensOut: number; cost: number };

async function callOpenRouter(ind: Indicators, cfg: { model: string; prompt: string; maxTokens: number }): Promise<AiCall> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY belum diatur");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://sahabatanaktunas.com",
      "X-Title": "SAHABAT ANAK",
    },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      temperature: 0.4,
      response_format: { type: "json_object" },
      usage: { include: true },
      messages: [
        { role: "system", content: cfg.prompt },
        { role: "user", content: `Ringkasan angka 7 hari terakhir (JSON):\n${JSON.stringify(ind)}` },
      ],
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const content: string = json.choices?.[0]?.message?.content ?? "";
  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const parsed = parseInsight(JSON.parse(cleaned.slice(start, end + 1)));
  if (!parsed) throw new Error("Format output AI tidak valid");
  return {
    output: parsed,
    model: json.model ?? cfg.model,
    tokensIn: json.usage?.prompt_tokens ?? 0,
    tokensOut: json.usage?.completion_tokens ?? 0,
    cost: Number(json.usage?.cost ?? 0),
  };
}

export async function generateInsight(childId: string): Promise<InsightResult> {
  const supabase = await createClient();
  // Kepemilikan anak diverifikasi lewat RLS: query gagal jika bukan anak sendiri.
  const { data: child } = await supabase.from("children").select("id").eq("id", childId).maybeSingle();
  if (!child) return { ok: false, error: "Anak tidak ditemukan." };

  const ind = await buildIndicators(childId);
  if (!ind) return { ok: false, error: "Data anak tidak ditemukan." };
  if (ind.hari_tercatat === 0) return { ok: false, error: "Belum ada catatan 7 hari terakhir. Catat aktivitas dulu, ya." };

  const hash = sha256(JSON.stringify(ind));
  const { data: latest } = await supabase
    .from("ai_insights")
    .select("id,input_hash")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (latest?.[0]?.input_hash === hash) return { ok: true, id: latest[0].id, cached: true, fallback: false };

  const cfg = await getSettings(["ai.model", "ai.system_prompt", "ai.max_per_day", "ai.max_tokens", "ai.enabled"]);
  const startToday = new Date(`${todayStr()}T00:00:00+07:00`).toISOString();
  const { count } = await supabase
    .from("ai_insights")
    .select("id", { count: "exact", head: true })
    .eq("child_id", childId)
    .gte("created_at", startToday);
  if ((count ?? 0) >= Number(cfg["ai.max_per_day"])) {
    return { ok: false, error: `Batas ${cfg["ai.max_per_day"]} analisis per hari untuk anak ini sudah tercapai. Coba lagi besok.` };
  }

  let call: AiCall;
  let fallback = false;
  try {
    if (!cfg["ai.enabled"]) throw new Error("AI dinonaktifkan di pengaturan");
    call = await callOpenRouter(ind, { model: String(cfg["ai.model"]), prompt: String(cfg["ai.system_prompt"]), maxTokens: Number(cfg["ai.max_tokens"]) });
  } catch (e) {
    await logError("insight.ai", e);
    fallback = true;
    call = { output: ruleBasedInsight(ind), model: "rule-based", tokensIn: 0, tokensOut: 0, cost: 0 };
  }

  const { data: row, error } = await createAdminClient()
    .from("ai_insights")
    .insert({
      child_id: childId,
      period_start: ind.periode.mulai,
      period_end: ind.periode.selesai,
      input_summary: ind,
      input_hash: hash,
      output: call.output,
      model: call.model,
      tokens_in: call.tokensIn,
      tokens_out: call.tokensOut,
      cost_usd: call.cost,
    })
    .select("id")
    .single();
  if (error || !row) return { ok: false, error: "Gagal menyimpan insight." };
  return { ok: true, id: row.id, cached: false, fallback };
}

export async function openRouterBalance(): Promise<{ limit: number | null; usage: number; remaining: number | null } | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
    if (!res.ok) return null;
    const { data } = await res.json();
    return { limit: data.limit ?? null, usage: Number(data.usage ?? 0), remaining: data.limit_remaining ?? (data.limit != null ? data.limit - data.usage : null) };
  } catch {
    return null;
  }
}
