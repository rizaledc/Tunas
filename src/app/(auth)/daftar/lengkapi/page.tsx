import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser, getProfile } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { CompleteGoogleForm } from "../../forms";
import { cancelGoogleSignup } from "../../actions";

export const metadata: Metadata = { title: "Lengkapi Pendaftaran", robots: { index: false } };

export default async function LengkapiPage({ searchParams }: { searchParams: Promise<{ kode?: string }> }) {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  if (await getProfile()) redirect("/app");
  const [{ kode }, consent] = await Promise.all([searchParams, getSetting("public.consent")]);
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  return (
    <div className="card mt-4 p-6">
      <h1 className="text-2xl font-extrabold text-daun-900">Satu langkah lagi</h1>
      <p className="mb-5 text-ink-soft">Lengkapi data berikut untuk bergabung dengan komunitas Anda.</p>
      <CompleteGoogleForm consentText={consent.text} consentVersion={consent.version} code={kode} nama={meta?.full_name ?? meta?.name ?? ""} email={user.email ?? ""} />
      <form action={cancelGoogleSignup} className="mt-4 text-center">
        <button className="text-sm font-semibold text-ink-soft underline">Batal dan keluar</button>
      </form>
    </div>
  );
}
