import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatTanggal } from "@/lib/date";
import { isSyntheticEmail } from "@/lib/utils";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/ui";
import { PageTitle } from "@/components/blocks";
import { CreateMemberForm, EditMemberForm, ImportMembersForm, ResetPasswordForm } from "@/components/admin/forms";
import { createInvites, deleteInvite, setUserStatus } from "../actions";

export const metadata = { title: "Anggota" };

export default async function AnggotaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q } = await searchParams;
  const db = createAdminClient();
  const [{ data: invites }, { data: users }, { data: fams }, { data: kids }] = await Promise.all([
    db.from("invite_codes").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("users").select("id,nama,no_hp,email,status,last_active_at,created_at").eq("role", "parent").order("created_at", { ascending: false }),
    db.from("families").select("id,parent_id,rt,consent_version"),
    db.from("children").select("family_id"),
  ]);
  const members = (users ?? [])
    .map((u) => {
      const f = fams?.find((x) => x.parent_id === u.id);
      return { ...u, rt: f?.rt, consent: f?.consent_version, kids: (kids ?? []).filter((k) => k.family_id === f?.id).length };
    })
    .filter((m) => !q || m.nama.toLowerCase().includes(q.toLowerCase()) || (m.no_hp ?? "").includes(q));
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <div className="space-y-6">
      <PageTitle title="Anggota" subtitle={`${users?.length ?? 0} keluarga terdaftar`} />

      <section className="card">
        <h2 className="mb-1 font-extrabold">Buat akun orang tua</h2>
        <p className="mb-3 text-sm text-ink-soft">Untuk orang tua yang kesulitan mendaftar sendiri. Cukup salah satu: nomor HP atau email.</p>
        <CreateMemberForm />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-extrabold">Buat kode undangan</h2>
          <ActionForm action={createInvites} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <label className="text-sm">
                <span className="label">Jumlah kode</span>
                <input name="count" type="number" min={1} max={200} defaultValue={1} className="input" />
              </label>
              <label className="text-sm">
                <span className="label">Maks. pakai</span>
                <input name="max_uses" type="number" min={1} max={500} defaultValue={1} className="input" />
              </label>
              <label className="text-sm">
                <span className="label">Berlaku (hari)</span>
                <input name="expires_days" type="number" min={0} defaultValue={30} className="input" />
              </label>
            </div>
            <input name="note" className="input" placeholder="Catatan (mis. Pelatihan Desember RT 7)" />
            <p className="text-xs text-ink-soft">Sekali pakai: jumlah N, maks. pakai 1. Satu kode untuk banyak orang: jumlah 1, maks. pakai N. Berlaku 0 = tanpa batas.</p>
            <SubmitButton className="btn-green">Buat Kode</SubmitButton>
          </ActionForm>
        </div>
        <div className="card">
          <h2 className="mb-1 font-extrabold">Impor anggota dari Excel</h2>
          <p className="mb-3 text-sm text-ink-soft">
            Kolom: <code>nama</code>, <code>no_hp</code>, <code>email</code> (opsional), <code>rt</code>.{" "}
            <a href="/api/admin/template?jenis=anggota" className="font-bold text-sky-brand">
              Unduh template
            </a>
          </p>
          <ImportMembersForm />
        </div>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-extrabold">Kode undangan</h2>
        <table className="tbl">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Dipakai</th>
              <th>Kedaluwarsa</th>
              <th>Catatan</th>
              <th>Tautan daftar</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {invites?.map((i) => {
              const expired = i.expires_at && new Date(i.expires_at) < new Date();
              return (
                <tr key={i.id} className={expired || i.used_count >= i.max_uses ? "opacity-50" : ""}>
                  <td className="font-mono font-bold">{i.code}</td>
                  <td>
                    {i.used_count}/{i.max_uses}
                  </td>
                  <td>{i.expires_at ? formatTanggal(i.expires_at) : "—"}</td>
                  <td>{i.note}</td>
                  <td className="font-mono text-xs">
                    {site}/daftar?kode={i.code}
                  </td>
                  <td>
                    <form action={deleteInvite}>
                      <input type="hidden" name="id" value={i.id} />
                      <ConfirmButton message="Hapus kode ini?">Hapus</ConfirmButton>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card overflow-x-auto">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-extrabold">Daftar keluarga</h2>
          <form className="flex gap-2">
            <input name="q" defaultValue={q} placeholder="Cari nama / no HP" className="input py-2" />
            <button className="btn-outline btn-sm">Cari</button>
          </form>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Nama orang tua</th>
              <th>Login</th>
              <th>RT</th>
              <th>Anak</th>
              <th>Terakhir aktif</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td className="font-bold">
                  {m.nama}
                  {!m.consent && <span className="block text-xs font-normal text-oranye-600">belum menyetujui consent</span>}
                </td>
                <td className="text-xs">{m.no_hp ? `0${m.no_hp.slice(2)}` : !isSyntheticEmail(m.email) ? m.email : ""}</td>
                <td>{m.rt ?? "—"}</td>
                <td>{m.kids}</td>
                <td>{m.last_active_at ? formatTanggal(m.last_active_at, { day: "numeric", month: "short", year: "numeric" }) : "belum pernah"}</td>
                <td>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${m.status === "active" ? "bg-daun-50 text-daun-700" : "bg-gray-200"}`}>{m.status === "active" ? "Aktif" : "Nonaktif"}</span>
                </td>
                <td className="space-y-1">
                  <form action={setUserStatus}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value={m.status === "active" ? "inactive" : "active"} />
                    <button className="btn-ghost btn-sm">{m.status === "active" ? "Nonaktifkan" : "Aktifkan"}</button>
                  </form>
                  <ResetPasswordForm id={m.id} />
                  <EditMemberForm m={{ id: m.id, nama: m.nama, no_hp: m.no_hp, email: isSyntheticEmail(m.email) ? null : m.email, rt: m.rt ?? null }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-ink-soft">Admin komunitas tidak dapat membuka catatan harian atau insight keluarga.</p>
      </section>
    </div>
  );
}
