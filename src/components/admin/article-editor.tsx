"use client";
import { useRef, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";

/** Editor teks sederhana dengan toolbar Markdown dan pratinjau. */
export function ArticleEditor({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after = before, linePrefix = false) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || "teks";
    const next = linePrefix ? value.slice(0, s) + sel.split("\n").map((l) => before + l).join("\n") + value.slice(e) : value.slice(0, s) + before + sel + after + value.slice(e);
    setValue(next);
    requestAnimationFrame(() => el.focus());
  }

  return (
    <div className="rounded-xl ring-1 ring-gray-300">
      <div className="flex flex-wrap gap-1 border-b bg-gray-50 p-2 text-sm">
        <button type="button" className="btn-ghost btn-sm" onClick={() => wrap("## ", "", true)}>
          Judul
        </button>
        <button type="button" className="btn-ghost btn-sm font-extrabold" onClick={() => wrap("**")}>
          B
        </button>
        <button type="button" className="btn-ghost btn-sm italic" onClick={() => wrap("*")}>
          I
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={() => wrap("- ", "", true)}>
          • Daftar
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={() => wrap("1. ", "", true)}>
          1. Nomor
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={() => wrap("[", "](https://)")}>
          🔗 Tautan
        </button>
        <button type="button" className="btn-ghost btn-sm ml-auto" onClick={() => setPreview(!preview)}>
          {preview ? "✏️ Tulis" : "👁️ Pratinjau"}
        </button>
      </div>
      <input type="hidden" name="body" value={value} />
      {preview ? (
        <div className="prose-sa min-h-64 p-4" dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
      ) : (
        <textarea ref={ref} value={value} onChange={(e) => setValue(e.target.value)} rows={18} className="w-full rounded-b-xl p-3 font-mono text-sm focus:outline-none" placeholder="Tulis isi artikel…" />
      )}
    </div>
  );
}
