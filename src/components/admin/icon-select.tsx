import { CATEGORY_ICONS } from "@/components/icons";

export function IconSelect({ defaultValue, name = "icon", className = "input w-44 py-1 text-sm" }: { defaultValue: string; name?: string; className?: string }) {
  const extra = [
    { key: "pencil", label: "Pensil" },
    { key: "chart", label: "Grafik" },
    { key: "agreement", label: "Kesepakatan" },
    { key: "community", label: "Komunitas" },
    { key: "shield", label: "Perisai" },
    { key: "bulb", label: "Ide" },
    { key: "calendar", label: "Kalender" },
    { key: "child", label: "Anak" },
  ];
  const all = [...CATEGORY_ICONS, ...extra.filter((e) => !CATEGORY_ICONS.some((c) => c.key === e.key))];
  return (
    <select name={name} defaultValue={all.some((i) => i.key === defaultValue) ? defaultValue : "heart"} className={className} aria-label="Ikon">
      {all.map((i) => (
        <option key={i.key} value={i.key}>
          {i.label}
        </option>
      ))}
    </select>
  );
}
