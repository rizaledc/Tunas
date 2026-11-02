import { Icon } from "@/components/icons";
import { redirect } from "next/navigation";
import { requireParent } from "@/lib/auth";
import { getActiveChild, getAgreement } from "@/lib/parent";
import { formatMenit } from "@/lib/date";
import { PrintButton } from "@/components/ui";
import { getSetting } from "@/lib/settings";
import { LogoMark } from "@/components/logo";

export const metadata = { title: "Poster Kesepakatan" };

export default async function PosterPage() {
  const parent = await requireParent();
  const { child } = await getActiveChild(parent.familyId);
  if (!child) redirect("/app/anak");
  const [a, brand] = await Promise.all([getAgreement(child.id), getSetting("public.brand")]);
  if (!a) redirect("/app/kesepakatan");
  const rules = (a.notes ?? "").split("\n").map((r) => r.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  return (
    <div>
      <div className="no-print mb-4 flex justify-end">
        <PrintButton label="Cetak Poster" />
      </div>
      <div className="mx-auto aspect-[1/1.414] max-w-md rounded-3xl border-8 border-marun-500 bg-white p-6 text-center shadow-lg print:max-w-none print:border-[12px] print:shadow-none">
        <LogoMark src={brand.logo || undefined} className="mx-auto h-14 w-14" />
        <p className="mt-2 text-sm font-bold tracking-widest text-marun-700">KESEPAKATAN DIGITAL KELUARGA</p>
        <h1 className="mt-1 text-3xl font-extrabold text-aksen-600">Keluarga {child.nickname}</h1>
        <div className="mt-6 rounded-2xl bg-black/[0.045] p-4">
          <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-marun-600"><Icon name="device" className="h-4 w-4" /> Waktu layar maksimal</p>
          <p className="text-4xl font-extrabold">{formatMenit(a.target_screen_min)}</p>
          <p className="text-sm">per hari</p>
        </div>
        {a.no_device_hours && (
          <div className="mt-4 rounded-2xl bg-emas-300/25 p-4">
            <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-aksen-600"><Icon name="ban" className="h-4 w-4" /> Jam bebas gawai</p>
            <p className="text-xl font-extrabold">{a.no_device_hours}</p>
          </div>
        )}
        {rules.length > 0 && (
          <ul className="mt-4 space-y-2 text-left text-lg">
            {rules.map((r, i) => (
              <li key={i} className="flex gap-2">
                <Icon name="star-solid" className="mt-1 h-5 w-5 text-aksen-500" />
                {r}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
          <div className="border-t-2 border-dashed pt-2">Tanda tangan anak</div>
          <div className="border-t-2 border-dashed pt-2">Tanda tangan orang tua</div>
        </div>
        <p className="mt-6 text-xs text-ink-soft">SAHABAT ANAK · {brand.tagline}</p>
      </div>
    </div>
  );
}
