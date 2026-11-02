import { notFound } from "next/navigation";
import { requireParent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Question } from "@/lib/survey";
import { ActionForm, SubmitButton } from "@/components/ui";
import { PageTitle } from "@/components/blocks";
import { submitSurvey } from "../../../actions";

export const metadata = { title: "Kuesioner Evaluasi" };

const SCALE = ["Sangat tidak setuju", "Tidak setuju", "Netral", "Setuju", "Sangat setuju"];

export default async function SurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const parent = await requireParent();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: s }, { data: done }] = await Promise.all([
    supabase.from("surveys").select("id,name,questions,is_open,period").eq("id", id).maybeSingle(),
    supabase.from("survey_responses").select("id").eq("survey_id", id).eq("user_id", parent.id).maybeSingle(),
  ]);
  if (!s) notFound();
  if (done) return <p className="card text-center">Anda sudah mengisi kuesioner ini. Terima kasih!</p>;
  if (!s.is_open) return <p className="card text-center">Kuesioner ini sudah ditutup.</p>;
  const qs = s.questions as Question[];
  return (
    <div>
      <PageTitle title={s.name} subtitle={`${s.period === "pre" ? "Pre-test" : "Post-test"} · ${qs.length} pertanyaan`} />
      <ActionForm action={submitSurvey} className="space-y-4">
        <input type="hidden" name="survey_id" value={s.id} />
        {qs.map((q, i) => (
          <fieldset key={q.id} className="card">
            <legend className="mb-3 px-1 font-bold">
              {i + 1}. {q.text}
            </legend>
            <div className="grid grid-cols-5 gap-1">
              {SCALE.map((label, k) => (
                <label key={k} className="chip flex-col justify-center rounded-xl px-1 py-2 text-center">
                  <input type="radio" name={q.id} value={k + 1} required className="sr-only" />
                  <span className="text-lg font-extrabold">{k + 1}</span>
                  <span className="text-[10px] leading-tight">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <SubmitButton className="btn-primary w-full text-lg">Kirim Jawaban</SubmitButton>
      </ActionForm>
    </div>
  );
}
