"use client";
import { Icon } from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/** Kompres gambar ke WebP di browser (maks. 1600 px) sebelum diunggah. */
async function toWebp(file: File, maxSize = 1600, quality = 0.8): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise((res) => canvas.toBlob((b) => res(b ?? file), "image/webp", quality));
}

async function upload(file: File, folder: string) {
  const supabase = createBrowserSupabase();
  const isImage = file.type.startsWith("image/");
  const blob = isImage ? await toWebp(file) : file;
  const ext = isImage ? "webp" : (file.name.split(".").pop() ?? "bin").toLowerCase();
  const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, blob, { contentType: isImage ? "image/webp" : file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export function SingleUpload({ name, defaultValue, folder, accept = "image/*", label = "Unggah gambar", preview = true }: { name: string; defaultValue?: string | null; folder: string; accept?: string; label?: string; preview?: boolean }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      {preview && url && accept.startsWith("image") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-32 rounded-xl object-cover" />
      )}
      {url && !accept.startsWith("image") && (
        <a href={url} target="_blank" rel="noreferrer" className="block text-sm font-bold text-sky-brand break-all">
          {url}
        </a>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label className="btn-outline btn-sm cursor-pointer">
          {busy ? "Mengunggah…" : label}
          <input
            type="file"
            accept={accept}
            className="sr-only"
            disabled={busy}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              setErr("");
              try {
                setUrl((await upload(f, folder)).url);
              } catch (x) {
                setErr((x as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        {url && preview && (
          <button type="button" className="btn-ghost btn-sm" onClick={() => setUrl("")}>
            Hapus
          </button>
        )}
        {!preview && url !== (defaultValue ?? "") && <span className="text-xs font-semibold text-daun-700">Foto baru siap — tekan Simpan</span>}
      </div>
      {err && <p className="text-sm text-merah-600">Gagal: {err}</p>}
    </div>
  );
}

export function MultiUpload({ name = "uploaded", folder }: { name?: string; folder: string }) {
  const [items, setItems] = useState<Array<{ url: string; path: string }>>([]);
  const [progress, setProgress] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const form = ref.current?.closest("form");
    const onReset = () => {
      setItems([]);
      setProgress("");
    };
    form?.addEventListener("reset", onReset);
    return () => form?.removeEventListener("reset", onReset);
  }, []);
  return (
    <div className="space-y-2" ref={ref}>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <label className="btn-outline cursor-pointer">
        <Icon name="camera" className="h-5 w-5" /> Pilih foto (bisa banyak)
        <input
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={async (e) => {
            const files = [...(e.target.files ?? [])];
            const done: Array<{ url: string; path: string }> = [];
            for (const [i, f] of files.entries()) {
              setProgress(`Mengompres & mengunggah ${i + 1}/${files.length}…`);
              try {
                done.push(await upload(f, folder));
              } catch {
                /* lanjut */
              }
            }
            setItems((prev) => [...prev, ...done]);
            setProgress(`${done.length} dari ${files.length} foto terunggah (WebP).`);
          }}
        />
      </label>
      {progress && <p className="text-sm text-ink-soft">{progress}</p>}
      {items.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {items.map((it) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={it.path} src={it.url} alt="" className="aspect-square rounded-lg object-cover" />
          ))}
        </div>
      )}
    </div>
  );
}
