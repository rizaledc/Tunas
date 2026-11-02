import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/settings";
import { formatTanggal } from "@/lib/date";
import { GALLERY_CATEGORIES } from "@/lib/utils";
import { ActionForm, ConfirmButton, ResetToDefault, SubmitButton } from "@/components/ui";
import { PageTitle, Tabs } from "@/components/blocks";
import { MultiUpload, SingleUpload } from "@/components/admin/uploader";
import { ArticleEditor } from "@/components/admin/article-editor";
import { IconSelect } from "@/components/admin/icon-select";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { resetContent, saveBrand, saveLanding, savePrivasi, saveTentang, saveShare, deleteArticle, deletePhoto, saveContact, saveHero, savePanduan, savePhotos, saveStats, updatePhoto } from "../actions";

export const metadata = { title: "Konten" };

export default async function KontenPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const tab = (await searchParams).tab ?? "beranda";
  const db = createAdminClient();
  const s = await getSettings(["public.hero", "public.stats", "public.contact", "public.panduan", "public.share", "public.brand", "public.landing", "public.tentang", "public.privasi"]);
  const tabs = [
    { key: "beranda", label: "Hero & Angka", href: "/admin/konten" },
    { key: "bagian", label: "Bagian Beranda", href: "/admin/konten?tab=bagian" },
    { key: "identitas", label: "Logo & Slogan", href: "/admin/konten?tab=identitas" },
    { key: "tentang", label: "Tentang", href: "/admin/konten?tab=tentang" },
    { key: "privasi", label: "Privasi", href: "/admin/konten?tab=privasi" },
    { key: "artikel", label: "Artikel", href: "/admin/konten?tab=artikel" },
    { key: "galeri", label: "Galeri", href: "/admin/konten?tab=galeri" },
    { key: "panduan", label: "Panduan & Modul", href: "/admin/konten?tab=panduan" },
    { key: "kegiatan", label: "Kegiatan/Agenda", href: "/admin/kegiatan" },
  ];

  return (
    <div className="space-y-4">
      <PageTitle title="Konten Website" subtitle="Ubah isi landing page tanpa coding." />
      <Tabs items={tabs} active={tab} />

      {tab === "beranda" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ActionForm action={saveHero} className="card space-y-3">
            <h2 className="font-extrabold">Hero</h2>
            <input name="title" defaultValue={s["public.hero"].title} className="input" required />
            <textarea name="subtitle" defaultValue={s["public.hero"].subtitle} rows={3} className="input" />
            <p className="text-sm text-ink-soft">Foto besar (mis. anak merawat lele / diskusi ibu-ibu). Pakai foto yang sudah ada izin publikasi.</p>
            <SingleUpload name="image" defaultValue={s["public.hero"].image} folder="hero" />
            <SubmitButton className="btn-green">Simpan Hero</SubmitButton>
          </ActionForm>
          <ActionForm action={saveStats} className="card space-y-3">
            <h2 className="font-extrabold">Angka capaian</h2>
            <p className="text-sm text-ink-soft">Kolom “sebelum” boleh kosong. Jumlah keluarga aktif dihitung otomatis.</p>
            {Array.from({ length: 6 }).map((_, i) => {
              const v = s["public.stats"][i];
              return (
                <div key={i} className="grid grid-cols-5 gap-2">
                  <input name={`label_${i}`} defaultValue={v?.label} placeholder="Label" className="input col-span-3 py-2 text-sm" />
                  <input name={`before_${i}`} defaultValue={v?.before} placeholder="Sebelum" className="input py-2 text-sm" />
                  <input name={`after_${i}`} defaultValue={v?.after} placeholder="Sesudah" className="input py-2 text-sm" />
                </div>
              );
            })}
            <SubmitButton className="btn-green">Simpan Angka</SubmitButton>
          </ActionForm>
          <ActionForm action={saveShare} className="card space-y-3 lg:col-span-2">
            <h2 className="font-extrabold">Tampilan saat dibagikan (WhatsApp & media sosial)</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm text-ink-soft">
                  Kosongkan gambar agar kartu dibuat otomatis dari judul hero. Jika mengunggah sendiri, pakai ukuran <strong>1200 × 630 px</strong> (rasio 1,91 : 1). Artikel dan kegiatan otomatis memakai foto sampul dan judulnya masing-masing.
                </p>
                <label className="block">
                  <span className="label">Kalimat deskripsi (maks. 200 karakter)</span>
                  <textarea name="description" defaultValue={s["public.share"].description} maxLength={200} rows={3} className="input" placeholder="Catat aktivitas digital dan non-digital anak, lihat keseimbangannya, dan dapatkan saran pendampingan." />
                </label>
                <SingleUpload name="image" defaultValue={s["public.share"].image} folder="share" label="Unggah gambar khusus" />
                <SubmitButton className="btn-green">Simpan</SubmitButton>
              </div>
              <div>
                <p className="label">Pratinjau</p>
                <div className="overflow-hidden rounded-xl bg-[#e9e1d6] p-2 shadow-inner">
                  <div className="overflow-hidden rounded-lg bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/opengraph-image?v=${encodeURIComponent(`${s["public.share"].image}|${s["public.share"].description}|${s["public.hero"].title}`.length + (s["public.share"].image || s["public.share"].description || s["public.hero"].title).slice(-16))}`} alt="Pratinjau kartu tautan" className="aspect-[1200/630] w-full object-cover" />
                    <div className="space-y-0.5 bg-[#f3f0ec] px-3 py-2 text-xs">
                      <p className="font-bold text-ink">SAHABAT ANAK: Dampingi Aktivitas Anak, Seimbangkan Dunia Digitalnya</p>
                      <p className="line-clamp-2 text-ink-soft">{s["public.share"].description || "Catat aktivitas digital dan non-digital anak, lihat keseimbangannya, dan dapatkan saran pendampingan."}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-ink-soft">Contoh tampilan di WhatsApp. Cek tautan lain di developers.facebook.com/tools/debug.</p>
              </div>
            </div>
          </ActionForm>
          <ActionForm action={saveContact} className="card space-y-3">
            <h2 className="font-extrabold">Kontak & alamat (footer, CTA)</h2>
            <textarea name="address" defaultValue={s["public.contact"].address} rows={2} className="input" />
            <input name="whatsapp" defaultValue={s["public.contact"].whatsapp} placeholder="No WhatsApp pengurus" className="input" />
            <input name="email" defaultValue={s["public.contact"].email} placeholder="Email" className="input" />
            <SubmitButton className="btn-green">Simpan Kontak</SubmitButton>
          </ActionForm>
        </div>
      )}

      {tab === "artikel" && <ArticleList db={db} />}
      {tab === "bagian" && <LandingEditor L={s["public.landing"]} />}
      {tab === "identitas" && (
        <ActionForm action={saveBrand} className="card max-w-2xl space-y-3">
          <h2 className="font-extrabold">Logo & slogan</h2>
          <p className="text-sm text-ink-soft">Kosongkan logo untuk memakai logo bawaan SAHABAT ANAK. Logo khusus sebaiknya persegi (mis. 512 × 512 px, latar transparan atau putih). Ikon aplikasi di layar utama HP tetap memakai logo bawaan.</p>
          <SingleUpload name="logo" defaultValue={s["public.brand"].logo} folder="brand" label="Unggah logo" />
          <label className="block">
            <span className="label">Slogan di bawah nama</span>
            <input name="tagline" defaultValue={s["public.brand"].tagline} maxLength={60} className="input" />
          </label>
          <SubmitButton className="btn-green">Simpan</SubmitButton>
          <ResetButton k="public.brand" />
        </ActionForm>
      )}
      {tab === "tentang" && (
        <ActionForm action={saveTentang} className="card space-y-3">
          <h2 className="font-extrabold">Halaman Tentang</h2>
          <input name="title" defaultValue={s["public.tentang"].title} className="input text-lg font-bold" />
          <label className="block">
            <span className="label">Paragraf pembuka</span>
            <textarea name="intro" defaultValue={s["public.tentang"].intro} rows={3} className="input" />
          </label>
          <SingleUpload name="image" defaultValue={s["public.tentang"].image} folder="tentang" label="Unggah foto (opsional)" />
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" name="show_logo" defaultChecked={s["public.tentang"].show_logo} className="h-5 w-5 accent-marun-600" /> Tampilkan bagian &quot;Makna Logo&quot;
          </label>
          <ArticleEditor defaultValue={s["public.tentang"].body} />
          <SubmitButton className="btn-green">Simpan</SubmitButton>
          <ResetButton k="public.tentang" />
        </ActionForm>
      )}
      {tab === "privasi" && (
        <ActionForm action={savePrivasi} className="card space-y-3">
          <h2 className="font-extrabold">Halaman Kebijakan Privasi</h2>
          <p className="text-sm text-ink-soft">Teks persetujuan data (consent) diatur superadmin di Pengaturan → Teks Consent dan otomatis tampil di bawah halaman ini.</p>
          <ArticleEditor defaultValue={s["public.privasi"].body} />
          <SubmitButton className="btn-green">Simpan</SubmitButton>
          <ResetButton k="public.privasi" />
        </ActionForm>
      )}
      {tab === "galeri" && <GalleryAdmin db={db} />}

      {tab === "panduan" && (
        <ActionForm action={savePanduan} className="card space-y-3">
          <h2 className="font-extrabold">Halaman panduan</h2>
          <p className="text-sm text-ink-soft">Format: ## Judul, **tebal**, daftar dengan “1.” atau “-”.</p>
          <textarea name="body" defaultValue={s["public.panduan"].body} rows={14} className="input font-mono text-sm" />
          <input name="module_name" defaultValue={s["public.panduan"].module_name} className="input" />
          <SingleUpload name="module_url" defaultValue={s["public.panduan"].module_url} folder="modul" accept="application/pdf" label="Unggah modul PDF" />
          <SubmitButton className="btn-green">Simpan Panduan</SubmitButton>
        </ActionForm>
      )}
    </div>
  );

}

