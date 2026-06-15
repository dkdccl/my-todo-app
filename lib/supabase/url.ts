// Supabase クライアントに渡す URL / キーを正規化するヘルパー。
//
// NEXT_PUBLIC_SUPABASE_URL は「プロジェクトURLのみ」を指定する必要がある。
//   正: https://xxxx.supabase.co
//   誤: https://xxxx.supabase.co/rest/v1/   ← /rest/v1 や /auth/v1、末尾スラッシュ付き
//
// 誤った値を渡すと supabase-js が組み立てるパスが壊れ（例: /rest/v1/auth/v1/signup）、
// PostgREST が PGRST125 "Invalid path specified in request URL" を返して
// signup / login が失敗する。
//
// ここで origin だけ（scheme://host[:port]）に正規化し、その種の設定ミスを吸収する。
export function supabaseUrl(): string {
  // env はコピペで前後に空白や末尾パスが混ざることがあるので trim してから扱う。
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  try {
    return new URL(raw).origin;
  } catch {
    // URL としてパースできない場合でも、せめて末尾スラッシュは落とす。
    return raw.replace(/\/+$/, "");
  }
}

export function supabaseAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
}
