"use client";
import Link from "next/link";
import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui";
import { loginAdmin, loginParent, register, requestReset, updatePassword, verifyMfa } from "./actions";

function PasswordInput({ name = "password", label = "Password", autoComplete = "current-password" }: { name?: string; label?: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input id={name} name={name} type={show ? "text" : "password"} required minLength={name === "password" && autoComplete === "current-password" ? 1 : 8} autoComplete={autoComplete} className="input pr-20" />
        <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-bold text-tunas-700">
          {show ? "Sembunyi" : "Lihat"}
        </button>
      </div>
    </div>
  );
}

export function LoginForm({ admin = false, next }: { admin?: boolean; next?: string }) {
  return (
    <ActionForm action={admin ? loginAdmin : loginParent}>
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="identifier">
          {admin ? "Email atau nomor HP" : "Nomor HP atau email"}
        </label>
        <input id="identifier" name="identifier" required autoComplete="username" inputMode={admin ? "email" : "text"} placeholder={admin ? "admin@contoh.com" : "08xxxxxxxxxx"} className="input" />
      </div>
      <PasswordInput />
      <SubmitButton pendingText="Memeriksa…">Masuk</SubmitButton>
      {!admin && (
        <p className="text-center text-sm">
          <Link href="/lupa-password" className="font-bold text-sky-brand">
            Lupa password?
          </Link>
        </p>
      )}
    </ActionForm>
  );
}

export function MfaForm() {
  return (
    <ActionForm action={verifyMfa}>
      <div>
        <label className="label" htmlFor="code">
          Kode 6 digit dari aplikasi autentikator
        </label>
        <input id="code" name="code" required inputMode="numeric" pattern="[0-9 ]{6,7}" autoComplete="one-time-code" className="input text-center text-2xl tracking-[0.5em]" />
      </div>
      <SubmitButton pendingText="Memverifikasi…">Verifikasi</SubmitButton>
    </ActionForm>
  );
}

export function RegisterForm({ consentText, consentVersion, code }: { consentText: string; consentVersion: string; code?: string }) {
  return (
    <ActionForm action={register}>
      <div>
        <label className="label" htmlFor="kode">
          Kode undangan TUNAS
        </label>
        <input id="kode" name="kode" required defaultValue={code} autoCapitalize="characters" className="input font-mono tracking-widest uppercase" placeholder="ABCD2345" />
      </div>
      <div>
        <label className="label" htmlFor="nama">
          Nama orang tua
        </label>
        <input id="nama" name="nama" required autoComplete="name" className="input" placeholder="Contoh: Bu Siti" />
      </div>
      <div>
        <label className="label" htmlFor="contact">
          Nomor HP (atau email)
        </label>
        <input id="contact" name="contact" required autoComplete="tel" className="input" placeholder="08xxxxxxxxxx" />
        <p className="mt-1 text-xs text-ink-soft">Nomor HP dipakai untuk masuk. Jika lupa password, pengurus TUNAS dapat membantu reset.</p>
      </div>
      <div>
        <label className="label" htmlFor="rt">
          RT (opsional)
        </label>
        <input id="rt" name="rt" inputMode="numeric" className="input" placeholder="7" />
      </div>
      <PasswordInput label="Buat password (min. 8 karakter)" autoComplete="new-password" />
      <PasswordInput name="password2" label="Ulangi password" autoComplete="new-password" />
      <details className="rounded-xl bg-gray-50 p-3 text-sm">
        <summary className="cursor-pointer font-bold">Baca persetujuan data (versi {consentVersion})</summary>
        <p className="mt-2 whitespace-pre-line text-ink-soft">{consentText}</p>
        <Link href="/privasi" className="mt-2 inline-block font-bold text-sky-brand" target="_blank">
          Kebijakan privasi lengkap
        </Link>
      </details>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 accent-tunas-600" />
        <span>Saya sudah membaca dan menyetujui penyimpanan serta pemakaian data seperti dijelaskan di atas.</span>
      </label>
      <SubmitButton pendingText="Mendaftarkan…">Daftar</SubmitButton>
    </ActionForm>
  );
}

export function ResetRequestForm() {
  return (
    <ActionForm action={requestReset}>
      <div>
        <label className="label" htmlFor="email">
          Email terdaftar
        </label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <SubmitButton pendingText="Mengirim…">Kirim tautan reset</SubmitButton>
    </ActionForm>
  );
}

export function NewPasswordForm() {
  return (
    <ActionForm action={updatePassword}>
      <PasswordInput label="Password baru (min. 8 karakter)" autoComplete="new-password" />
      <SubmitButton>Simpan password</SubmitButton>
    </ActionForm>
  );
}
