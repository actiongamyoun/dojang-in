import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 서버 전용 클라이언트 (service_role) — 클라이언트 컴포넌트에서 import 금지
export function getServerSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
