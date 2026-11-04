import { Icon, type IconName } from "@/components/icons";
import Link from "next/link";
import { requireParent } from "@/lib/auth";
import { getActiveChild } from "@/lib/parent";
import { createClient } from "@/lib/supabase/server";
import { formatTanggal } from "@/lib/date";
import { aiCoins } from "@/lib/insight";
import type { Indicators, InsightOutput } from "@/lib/indicators";
import { ActionForm, SubmitButton } from "@/components/ui";
import { PageTitle } from "@/components/blocks";
import { rateInsight, runInsight, saveReflection } from "../../actions";
import { NoChild } from "../no-child";

export const metadata = { title: "Insight" };

function Section({ icon, title, items, tone }: { icon: IconName; title: string; items: string[]; tone: string }) {
  if (!items.length) return null;
  return (
    <div className={`card border-l-4 ${tone}`}>
      <p className="flex items-center gap-2 font-extrabold">
        <Icon name={icon} /> {title}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function InsightPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const parent = await requireParent();
  const { child } = await getActiveChild(parent.familyId);
  if (!child) return <NoChild />;
  const { id } = await searchParams;
  const supabase = await createClient();
  const [{ data: history }, coins, { data: reflections }] = await Promise.all([
    supabase.from("ai_insights").select("id,output,created_at,model,rating,input_summary,period_start,period_end").eq("child_id", child.id).order("created_at", { ascending: false }).limit(20),
    aiCoins(parent.familyId),
    supabase.from("reflections").select("id,insight_id,action_text,outcome,created_at").eq("child_id", child.id).order("created_at", { ascending: false }).limit(10),
  ]);
  const current = (id ? history?.find((h) => h.id === id) : history?.[0]) ?? null;
  const out = current?.output as InsightOutput | undefined;
  const ind = current?.input_summary as Indicators | undefined;
  const left = coins.remaining;
  const reflected = reflections?.find((r) => r.insight_id === current?.id);

  return (
    <div className="space-y-4">
      <PageTitle title="Insight Mingguan" subtitle={`${child.nickname} · 7 hari terakhir`} />
      <ActionForm action={runInsight} className="card space-y-2 bg-gradient-to-br from-marun-50 to-marun-50">
        <input type="hidden" name="child_id" value={child.id} />
        <p className="text-ink-soft">Sistem menghitung angka dari catatan Anda, lalu AI menuliskannya menjadi saran. Nama anak tidak dikirim ke AI.</p>
        <div className="flex items-center gap-3 rounded-2xl border border-emas-400/40 bg-paper p-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emas-300/40 text-[#8a5a0b]">
            <Icon name="coin" className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-ink">
              Koin AI: {left} dari {coins.total}
            </p>
            <p className="text-xs text-ink-soft">
              {left > 0 ? "1 analisis memakai 1 koin. Koin yang tidak dipakai hangus." : "Koin hari ini sudah terpakai."} Koin baru setiap hari pukul 07.00 WIB.
            </p>
          </div>
          <span className="flex gap-1" aria-hidden>
            {Array.from({ length: coins.total }).map((_, i) => (
              <span key={i} className={`h-3 w-3 rounded-full ${i < left ? "bg-emas-500" : "bg-gray-200"}`} />
            ))}
          </span>
        </div>
        <SubmitButton pendingText="Menganalisis…" disabled={left === 0} className="btn-primary w-full text-lg">
          <Icon name="sparkle" /> {left > 0 ? "Analisis Sekarang (1 koin)" : "Kembali besok pukul 07.00"}
        </SubmitButton>
      </ActionForm>

      {out && current ? (
        <>
          <div className="card">
            <p className="text-xs font-semibold text-ink-soft">
              Periode {formatTanggal(current.period_start, { day: "numeric", month: "short" })} – {formatTanggal(current.period_end, { day: "numeric", month: "short" })}
              {current.model === "rule-based" && " · ringkasan otomatis"}
            </p>
            <p className="mt-1 flex items-center gap-2 text-lg font-extrabold"><Icon name="note" className="text-marun-600" /> Ringkasan minggu ini</p>
            <p className="mt-1">{out.ringkasan}</p>
          </div>
          <Section icon="star" title="Yang sudah baik" items={out.sudah_baik} tone="border-l-marun-500" />
          <Section icon="eye" title="Perlu diperhatikan" items={out.perlu_diperhatikan} tone="border-l-emas-400" />
          <Section icon="bulb" title="Saran untuk dicoba" items={out.saran} tone="border-l-gelap-800" />
          <div className="card border-l-4 border-l-emas-400">
            <p className="flex items-center gap-2 font-extrabold"><Icon name="chat" className="text-emas-500" /> Ide obrolan dengan anak</p>
            <p className="mt-1 text-lg italic">{out.ide_obrolan}</p>
          </div>
          <p className="text-center text-xs text-ink-soft">Saran ini bukan diagnosis. Keputusan pendampingan tetap di tangan Ayah dan Bunda.</p>

          <form action={rateInsight} className="card flex items-center justify-between gap-2">
            <input type="hidden" name="id" value={current.id} />
            <span className="font-bold">Apakah insight ini membantu?</span>
            <span className="flex gap-2">
              <button name="rating" value="1" className={`btn-sm btn ${current.rating === 1 ? "bg-marun-600 text-white" : "bg-gray-100"}`} aria-label="Membantu">
                <Icon name="thumbsUp" />
              </button>
              <button name="rating" value="-1" className={`btn-sm btn ${current.rating === -1 ? "bg-merah-500 text-white" : "bg-gray-100"}`} aria-label="Tidak membantu">
                <Icon name="thumbsDown" />
              </button>
            </span>
          </form>

          {reflected ? (
            <div className="card bg-marun-50">
              <p className="flex items-center gap-2 font-extrabold"><Icon name="check-circle" className="text-marun-600" /> Tindak lanjut Anda</p>
              <p>{reflected.action_text}</p>
              {reflected.outcome && <p className="mt-1 text-sm text-ink-soft">Hasil: {reflected.outcome}</p>}
            </div>
          ) : (
            <ActionForm action={saveReflection} className="card space-y-3">
              <input type="hidden" name="child_id" value={child.id} />
              <input type="hidden" name="insight_id" value={current.id} />
              <p className="flex items-center gap-2 font-extrabold"><Icon name="refresh" className="text-marun-600" /> Refleksi: apa yang akan dicoba minggu ini?</p>
              <div className="grid gap-2">
                {[...out.saran, "Mengobrol dengan anak memakai ide obrolan di atas"].map((s) => (
                  <label key={s} className="chip justify-start rounded-xl py-3 text-left">
                    <input type="radio" name="action_choice" value={s} className="sr-only" />
                    {s}
                  </label>
                ))}
              </div>
              <textarea name="action_custom" rows={2} maxLength={300} className="input" placeholder="Atau tulis rencana sendiri…" />
              <SubmitButton className="btn-green w-full">Simpan Tindak Lanjut</SubmitButton>
            </ActionForm>
          )}

          {ind && (
            <details className="card">
              <summary className="cursor-pointer font-bold">Angka yang dipakai untuk analisis</summary>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <dt className="text-ink-soft">Hari tercatat</dt>
                <dd className="font-bold">{ind.hari_tercatat} / 7</dd>
                <dt className="text-ink-soft">Rata-rata screen time</dt>
                <dd className="font-bold">
                  {ind.rata_screen_min_per_hari} mnt (target {ind.target_screen_min})
                </dd>
                <dt className="text-ink-soft">Rasio digital : positif</dt>
                <dd className="font-bold">{ind.rasio_digital_positif}</dd>
                <dt className="text-ink-soft">Didampingi</dt>
                <dd className="font-bold">{ind.persen_didampingi}%</dd>
                <dt className="text-ink-soft">Gawai menjelang tidur</dt>
                <dd className="font-bold">{ind.hari_gawai_menjelang_tidur} hari</dd>
                <dt className="text-ink-soft">Patuh kesepakatan</dt>
                <dd className="font-bold">{ind.hari_patuh_kesepakatan} / 7 hari</dd>
                <dt className="text-ink-soft">Variasi aktivitas positif</dt>
                <dd className="font-bold">{ind.variasi_aktivitas_positif} jenis</dd>
              </dl>
            </details>
          )}
        </>
      ) : (
        <p className="card text-center text-ink-soft">Belum ada insight. Catat aktivitas beberapa hari, lalu tekan “Analisis Sekarang”.</p>
      )}

      {history && history.length > 1 && (
        <section>
          <h2 className="mb-2 font-extrabold">Riwayat insight</h2>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id}>
                <Link href={`/app/insight?id=${h.id}`} className={`card block p-3 ${h.id === current?.id ? "ring-2 ring-marun-500" : ""}`}>
                  <span className="text-xs text-ink-soft">{formatTanggal(h.created_at, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="line-clamp-2 block text-sm">{(h.output as InsightOutput).ringkasan}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
