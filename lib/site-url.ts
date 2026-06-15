// アプリの「絶対URL」ベースを返すヘルパー。
//
// Supabase の emailRedirectTo / OAuth の redirectTo には必ず絶対URLを渡す必要がある。
// 相対パス（例: "/auth/callback"）を渡すと GoTrue が
//   "Invalid path specified in request URL"
// を返して signup / signin が失敗する。
export function getSiteURL(): string {
  let url =
    // 本番URLを固定したい場合に使う（任意）。例: https://my-todo-app-snowy-tau.vercel.app
    process.env.NEXT_PUBLIC_SITE_URL ??
    // Vercel が自動で注入する本番/プレビューのホスト名。
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined) ??
    // クライアント実行時は現在のオリジンを使う（環境に自動追従）。
    (typeof window !== "undefined" ? window.location.origin : undefined) ??
    // サーバー側で env が無い場合のフォールバック。
    // 開発中は localhost、それ以外は Vercel 本番URLに合わせる。
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://my-todo-app-snowy-tau.vercel.app");

  // プロトコルが無ければ https を補う。
  if (!/^https?:\/\//.test(url)) {
    url = `https://${url}`;
  }
  // 末尾スラッシュを除去して正規化（"//auth/callback" を防ぐ）。
  url = url.replace(/\/+$/, "");

  return url;
}
