import { CategoryIcon, Icon } from "@/components/icons";
import { IconSelect } from "@/components/admin/icon-select";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/settings";
import { formatTanggal } from "@/lib/date";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/ui";
import { PageTitle, Tabs } from "@/components/blocks";
import { MfaSetup } from "@/components/admin/mfa";
import { AiTestForm } from "@/components/admin/ai-test";
import { fetchModels, maskKey, resolveOpenRouterKey } from "@/lib/openrouter";
import { openRouterBalance } from "@/lib/insight";
import { googleProviderStatus, supabaseOAuthCallback } from "@/lib/auth-providers";
import { SITE_URL } from "@/lib/site";
import { getSetting } from "@/lib/settings";
import { changeAdminRole, createAdminAccount, deleteAdminAccount, deleteOpenRouterKey, resetSystemPrompt, saveAiSettings, saveAuthSettings, saveOpenRouterKey, saveCategory, saveConsent, saveReminder, saveScreenRef, toggleCategory } from "../actions";

export const metadata = { title: "Pengaturan" };

export default async function PengaturanPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const me = await requireAdmin("superadmin");
  const tab = (await searchParams).tab ?? "kategori";
  const db = createAdminClient();
  const s = await getSettings(["ai.model", "ai.system_prompt", "ai.coins_per_day", "ai.max_tokens", "ai.enabled", "screen_time.reference", "public.consent", "reminder.message"]);
  const tabs = [
    ["kategori", "Kategori"],
    ["ai", "AI & Prompt"],
    ["login", "Login & Google"],
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

      {tab === "ai" && <AiSettings s={s} />}
      {tab === "login" && <LoginSettings />}

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
      {(["digital", "positif", "rutin"] as const).map((type) => (
        <section key={type} className="card overflow-x-auto">
          <h2 className="mb-2 font-extrabold"><span className="inline-flex items-center gap-2"><Icon name={type === "digital" ? "device" : type === "rutin" ? "school" : "leaf"} className="text-hijau-600" /> {type === "digital" ? "Tujuan gawai (digital)" : type === "rutin" ? "Rutinitas (sekolah, makan & mandi, dll.)" : "Aktivitas positif"}</span></h2>
          <p className="mb-2 text-xs text-ink-soft">Kategori bernama &quot;Lainnya&quot; otomatis meminta orang tua menuliskan nama kegiatannya. Kategori dengan ikon ikan / nama berisi &quot;lele&quot; memunculkan logbook lele harian.</p>
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
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hijau-50 text-hijau-600">
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
                <td>{a.last_active_at ? formatTanggal(a.last_active_at) : "-"}</td>
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

type AiCfg = { "ai.model": string; "ai.system_prompt": string; "ai.coins_per_day": number; "ai.max_tokens": number; "ai.enabled": boolean };

async function AiSettings({ s }: { s: AiCfg }) {
  const [{ key, source }, models, balance] = await Promise.all([resolveOpenRouterKey(), fetchModels(), openRouterBalance()]);
  const model = String(s["ai.model"]);
  const current = models.find((m) => m.id === model);
  // Perkiraan: ±1.500 token masuk (prompt + angka) dan max_tokens keluar.
  const estimate = current ? (1500 * current.promptPerM + Number(s["ai.max_tokens"]) * current.completionPerM) / 1_000_000 : null;
  const status =
    source === "panel"
      ? { tone: "bg-hijau-50 text-hijau-700", icon: "check-circle" as const, text: `Terhubung · kunci ${maskKey(key)} disimpan di Panel Admin (terenkripsi)` }
      : source === "env"
        ? { tone: "bg-ink/[0.045] text-hijau-600", icon: "info" as const, text: `Terhubung · kunci ${maskKey(key)} dari variabel server OPENROUTER_API_KEY. Kunci yang diisi di bawah akan diutamakan.` }
        : source === "broken"
          ? { tone: "bg-red-50 text-merah-600", icon: "warning" as const, text: "Kunci tersimpan tidak bisa dibuka (APP_SECRET berubah). Simpan ulang API key." }
          : { tone: "bg-kuning-300/25 text-hijau-700", icon: "warning" as const, text: "Belum terhubung. Insight memakai ringkasan cadangan sampai API key diisi." };

  return (
    <div className="space-y-4">
      <section className="card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold">Koneksi OpenRouter</h2>
            <p className="text-sm text-ink-soft">Semua pengaturan AI cukup dari halaman ini, tanpa mengubah kode atau server.</p>
          </div>
          {balance && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold">
              Saldo/limit: {balance.remaining !== null ? `$${balance.remaining.toFixed(2)} tersisa` : "tanpa limit"} · terpakai ${balance.usage.toFixed(2)}
            </span>
          )}
        </div>
        <p className={`flex items-start gap-2 rounded-xl p-3 text-sm font-semibold ${status.tone}`}>
          <Icon name={status.icon} className="mt-0.5" /> {status.text}
        </p>
        <ActionForm action={saveOpenRouterKey} resetOnSuccess className="space-y-2">
          <label className="block">
            <span className="label">{source === "panel" ? "Ganti API key" : "API key OpenRouter"}</span>
            <input type="text" name="username" autoComplete="username" value="openrouter" readOnly hidden aria-hidden tabIndex={-1} />
            <input name="api_key" type="password" autoComplete="off" spellCheck={false} placeholder="sk-or-v1-…" className="input font-mono" />
          </label>
          <ol className="list-decimal space-y-0.5 pl-5 text-xs text-ink-soft">
            <li>
              Buat kunci di{" "}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="font-bold text-hijau-600 underline">
                openrouter.ai/keys
              </a>{" "}
              dan <strong>pasang limit kredit</strong> (mis. $10–15) pada kunci tersebut.
            </li>
            <li>
              Isi saldo di{" "}
              <a href="https://openrouter.ai/credits" target="_blank" rel="noopener noreferrer" className="font-bold text-hijau-600 underline">
                openrouter.ai/credits
              </a>
              .
            </li>
            <li>Tempel kunci di atas lalu simpan. Kunci diverifikasi dulu ke OpenRouter, lalu disimpan terenkripsi dan tidak pernah ditampilkan utuh.</li>
          </ol>
          <SubmitButton className="btn-green" pendingText="Memverifikasi…">
            <Icon name="lock" /> Verifikasi & Simpan
          </SubmitButton>
        </ActionForm>
        {source === "panel" && (
          <form action={deleteOpenRouterKey}>
            <ConfirmButton message="Hapus API key dari panel? Insight akan memakai ringkasan cadangan (atau kunci env bila ada).">Hapus API key</ConfirmButton>
          </form>
        )}
        <div className="border-t pt-4">
          <AiTestForm model={model} />
        </div>
      </section>

      <ActionForm action={saveAiSettings} className="card space-y-3">
        <h2 className="text-lg font-extrabold">Model & batas pemakaian</h2>
        <label className="flex items-center gap-2 font-bold">
          <input type="checkbox" name="enabled" defaultChecked={Boolean(s["ai.enabled"])} className="h-5 w-5 accent-hijau-600" /> AI aktif (jika mati, semua insight memakai ringkasan rule-based)
        </label>
        <label className="block">
          <span className="label">Model OpenRouter</span>
          <input name="model" list="model-list" defaultValue={model} className="input font-mono" />
          <datalist id="model-list">
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}: ${m.promptPerM.toFixed(2)} / ${m.completionPerM.toFixed(2)} per 1 jt token
              </option>
            ))}
          </datalist>
          <span className="mt-1 block text-xs text-ink-soft">
            {current
              ? `${current.name} · perkiraan ±$${estimate!.toFixed(4)} per analisis`
              : models.length
                ? "Model ini tidak ditemukan di katalog OpenRouter. Pilih dari daftar saat mengetik."
                : "Ketik ID model, mis. anthropic/claude-haiku-5.5."}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label">Koin AI / akun / hari</span>
            <input type="number" name="coins_per_day" min={1} max={10} defaultValue={Number(s["ai.coins_per_day"])} className="input" />
            <span className="mt-1 block text-xs text-ink-soft">Diisi ulang tiap 07.00 WIB, sisa koin hangus.</span>
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
      <form action={resetSystemPrompt} className="text-right">
        <ConfirmButton message="Kembalikan prompt sistem ke versi bawaan?" className="btn-ghost btn-sm">
          Pulihkan prompt bawaan
        </ConfirmButton>
      </form>
    </div>
  );
}

function CopyLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-xs font-bold text-ink-soft">{label}</p>
      <code className="block font-mono text-sm break-all select-all">{value}</code>
    </div>
  );
}

async function LoginSettings() {
  const [auth, provider] = await Promise.all([getSetting("public.auth"), googleProviderStatus()]);
  const providerText =
    provider === true ? { tone: "bg-hijau-50 text-hijau-700", icon: "check-circle" as const, text: "Provider Google di Supabase: AKTIF" } : provider === false ? { tone: "bg-kuning-300/25 text-hijau-700", icon: "warning" as const, text: "Provider Google di Supabase: belum aktif" } : { tone: "bg-gray-100 text-ink-soft", icon: "info" as const, text: "Status provider tidak bisa dicek" };
  return (
    <div className="space-y-4">
      <section className="card space-y-4">
        <div>
          <h2 className="text-lg font-extrabold">Masuk & daftar dengan Google</h2>
          <p className="text-sm text-ink-soft">Orang tua cukup memilih akun Google; kode undangan, nomor HP, dan persetujuan data tetap diminta saat pertama kali mendaftar.</p>
        </div>
        <p className={`flex items-center gap-2 rounded-xl p-3 text-sm font-semibold ${providerText.tone}`}>
          <Icon name={providerText.icon} /> {providerText.text}
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-sm">
          <li>
            Buka{" "}
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="font-bold text-hijau-600 underline">
              Google Cloud Console → APIs & Services → Credentials
            </a>
            . Atur <strong>OAuth consent screen</strong> (nama aplikasi SAHABAT ANAK, email dukungan, logo, domain), lalu buat <strong>OAuth client ID</strong> tipe <em>Web application</em>.
          </li>
          <li>
            Isi kolom di Google:
            <div className="mt-2 grid gap-2">
              <CopyLine label="Authorized JavaScript origins" value={SITE_URL} />
              <CopyLine label="Authorized redirect URIs" value={supabaseOAuthCallback()} />
            </div>
          </li>
          <li>
            Salin <strong>Client ID</strong> dan <strong>Client secret</strong> ke Supabase Dashboard → Authentication → Sign In / Providers → <strong>Google</strong> → Enable. Lalu di Authentication → URL Configuration, pastikan:
            <div className="mt-2 grid gap-2">
              <CopyLine label="Site URL" value={SITE_URL} />
              <CopyLine label="Redirect URLs (tambahkan)" value={`${SITE_URL}/auth/callback`} />
            </div>
          </li>
          <li>Kembali ke sini, nyalakan tombol di bawah, lalu coba masuk dengan Google dari HP.</li>
        </ol>
        <ActionForm action={saveAuthSettings} className="flex flex-wrap items-center gap-3 border-t pt-4">
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" name="google" defaultChecked={auth.google} className="h-5 w-5 accent-hijau-600" /> Tampilkan tombol &quot;Masuk/Daftar dengan Google&quot;
          </label>
          <SubmitButton className="btn-green btn-sm">Simpan</SubmitButton>
        </ActionForm>
      </section>
      <section className="card text-sm">
        <h2 className="mb-2 font-extrabold">Aturan password & data akun</h2>
        <ul className="list-disc space-y-1 pl-5 text-ink-soft">
          <li>Password minimal 10 karakter, berisi huruf besar, huruf kecil, angka, dan simbol; bukan kata umum, nama, atau nomor HP pengguna. Panduan tampil langsung saat mengetik.</li>
          <li>Nomor HP hanya angka (nomor seluler Indonesia, diawali 08/628). Email diperiksa formatnya dan salah ketik umum (gmial.com) disarankan perbaikannya.</li>
          <li>Daftar mandiri tanpa Google wajib mengisi nomor HP dan email. Akun buatan admin cukup salah satu.</li>
          <li>Pengurus (admin) masuk lewat /login/admin dengan email + password; akun pengurus tidak bisa masuk lewat tombol Google.</li>
        </ul>
      </section>
    </div>
  );
}
