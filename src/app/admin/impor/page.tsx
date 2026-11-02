import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ActionForm, SubmitButton } from "@/components/ui";
import { PageTitle } from "@/components/blocks";
import { LogbookFileForm } from "@/components/admin/forms";
import { importLogbookForm } from "../actions";

export const metadata = { title: "Impor Logbook" };

export default async function ImporPage() {
  await requireAdmin("superadmin");
  const db = createAdminClient();
  const [{ data: cats }, { count }] = await Promise.all([
    db.from("categories").select("type,name").order("sort"),
    db.from("activity_logs").select("id", { count: "exact", head: true }).eq("source", "logbook_import"),
  ]);
  return (
    <div className="space-y-4">
      <PageTitle title="Impor Logbook Kertas" subtitle={`Data lama dipakai sebagai baseline “sebelum”. Saat ini ${count ?? 0} baris logbook tersimpan.`} />
      <section className="card space-y-2">
        <h2 className="font-extrabold">Unggah Excel</h2>
        <p className="text-sm text-ink-soft">
          Kolom: <code>no_hp</code> (orang tua), <code>anak</code> (nama panggilan persis seperti di aplikasi), <code>tanggal</code> (YYYY-MM-DD), <code>jenis</code> (digital/positif), <code>kategori</code>, <code>durasi</code> (menit), <code>didampingi</code> (ya/tidak), <code>catatan</code>.{" "}
          <a href="/api/admin/template?jenis=logbook" className="font-bold text-marun-600">
            Unduh template
          </a>
        </p>
        <p className="text-xs text-ink-soft">Kategori yang dikenali: {cats?.map((c) => `${c.name} (${c.type})`).join(", ")}</p>
        <LogbookFileForm />
      </section>

      <ActionForm action={importLogbookForm} className="card space-y-3" resetOnSuccess>
        <h2 className="font-extrabold">Form massal (satu anak)</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <input name="no_hp" required placeholder="No HP orang tua" className="input" />
          <input name="anak" required placeholder="Nama panggilan anak" className="input" />
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Kategori</th>
                <th>Durasi (mnt)</th>
                <th>Didampingi</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <input type="date" name={`tanggal_${i}`} className="input py-1 text-sm" />
                  </td>
                  <td>
                    <select name={`jenis_${i}`} className="input py-1 text-sm">
                      <option value="digital">Digital</option>
                      <option value="positif">Positif</option>
                    </select>
                  </td>
                  <td>
                    <input name={`kategori_${i}`} list="kategori-list" className="input py-1 text-sm" />
                  </td>
                  <td>
                    <input type="number" name={`durasi_${i}`} min={1} max={1440} className="input w-24 py-1 text-sm" />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" name={`didampingi_${i}`} className="h-5 w-5" />
                  </td>
                  <td>
                    <input name={`catatan_${i}`} className="input py-1 text-sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id="kategori-list">
            {cats?.map((c) => (
              <option key={`${c.type}-${c.name}`} value={c.name} />
            ))}
          </datalist>
        </div>
        <SubmitButton className="btn-green">Simpan Logbook</SubmitButton>
      </ActionForm>
    </div>
  );
}
