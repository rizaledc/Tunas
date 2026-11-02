import { Icon, CategoryIcon } from "@/components/icons";
import Link from "next/link";
import { requireParent } from "@/lib/auth";
import { getActiveChild, getCategories } from "@/lib/parent";
import { createClient } from "@/lib/supabase/server";
import { addDays, formatHari, formatMenit, isoToWibTime, todayStr } from "@/lib/date";
import { Empty, PageTitle } from "@/components/blocks";
import { ConfirmButton } from "@/components/ui";
import { deleteLog } from "../../actions";
import { NoChild } from "../no-child";

export const metadata = { title: "Riwayat" };

export default async function RiwayatPage({ searchParams }: { searchParams: Promise<{ jenis?: string; kategori?: string; hari?: string }> }) {
  const parent = await requireParent();
  const { child } = await getActiveChild(parent.familyId);
  if (!child) return <NoChild />;
  const { jenis, kategori, hari } = await searchParams;
  const days = Math.min(Number(hari) || 14, 90);
  const cats = await getCategories(true);
  const supabase = await createClient();
  let q = supabase
    .from("activity_logs")
    .select("*")
    .eq("child_id", child.id)
    .gte("log_date", addDays(todayStr(), -days + 1))
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (jenis === "digital" || jenis === "positif") q = q.eq("type", jenis);
  if (kategori) q = q.eq("category_id", kategori);
  const { data: logs } = await q;

  const groups = new Map<string, NonNullable<typeof logs>>();
  for (const l of logs ?? []) groups.set(l.log_date, [...(groups.get(l.log_date) ?? []), l]);
  const editable = addDays(todayStr(), -7);

  return (
    <div>
      <PageTitle title="Riwayat Catatan" subtitle={`${child.nickname} · ${days} hari terakhir`} />
      <form className="card mb-4 grid grid-cols-2 gap-2" method="get">
        <select name="jenis" defaultValue={jenis ?? ""} className="input" aria-label="Filter jenis">
          <option value="">Semua jenis</option>
          <option value="digital">Digital</option>
          <option value="positif">Positif</option>
        </select>
        <select name="kategori" defaultValue={kategori ?? ""} className="input" aria-label="Filter kategori">
          <option value="">Semua kategori</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.type === "digital" ? "Digital · " : "Positif · "}{c.name}
            </option>
          ))}
        </select>
        <select name="hari" defaultValue={String(days)} className="input" aria-label="Rentang">
          <option value="7">7 hari</option>
          <option value="14">14 hari</option>
          <option value="30">30 hari</option>
          <option value="90">90 hari</option>
        </select>
        <button className="btn-green">Terapkan</button>
      </form>

      {groups.size === 0 ? (
        <Empty icon="list" title="Belum ada catatan" action={<Link href="/app/catat" className="btn-primary mt-2">Catat sekarang</Link>} />
      ) : (
        <div className="space-y-4">
          {[...groups.entries()].map(([date, items]) => {
            const dig = items.filter((i) => i.type === "digital").reduce((a, i) => a + i.duration_min, 0);
            const pos = items.filter((i) => i.type === "positif").reduce((a, i) => a + i.duration_min, 0);
            return (
              <section key={date}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="font-extrabold">{formatHari(date)}</h2>
                  <p className="text-xs text-ink-soft">
                    <Icon name="device" className="h-3.5 w-3.5 align-[-2px]" /> {formatMenit(dig)} · <Icon name="leaf" className="h-3.5 w-3.5 align-[-2px]" /> {formatMenit(pos)}
                  </p>
                </div>
                <ul className="space-y-2">
                  {items.map((l) => {
                    const cat = cats.find((c) => c.id === l.category_id);
                    return (
                      <li key={l.id} className="card flex items-start gap-3 p-3">
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${l.type === "digital" ? "bg-blue-50 text-sky-brand" : "bg-tunas-50 text-tunas-600"}`}>
                          <CategoryIcon icon={cat?.icon} className="h-6 w-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold">
                            {cat?.name ?? "Lainnya"} · {formatMenit(l.duration_min)}
                            {l.input_by === "child" && <span className="ml-1 inline-flex items-center gap-0.5 text-xs text-oranye-600"><Icon name="star-solid" className="h-3 w-3" /> dicatat anak</span>}
                            {l.source === "logbook_import" && <span className="ml-1 text-xs text-ink-soft">(logbook)</span>}
                          </p>
                          <p className="text-sm text-ink-soft">
                            {l.start_at && `${isoToWibTime(l.start_at)}–${isoToWibTime(l.end_at)} · `}
                            {l.app_name && `${l.app_name} · `}
                            {l.type === "digital" && (l.accompanied ? "didampingi" : l.accompanied === false ? "tidak didampingi" : "")}
                            {l.type === "digital" && l.follows_agreement === false && " · di luar kesepakatan"}
                            {l.with_whom && `bersama ${l.with_whom}`}
                          </p>
                          {l.note && <p className="mt-1 text-sm">{l.note}</p>}
                        </div>
                        {l.source === "app" && (
                          <div className="flex flex-col items-end">
                            {l.log_date >= editable && (
                              <Link href={`/app/catat?edit=${l.id}`} className="btn-ghost btn-sm text-sky-brand">
                                Ubah
                              </Link>
                            )}
                            <form action={deleteLog}>
                              <input type="hidden" name="id" value={l.id} />
                              <input type="hidden" name="child_id" value={child.id} />
                              <ConfirmButton message="Hapus catatan ini?">Hapus</ConfirmButton>
                            </form>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
