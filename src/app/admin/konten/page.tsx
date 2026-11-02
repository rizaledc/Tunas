import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/settings";
import { formatTanggal } from "@/lib/date";
import { GALLERY_CATEGORIES } from "@/lib/utils";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/ui";
import { PageTitle, Tabs } from "@/components/blocks";
import { MultiUpload, SingleUpload } from "@/components/admin/uploader";
import { deleteArticle, deletePhoto, saveContact, saveHero, savePanduan, savePhotos, saveStats, updatePhoto } from "../actions";

export const metadata = { title: "Konten" };

export default async function KontenPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const tab = (await searchParams).tab ?? "beranda";
  const db = createAdminClient();
  const s = await getSettings(["public.hero", "public.stats", "public.contact", "public.panduan"]);
  const tabs = [
    { key: "beranda", label: "Hero & Angka", href: "/admin/konten" },
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
                <Link href={`/admin/konten/artikel/${a.id}`} className="btn-ghost btn-sm text-sky-brand">
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
            <option value="">— tanpa kegiatan —</option>
            {events?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
          <input name="caption" placeholder="Keterangan (opsional)" className="input" />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="publish_consent" className="mt-1 h-5 w-5 accent-tunas-600" />
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
              {!p.publish_consent && <span className="absolute top-1 left-1 rounded bg-telkom-500 px-2 text-xs font-bold text-white">Tidak tampil</span>}
            </div>
            <form action={updatePhoto} className="space-y-1">
              <input type="hidden" name="id" value={p.id} />
              <input name="caption" defaultValue={p.caption ?? ""} placeholder="Keterangan" className="input py-1 text-sm" />
              <select name="category" defaultValue={p.category} className="input py-1 text-sm">
                {Object.entries(GALLERY_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <select name="event_id" defaultValue={p.event_id ?? ""} className="input py-1 text-sm">
                <option value="">— tanpa kegiatan —</option>
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
