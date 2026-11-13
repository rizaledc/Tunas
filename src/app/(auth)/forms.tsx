"use client";
import Link from "next/link";
import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui";
import { EmailField, NewPasswordField, PhoneField } from "@/components/fields";
import { Icon } from "@/components/icons";
import { completeGoogleProfile, loginAdmin, loginParent, register, requestReset, signInWithGoogle, updatePassword, verifyMfa } from "./actions";

function PasswordInput({ name = "password", label = "Password", autoComplete = "current-password" }: { name?: string; label?: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input id={name} name={name} type={show ? "text" : "password"} required autoComplete={autoComplete} className="input pr-20" />
        <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-bold text-hijau-700">
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
          <Link href="/lupa-password" className="font-bold text-hijau-600">
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

function ConsentBox({ consentText, consentVersion }: { consentText: string; consentVersion: string }) {
  return (
    <>
      <details className="rounded-xl bg-gray-50 p-3 text-sm">
        <summary className="cursor-pointer font-bold">Baca persetujuan data (versi {consentVersion})</summary>
        <p className="mt-2 whitespace-pre-line text-ink-soft">{consentText}</p>
        <Link href="/privasi" className="mt-2 inline-block font-bold text-hijau-600" target="_blank">
          Kebijakan privasi lengkap
        </Link>
      </details>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 accent-hijau-600" />
        <span>Saya sudah membaca dan menyetujui penyimpanan serta pemakaian data seperti dijelaskan di atas.</span>
      </label>
    </>
  );
}

function InviteField({ code }: { code?: string }) {
  return (
    <div>
      <label className="label" htmlFor="kode">
        Kode undangan
      </label>
      <input
        id="kode"
        name="kode"
        required
        defaultValue={code}
        autoCapitalize="characters"
        maxLength={12}
        pattern="[A-Za-z0-9]{6,12}"
        title="6–12 huruf atau angka"
        onInput={(e) => (e.currentTarget.value = e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
        className="input font-mono tracking-widest uppercase"
        placeholder="ABCD2345"
      />
    </div>
  );
}

function RtField() {
  return (
    <div>
      <label className="label" htmlFor="rt">
        RT <span className="font-normal text-ink-soft">(opsional)</span>
      </label>
      <input id="rt" name="rt" inputMode="numeric" maxLength={3} pattern="\d{1,3}" title="Hanya angka" onInput={(e) => (e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ""))} className="input w-28" placeholder="7" />
    </div>
  );
}

function NameField({ defaultValue }: { defaultValue?: string }) {
  return (
    <div>
      <label className="label" htmlFor="nama">
        Nama orang tua
      </label>
      <input id="nama" name="nama" required minLength={2} maxLength={80} defaultValue={defaultValue} autoComplete="name" className="input" placeholder="Contoh: Siti Aminah" />
    </div>
  );
}

/** Tombol "Lanjutkan dengan Google" (logo Google resmi sesuai pedoman merek Google). */
export function GoogleButton({ code, label = "Lanjutkan dengan Google" }: { code?: string; label?: string }) {
  return (
    <form action={signInWithGoogle}>
      {code !== undefined && <input type="hidden" name="kode" value={code} />}
      <SubmitButton className="btn w-full border border-gray-300 bg-paper text-ink hover:bg-gray-50" pendingText="Membuka Google…">
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        {label}
      </SubmitButton>
    </form>
  );
}

export function OrDivider() {
  return (
    <div className="my-4 flex items-center gap-3 text-xs font-semibold text-ink-soft">
      <span className="h-px flex-1 bg-gray-200" /> atau <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export function RegisterForm({ consentText, consentVersion, code }: { consentText: string; consentVersion: string; code?: string }) {
  return (
    <ActionForm action={register}>
      <InviteField code={code} />
      <NameField />
      <PhoneField hint="Hanya angka. Dipakai untuk masuk dan dihubungi pengurus." />
      <EmailField hint="Dipakai untuk masuk dan memulihkan password jika lupa." />
      <RtField />
      <NewPasswordField />
      <ConsentBox consentText={consentText} consentVersion={consentVersion} />
      <SubmitButton pendingText="Mendaftarkan…">Daftar</SubmitButton>
    </ActionForm>
  );
}

export function CompleteGoogleForm({ consentText, consentVersion, code, nama, email }: { consentText: string; consentVersion: string; code?: string; nama: string; email: string }) {
  return (
    <ActionForm action={completeGoogleProfile}>
      <p className="flex items-center gap-2 rounded-xl bg-hijau-50 p-3 text-sm text-hijau-700">
        <Icon name="check-circle" /> Akun Google terhubung: <strong className="break-all">{email}</strong>
      </p>
      <InviteField code={code} />
      <NameField defaultValue={nama} />
      <PhoneField hint="Hanya angka. Agar pengurus komunitas dapat menghubungi Anda." />
      <RtField />
      <ConsentBox consentText={consentText} consentVersion={consentVersion} />
      <SubmitButton pendingText="Menyimpan…">Selesaikan Pendaftaran</SubmitButton>
    </ActionForm>
  );
}

export function ResetRequestForm() {
  return (
    <ActionForm action={requestReset}>
      <EmailField label="Email terdaftar" />
      <SubmitButton pendingText="Mengirim…">Kirim tautan reset</SubmitButton>
    </ActionForm>
  );
}

export function NewPasswordForm() {
  return (
    <ActionForm action={updatePassword}>
      <NewPasswordField label="Password baru" />
      <SubmitButton>Simpan password</SubmitButton>
    </ActionForm>
  );
}
