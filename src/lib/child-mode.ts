import "server-only";
import { cookies } from "next/headers";
import { sign, unsign } from "./crypto";

export const CHILD_MODE_COOKIE = "sa_child_mode";

export async function getChildModeId(): Promise<string | null> {
  return unsign((await cookies()).get(CHILD_MODE_COOKIE)?.value);
}

export async function setChildMode(childId: string) {
  (await cookies()).set(CHILD_MODE_COOKIE, sign(childId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearChildMode() {
  (await cookies()).delete(CHILD_MODE_COOKIE);
}
