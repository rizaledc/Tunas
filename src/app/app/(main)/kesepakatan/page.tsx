import { Icon } from "@/components/icons";
import Link from "next/link";
import { requireParent } from "@/lib/auth";
import { getActiveChild, getAgreement } from "@/lib/parent";
import { getSetting, referenceForAge } from "@/lib/settings";
import { formatTanggal, todayStr } from "@/lib/date";
import { ActionForm, SubmitButton } from "@/components/ui";
import { PageTitle } from "@/components/blocks";
import { saveAgreement } from "../../actions";
import { NoChild } from "../no-child";

export const metadata = { title: "Kesepakatan Keluarga" };

export default async function KesepakatanPage() {
  const parent = await requireParent();
  const { child } = await getActiveChild(parent.familyId);
  if (!child) return <NoChild />;
  const [agreement, refs] = await Promise.all([getAgreement(child.id), getSetting("screen_time.reference")]);
  const age = Number(todayStr().slice(0, 4)) - child.birth_year;
  const ref = referenceForAge(refs, age);

  return (
    <div>
      <PageTitle
        title="Kesepakatan Keluarga"
        subtitle={`Disusun bersama ${child.nickname}`}
        action={
          agreement && (
            <Link href="/app/kesepakatan/poster" className="btn-outline btn-sm">
              <Icon name="printer" className="h-4 w-4" /> Poster
            </Link>
          )
        }
      />
      {ref && (
        <div className="card mb-4 bg-ink/[0.045] text-sm">
          <p className="font-bold text-marun-600">Acuan untuk usia {age} tahun</p>
          <p>
            Maksimal {ref.max_min} menit/hari. {ref.note}
          </p>
        </div>
      )}
      <ActionForm action={saveAgreement} className="card space-y-4">
        <input type="hidden" name="child_id" value={child.id} />
        <div>
          <label className="label" htmlFor="target_screen_min">
            Target screen time harian (menit)
          </label>
          <input id="target_screen_min" name="target_screen_min" type="number" min={0} max={1440} step={5} required defaultValue={agreement?.target_screen_min ?? ref?.max_min ?? 120} className="input text-xl font-bold" />
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {[30, 60, 90, 120].map((m) => (
              <span key={m} className="rounded-full bg-gray-100 px-3 py-1">
                {m} mnt = {m >= 60 ? `${m / 60} jam` : "½ jam"}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="no_device_hours">
            Jam bebas gawai
          </label>
          <input id="no_device_hours" name="no_device_hours" defaultValue={agreement?.no_device_hours ?? ""} className="input" placeholder="Contoh: Maghrib–Isya, dan setelah 20.30" maxLength={200} />
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Aturan lain
          </label>
          <textarea id="notes" name="notes" rows={4} defaultValue={agreement?.notes ?? ""} className="input" placeholder={"Contoh:\n- Main HP setelah PR selesai\n- HP disimpan di ruang tamu saat tidur"} maxLength={1000} />
        </div>
        <SubmitButton className="btn-green w-full">Simpan Kesepakatan</SubmitButton>
        {agreement && <p className="text-center text-xs text-ink-soft">Terakhir diubah {formatTanggal(agreement.updated_at)}</p>}
      </ActionForm>
    </div>
  );
}
