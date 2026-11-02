import { CATEGORY_ICONS, CategoryIcon, Icon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/settings";
import { formatTanggal } from "@/lib/date";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/ui";
import { PageTitle, Tabs } from "@/components/blocks";
import { MfaSetup } from "@/components/admin/mfa";
import { changeAdminRole, createAdminAccount, deleteAdminAccount, saveAiSettings, saveCategory, saveConsent, saveReminder, saveScreenRef, toggleCategory } from "../actions";

export const metadata = { title: "Pengaturan" };

export default async function PengaturanPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const me = await requireAdmin("superadmin");
  const tab = (await searchParams).tab ?? "kategori";
  const db = createAdminClient();
  const s = await getSettings(["ai.model", "ai.system_prompt", "ai.max_per_day", "ai.max_tokens", "ai.enabled", "screen_time.reference", "public.consent", "reminder.message"]);
  const tabs = [
    ["kategori", "Kategori"],
    ["ai", "AI & Prompt"],
    ["acuan", "Acuan Screen Time"],
    ["consent", "Teks Consent"],
    ["pengingat", "Pengingat"],
    ["akun", "Akun Admin"],
    ["keamanan", "Keamanan"],
  ].map(([key, label]) => ({ key, label, href: `/admin/pengaturan?tab=${key}` }));

  return (
    <div className="space-y-4">
      <PageTitle title="Pengaturan" subtitle="Khusus superadmin (pengelola program)." />
      <Tabs items={tabs} active={tab} />

      {tab === "kategori" && <Categories db={db} />}

      {tab === "ai" && (
        <ActionForm action={saveAiSettings} className="card space-y-3">
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" name="enabled" defaultChecked={Boolean(s["ai.enabled"])} className="h-5 w-5 accent-daun-600" /> AI aktif (jika mati, semua insight memakai ringkasan rule-based)
          </label>
          <label className="block">
            <span className="label">Model OpenRouter</span>
            <input name="model" defaultValue={String(s["ai.model"])} className="input font-mono" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="label">Maks. analisis / anak / hari</span>
              <input type="number" name="max_per_day" min={1} max={10} defaultValue={Number(s["ai.max_per_day"])} className="input" />
            </label>
            <label>
              <span className="label">max_tokens</span>
              <input type="number" name="max_tokens" min={200} max={2000} defaultValue={Number(s["ai.max_tokens"])} className="input" />
            </label>
          </div>
          <label className="block">
            <span className="label">Prompt sistem</span>
            <textarea name="system_prompt" defaultValue={String(s["ai.system_prompt"])} rows={18} className="input font-mono text-sm" />
          </label>
          <SubmitButton className="btn-green">Simpan</SubmitButton>
        </ActionForm>
      )}

      {tab === "acuan" && (
        <ActionForm action={saveScreenRef} className="card space-y-3">
          <p className="text-sm text-ink-soft">Acuan dipakai sebagai target awal kesepakatan dan dikirim ke AI. Tetapkan berdasarkan pedoman resmi (mis. IDAI/WHO) yang disepakati tim.</p>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Usia min</th>
                  <th>Usia maks</th>
                  <th>Maks menit/hari</th>
                  <th>Catatan & sumber</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => {
                  const r = s["screen_time.reference"][i];
                  return (
                    <tr key={i}>
                      <td>
                        <input type="number" name={`min_${i}`} defaultValue={r?.min_age} className="input w-20 py-1" />
                      </td>
                      <td>
                        <input type="number" name={`maxage_${i}`} defaultValue={r?.max_age} className="input w-20 py-1" />
                      </td>
                      <td>
                        <input type="number" name={`max_${i}`} defaultValue={r?.max_min} className="input w-24 py-1" />
                      </td>
                      <td>
                        <input name={`note_${i}`} defaultValue={r?.note} className="input py-1" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <SubmitButton className="btn-green">Simpan Acuan</SubmitButton>
        </ActionForm>
      )}

      {tab === "consent" && (
        <ActionForm action={saveConsent} className="card space-y-3">
          <p className="text-sm text-ink-soft">Mengubah nomor versi akan meminta semua orang tua menyetujui ulang saat membuka aplikasi.</p>
          <label className="block">
            <span className="label">Versi</span>
            <input name="version" defaultValue={s["public.consent"].version} className="input w-32" />
          </label>
          <textarea name="text" defaultValue={s["public.consent"].text} rows={12} className="input" />
          <SubmitButton className="btn-green">Simpan Consent</SubmitButton>
        </ActionForm>
      )}

      {tab === "pengingat" && (
        <ActionForm action={saveReminder} className="card space-y-3">
          <p className="text-sm text-ink-soft">Notifikasi PWA dikirim setiap hari pukul 19.00 WIB ke orang tua yang mengaktifkan pengingat dan belum mencatat hari itu.</p>
          <input name="message" defaultValue={String(s["reminder.message"])} className="input" maxLength={140} />
          <SubmitButton className="btn-green">Simpan</SubmitButton>
        </ActionForm>
      )}

      {tab === "akun" && <Admins db={db} meId={me.id} />}

      {tab === "keamanan" && (
        <section className="card space-y-2">
          <h2 className="font-extrabold">Verifikasi dua langkah (TOTP)</h2>
          <p className="text-sm text-ink-soft">Disarankan untuk semua superadmin. Setelah aktif, login admin meminta kode 6 digit.</p>
          <MfaSetup />
        </section>
      )}
    </div>
  );
}

async function Categories({ db }: { db: ReturnType<typeof createAdminClient> }) {
  const { data: cats } = await db.from("categories").select("*").order("type").order("sort");
  return (
    <div className="space-y-4">
      {(["digital", "positif"] as const).map((type) => (
        <section key={type} className="card overflow-x-auto">
          <h2 className="mb-2 font-extrabold"><span className="inline-flex items-center gap-2"><Icon name={type === "digital" ? "device" : "leaf"} className="text-daun-600" /> {type === "digital" ? "Tujuan gawai (digital)" : "Aktivitas positif"}</span></h2>
          <table className="tbl">
            <thead>
              <tr>
                <th>Ikon</th>
                <th>Nama</th>
                <th>Urutan</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {cats
                ?.filter((c) => c.type === type)
                .map((c) => (
                  <tr key={c.id} className={c.active ? "" : "opacity-50"}>
                    <td colSpan={3}>
                      <ActionForm action={saveCategory} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="type" value={c.type} />
                        <input type="hidden" name="active" value={c.active ? "on" : "off"} />
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-daun-50 text-daun-600">
                          <CategoryIcon icon={c.icon} className="h-6 w-6" />
                        </span>
                        <IconSelect defaultValue={c.icon} />
                        <input name="name" defaultValue={c.name} className="input py-1" />
                        <input type="number" name="sort" defaultValue={c.sort} className="input w-20 py-1" />
                        <button className="btn-outline btn-sm">Simpan</button>
                      </ActionForm>
                    </td>
                    <td>{c.active ? "Aktif" : "Nonaktif"}</td>
                    <td>
                      <form action={toggleCategory}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="active" value={c.active ? "0" : "1"} />
                        <button className="btn-ghost btn-sm">{c.active ? "Nonaktifkan" : "Aktifkan"}</button>
                      </form>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <ActionForm action={saveCategory} resetOnSuccess className="mt-3 flex flex-wrap items-center gap-2">
            <input type="hidden" name="type" value={type} />
            <IconSelect defaultValue="star" />
            <input name="name" placeholder="Nama kategori baru" required className="input w-60 py-1" />
            <input type="number" name="sort" defaultValue={99} className="input w-20 py-1" />
            <button className="btn-green btn-sm">+ Tambah</button>
          </ActionForm>
        </section>
      ))}
    </div>
  );
}

async function Admins({ db, meId }: { db: ReturnType<typeof createAdminClient>; meId: string }) {
  const { data: admins } = await db.from("users").select("id,nama,email,role,last_active_at").in("role", ["admin", "superadmin"]).order("created_at");
  return (
    <div className="space-y-4">
      <section className="card overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Peran</th>
              <th>Terakhir aktif</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {admins?.map((a) => (
              <tr key={a.id}>
                <td className="font-bold">{a.nama}</td>
                <td>{a.email}</td>
                <td>
                  {a.id === meId ? (
                    a.role
                  ) : (
                    <form action={changeAdminRole} className="flex gap-1">
                      <input type="hidden" name="id" value={a.id} />
                      <select name="role" defaultValue={a.role} className="input py-1 text-sm">
                        <option value="admin">admin</option>
                        <option value="superadmin">superadmin</option>
                      </select>
                      <button className="btn-ghost btn-sm">Ubah</button>
                    </form>
                  )}
                </td>
                <td>{a.last_active_at ? formatTanggal(a.last_active_at) : "—"}</td>
                <td>
                  {a.id !== meId && (
                    <form action={deleteAdminAccount}>
                      <input type="hidden" name="id" value={a.id} />
                      <ConfirmButton message={`Hapus akun admin ${a.nama}?`}>Hapus</ConfirmButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <ActionForm action={createAdminAccount} className="card space-y-3" resetOnSuccess>
        <h2 className="font-extrabold">Tambah admin</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <input name="nama" required placeholder="Nama pengurus" className="input" />
          <input name="email" type="email" required placeholder="Email" className="input" />
          <select name="role" className="input">
            <option value="admin">Admin komunitas</option>
            <option value="superadmin">Superadmin (pengelola program)</option>
          </select>
        </div>
        <SubmitButton className="btn-green">Buat Akun</SubmitButton>
      </ActionForm>
    </div>
  );
}

function IconSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select name="icon" defaultValue={CATEGORY_ICONS.some((i) => i.key === defaultValue) ? defaultValue : "heart"} className="input w-44 py-1 text-sm" aria-label="Ikon">
      {CATEGORY_ICONS.map((i) => (
        <option key={i.key} value={i.key}>
          {i.label}
        </option>
      ))}
    </select>
  );
}
