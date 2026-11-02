import { Icon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatTanggal } from "@/lib/date";
import { PageTitle, Tabs } from "@/components/blocks";

export const metadata = { title: "Log" };

export default async function LogPage({ searchParams }: { searchParams: Promise<{ jenis?: string; hal?: string }> }) {
  await requireAdmin("superadmin");
  const { jenis, hal } = await searchParams;
  const page = Math.max(0, Number(hal) || 0);
  const db = createAdminClient();
  let q = db.from("audit_logs").select("*").order("created_at", { ascending: false }).range(page * 100, page * 100 + 99);
  q = jenis === "error" ? q.eq("action", "system.error") : q.neq("action", "system.error");
  const [{ data: logs }, { data: users }] = await Promise.all([q, db.from("users").select("id,nama").neq("role", "parent")]);
  return (
    <div className="space-y-4">
      <PageTitle title="Log Aktivitas" subtitle="Jejak aksi admin dan error sistem." />
      <Tabs
        active={jenis === "error" ? "error" : "admin"}
        items={[
          { key: "admin", label: "Aksi admin", href: "/admin/log" },
          { key: "error", label: "Error sistem", href: "/admin/log?jenis=error" },
        ]}
      />
      <div className="card overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Pelaku</th>
              <th>Aksi</th>
              <th>Target</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap">{formatTanggal(l.created_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                <td>{users?.find((u) => u.id === l.actor_id)?.nama ?? (l.actor_id ? "—" : "sistem")}</td>
                <td className="font-mono text-xs">{l.action}</td>
                <td className="text-xs">{l.target}</td>
                <td className="max-w-md font-mono text-xs break-all">{l.detail ? JSON.stringify(l.detail) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex justify-between">
          {page > 0 ? (
            <a className="btn-ghost btn-sm" href={`?${jenis ? `jenis=${jenis}&` : ""}hal=${page - 1}`}>
              <Icon name="arrow-left" className="h-4 w-4" /> Sebelumnya
            </a>
          ) : (
            <span />
          )}
          {(logs?.length ?? 0) === 100 && (
            <a className="btn-ghost btn-sm" href={`?${jenis ? `jenis=${jenis}&` : ""}hal=${page + 1}`}>
              Berikutnya <Icon name="arrow-right" className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
