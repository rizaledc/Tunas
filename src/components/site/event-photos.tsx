import Image from "next/image";

type Photo = { url: string; caption?: string };

/** Kolase foto dokumentasi kegiatan: 1 foto besar + foto pendamping dengan keterangan. */
export function EventPhotos({ photos, compact = false }: { photos: Photo[]; compact?: boolean }) {
  const list = photos.filter((p) => p.url).slice(0, 3);
  if (!list.length) return null;
  const [main, ...rest] = list;
  return (
    <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr]"}`}>
      <Figure p={main} className={compact ? "aspect-[4/3]" : "aspect-[4/3] sm:row-span-2 sm:aspect-auto sm:min-h-[22rem]"} sizes="(min-width:1024px) 40vw, 100vw" priority />
      {!compact && rest.map((p, i) => <Figure key={p.url + i} p={p} className="aspect-[16/10]" sizes="(min-width:1024px) 25vw, 50vw" />)}
      {compact && rest.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {rest.map((p, i) => (
            <Figure key={p.url + i} p={p} className="aspect-[4/3]" sizes="(min-width:1024px) 20vw, 50vw" />
          ))}
        </div>
      )}
    </div>
  );
}

function Figure({ p, className, sizes, priority }: { p: Photo; className: string; sizes: string; priority?: boolean }) {
  return (
    <figure className={`theme-dark group relative overflow-hidden rounded-3xl bg-gelap-900 ${className}`}>
      <Image src={p.url} alt={p.caption || "Dokumentasi kegiatan pendampingan"} fill sizes={sizes} priority={priority} className="object-cover transition duration-700 group-hover:scale-105" />
      {p.caption && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pt-10 pb-4 text-sm font-semibold text-white">
          {p.caption}
        </figcaption>
      )}
    </figure>
  );
}
