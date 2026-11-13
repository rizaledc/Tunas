import { Icon } from "@/components/icons";
import Link from "next/link";
import { requireParent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatTanggal, isoDaysAgo } from "@/lib/date";
import { Empty, PageTitle } from "@/components/blocks";
import { rsvp } from "../../actions";

export const metadata = { title: "Kegiatan Komunitas" };

export default async function AppKegiatanPage() {
  const parent = await requireParent();
  const supabase = await createClient();
  const [{ data: events }, { data: mine }] = await Promise.all([
    supabase.from("events").select("id,title,slug,date,location,description").eq("published", true).gte("date", isoDaysAgo(1)).order("date"),
    supabase.from("event_attendance").select("event_id,rsvp,attended").eq("user_id", parent.id),
  ]);
  return (
    <div className="space-y-3">
      <PageTitle title="Kegiatan Komunitas" subtitle="Jadwal pendampingan komunitas" />
      {!events?.length && <Empty icon="calendar" title="Belum ada jadwal" text="Pengurus akan mengumumkan kegiatan berikutnya." />}
      {events?.map((e) => {
        const a = mine?.find((m) => m.event_id === e.id);
        return (
          <div key={e.id} className="card">
            <p className="text-sm font-bold text-hijau-700">{formatTanggal(e.date, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })} WIB</p>
            <p className="text-lg font-extrabold">{e.title}</p>
            {e.location && <p className="flex items-center gap-1 text-sm text-ink-soft"><Icon name="pin" className="h-4 w-4" /> {e.location}</p>}
            {e.description && <p className="mt-2 line-clamp-3 text-sm">{e.description}</p>}
            <form action={rsvp} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="event_id" value={e.id} />
              <button name="rsvp" value="hadir" className={`btn-sm btn flex-1 ${a?.rsvp === "hadir" ? "bg-hijau-600 text-white" : "bg-gray-100"}`}>
                <Icon name="check" className="h-4 w-4" /> Saya hadir
              </button>
              <button name="rsvp" value="tidak" className={`btn-sm btn flex-1 ${a?.rsvp === "tidak" ? "bg-gray-600 text-white" : "bg-gray-100"}`}>
                Tidak bisa
              </button>
            </form>
            <Link href={`/kegiatan/${e.slug}`} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-hijau-600">
              Detail <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
