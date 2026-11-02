"use client";
import { ActionForm, SubmitButton } from "@/components/ui";
import { useState } from "react";
import { createMember, importLogbookFile, importMembers, resetPassword, updateMember } from "@/app/admin/actions";
import { EmailField, NewPasswordField, PhoneField } from "@/components/fields";
import { Icon } from "@/components/icons";

type Row = Record<string, string | number | undefined>;

function ResultTable({ rows }: { rows: Row[] }) {
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);
  return (
    <div className="max-h-80 overflow-auto rounded-xl ring-1 ring-gray-200">
      <table className="tbl">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map((c) => (
                <td key={c} className="font-mono text-xs">
                  {String(r[c] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ImportMembersForm() {
  return (
    <ActionForm action={importMembers} className="space-y-3">
      {(state) => (
        <>
          <input type="file" name="file" accept=".xlsx" required className="input" />
          <SubmitButton className="btn-green" pendingText="Mengimpor…">
            Impor Anggota
          </SubmitButton>
          {state?.data?.results ? (
            <>
              <p className="text-sm font-semibold text-merah-600">Simpan daftar password sementara ini sekarang — tidak akan ditampilkan lagi.</p>
              <ResultTable rows={state.data.results as Row[]} />
            </>
          ) : null}
        </>
      )}
    </ActionForm>
  );
}

export function LogbookFileForm() {
  return (
    <ActionForm action={importLogbookFile} className="space-y-3">
      {(state) => (
        <>
          <input type="file" name="file" accept=".xlsx" required className="input" />
          <SubmitButton className="btn-green" pendingText="Mengimpor…">
            Impor Logbook
          </SubmitButton>
          {state?.data?.results ? <ResultTable rows={state.data.results as Row[]} /> : null}
        </>
      )}
    </ActionForm>
  );
}

export function ResetPasswordForm({ id }: { id: string }) {
  return (
    <ActionForm action={resetPassword} className="space-y-1" confirm="Buat password sementara baru untuk akun ini?">
      <input type="hidden" name="id" value={id} />
      <SubmitButton className="btn-ghost btn-sm text-sky-brand" pendingText="…">
        Reset password
      </SubmitButton>
    </ActionForm>
  );
}

function Copy({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost btn-sm ring-1 ring-gray-200"
      onClick={async () => {
        await navigator.clipboard.writeText(text).catch(() => {});
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
    >
      <Icon name={ok ? "check" : "copy"} className="h-4 w-4" /> {ok ? "Tersalin" : "Salin"}
    </button>
  );
}

export function CreateMemberForm() {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  return (
    <ActionForm action={createMember} resetOnSuccess className="space-y-3">
      {(state) => {
        const d = state?.ok ? (state.data as { nama: string; login: string; password: string; phone: string; manual: boolean }) : null;
        const msg = d ? `Halo ${d.nama}, akun SAHABAT ANAK Anda sudah dibuat.\n\nMasuk di: ${typeof window !== "undefined" ? window.location.origin : ""}/login\nNomor HP/email: ${d.login}\nPassword sementara: ${d.password}\n\nSetelah masuk, segera ganti password di menu Profil.` : "";
        return (
          <>
            <div>
              <label className="label" htmlFor="m-nama">
                Nama orang tua
              </label>
              <input id="m-nama" name="nama" required minLength={2} maxLength={80} className="input" placeholder="Contoh: Siti Aminah" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <PhoneField id="m-hp" required={false} hint="Hanya angka. Isi nomor HP dan/atau email." />
              <EmailField id="m-email" required={false} hint="Opsional, untuk pemulihan password." />
            </div>
            <div>
              <label className="label" htmlFor="m-rt">
                RT <span className="font-normal text-ink-soft">(opsional)</span>
              </label>
              <input id="m-rt" name="rt" inputMode="numeric" maxLength={3} pattern="\d{1,3}" className="input w-28" />
            </div>
            <fieldset className="space-y-2">
              <legend className="label">Password</legend>
              <div className="flex flex-wrap gap-2">
                <label className="chip">
                  <input type="radio" name="pw_mode" value="auto" checked={mode === "auto"} onChange={() => setMode("auto")} className="sr-only" /> Buatkan otomatis (disarankan)
                </label>
                <label className="chip">
                  <input type="radio" name="pw_mode" value="manual" checked={mode === "manual"} onChange={() => setMode("manual")} className="sr-only" /> Tentukan sendiri
                </label>
              </div>
              {mode === "manual" && <NewPasswordField label="Password untuk orang tua" />}
            </fieldset>
            <SubmitButton className="btn-green" pendingText="Membuat akun…">
              <Icon name="plus" /> Buat Akun
            </SubmitButton>
            {d && (
              <div className="space-y-2 rounded-xl border border-daun-200 bg-daun-50 p-4 text-sm">
                <p className="font-extrabold text-daun-700">Sampaikan data masuk ini kepada {d.nama}:</p>
                <p className="flex flex-wrap items-center gap-2">
                  Nomor HP/email: <code className="rounded bg-white px-2 py-1 font-bold">{d.login}</code> <Copy text={d.login} />
                </p>
                <p className="flex flex-wrap items-center gap-2">
                  Password{d.manual ? "" : " sementara"}: <code className="rounded bg-white px-2 py-1 font-bold">{d.password}</code> <Copy text={d.password} />
                </p>
                <p className="text-xs text-ink-soft">Password tidak ditampilkan lagi setelah halaman ini ditutup. Orang tua akan diminta menyetujui persetujuan data saat pertama masuk.</p>
                <div className="flex flex-wrap gap-2">
                  {d.phone && (
                    <a className="btn-sm btn bg-[#25D366] text-white" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${d.phone}?text=${encodeURIComponent(msg)}`}>
                      <Icon name="chat" className="h-4 w-4" /> Kirim lewat WhatsApp
                    </a>
                  )}
                  <Copy text={msg} />
                </div>
              </div>
            )}
          </>
        );
      }}
    </ActionForm>
  );
}

export function EditMemberForm({ m }: { m: { id: string; nama: string; no_hp: string | null; email: string | null; rt: string | null } }) {
  return (
    <details className="text-left">
      <summary className="btn-ghost btn-sm cursor-pointer list-none text-sky-brand">Ubah data</summary>
      <ActionForm action={updateMember} className="mt-2 w-72 space-y-2 rounded-xl bg-gray-50 p-3">
        <input type="hidden" name="id" value={m.id} />
        <input name="nama" defaultValue={m.nama} required minLength={2} className="input py-2" aria-label="Nama" />
        <PhoneField id={`hp-${m.id}`} required={false} label="Nomor HP" defaultValue={m.no_hp ? `0${m.no_hp.slice(2)}` : ""} />
        <EmailField id={`em-${m.id}`} required={false} defaultValue={m.email ?? ""} />
        <input name="rt" defaultValue={m.rt ?? ""} inputMode="numeric" maxLength={3} pattern="\d{0,3}" placeholder="RT" className="input w-24 py-2" aria-label="RT" />
        <SubmitButton className="btn-green btn-sm">Simpan</SubmitButton>
      </ActionForm>
    </details>
  );
}
