import { redirect } from "next/navigation";
import { requireParent } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { ActionForm, SubmitButton } from "@/components/ui";
import { Logo } from "@/components/logo";
import { acceptConsent } from "../actions";

export const metadata = { title: "Persetujuan Data" };

export default async function PersetujuanPage() {
  const parent = await requireParent();
  const consent = await getSetting("public.consent");
  if (parent.consentVersion === consent.version) redirect("/app");
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Logo brand={await getSetting("public.brand")} />
      <div className="card mt-6 space-y-4 p-6">
        <h1 className="text-2xl font-extrabold text-daun-900">Persetujuan Data</h1>
        <p className="text-ink-soft">
          {parent.consentVersion ? "Teks persetujuan data telah diperbarui." : "Sebelum mulai, mohon baca dan setujui pemakaian data berikut."} (versi {consent.version})
        </p>
        <p className="rounded-xl bg-gray-50 p-3 text-sm whitespace-pre-line">{consent.text}</p>
        <ActionForm action={acceptConsent}>
          <input type="hidden" name="version" value={consent.version} />
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 accent-daun-600" />
            <span>Saya sudah membaca dan menyetujui.</span>
          </label>
          <SubmitButton>Setuju dan lanjutkan</SubmitButton>
        </ActionForm>
        <form action="/keluar" method="post">
          <button className="btn-ghost w-full text-sm">Tidak setuju — keluar</button>
        </form>
      </div>
    </div>
  );
}
