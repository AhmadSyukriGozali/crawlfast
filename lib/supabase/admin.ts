import "server-only";

import { createClient } from "@supabase/supabase-js";

function readEnv() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  let parsed: URL;

  try {
    parsed = new URL(supabaseUrl);
  } catch {
    throw new Error("SUPABASE_URL is not a valid URL.");
  }

  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
    throw new Error("SUPABASE_URL must use HTTPS outside local development.");
  }

  return { supabaseUrl, supabaseSecretKey };
}

export function createAdminClient() {
  const { supabaseUrl, supabaseSecretKey } = readEnv();

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
