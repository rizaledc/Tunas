"use client";
import { Icon } from "@/components/icons";
import { createContext, startTransition, useActionState, useContext, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export type ActionState = { ok?: boolean; error?: string; message?: string; data?: Record<string, unknown> } | null;
export type FormAction = (prev: ActionState, fd: FormData) => Promise<ActionState>;

const PendingContext = createContext(false);

export function SubmitButton({ children, className, pendingText = "Menyimpan…", ...rest }: { children: ReactNode; className?: string; pendingText?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const status = useFormStatus();
  const ctxPending = useContext(PendingContext);
  const pending = status.pending || ctxPending;
  return (
    <button type="submit" disabled={pending} className={cn(className ?? "btn-primary w-full")} {...rest}>
      {pending ? pendingText : children}
    </button>
  );
}

export function Alert({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error)
    return (
      <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-merah-600">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p role="status" className="rounded-xl bg-daun-50 px-3 py-2 text-sm font-semibold text-daun-700">
        {state.message}
      </p>
    );
  return null;
}

/** Formulir dengan server action + pesan hasil. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  confirm,
}: {
  action: FormAction;
  children: ReactNode | ((state: ActionState) => ReactNode);
  className?: string;
  resetOnSuccess?: boolean;
  confirm?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (resetOnSuccess && state?.ok) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <PendingContext value={pending}>
      <form
        ref={ref}
        action={formAction}
        className={className ?? "space-y-4"}
        onSubmit={(e) => {
          const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          // Tombol dengan formAction sendiri (mis. "Kembalikan ke bawaan") ditangani React seperti biasa.
          if (submitter?.hasAttribute("formaction")) return;
          e.preventDefault();
          if (confirm && !window.confirm(confirm)) return;
          // Kirim manual agar React tidak mengosongkan isian form setelah aksi selesai
          // (isian tetap ada saat validasi gagal). Reset hanya bila resetOnSuccess.
          const fd = new FormData(e.currentTarget, submitter);
          startTransition(() => formAction(fd));
        }}
      >
        {typeof children === "function" ? children(state) : children}
        <Alert state={state} />
      </form>
    </PendingContext>
  );
}

export function ConfirmButton({ children, message, className }: { children: ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className ?? "btn-ghost btn-sm text-merah-600"}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function PrintButton({ label = "Cetak" }: { label?: string }) {
  return (
    <button type="button" className="btn-primary no-print" onClick={() => window.print()}>
      <Icon name="printer" className="h-5 w-5" /> {label}
    </button>
  );
}

/** Tombol "kembalikan ke bawaan" di dalam form lain, dengan konfirmasi. */
export function ResetToDefault({ action, label = "Kembalikan ke bawaan" }: { action: (fd: FormData) => Promise<void>; label?: string }) {
  return (
    <button
      type="submit"
      formAction={action}
      formNoValidate
      className="btn-ghost btn-sm ml-2 text-ink-soft"
      onClick={(e) => {
        if (!window.confirm("Kembalikan isi bagian ini ke teks bawaan? Perubahan Anda akan hilang.")) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
