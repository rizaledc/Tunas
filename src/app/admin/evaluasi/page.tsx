import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatTanggal } from "@/lib/date";
import { susGrade, type Question } from "@/lib/survey";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/ui";
import { PageTitle } from "@/components/blocks";
import { createSurvey, deleteSurvey, toggleSurvey } from "../actions";

export const metadata = { title: "Evaluasi" };

export default async function EvaluasiPage() {
  await requireAdmin();
  const db = createAdminClient();
  const [{ data: surveys }, { data: responses }, { count: parents }] = await Promise.all([
    db.from("surveys").select("*").order("created_at", { ascending: false }),
    db.from("survey_responses").select("survey_id,score,answers"),
    db.from("users").select("id", { count: "exact", head: true }).eq("role", "parent").eq("status", "active"),
  ]);
  const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null);

  return (
    <div className="space-y-4">
      <PageTitle title="Evaluasi Program" subtitle="Kuesioner SUS, penerimaan, dan manfaat untuk pre-test dan post-test." />
      <ActionForm action={createSurvey} className="card flex flex-wrap items-end gap-3">
        <label>
          <span className="label">Template</span>
          <select name="kind" className="input">
            <option value="sus">System Usability Scale (SUS)</option>
            <option value="penerimaan">Penerimaan aplikasi</option>
            <option value="manfaat">Manfaat program</option>
          </select>
        </label>
        <label>
          <span className="label">Periode</span>
          <select name="period" className="input">
            <option value="pre">Pre-test</option>
            <option value="post">Post-test</option>
          </select>
        </label>
        <SubmitButton className="btn-green">Buat Kuesioner</SubmitButton>
      </ActionForm>

      {surveys?.map((s) => {
        const rs = (responses ?? []).filter((r) => r.survey_id === s.id);
        const scores = rs.map((r) => Number(r.score)).filter((x) => !Number.isNaN(x));
        const mean = avg(scores);
        const qs = s.questions as Question[];
        return (
          <section key={s.id} className="card space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold">{s.name}</h2>
                <p className="text-sm text-ink-soft">
                  Dibuat {formatTanggal(s.created_at)} · {rs.length} dari {parents ?? 0} orang tua mengisi
                </p>
              </div>
              <div className="flex gap-2">
                <form action={toggleSurvey}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="open" value={s.is_open ? "0" : "1"} />
                  <button className={s.is_open ? "btn-danger btn-sm" : "btn-primary btn-sm"}>{s.is_open ? "Tutup periode" : "Buka periode"}</button>
                </form>
                <form action={deleteSurvey}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmButton message="Hapus kuesioner beserta seluruh jawaban?">Hapus</ConfirmButton>
                </form>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${s.is_open ? "bg-hijau-50 text-hijau-700" : "bg-gray-100"}`}>{s.is_open ? <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-hijau-500" /> Terbuka</span> : "Tertutup"}</span>
              {mean !== null && (
                <span className="rounded-full bg-kuning-300/25 px-3 py-1 text-sm font-bold text-hijau-700">
                  Skor rata-rata: {mean}
                  {s.kind === "sus" ? ` / 100 (${susGrade(mean)})` : " / 5"}
                </span>
              )}
            </div>
            {rs.length > 0 && (
              <details>
                <summary className="cursor-pointer text-sm font-bold">Rata-rata per butir</summary>
                <table className="tbl mt-2">
                  <tbody>
                    {qs.map((q) => {
                      const vals = rs.map((r) => Number((r.answers as Record<string, number>)[q.id])).filter(Boolean);
                      return (
                        <tr key={q.id}>
                          <td>{q.text}</td>
                          <td className="font-bold whitespace-nowrap">{avg(vals) ?? "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </details>
            )}
          </section>
        );
      })}
    </div>
  );
}
