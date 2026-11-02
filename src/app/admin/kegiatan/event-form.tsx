import { ActionForm, SubmitButton } from "@/components/ui";
import { SingleUpload } from "@/components/admin/uploader";
import { saveEvent } from "../actions";
import type { EventRow } from "@/lib/content";

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 7 * 3600_000);
  return d.toISOString().slice(0, 16);
}

export function EventForm({ e }: { e?: EventRow }) {
  return (
    <ActionForm action={saveEvent} className="space-y-3">
      {e && <input type="hidden" name="id" value={e.id} />}
      <input name="title" defaultValue={e?.title} required placeholder="Judul kegiatan" className="input font-bold" />
      <div className="grid gap-2 md:grid-cols-2">
        <label>
          <span className="label">Tanggal & jam (WIB)</span>
          <input type="datetime-local" name="date" required defaultValue={toLocalInput(e?.date)} className="input" />
        </label>
        <label>
          <span className="label">Lokasi</span>
          <input name="location" defaultValue={e?.location ?? ""} className="input" />
        </label>
      </div>
      <textarea name="description" defaultValue={e?.description ?? ""} rows={4} placeholder="Deskripsi" className="input" />
      <input name="slug" defaultValue={e?.slug} placeholder="slug-url (opsional)" className="input font-mono text-sm" />
      <SingleUpload name="cover_photo" defaultValue={e?.cover_photo} folder="kegiatan" label="Unggah foto sampul" />
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 font-bold">
          <input type="checkbox" name="published" defaultChecked={e?.published ?? true} className="h-5 w-5 accent-daun-600" /> Tampilkan di website
        </label>
        <label className="flex items-center gap-2 font-bold">
          <input type="checkbox" name="featured" defaultChecked={e?.featured} className="h-5 w-5 accent-daun-600" /> Unggulan (slider beranda)
        </label>
      </div>
      <SubmitButton className="btn-green">Simpan Kegiatan</SubmitButton>
    </ActionForm>
  );
}
