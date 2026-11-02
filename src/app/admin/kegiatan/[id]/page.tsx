import { Icon } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { GALLERY_CATEGORIES } from "@/lib/utils";
import { ActionForm, ConfirmButton } from "@/components/ui";
import { PageTitle } from "@/components/blocks";
import { MultiUpload } from "@/components/admin/uploader";
import { deleteEvent, markAttendance, savePhotos } from "../../actions";
import { EventForm } from "../event-form";
import type { EventRow } from "@/lib/content";

export const metadata = { title: "Detail Kegiatan" };

export default async function AdminEventDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { q } = await searchParams;
  const db = createAdminClient();
  const [{ data: e }, { data: att }, { data: parents }, { data: photos }] = await Promise.all([
    db.from("events").select("*").eq("id", id).maybeSingle(),
    db.from("event_attendance").select("user_id,rsvp,attended").eq("event_id", id),
    db.from("users").select("id,nama").eq("role", "parent").eq("status", "active").order("nama"),
    db.from("gallery_photos").select("id,url,publish_consent").eq("event_id", id),
  ]);
  if (!e) notFound();
  const rows = (parents ?? [])
    .map((p) => ({ ...p, a: att?.find((x) => x.user_id === p.id) }))
    .filter((p) => !q || p.nama.toLowerCase().includes(q.toLowerCase()))
    .sort((x, y) => Number(Boolean(y.a?.rsvp === "hadir")) - Number(Boolean(x.a?.rsvp === "hadir")));

  return (
    <div className="space-y-4">
      <Link href="/admin/kegiatan" className="inline-flex items-center gap-1 text-sm font-bold text-sky-brand">
        <Icon name="arrow-left" className="h-4 w-4" /> Semua kegiatan
      </Link>
      <PageTitle title={e.title} action={<Link href={`/kegiatan/${e.slug}`} className="btn-outline btn-sm" target="_blank">Lihat publik</Link>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-extrabold">Data kegiatan</h2>
          <EventForm e={e as EventRow} />
          <form action={deleteEvent} className="mt-3">
            <input type="hidden" name="id" value={e.id} />
            <ConfirmButton message="Hapus kegiatan ini beserta daftar hadirnya?">Hapus kegiatan</ConfirmButton>
          </form>
        </section>
        <section className="card">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-extrabold">
              Daftar hadir ({att?.filter((a) => a.attended).length ?? 0} hadir · {att?.filter((a) => a.rsvp === "hadir").length ?? 0} konfirmasi)
            </h2>
            <form>
              <input name="q" defaultValue={q} placeholder="Cari nama" className="input py-1 text-sm" />
            </form>
          </div>
          <ul className="max-h-[32rem] divide-y overflow-y-auto">
            {rows.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                <span>
                  <span className="font-bold">{p.nama}</span>
                  {p.a?.rsvp && <span className={`ml-2 text-xs ${p.a.rsvp === "hadir" ? "text-tunas-700" : "text-ink-soft"}`}>{p.a.rsvp === "hadir" ? "konfirmasi hadir" : "tidak bisa"}</span>}
                </span>
                <form action={markAttendance}>
                  <input type="hidden" name="event_id" value={e.id} />
                  <input type="hidden" name="user_id" value={p.id} />
                  <input type="hidden" name="attended" value={p.a?.attended ? "0" : "1"} />
                  <button className={`btn-sm btn ${p.a?.attended ? "bg-tunas-600 text-white" : "bg-gray-100"}`}>{p.a?.attended ? <><Icon name="check" className="h-4 w-4" /> Hadir</> : "Tandai hadir"}</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="card space-y-3">
        <h2 className="font-extrabold">Dokumentasi foto</h2>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {photos?.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg">
              <Image src={p.url} alt="" fill sizes="16vw" className="object-cover" />
              {!p.publish_consent && <span className="absolute top-1 left-1 rounded bg-telkom-500 px-1 text-[10px] font-bold text-white">privat</span>}
            </div>
          ))}
        </div>
        <ActionForm action={savePhotos} resetOnSuccess className="space-y-2">
          <input type="hidden" name="event_id" value={e.id} />
          <MultiUpload folder={`kegiatan/${e.slug}`} />
          <select name="category" className="input">
            {Object.entries(GALLERY_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="publish_consent" className="h-5 w-5 accent-tunas-600" /> Izin publikasi sudah ada
          </label>
          <button className="btn-green">Simpan Foto Dokumentasi</button>
        </ActionForm>
      </section>
    </div>
  );
}
