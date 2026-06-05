import { createClient } from "@supabase/supabase-js";

// Creates a fresh Supabase client per server-component request.
// Do NOT use the lib/supabase.js singleton in server components —
// that is a browser singleton and is not safe for concurrent SSR requests.
export function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
