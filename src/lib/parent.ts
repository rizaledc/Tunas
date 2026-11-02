import "server-only";
import { cache } from "react";
import { createClient } from "./supabase/server";
import { getActiveChildId } from "./auth";
import type { CategoryRow } from "./indicators";

export type Child = { id: string; nickname: string; birth_year: number; school_level: string; pin_hash: string | null };

export const getChildren = cache(async (familyId: string): Promise<Child[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("children").select("id,nickname,birth_year,school_level,pin_hash").eq("family_id", familyId).order("created_at");
  return (data ?? []) as Child[];
});

export async function getActiveChild(familyId: string): Promise<{ children: Child[]; child: Child | null }> {
  const children = await getChildren(familyId);
  const id = await getActiveChildId();
  return { children, child: children.find((c) => c.id === id) ?? children[0] ?? null };
}

export const getCategories = cache(async (includeInactive = false): Promise<Array<CategoryRow & { active: boolean; sort: number }>> => {
  const supabase = await createClient();
  let q = supabase.from("categories").select("id,type,name,icon,active,sort").order("sort");
  if (!includeInactive) q = q.eq("active", true);
  const { data } = await q;
  return (data ?? []) as Array<CategoryRow & { active: boolean; sort: number }>;
});

export async function getAgreement(childId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("agreements").select("*").eq("child_id", childId).maybeSingle();
  return data as { id: string; target_screen_min: number; no_device_hours: string | null; notes: string | null; updated_at: string } | null;
}
