import "server-only";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { getSettings, referenceForAge } from "./settings";
import { addDays, coinPeriod, todayStr } from "./date";
import { computeIndicators, parseInsight, ruleBasedInsight, type CategoryRow, type CheckinRow, type Indicators, type InsightOutput, type LogRow } from "./indicators";
import { sha256 } from "./crypto";
import { logError } from "./audit";
import { schoolLevelLabel } from "./utils";
import { chatCompletion, extractJson, fetchKeyInfo, resolveOpenRouterKey } from "./openrouter";

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
    schoolLevel: schoolLevelLabel(child.school_level),
    reference: ref,
    lastReflection: refl?.[0] ?? null,
  });
}

export type CoinStatus = { total: number; used: number; remaining: number; nextReset: string };

/**
 * Koin AI per akun orang tua (semua anak dalam satu keluarga berbagi koin).
 * Koin terpakai hanya jika AI benar-benar dipanggil; ringkasan otomatis (cadangan) tidak memotong koin.
 */
export async function aiCoins(familyId: string): Promise<CoinStatus> {
  const supabase = await createClient();
  const [{ data: kids }, cfg] = await Promise.all([supabase.from("children").select("id").eq("family_id", familyId), getSettings(["ai.coins_per_day"])]);
  const total = Math.max(1, Number(cfg["ai.coins_per_day"]) || 1);
  const { start, next } = coinPeriod();
  const ids = (kids ?? []).map((k) => k.id as string);
  let used = 0;
  if (ids.length) {
    const { count } = await supabase
      .from("ai_insights")
      .select("id", { count: "exact", head: true })
      .in("child_id", ids)
      .neq("model", "rule-based")
      .gte("created_at", start.toISOString());
    used = count ?? 0;
  }
  return { total, used, remaining: Math.max(0, total - used), nextReset: next.toISOString() };
}

type AiCall = { output: InsightOutput; model: string; tokensIn: number; tokensOut: number; cost: number };

async function callOpenRouter(ind: Indicators, cfg: { model: string; prompt: string; maxTokens: number }): Promise<AiCall> {
  const { key } = await resolveOpenRouterKey();
  if (!key) throw new Error("API key OpenRouter belum diisi (Panel Admin → Pengaturan → AI)");
  const r = await chatCompletion(key, {
    model: cfg.model,
    system: cfg.prompt,
    user: `Ringkasan angka 7 hari terakhir (JSON):\n${JSON.stringify(ind)}`,
    maxTokens: cfg.maxTokens,
    json: true,
  });
  const parsed = parseInsight(extractJson(r.content, r.finishReason));
  if (!parsed) throw new Error("Format output AI tidak valid");
  return { output: parsed, model: r.model, tokensIn: r.tokensIn, tokensOut: r.tokensOut, cost: r.cost };
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

  const { data: fam } = await supabase.from("children").select("family_id").eq("id", childId).maybeSingle();
  const [cfg, coins] = await Promise.all([
    getSettings(["ai.model", "ai.system_prompt", "ai.max_tokens", "ai.enabled"]),
    aiCoins(String(fam?.family_id ?? "")),
  ]);
  if (coins.remaining <= 0) {
    return { ok: false, error: "Koin AI hari ini sudah terpakai. Koin baru tersedia besok pukul 07.00 WIB." };
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
  const { key } = await resolveOpenRouterKey();
  if (!key) return null;
  try {
    return await fetchKeyInfo(key);
  } catch {
    return null;
  }
}
