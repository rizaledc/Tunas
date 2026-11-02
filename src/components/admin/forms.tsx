"use client";
import { ActionForm, SubmitButton } from "@/components/ui";
import { importLogbookFile, importMembers, resetPassword } from "@/app/admin/actions";

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
              <p className="text-sm font-semibold text-telkom-600">Simpan daftar password sementara ini sekarang — tidak akan ditampilkan lagi.</p>
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
