import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = { title: { default: "Panel Admin", template: "%s · Admin SAHABAT ANAK" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const brand = await getSetting("public.brand");
  return (
    <div className="min-h-dvh bg-gray-50">
      <AdminSidebar role={me.role} nama={me.nama} brand={brand} />
      <main className="px-4 py-6 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
