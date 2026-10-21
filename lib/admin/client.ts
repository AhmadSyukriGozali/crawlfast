"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function getAdminAccessToken(): Promise<string | null> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) return null;

  return data.session.access_token;
}

export async function adminFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response | null> {
  const token = await getAdminAccessToken();

  if (!token) return null;

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function signOutAdmin(): Promise<void> {
  const supabase = createBrowserSupabaseClient();
  await supabase.auth.signOut();
}
