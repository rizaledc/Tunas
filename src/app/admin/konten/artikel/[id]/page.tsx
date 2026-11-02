import { Icon } from "@/components/icons";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ActionForm, SubmitButton } from "@/components/ui";
import { PageTitle } from "@/components/blocks";
import { SingleUpload } from "@/components/admin/uploader";
import { ArticleEditor } from "@/components/admin/article-editor";
import { saveArticle } from "../../../actions";

export const metadata = { title: "Editor Artikel" };

export default async function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  let a: { id: string; title: string; slug: string; excerpt: string | null; body: string; cover: string | null; published_at: string | null } | null = null;
  if (id !== "baru") {
    const { data } = await createAdminClient().from("articles").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    a = data;
  }
  return (
    <div>
      <Link href="/admin/konten?tab=artikel" className="inline-flex items-center gap-1 text-sm font-bold text-marun-600">
        <Icon name="arrow-left" className="h-4 w-4" /> Daftar artikel
      </Link>
      <PageTitle title={a ? "Ubah Artikel" : "Artikel Baru"} />
      <ActionForm action={saveArticle} className="card space-y-3">
        {a && <input type="hidden" name="id" value={a.id} />}
        <input name="title" defaultValue={a?.title} required placeholder="Judul" className="input text-lg font-bold" />
        <input name="slug" defaultValue={a?.slug} placeholder="slug-url (otomatis dari judul jika kosong)" className="input font-mono text-sm" />
        <textarea name="excerpt" defaultValue={a?.excerpt ?? ""} rows={2} placeholder="Ringkasan singkat (opsional)" className="input" />
        <SingleUpload name="cover" defaultValue={a?.cover} folder="artikel" label="Unggah sampul" />
        <ArticleEditor defaultValue={a?.body ?? ""} />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" name="publish" defaultChecked={Boolean(a?.published_at)} className="h-5 w-5 accent-marun-600" /> Terbitkan
          </label>
          <label className="text-sm">
            Tanggal terbit{" "}
            <input type="datetime-local" name="published_at" defaultValue={a?.published_at ? new Date(a.published_at).toISOString().slice(0, 16) : ""} className="input inline w-auto py-1" />
          </label>
        </div>
        <SubmitButton className="btn-green">Simpan Artikel</SubmitButton>
      </ActionForm>
    </div>
  );
}
