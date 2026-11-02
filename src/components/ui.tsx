"use client";
import { Icon } from "@/components/icons";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export type ActionState = { ok?: boolean; error?: string; message?: string; data?: Record<string, unknown> } | null;
export type FormAction = (prev: ActionState, fd: FormData) => Promise<ActionState>;

export function SubmitButton({ children, className, pendingText = "Menyimpan…", ...rest }: { children: ReactNode; className?: string; pendingText?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
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
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (resetOnSuccess && state?.ok) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form
      ref={ref}
      action={formAction}
      className={className ?? "space-y-4"}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {typeof children === "function" ? children(state) : children}
      <Alert state={state} />
    </form>
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
