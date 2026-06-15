import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 確認メール（PKCE フロー）のコールバック。
// Supabase は emailRedirectTo に ?code=... を付けてここへ戻してくる。
// その code をセッションへ交換してから目的のページへリダイレクトする。
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // ログイン後の遷移先（無ければトップ）。
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Vercel など本番ではロードバランサ経由になるため
      // x-forwarded-host を優先して正しい本番ホストにリダイレクトする。
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // code が無い / 交換に失敗した場合はログインへ。
  return NextResponse.redirect(`${origin}/login?error=auth-callback`);
}
