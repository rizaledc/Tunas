import { Icon, type IconName } from "@/components/icons";
import Link from "next/link";
import { requireParent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ActionForm, SubmitButton } from "@/components/ui";
import { PageTitle } from "@/components/blocks";
import { changePassword, deleteAccount, updateProfile } from "../../actions";
import { PushToggle } from "./push-toggle";
import { EmailField, NewPasswordField, PhoneField } from "@/components/fields";
import { createAdminClient } from "@/lib/supabase/admin";
import { loginMethods } from "@/lib/accounts";

export const metadata = { title: "Profil" };

export default async function ProfilPage() {
  const parent = await requireParent();
  const supabase = await createClient();
  const [{ data: fam }, { data: au }] = await Promise.all([
    supabase.from("families").select("rt,consent_at,consent_version").eq("id", parent.familyId).maybeSingle(),
    createAdminClient().auth.admin.getUserById(parent.id),
  ]);
  const { isGoogle, hasPassword } = loginMethods(au.user);
  return (
    <div className="space-y-4">
      <PageTitle title="Profil" subtitle={parent.no_hp ? `+${parent.no_hp}` : parent.email ?? ""} />

      <nav className="grid grid-cols-2 gap-2">
        {([
          ["/app/anak", "child", "Profil anak & PIN"],
          ["/app/kesepakatan", "agreement", "Kesepakatan"],
          ["/app/insight", "sparkle", "Insight"],
          ["/app/checkin", "face-smile", "Check-in harian"],
          ["/app/kegiatan", "calendar", "Kegiatan komunitas"],
          ["/app/mode-anak/masuk", "star", "Mode anak"],
          ["/panduan", "book", "Panduan"],
          ["/privasi", "lock", "Privasi"],
        ] as Array<[string, IconName, string]>).map(([href, icon, label]) => (
          <Link key={href} href={href} className="card flex items-center gap-2 p-3 font-bold">
            <Icon name={icon} className="h-6 w-6 text-marun-600" />
            {label}
          </Link>
        ))}
      </nav>

      <section className="card">
        <h2 className="mb-3 text-lg font-extrabold">Data akun</h2>
        <ActionForm action={updateProfile} className="space-y-3">
          <div>
            <label className="label" htmlFor="nama">
              Nama
            </label>
            <input id="nama" name="nama" defaultValue={parent.nama} required minLength={2} maxLength={80} className="input" />
          </div>
          <PhoneField defaultValue={parent.no_hp ? `0${parent.no_hp.slice(2)}` : ""} />
          {isGoogle ? (
            <div>
              <p className="label">Email</p>
              <p className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm">
                <Icon name="check-circle" className="text-marun-600" /> {parent.email} <span className="text-ink-soft">(akun Google)</span>
              </p>
            </div>
          ) : (
            <EmailField required={false} defaultValue={parent.email ?? ""} hint="Isi email agar bisa memulihkan password sendiri." />
          )}
          <div>
            <label className="label" htmlFor="rt">
              RT
            </label>
            <input id="rt" name="rt" defaultValue={fam?.rt ?? ""} inputMode="numeric" maxLength={3} pattern="\d{0,3}" className="input w-28" />
          </div>
          <SubmitButton className="btn-green w-full">Simpan</SubmitButton>
        </ActionForm>
      </section>

      <section className="card">
        <h2 className="mb-3 text-lg font-extrabold">{hasPassword ? "Ubah password" : "Buat password (opsional)"}</h2>
        {!hasPassword && <p className="mb-3 text-sm text-ink-soft">Anda masuk dengan Google. Buat password jika ingin bisa masuk juga dengan email/nomor HP.</p>}
        <ActionForm action={changePassword} resetOnSuccess className="space-y-3">
          {hasPassword && (
            <div>
              <label className="label" htmlFor="current">
                Password lama
              </label>
              <input id="current" name="current" type="password" required autoComplete="current-password" className="input" />
            </div>
          )}
          <input type="hidden" name="nama" value={parent.nama} />
          <input type="hidden" name="no_hp" value={parent.no_hp ?? ""} />
          <input type="hidden" name="email" value={parent.email ?? ""} />
          <NewPasswordField label="Password baru" />
          <SubmitButton className="btn-outline w-full">{hasPassword ? "Ubah Password" : "Buat Password"}</SubmitButton>
        </ActionForm>
      </section>

      <section className="card">
        <PushToggle enabled={parent.reminder_enabled} />
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-extrabold">Data saya</h2>
        <p className="text-sm text-ink-soft">
          Persetujuan data versi {fam?.consent_version ?? "-"} diberikan {fam?.consent_at ? new Date(fam.consent_at).toLocaleDateString("id-ID") : "-"}.
        </p>
        <div className="flex flex-wrap gap-2">
          <a href="/api/data-saya?format=xlsx" className="btn-outline btn-sm">
            <Icon name="download" className="h-4 w-4" /> Unduh (Excel)
          </a>
          <a href="/api/data-saya?format=json" className="btn-outline btn-sm">
            <Icon name="download" className="h-4 w-4" /> Unduh (JSON)
          </a>
        </div>
        <details className="rounded-xl bg-red-50 p-3">
          <summary className="cursor-pointer font-bold text-merah-600">Hapus akun beserta seluruh data</summary>
          <ActionForm action={deleteAccount} confirm="Yakin menghapus akun dan SEMUA data anak? Tidak bisa dibatalkan." className="mt-3 space-y-2">
            <p className="text-sm">Semua profil anak, catatan, insight, dan refleksi akan dihapus permanen. Ketik <strong>HAPUS</strong> untuk melanjutkan.</p>
            <input name="confirm" required className="input" autoComplete="off" />
            <SubmitButton className="btn-danger w-full">Hapus Permanen</SubmitButton>
          </ActionForm>
        </details>
      </section>

      <form action="/keluar" method="post">
        <button className="btn-ghost w-full ring-1 ring-gray-200"><Icon name="logout" /> Keluar</button>
      </form>
    </div>
  );
}
