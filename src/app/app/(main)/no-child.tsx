import Link from "next/link";
import { Empty } from "@/components/blocks";

export function NoChild() {
  return (
    <Empty
      icon="child"
      title="Tambahkan profil anak dulu"
      text="Cukup nama panggilan, tahun lahir, dan jenjang sekolah."
      action={
        <Link href="/app/anak" className="btn-primary mt-2">
          Tambah Anak
        </Link>
      }
    />
  );
}
