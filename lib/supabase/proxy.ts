import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseUrl, supabaseAnonKey } from "./url";

// proxy（旧 middleware）からセッションを更新し、認証状態に応じてリダイレクトする
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() を呼ぶことでトークンが必要に応じてリフレッシュされる。
  // getClaims/getSession ではなく getUser を使うのが推奨。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // 公開ページ（未ログインでもアクセス可）。
  // 認証ページに加え、既存のデモページもログイン不要のままにしておく。
  // /api/contact は公開の問い合わせフォームから叩くため、未ログインでも許可する
  // （ここを保護すると POST が /login へリダイレクトされ、API に届かない）。
  const publicPaths = ["/about", "/contact", "/api/contact"];
  // /auth/* はメール確認のコールバック。未ログイン状態で踏むため必ず公開にする
  // （ここを保護すると code 交換前に /login へ飛ばされて確認が完了しない）。
  const isAuthCallback = pathname.startsWith("/auth");
  const isPublic = isAuthPage || isAuthCallback || publicPaths.includes(pathname);

  // 未ログインで保護ページ（/ など）にアクセス → /login へ
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ログイン済みで /login・/signup にアクセス → / へ
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 重要: supabaseResponse をそのまま返すこと（Cookie の同期を保つため）
  return supabaseResponse;
}
