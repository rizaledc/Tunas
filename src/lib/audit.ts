import "server-only";
import { createAdminClient } from "./supabase/admin";

export async function audit(actorId: string | null, action: string, target?: string, detail?: Record<string, unknown>) {
  try {
    await createAdminClient().from("audit_logs").insert({ actor_id: actorId, action, target: target ?? null, detail: detail ?? null });
  } catch {
    /* logging tidak boleh menggagalkan aksi */
  }
}

export async function logError(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[${context}]`, message);
  await audit(null, "system.error", context, { message: message.slice(0, 1000) });
}
