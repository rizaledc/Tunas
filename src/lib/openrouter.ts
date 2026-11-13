import "server-only";
import { getSettings } from "./settings";
import { decryptSecret } from "./crypto";
import { SITE_URL } from "./site";

/** Dapat diganti untuk pengujian (server tiruan). Produksi: biarkan default. */
const BASE = (process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1").replace(/\/$/, "");

export type KeySource = "panel" | "env" | "none" | "broken";

/** Kunci dari Panel Admin diutamakan; jika kosong, pakai env OPENROUTER_API_KEY. */
export async function resolveOpenRouterKey(): Promise<{ key: string | null; source: KeySource }> {
  const s = await getSettings(["ai.openrouter_key"]);
  const box = String(s["ai.openrouter_key"] ?? "");
  if (box) {
    const key = decryptSecret(box);
    if (key) return { key, source: "panel" };
    if (process.env.OPENROUTER_API_KEY) return { key: process.env.OPENROUTER_API_KEY, source: "env" };
    return { key: null, source: "broken" };
  }
  if (process.env.OPENROUTER_API_KEY) return { key: process.env.OPENROUTER_API_KEY, source: "env" };
  return { key: null, source: "none" };
}

export function maskKey(key: string | null): string {
  if (!key) return "";
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

function headers(key: string) {
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "HTTP-Referer": SITE_URL,
    "X-Title": "SAHABAT ANAK",
  };
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Pesan ramah untuk kode error OpenRouter. */
export function explainError(status: number, raw = ""): string {
  if (status === 401) return "API key tidak valid atau sudah dihapus di OpenRouter.";
  if (status === 402) return "Saldo/kredit OpenRouter habis atau limit API key tercapai. Isi ulang di openrouter.ai/credits.";
  if (status === 403) return "Permintaan ditolak oleh moderasi OpenRouter.";
  if (status === 404) return "Model tidak ditemukan. Periksa nama model di pengaturan.";
  if (status === 408 || status === 0) return "OpenRouter tidak merespons (timeout). Coba lagi.";
  if (status === 429) return "Terlalu banyak permintaan ke OpenRouter (rate limit). Coba lagi sebentar lagi.";
  if (status >= 500) return "Penyedia model sedang bermasalah. Coba lagi nanti atau ganti model.";
  return raw.slice(0, 200) || `Error ${status}`;
}

export type KeyInfo = { label: string | null; limit: number | null; usage: number; remaining: number | null; isFreeTier: boolean };

export async function fetchKeyInfo(key: string): Promise<KeyInfo> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/key`, { headers: headers(key), cache: "no-store", signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new OpenRouterError(explainError(0), 0);
  }
  if (!res.ok) throw new OpenRouterError(explainError(res.status, await res.text()), res.status);
  const { data } = await res.json();
  const limit = data?.limit ?? null;
  const usage = Number(data?.usage ?? 0);
  return {
    label: data?.label ?? null,
    limit,
    usage,
    remaining: data?.limit_remaining ?? (limit !== null ? limit - usage : null),
    isFreeTier: Boolean(data?.is_free_tier),
  };
}

export type ModelInfo = { id: string; name: string; promptPerM: number; completionPerM: number; context: number | null };

/** Daftar model publik OpenRouter (tidak butuh API key), di-cache 1 jam. */
export async function fetchModels(): Promise<ModelInfo[]> {
  try {
    const res = await fetch(`${BASE}/models`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return [];
    const { data } = await res.json();
    return (data ?? []).map((m: { id: string; name?: string; context_length?: number; pricing?: { prompt?: string; completion?: string } }) => ({
      id: m.id,
      name: m.name ?? m.id,
      promptPerM: Number(m.pricing?.prompt ?? 0) * 1_000_000,
      completionPerM: Number(m.pricing?.completion ?? 0) * 1_000_000,
      context: m.context_length ?? null,
    }));
  } catch {
    return [];
  }
}

export type ChatResult = { content: string; model: string; tokensIn: number; tokensOut: number; cost: number; finishReason: string | null };

/** Isi pesan bisa berupa string atau array bagian ({type:"text", text}). */
function messageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content))
    return content
      .map((p) => (typeof p === "string" ? p : p && typeof p === "object" && "text" in p ? String((p as { text: unknown }).text ?? "") : ""))
      .join("");
  return "";
}

export async function chatCompletion(
  key: string,
  opts: { model: string; system: string; user: string; maxTokens: number; json?: boolean; timeoutMs?: number },
): Promise<ChatResult> {
  const send = (withReasoningOff: boolean) =>
    fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: headers(key),
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens,
        temperature: 0.4,
        // Insight hanya merangkum angka yang sudah dihitung: tidak perlu "berpikir".
        // Token reasoning ikut memakan max_tokens sehingga JSON bisa kosong/terpotong.
        ...(withReasoningOff ? { reasoning: { enabled: false } } : {}),
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        usage: { include: true },
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000),
    });
  let res: Response;
  try {
    res = await send(true);
    // Sebagian model tidak bisa mematikan reasoning: ulangi sekali tanpa opsi itu.
    if (res.status === 400) {
      const body = await res.text();
      if (/reason/i.test(body)) res = await send(false);
      else throw new OpenRouterError(explainError(400, body), 400);
    }
  } catch (e) {
    if (e instanceof OpenRouterError) throw e;
    throw new OpenRouterError(explainError(0), 0);
  }
  if (!res.ok) throw new OpenRouterError(explainError(res.status, await res.text()), res.status);
  const json = await res.json();
  if (json.error) throw new OpenRouterError(explainError(Number(json.error.code) || 500, json.error.message), Number(json.error.code) || 500);
  const choice = json.choices?.[0];
  return {
    content: messageText(choice?.message?.content),
    model: json.model ?? opts.model,
    tokensIn: json.usage?.prompt_tokens ?? 0,
    tokensOut: json.usage?.completion_tokens ?? 0,
    cost: Number(json.usage?.cost ?? 0),
    finishReason: choice?.finish_reason ?? choice?.native_finish_reason ?? null,
  };
}

/** Mengambil objek JSON dari jawaban model (toleran terhadap ```json ... ```). */
export function extractJson(content: string, finishReason: string | null = null): unknown {
  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const truncated = finishReason === "length" || finishReason === "max_tokens";
  if (!cleaned) throw new Error(truncated ? "Jawaban AI kosong karena batas token habis (kemungkinan terpakai untuk reasoning). Naikkan max tokens atau ganti model." : "Jawaban AI kosong.");
  if (start < 0 || end < start)
    throw new Error(
      truncated
        ? `Jawaban AI terpotong sebelum JSON selesai (batas token tercapai). Naikkan max tokens. Awal jawaban: "${cleaned.slice(0, 80)}"`
        : `Jawaban AI bukan JSON. Awal jawaban: "${cleaned.slice(0, 80)}"`,
    );
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new Error(truncated ? "Jawaban AI terpotong (batas token tercapai) sehingga JSON rusak. Naikkan max tokens." : "Jawaban AI berformat JSON tetapi rusak.");
  }
}
