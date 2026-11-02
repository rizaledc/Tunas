"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { emailError, emailTypoHint, generateStrongPassword, passwordChecks, passwordScore, phoneError } from "@/lib/validation";

const STRENGTH = [
  { label: "Sangat lemah", color: "bg-merah-500", text: "text-merah-600" },
  { label: "Lemah", color: "bg-merah-500", text: "text-merah-600" },
  { label: "Cukup", color: "bg-aksen-500", text: "text-aksen-600" },
  { label: "Kuat", color: "bg-marun-500", text: "text-marun-700" },
  { label: "Sangat kuat", color: "bg-marun-600", text: "text-marun-700" },
];

/** Membaca nilai field lain di form yang sama (untuk cek "bukan nama/nomor HP"). */
function useSibling(ref: React.RefObject<HTMLElement | null>, names: string[]) {
  const [ctx, setCtx] = useState<Record<string, string>>({});
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const read = () => {
      const o: Record<string, string> = {};
      for (const n of names) o[n] = (form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "";
      setCtx(o);
    };
    // Ditunda satu tick: setState sinkron di listener native akan me-render ulang input
    // terkontrol sebelum React memproses onChange, sehingga ketikan hilang.
    let t: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(t);
      t = setTimeout(read, 0);
    };
    read();
    form.addEventListener("input", schedule);
    return () => {
      clearTimeout(t);
      form.removeEventListener("input", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ctx;
}

/**
 * Password baru dengan panduan: daftar syarat yang tercentang langsung, indikator kekuatan,
 * tombol lihat/sembunyikan, dan "Buatkan password kuat". Jika `confirmName` diisi, ada kolom ulangi.
 */
export function NewPasswordField({ name = "password", label = "Buat password", confirmName = "password2", nameField = "nama", phoneField = "no_hp", emailField = "email" }: { name?: string; label?: string; confirmName?: string | null; nameField?: string; phoneField?: string; emailField?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const sib = useSibling(ref, [nameField, phoneField, emailField]);
  useEffect(() => {
    const form = ref.current?.closest("form");
    const onReset = () => {
      setPw("");
      setPw2("");
      setShow(false);
    };
    form?.addEventListener("reset", onReset);
    return () => form?.removeEventListener("reset", onReset);
  }, []);
  const ctx = { name: sib[nameField], phone: sib[phoneField], email: sib[emailField] };
  const checks = passwordChecks(pw, ctx);
  const score = passwordScore(pw, ctx);
  const allOk = checks.every((c) => c.ok);

  return (
    <div ref={ref} className="space-y-2">
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          required
          autoComplete="new-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          aria-describedby={`${name}-rules`}
          aria-invalid={pw.length > 0 && !allOk}
          className={cn("input pr-20", pw && (allOk ? "border-marun-500" : "border-aksen-400"))}
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-marun-700" aria-label={show ? "Sembunyikan password" : "Lihat password"}>
          <Icon name="eye" className="h-4 w-4" /> {show ? "Tutup" : "Lihat"}
        </button>
      </div>

      {pw && (
        <div className="flex items-center gap-2" aria-live="polite">
          <div className="flex flex-1 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < score ? STRENGTH[score].color : "bg-gray-200")} />
            ))}
          </div>
          <span className={cn("text-xs font-bold", STRENGTH[score].text)}>{STRENGTH[score].label}</span>
        </div>
      )}

      <ul id={`${name}-rules`} className="grid gap-1 rounded-xl bg-gray-50 p-3 text-xs sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.id} className={cn("flex items-center gap-1.5", c.ok ? "text-marun-700" : "text-ink-soft")}>
            <Icon name={c.ok ? "check-circle" : "info"} className={cn("h-4 w-4", c.ok ? "text-marun-600" : "text-gray-400")} />
            {c.label}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
        <button
          type="button"
          className="btn-ghost btn-sm text-marun-600 ring-1 ring-gray-200"
          onClick={() => {
            const g = generateStrongPassword();
            setPw(g);
            setPw2(g);
            setShow(true);
          }}
        >
          <Icon name="sparkle" className="h-4 w-4" /> Buatkan password kuat
        </button>
        <span>Tips: gabungkan 2 kata yang mudah diingat + simbol + angka, mis. Mangga!kancil47. Catat di tempat aman.</span>
      </div>

      {confirmName && (
        <div>
          <label className="label" htmlFor={confirmName}>
            Ulangi password
          </label>
          <input
            id={confirmName}
            name={confirmName}
            type={show ? "text" : "password"}
            required
            autoComplete="new-password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className={cn("input", pw2 && (pw2 === pw ? "border-marun-500" : "border-merah-500"))}
          />
          {pw2 && pw2 !== pw && <p className="mt-1 text-xs font-semibold text-merah-600">Password belum sama.</p>}
          {pw2 && pw2 === pw && allOk && (
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-marun-700">
              <Icon name="check" className="h-3.5 w-3.5" /> Password cocok
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Nomor HP: hanya angka (karakter lain otomatis dibuang), dengan pesan validasi langsung. */
export function PhoneField({ name = "no_hp", id, label = "Nomor HP", required = true, defaultValue = "", hint }: { name?: string; id?: string; label?: string; required?: boolean; defaultValue?: string; hint?: string }) {
  const fid = id ?? name;
  const [v, setV] = useState(defaultValue);
  const [touched, setTouched] = useState(false);
  const err = v || required ? phoneError(v) : null;
  return (
    <div>
      <label className="label" htmlFor={fid}>
        {label}
        {!required && <span className="font-normal text-ink-soft"> (opsional)</span>}
      </label>
      <input
        id={fid}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        required={required}
        maxLength={16}
        placeholder="081234567890"
        value={v}
        onChange={(e) => setV(e.target.value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, ""))}
        onBlur={() => setTouched(true)}
        aria-invalid={touched && !!err}
        className={cn("input tracking-wide", touched && err && "border-merah-500", v && !err && "border-marun-500")}
      />
      {touched && err ? <p className="mt-1 text-xs font-semibold text-merah-600">{err}</p> : <p className="mt-1 text-xs text-ink-soft">{hint ?? "Hanya angka. Nomor seluler aktif, diawali 08 atau 628."}</p>}
    </div>
  );
}

/** Email dengan validasi format dan saran perbaikan salah ketik (gmial.com → gmail.com). */
export function EmailField({ name = "email", id, label = "Email", required = true, defaultValue = "", hint }: { name?: string; id?: string; label?: string; required?: boolean; defaultValue?: string; hint?: string }) {
  const fid = id ?? name;
  const [v, setV] = useState(defaultValue);
  const [touched, setTouched] = useState(false);
  const err = v || required ? emailError(v) : null;
  const typo = emailTypoHint(v);
  return (
    <div>
      <label className="label" htmlFor={fid}>
        {label}
        {!required && <span className="font-normal text-ink-soft"> (opsional)</span>}
      </label>
      <input
        id={fid}
        name={name}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required={required}
        maxLength={254}
        placeholder="nama@gmail.com"
        value={v}
        onChange={(e) => setV(e.target.value.replace(/\s/g, ""))}
        onBlur={() => setTouched(true)}
        aria-invalid={touched && !!err}
        className={cn("input", touched && err && "border-merah-500", v && !err && "border-marun-500")}
      />
      {typo ? (
        <p className="mt-1 text-xs text-aksen-600">
          Maksud Anda{" "}
          <button type="button" className="font-bold underline" onClick={() => setV(typo)}>
            {typo}
          </button>
          ?
        </p>
      ) : touched && err ? (
        <p className="mt-1 text-xs font-semibold text-merah-600">{err}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>
      )}
    </div>
  );
}
