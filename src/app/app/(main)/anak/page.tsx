import { Icon } from "@/components/icons";
import { requireParent } from "@/lib/auth";
import { getActiveChild } from "@/lib/parent";
import { SCHOOL_LEVELS } from "@/lib/utils";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/ui";
import { PageTitle } from "@/components/blocks";
import { deleteChild, saveChild } from "../../actions";
import type { Child } from "@/lib/parent";

export const metadata = { title: "Profil Anak" };

function ChildForm({ child }: { child?: Child }) {
  const year = new Date().getFullYear();
  return (
    <ActionForm action={saveChild} resetOnSuccess={!child} className="space-y-3">
      {child && <input type="hidden" name="id" value={child.id} />}
      <div>
        <label className="label">Nama panggilan</label>
        <input name="nickname" required maxLength={40} defaultValue={child?.nickname} className="input" placeholder="Contoh: Dika" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Tahun lahir</label>
          <select name="birth_year" defaultValue={child?.birth_year ?? year - 8} className="input">
            {Array.from({ length: 18 }, (_, i) => year - i).map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Jenjang sekolah</label>
          <select name="school_level" defaultValue={child?.school_level ?? "sd_awal"} className="input">
            {Object.entries(SCHOOL_LEVELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">PIN mode anak (4 angka){child?.pin_hash && ", kosongkan jika tidak diubah"}</label>
        <input name="pin" inputMode="numeric" pattern="\d{4}" maxLength={4} className="input tracking-[0.5em]" placeholder="••••" autoComplete="off" />
      </div>
      <SubmitButton className="btn-green w-full">{child ? "Simpan" : "Tambah Anak"}</SubmitButton>
    </ActionForm>
  );
}

export default async function AnakPage({ searchParams }: { searchParams: Promise<{ baru?: string }> }) {
  const parent = await requireParent();
  const { children } = await getActiveChild(parent.familyId);
  const { baru } = await searchParams;
  return (
    <div className="space-y-4">
      <PageTitle title="Profil Anak" subtitle="Data anak disimpan minimal: tanpa NIK, alamat, atau foto." />
      {baru && <p className="rounded-xl bg-marun-50 p-3 font-semibold text-marun-700">Selamat datang! Tambahkan profil anak untuk mulai mencatat.</p>}
      {children.map((c) => (
        <details key={c.id} className="card">
          <summary className="flex cursor-pointer items-center justify-between font-extrabold">
            <span>
              <Icon name="child" className="h-5 w-5 align-[-3px] text-marun-600" /> {c.nickname} <span className="font-normal text-ink-soft">· {SCHOOL_LEVELS[c.school_level]} · lahir {c.birth_year}</span>
            </span>
            <span className="text-xs text-ink-soft">{c.pin_hash ? <span className="inline-flex items-center gap-1"><Icon name="lock" className="h-3.5 w-3.5" /> PIN aktif</span> : "PIN belum diatur"}</span>
          </summary>
          <div className="mt-4">
            <ChildForm child={c} />
            <form action={deleteChild} className="mt-3 text-right">
              <input type="hidden" name="id" value={c.id} />
              <ConfirmButton message={`Hapus ${c.nickname} beserta SEMUA catatannya? Tindakan ini tidak bisa dibatalkan.`}>Hapus profil anak</ConfirmButton>
            </form>
          </div>
        </details>
      ))}
      <div className="card">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold"><Icon name="plus" className="text-marun-600" /> Tambah anak</h2>
        <ChildForm />
      </div>
    </div>
  );
}