async function ArticleList({ db }: { db: ReturnType<typeof createAdminClient> }) {
  const { data } = await db.from("articles").select("id,title,slug,published_at").order("created_at", { ascending: false });
  return (
    <div className="card overflow-x-auto">
      <div className="mb-3 flex justify-between">
        <h2 className="font-extrabold">Artikel & tips</h2>
        <Link href="/admin/konten/artikel/baru" className="btn-primary btn-sm">
          + Artikel baru
        </Link>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Judul</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data?.map((a) => (
            <tr key={a.id}>
              <td className="font-bold">{a.title}</td>
              <td>{a.published_at ? `Terbit ${formatTanggal(a.published_at)}` : "Draf"}</td>
              <td className="flex gap-1">
                <Link href={`/admin/konten/artikel/${a.id}`} className="btn-ghost btn-sm text-marun-600">
                  Ubah
                </Link>
                <form action={deleteArticle}>
                  <input type="hidden" name="id" value={a.id} />
                  <ConfirmButton message="Hapus artikel?">Hapus</ConfirmButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function GalleryAdmin({ db }: { db: ReturnType<typeof createAdminClient> }) {
  const [{ data: photos }, { data: events }] = await Promise.all([
    db.from("gallery_photos").select("*").order("created_at", { ascending: false }).limit(200),
    db.from("events").select("id,title").order("date", { ascending: false }),
  ]);
  return (
    <div className="space-y-4">
      <ActionForm action={savePhotos} className="card space-y-3" resetOnSuccess>
        <h2 className="font-extrabold">Unggah foto</h2>
        <MultiUpload folder="galeri" />
        <div className="grid gap-2 md:grid-cols-3">
          <select name="category" className="input">
            {Object.entries(GALLERY_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select name="event_id" className="input">
            <option value="">Tanpa kegiatan</option>
            {events?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
          <input name="caption" placeholder="Keterangan (opsional)" className="input" />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="publish_consent" className="mt-1 h-5 w-5 accent-marun-600" />
          <span>
            <strong>Izin publikasi sudah ada</strong> dari orang tua anak yang wajahnya tampak. Tanpa centang, foto disimpan tetapi tidak tampil di website.
          </span>
        </label>
        <p className="text-xs text-ink-soft">Foto otomatis dikompres ke WebP sebelum diunggah.</p>
        <button className="btn-green" type="submit">
          Simpan Foto
        </button>
      </ActionForm>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {photos?.map((p) => (
          <div key={p.id} className="card space-y-2 p-2">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image src={p.url} alt={p.caption ?? ""} fill sizes="25vw" className="object-cover" />
              {!p.publish_consent && <span className="absolute top-1 left-1 rounded bg-merah-500 px-2 text-xs font-bold text-white">Tidak tampil</span>}
            </div>
            <form action={updatePhoto} className="space-y-1">
              <input type="hidden" name="id" value={p.id} />
              <SingleUpload name="url" defaultValue={p.url} folder="galeri" label="Ganti foto" preview={false} />
              <input name="caption" defaultValue={p.caption ?? ""} placeholder="Keterangan" className="input py-1 text-sm" />
              <select name="category" defaultValue={p.category} className="input py-1 text-sm">
                {Object.entries(GALLERY_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <select name="event_id" defaultValue={p.event_id ?? ""} className="input py-1 text-sm">
                <option value="">Tanpa kegiatan</option>
                {events?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" name="publish_consent" defaultChecked={p.publish_consent} /> Izin publikasi
              </label>
              <button className="btn-outline btn-sm w-full">Simpan</button>
            </form>
            <form action={deletePhoto}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton message="Hapus foto ini permanen?">Hapus</ConfirmButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResetButton({ k }: { k: string }) {
  return <ResetToDefault action={resetContent.bind(null, k)} />;
}

function LandingEditor({ L }: { L: (typeof DEFAULT_SETTINGS)["public.landing"] }) {
  const show = { ...DEFAULT_SETTINGS["public.landing"].show, ...(L.show ?? {}) };
  const labels: Record<string, string> = { stats: "Angka capaian", events: "Kegiatan & agenda", features: "Fitur aplikasi", steps: "Cara kerja", roadmap: "Alur program", gallery: "Galeri", articles: "Artikel", cta: "Ajakan bergabung" };
  const roadmap = Array.from({ length: 6 }, (_, i) => L.roadmap[i] ?? { label: "", title: "", text: "" });
  return (
    <ActionForm action={saveLanding} className="space-y-4">
      <section className="card space-y-3">
        <h2 className="font-extrabold">Tampilkan bagian</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(labels).map(([k, v]) => (
            <label key={k} className="chip">
              <input type="checkbox" name={`show_${k}`} defaultChecked={show[k as keyof typeof show]} className="h-4 w-4 accent-marun-600" /> {v}
            </label>
          ))}
        </div>
      </section>
      <section className="card grid gap-3 md:grid-cols-3">
        <h2 className="font-extrabold md:col-span-3">Hero (teks kecil & tombol)</h2>
        <Field name="badge" label="Label kecil di atas judul" v={L.badge} />
        <Field name="cta_primary" label="Tombol utama" v={L.cta_primary} />
        <Field name="cta_secondary" label="Tombol kedua" v={L.cta_secondary} />
        <Field name="stats_label" label="Label kartu jumlah keluarga" v={L.stats_label} />
        <Field name="events_title" label="Judul bagian kegiatan" v={L.events_title} />
        <Field name="agenda_title" label="Judul agenda" v={L.agenda_title} />
      </section>
      <section className="card space-y-3">
        <h2 className="font-extrabold">Fitur aplikasi</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field name="features_title" label="Judul" v={L.features_title} />
          <Field name="features_text" label="Kalimat pengantar" v={L.features_text} />
        </div>
        <p className="text-xs text-ink-soft">Kosongkan judul kartu untuk menyembunyikannya.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => L.features[i] ?? { icon: "star", title: "", text: "" }).map((f, i) => (
            <div key={i} className="space-y-2 rounded-xl bg-gray-50 p-3">
              <div className="flex gap-2">
                <IconSelect name={`f_icon_${i}`} defaultValue={f.icon} className="input w-40 py-2 text-sm" />
                <input name={`f_title_${i}`} defaultValue={f.title} placeholder={`Judul kartu ${i + 1}`} className="input py-2" />
              </div>
              <textarea name={`f_text_${i}`} defaultValue={f.text} rows={2} className="input py-2 text-sm" />
            </div>
          ))}
        </div>
      </section>
      <section className="card space-y-3">
        <h2 className="font-extrabold">Cara kerja</h2>
        <Field name="steps_title" label="Judul" v={L.steps_title} />
        {L.steps.map((st, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[1fr_2fr]">
            <input name={`s_title_${i}`} defaultValue={st.title} placeholder={`Langkah ${i + 1}`} className="input py-2 font-bold" />
            <input name={`s_text_${i}`} defaultValue={st.text} className="input py-2" />
          </div>
        ))}
        <p className="text-sm text-ink-soft">Gambar di samping langkah (mis. tangkapan layar aplikasi, rasio 9:16). Kosongkan untuk mockup HP bawaan.</p>
        <SingleUpload name="steps_image" defaultValue={L.steps_image} folder="beranda" label="Unggah gambar" />
      </section>
      <section className="card space-y-3">
        <h2 className="font-extrabold">Alur program</h2>
        <Field name="roadmap_title" label="Judul" v={L.roadmap_title} />
        <p className="text-xs text-ink-soft">Maks. 6 tahap; kosongkan judul untuk menyembunyikan.</p>
        {roadmap.map((r, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[120px_1fr_2fr]">
            <input name={`r_label_${i}`} defaultValue={r.label} placeholder="Tahap/tahun" className="input py-2 text-sm" />
            <input name={`r_title_${i}`} defaultValue={r.title} placeholder="Judul" className="input py-2 font-bold" />
            <input name={`r_text_${i}`} defaultValue={r.text} placeholder="Keterangan" className="input py-2" />
          </div>
        ))}
      </section>
      <section className="card grid gap-3 md:grid-cols-2">
        <h2 className="font-extrabold md:col-span-2">Bagian lain & footer</h2>
        <Field name="gallery_title" label="Judul galeri" v={L.gallery_title} />
        <Field name="articles_title" label="Judul artikel" v={L.articles_title} />
        <Field name="cta_title" label="Judul ajakan bergabung" v={L.cta_title} />
        <Field name="cta_button" label="Tombol ajakan" v={L.cta_button} />
        <Field name="cta_text" label="Kalimat ajakan" v={L.cta_text} />
        <Field name="footer_text" label="Teks footer" v={L.footer_text} />
      </section>
      <div className="flex items-center">
        <SubmitButton className="btn-green">Simpan Semua</SubmitButton>
        <ResetButton k="public.landing" />
      </div>
    </ActionForm>
  );
}

function Field({ name, label, v }: { name: string; label: string; v: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input name={name} defaultValue={v} className="input py-2" />
    </label>
  );
}
