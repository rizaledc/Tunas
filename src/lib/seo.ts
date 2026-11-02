import type { Metadata } from "next";

/** Bagian openGraph yang sama di semua halaman (openGraph per halaman tidak digabung otomatis). */
export function og(path: string, extra: NonNullable<Metadata["openGraph"]> = {}): NonNullable<Metadata["openGraph"]> {
  return { siteName: "SAHABAT ANAK", locale: "id_ID", type: "website", url: path, ...extra } as NonNullable<Metadata["openGraph"]>;
}

export function pageMeta(path: string, title: string, description: string): Metadata {
  return { title, description, alternates: { canonical: path }, openGraph: og(path, { title: `${title} · SAHABAT ANAK`, description }) };
}
