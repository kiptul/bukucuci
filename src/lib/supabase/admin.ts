import { createClient } from "@supabase/supabase-js";

// KHUSUS kode server (cron reminder). Memakai secret key sehingga melewati RLS.
// JANGAN PERNAH diimpor dari komponen client.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
