"use client";
import { useState, useTransition } from "react";
import { savePushSubscription, setReminder } from "../../actions";

function urlB64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushToggle({ enabled }: { enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  async function enable() {
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !key) {
      setMsg("HP/browser ini belum mendukung notifikasi. Pasang aplikasi ke layar utama lalu coba lagi.");
      return false;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setMsg("Izin notifikasi ditolak. Aktifkan lewat pengaturan browser.");
      return false;
    }
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(key) }));
    const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
    await savePushSubscription(json);
    return true;
  }

  return (
    <div>
      <label className="flex items-center justify-between gap-3">
        <span>
          <span className="block font-bold">Pengingat mencatat harian</span>
          <span className="text-sm text-ink-soft">Notifikasi sore hari jika belum ada catatan.</span>
        </span>
        <input
          type="checkbox"
          className="h-7 w-12 accent-marun-600"
          checked={on}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.checked;
            start(async () => {
              setMsg("");
              if (next && !(await enable())) return;
              await setReminder(next);
              setOn(next);
              if (next) setMsg("Pengingat aktif di perangkat ini.");
            });
          }}
        />
      </label>
      {msg && <p className="mt-2 text-sm text-ink-soft">{msg}</p>}
    </div>
  );
}
