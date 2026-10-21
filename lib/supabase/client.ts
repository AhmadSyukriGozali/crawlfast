import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type BrowserClient = ReturnType<typeof createSupabaseClient>;

let browserClient: BrowserClient | undefined;

export function createBrowserSupabaseClient(): BrowserClient {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase public environment variables are missing.");
  }

  browserClient = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });

  return browserClient;
}
