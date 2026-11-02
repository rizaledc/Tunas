import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { openRouterBalance } from "@/lib/insight";
import { getSettings } from "@/lib/settings";
import { addDays, dateRange, formatTanggal, toDateStr, todayStr } from "@/lib/date";
import type { InsightOutput } from "@/lib/indicators";
import { PageTitle, Stat } from "@/components/blocks";
import { TrendChart } from "@/components/charts";

export const metadata = { title: "Monitoring AI" };

export default async function MonitoringAiPage() {
  await requireAdmin("superadmin");
  const db = createAdminClient();
  const since = addDays(todayStr(), -29);
  const [{ data: rows }, balance, cfg] = await Promise.all([
    db.from("ai_insights").select("created_at,model,tokens_in,tokens_out,cost_usd,rating,output").gte("created_at", `${since}T00:00:00+07:00`).order("created_at", { ascending: false }),
    openRouterBalance(),
    getSettings(["ai.model", "ai.max_per_day", "ai.max_tokens", "ai.enabled"]),
  ]);
  const list = rows ?? [];
  const perDay = dateRange(since, todayStr()).map((d) => {
    const r = list.filter((x) => toDateStr(new Date(x.created_at)) === d);
    return { label: `${Number(d.slice(8))}/${Number(d.slice(5, 7))}`, analisis: r.length, cadangan: r.filter((x) => x.model === "rule-based").length };
  });
  const tokensIn = list.reduce((a, r) => a + r.tokens_in, 0);
  const tokensOut = list.reduce((a, r) => a + r.tokens_out, 0);
  const cost = list.reduce((a, r) => a + Number(r.cost_usd), 0);
  const up = list.filter((r) => r.rating === 1).length;
  const down = list.filter((r) => r.rating === -1).length;
  const fallback = list.filter((r) => r.model === "rule-based").length;
  const samples = list.filter((r) => r.model !== "rule-based").slice(0, 5);

  return (
    <div className="space-y-4">
      <PageTitle title="Monitoring AI" subtitle={`Model: ${cfg["ai.model"]} · maks ${cfg["ai.max_per_day"]}/anak/hari · max_tokens ${cfg["ai.max_tokens"]}${cfg["ai.enabled"] ? "" : " · ⚠️ AI dinonaktifkan"}`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon="✨" label="Analisis 30 hari" value={list.length} hint={`${fallback} memakai cadangan rule-based`} />
        <Stat icon="🔢" label="Token terpakai" value={(tokensIn + tokensOut).toLocaleString("id-ID")} hint={`in ${tokensIn.toLocaleString("id-ID")} · out ${tokensOut.toLocaleString("id-ID")}`} tone="blue" />
        <Stat icon="💵" label="Biaya 30 hari" value={`$${cost.toFixed(4)}`} hint={list.length ? `≈ $${(cost / Math.max(1, list.length - fallback)).toFixed(5)}/analisis` : undefined} tone="orange" />
        <Stat
          icon="🏦"
          label="Saldo / limit API key"
          value={balance ? (balance.remaining !== null ? `$${balance.remaining.toFixed(2)}` : "tanpa limit") : "—"}
          hint={balance ? `terpakai total $${balance.usage.toFixed(2)}${balance.limit !== null ? ` dari $${balance.limit}` : ""}` : "OPENROUTER_API_KEY belum diatur"}
          tone={balance?.remaining !== null && balance && balance.remaining < 2 ? "red" : "green"}
        />
        <Stat icon="👍" label="Membantu" value={up} tone="green" />
        <Stat icon="👎" label="Tidak membantu" value={down} tone="red" hint={up + down ? `${Math.round((up / (up + down)) * 100)}% positif` : "belum ada rating"} />
      </div>
      <section className="card">
        <h2 className="font-extrabold">Analisis per hari</h2>
        <TrendChart data={perDay} lines={[{ key: "analisis", name: "Analisis", color: "#23824a" }, { key: "cadangan", name: "Cadangan rule-based", color: "#c8102e" }]} />
      </section>
      <section className="space-y-3">
        <h2 className="font-extrabold">Contoh output anonim (cek kualitas)</h2>
        {samples.length === 0 && <p className="card text-ink-soft">Belum ada output AI.</p>}
        {samples.map((s, i) => {
          const o = s.output as InsightOutput;
          return (
            <div key={i} className="card text-sm">
              <p className="text-xs text-ink-soft">
                {formatTanggal(s.created_at)} · {s.model} · {s.tokens_out} token keluar {s.rating === 1 ? "· 👍" : s.rating === -1 ? "· 👎" : ""}
              </p>
              <p className="mt-1 font-bold">{o.ringkasan}</p>
              <p className="mt-1">
                <strong>Baik:</strong> {o.sudah_baik.join(" · ")}
              </p>
              <p>
                <strong>Perhatikan:</strong> {o.perlu_diperhatikan.join(" · ")}
              </p>
              <p>
                <strong>Saran:</strong> {o.saran.join(" · ")}
              </p>
              <p>
                <strong>Obrolan:</strong> {o.ide_obrolan}
              </p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
