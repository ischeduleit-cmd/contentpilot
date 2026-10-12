"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";

export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
  if (!session?.access_token) throw new Error("Your sign-in expired. Please sign in again.");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);
  return fetch(input, { ...init, headers });
}
