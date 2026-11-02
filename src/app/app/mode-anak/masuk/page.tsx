import { Icon } from "@/components/icons";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireParent } from "@/lib/auth";
import { getChildModeId } from "@/lib/child-mode";
import { getChildren } from "@/lib/parent";
import { EnterForm } from "../child-forms";

export const metadata = { title: "Masuk Mode Anak" };

export default async function MasukModeAnak() {
  const parent = await requireParent();
  if (await getChildModeId()) redirect("/app/mode-anak");
  const kids = await getChildren(parent.familyId);
  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-8">
      <div className="text-center">
        <Icon name="star" className="mx-auto h-14 w-14 text-oranye-500" />
        <h1 className="text-3xl font-extrabold text-tunas-900">Mode Anak</h1>
        <p className="mt-1 text-ink-soft">Anak bisa mencatat kegiatan positifnya sendiri dan mengumpulkan bintang. Anak tidak bisa melihat analitik atau insight.</p>
      </div>
      {kids.some((k) => k.pin_hash) ? (
        <EnterForm kids={kids.map((k) => ({ id: k.id, nickname: k.nickname, hasPin: Boolean(k.pin_hash) }))} />
      ) : (
        <p className="card text-center">
          Atur PIN 4 angka untuk anak dulu di{" "}
          <Link href="/app/anak" className="font-bold text-sky-brand">
            menu Anak
          </Link>
          .
        </p>
      )}
      <Link href="/app" className="flex items-center justify-center gap-1 font-bold text-ink-soft">
        <Icon name="arrow-left" className="h-4 w-4" /> Kembali
      </Link>
    </div>
  );
}
