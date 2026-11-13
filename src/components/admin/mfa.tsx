"use client";
import { Icon } from "@/components/icons";
import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/** Pendaftaran verifikasi dua langkah (TOTP) untuk superadmin. */
export function MfaSetup() {
  const supabase = createBrowserSupabase();
  const [factor, setFactor] = useState<{ id: string; status: string } | null>(null);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  async function refresh() {
    const { data } = await supabase.auth.mfa.listFactors();
    const f = data?.totp?.find((x) => x.status === "verified") ?? null;
    setFactor(f ? { id: f.id, status: f.status } : null);
  }
  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const f = data?.totp?.find((x) => x.status === "verified");
      setFactor(f ? { id: f.id, status: f.status } : null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (factor)
    return (
      <div className="space-y-2">
        <p className="flex items-center gap-2 font-bold text-hijau-700"><Icon name="shield" className="h-5 w-5" /> Verifikasi dua langkah aktif.</p>
        <button
          className="btn-danger btn-sm"
          onClick={async () => {
            if (!confirm("Nonaktifkan verifikasi dua langkah?")) return;
            const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
            setMsg(error ? error.message : "Dinonaktifkan.");
            refresh();
          }}
        >
          Nonaktifkan
        </button>
        {msg && <p className="text-sm">{msg}</p>}
      </div>
    );

  return (
    <div className="space-y-3">
      {!enroll ? (
        <button
          className="btn-green"
          onClick={async () => {
            const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `SAHABAT ANAK ${Date.now()}` });
            if (error || !data) return setMsg(error?.message ?? "Gagal");
            setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
          }}
        >
          Aktifkan verifikasi dua langkah
        </button>
      ) : (
        <>
          <p className="text-sm">Pindai kode QR dengan Google Authenticator / Authy, lalu masukkan 6 digit kodenya.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qr} alt="Kode QR TOTP" className="h-48 w-48 rounded-xl bg-paper p-2 ring-1 ring-gray-200" />
          <p className="font-mono text-xs break-all">Kunci manual: {enroll.secret}</p>
          <div className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} className="input w-40 text-center tracking-widest" placeholder="123456" />
            <button
              className="btn-green"
              onClick={async () => {
                const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enroll.id, code });
                if (error) return setMsg("Kode salah, coba lagi.");
                setEnroll(null);
                setMsg("Berhasil diaktifkan.");
                refresh();
              }}
            >
              Verifikasi
            </button>
          </div>
        </>
      )}
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
