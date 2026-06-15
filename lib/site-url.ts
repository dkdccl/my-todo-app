// アプリの「絶対URL」ベースを返すヘルパー。
//
// Supabase の emailRedirectTo / OAuth の redirectTo には必ず絶対URLを渡す必要がある。
// 相対パス（例: "/auth/callback"）や、パスを含んだ値（例: ".../auth/callback"）を
// そのまま使うと、最終的なリダイレクトURLが壊れて GoTrue が
//   "Invalid path specified in request URL"
// を返し、signup / signin が失敗する。
//
// そのため、ここでは入力が何であれ「オリジンだけ（scheme://host[:port]）」に正規化し、
// パス・クエリ・ハッシュ・末尾スラッシュ・前後の空白を取り除く。
function rawSiteURL(): string {
  return (
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
      : "https://my-todo-app-snowy-tau.vercel.app")
  );
}

// アプリの絶対URLの「オリジン」を返す。常に scheme://host[:port] のみ。
export function getSiteURL(): string {
  // env はダッシュボードからのコピペで前後に空白や改行が混ざることがある。
  let value = rawSiteURL().trim();

  // プロトコルが無ければ https を補う（URL のパースを成功させるため）。
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  // URL としてパースできれば origin だけを採用する。
  // これにより NEXT_PUBLIC_SITE_URL に誤って "/auth/callback" のような
  // パスを含めてしまっても、二重パス（.../auth/callback/auth/callback）にならない。
  try {
    return new URL(value).origin;
  } catch {
    // パースに失敗した場合は、せめて末尾スラッシュだけ落として返す。
    return value.replace(/\/+$/, "");
  }
}

// メール確認 / OAuth のコールバック用の絶対URLを返す。
// 必ず「オリジン + /auth/callback」の一意なパスになる。
export function getCallbackURL(): string {
  return `${getSiteURL()}/auth/callback`;
}
