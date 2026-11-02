import { Icon } from "@/components/icons";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatTanggal } from "@/lib/date";
import { PageTitle } from "@/components/blocks";
import { EventForm } from "./event-form";

export const metadata = { title: "Kegiatan" };

export default async function AdminKegiatanPage() {
  await requireAdmin();
  const db = createAdminClient();
  const [{ data: events }, { data: att }] = await Promise.all([
    db.from("events").select("*").order("date", { ascending: false }),
    db.from("event_attendance").select("event_id,rsvp,attended"),
  ]);
  return (
    <div className="space-y-4">
      <PageTitle title="Kegiatan & Agenda" subtitle="Jadwal pendampingan, daftar hadir, dan dokumentasi." />
      <details className="card">
        <summary className="cursor-pointer font-extrabold">+ Buat kegiatan baru</summary>
        <div className="mt-3">
          <EventForm />
        </div>
      </details>
      <div className="card overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kegiatan</th>
              <th>Status</th>
              <th>Konfirmasi hadir</th>
              <th>Hadir</th>
            </tr>
          </thead>
          <tbody>
            {events?.map((e) => {
              const a = (att ?? []).filter((x) => x.event_id === e.id);
              return (
                <tr key={e.id}>
                  <td className="whitespace-nowrap">{formatTanggal(e.date, { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>
                    <Link href={`/admin/kegiatan/${e.id}`} className="font-bold text-marun-600">
                      {e.title}
                    </Link>
                    {e.featured && <Icon name="star-solid" className="ml-1 h-3.5 w-3.5 text-aksen-500" title="Unggulan" />}
                  </td>
                  <td>{e.published ? "Tayang" : "Draf"}</td>
                  <td>{a.filter((x) => x.rsvp === "hadir").length}</td>
                  <td>{a.filter((x) => x.attended).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
