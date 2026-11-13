import { Icon } from "@/components/icons";
import Link from "next/link";
import { requireParent } from "@/lib/auth";
import { getActiveChild, getAgreement } from "@/lib/parent";
import { createClient } from "@/lib/supabase/server";
import { addDays, formatHari, formatMenit, formatTanggal, isoDaysAgo, todayStr } from "@/lib/date";
import { balancePercent, type InsightOutput } from "@/lib/indicators";
import { Progress } from "@/components/blocks";
import { saveReflectionOutcome } from "../actions";
import { NoChild } from "./no-child";

export const metadata = { title: "Beranda" };

export default async function BerandaPage({ searchParams }: { searchParams: Promise<{ terimakasih?: string }> }) {
  const parent = await requireParent();
  const { child } = await getActiveChild(parent.familyId);
  const { terimakasih } = await searchParams;
  if (!child) return <NoChild />;

  const today = todayStr();
  const supabase = await createClient();
  const [agreement, { data: logs }, { data: checkin }, { data: insight }, { data: event }, { data: pending }, { data: surveys }, { data: answered }] = await Promise.all([
    getAgreement(child.id),
    supabase.from("activity_logs").select("type,duration_min").eq("child_id", child.id).eq("log_date", today),
    supabase.from("daily_checkins").select("id").eq("child_id", child.id).eq("date", today).maybeSingle(),
    supabase.from("ai_insights").select("id,output,created_at").eq("child_id", child.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("events").select("title,slug,date,location").eq("published", true).gte("date", new Date().toISOString()).order("date").limit(1).maybeSingle(),
    supabase.from("reflections").select("id,action_text,created_at").eq("child_id", child.id).is("outcome", null).lte("created_at", isoDaysAgo(5)).order("created_at").limit(1).maybeSingle(),
    supabase.from("surveys").select("id,name").eq("is_open", true),
    supabase.from("survey_responses").select("survey_id").eq("user_id", parent.id),
  ]);

  const digital = (logs ?? []).filter((l) => l.type === "digital").reduce((a, l) => a + l.duration_min, 0);
  const positif = (logs ?? []).filter((l) => l.type === "positif").reduce((a, l) => a + l.duration_min, 0);
  const target = agreement?.target_screen_min ?? 120;
  const balance = balancePercent(digital, positif);
  const openSurvey = (surveys ?? []).find((s) => !(answered ?? []).some((a) => a.survey_id === s.id));
  const out = insight?.output as InsightOutput | undefined;

  return (
    <div className="space-y-4">
      {terimakasih && <p className="rounded-xl bg-hijau-50 p-3 font-semibold text-hijau-700">Terima kasih sudah mengisi kuesioner!</p>}
      <div>
        <p className="text-ink-soft">{formatHari(today)}</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Ringkasan {child.nickname} hari ini</h1>
      </div>

      {openSurvey && (
        <Link href={`/app/evaluasi/${openSurvey.id}`} className="card flex items-center gap-3 border-2 border-ink/80 bg-ink/[0.045]">
          <Icon name="clipboard-check" className="h-9 w-9 text-hijau-600" />
          <span>
            <span className="block font-extrabold">Isi kuesioner: {openSurvey.name}</span>
            <span className="text-sm text-ink-soft">Bantu tim memperbaiki aplikasi (± 3 menit).</span>
          </span>
        </Link>
      )}

      {(logs ?? []).length === 0 && (
        <div className="card flex items-center gap-3 border-2 border-kuning-500 bg-kuning-300/25">
          <Icon name="alarm" className="h-9 w-9 text-hijau-700" />
          <div className="flex-1">
            <p className="font-extrabold">Belum ada catatan hari ini</p>
            <p className="text-sm text-ink-soft">Cukup 1 menit untuk mencatat.</p>
          </div>
          <Link href="/app/catat" className="btn-primary btn-sm">
            Catat
          </Link>
        </div>
      )}

      <div className="card">
        <div className="flex items-baseline justify-between">
          <p className="flex items-center gap-1.5 font-bold text-hijau-600"><Icon name="device" /> Screen time</p>
          <p className="text-sm text-ink-soft">target {formatMenit(target)}</p>
        </div>
        <p className="mt-1 text-3xl font-extrabold">
          {digital} <span className="text-lg text-ink-soft">/ {target} menit</span>
        </p>
        <div className="mt-2">
          <Progress value={digital} max={target} tone={digital > target ? "red" : digital > target * 0.8 ? "orange" : "green"} />
        </div>
        {digital > target && <p className="mt-2 text-sm font-semibold text-merah-600">Sudah melewati target hari ini.</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="flex items-center gap-1.5 text-sm font-bold text-hijau-700"><Icon name="leaf" className="h-4 w-4" /> Aktivitas positif</p>
          <p className="mt-1 text-2xl font-extrabold">{formatMenit(positif)}</p>
        </div>
        <div className="card">
          <p className="flex items-center gap-1.5 text-sm font-bold text-hijau-700"><Icon name="scale" className="h-4 w-4" /> Keseimbangan</p>
          <p className="mt-1 text-2xl font-extrabold">{digital + positif ? `${balance}%` : "–"}</p>
          <p className="text-xs text-ink-soft">porsi aktivitas positif</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Link href="/app/catat?tab=digital" className="card flex flex-col items-center gap-1 p-3 text-center text-sm font-bold">
          <Icon name="device" className="h-7 w-7 text-hijau-600" />Catat gawai
        </Link>
        <Link href="/app/catat?tab=positif" className="card flex flex-col items-center gap-1 p-3 text-center text-sm font-bold">
          <Icon name="palette" className="h-7 w-7 text-hijau-600" />Catat positif
        </Link>
        <Link href="/app/checkin" className={`card flex flex-col items-center gap-1 p-3 text-center text-sm font-bold ${checkin ? "opacity-60" : "ring-2 ring-hijau-500"}`}>
          <Icon name={checkin ? "check-circle" : "face-smile"} className="h-7 w-7 text-hijau-700" />Check-in
        </Link>
      </div>

      {pending && (
        <div className="card border-2 border-hijau-200">
          <p className="font-extrabold">Bagaimana tindak lanjut minggu lalu?</p>
          <p className="mt-1 text-ink-soft">“{pending.action_text}”</p>
          <form action={saveReflectionOutcome} className="mt-3 flex flex-wrap gap-2">
            <input type="hidden" name="id" value={pending.id} />
            <button name="outcome" value="berhasil" className="btn-green btn-sm">
              <Icon name="thumbsUp" className="h-4 w-4" /> Berhasil
            </button>
            <button name="outcome" value="sebagian" className="btn-outline btn-sm">
              <Icon name="face-smile" className="h-4 w-4" /> Sebagian
            </button>
            <button name="outcome" value="belum" className="btn-ghost btn-sm ring-1 ring-gray-200">
              Belum
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 font-extrabold"><Icon name="sparkle" className="text-hijau-700" /> Insight terbaru</p>
          <Link href="/app/insight" className="inline-flex items-center gap-1 text-sm font-bold text-hijau-600">
            Lihat <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
        {out ? (
          <>
            <p className="mt-2 text-ink-soft">{out.ringkasan}</p>
            <p className="mt-1 text-xs text-ink-soft">{formatTanggal(insight!.created_at)}</p>
          </>
        ) : (
          <p className="mt-2 text-ink-soft">Belum ada insight. Setelah beberapa hari mencatat, tekan “Analisis Sekarang”.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/app/kesepakatan" className="card text-sm font-bold">
          <Icon name="agreement" className="mb-1 block h-6 w-6 text-hijau-600" />
          Kesepakatan keluarga
          <span className="block font-normal text-ink-soft">{agreement ? `Target ${formatMenit(agreement.target_screen_min)}/hari` : "Belum dibuat"}</span>
        </Link>
        <Link href="/app/mode-anak/masuk" className="card text-sm font-bold">
          <Icon name="star" className="mb-1 block h-6 w-6 text-hijau-700" />
          Mode anak
          <span className="block font-normal text-ink-soft">Anak mencatat sendiri</span>
        </Link>
      </div>

      {event && (
        <Link href="/app/kegiatan" className="card flex gap-3">
          <span className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-hijau-700 py-2 text-white">
            <span className="text-xl leading-none font-extrabold">{formatTanggal(event.date, { day: "numeric" })}</span>
            <span className="text-xs">{formatTanggal(event.date, { month: "short" })}</span>
          </span>
          <span>
            <span className="block text-xs font-bold text-hijau-700">AGENDA TERDEKAT</span>
            <span className="block font-extrabold">{event.title}</span>
            <span className="text-sm text-ink-soft">{event.location}</span>
          </span>
        </Link>
      )}
      <p className="text-center text-xs text-ink-soft">Data 7 hari terakhir: {formatTanggal(addDays(today, -6), { day: "numeric", month: "short" })} – {formatTanggal(today, { day: "numeric", month: "short" })}</p>
    </div>
  );
}
