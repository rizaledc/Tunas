"use client";
import { ActionForm, SubmitButton } from "@/components/ui";
import { Icon } from "@/components/icons";
import { testOpenRouter, type AiTestResult } from "@/app/admin/actions";

export function AiTestForm({ model }: { model: string }) {
  return (
    <ActionForm action={testOpenRouter} className="space-y-3">
      {(state) => {
        const r = state?.data as AiTestResult | undefined;
        return (
          <>
            <input type="hidden" name="model" value={model} />
            <SubmitButton className="btn-outline" pendingText="Menguji… (bisa sampai 30 detik)">
              <Icon name="sparkle" /> Uji koneksi & contoh insight
            </SubmitButton>
            {r?.steps && (
              <ul className="space-y-2">
                {r.steps.map((s) => (
                  <li key={s.label} className={`flex gap-2 rounded-xl p-3 text-sm ${s.ok ? "bg-marun-50" : "bg-red-50"}`}>
                    <Icon name={s.ok ? "check-circle" : "warning"} className={s.ok ? "text-marun-600" : "text-merah-600"} />
                    <span>
                      <strong>{s.label}:</strong> {s.detail}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {r?.sample && (
              <div className="space-y-2 rounded-xl border border-marun-200 p-4 text-sm">
                <p className="text-xs text-ink-soft">
                  Contoh output dari data anonim · {r.sample.model} · {r.sample.tokensIn}+{r.sample.tokensOut} token · ${r.sample.cost.toFixed(5)}
                </p>
                <p className="font-bold">{r.sample.output.ringkasan}</p>
                <p>
                  <strong>Sudah baik:</strong> {r.sample.output.sudah_baik.join(" · ")}
                </p>
                <p>
                  <strong>Perlu diperhatikan:</strong> {r.sample.output.perlu_diperhatikan.join(" · ")}
                </p>
                <p>
                  <strong>Saran:</strong> {r.sample.output.saran.join(" · ")}
                </p>
                <p>
                  <strong>Ide obrolan:</strong> {r.sample.output.ide_obrolan}
                </p>
              </div>
            )}
          </>
        );
      }}
    </ActionForm>
  );
}
