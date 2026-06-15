import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./url";

// ブラウザ（Client Component）用の Supabase クライアント
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
