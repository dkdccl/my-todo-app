import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 では middleware は proxy にリネームされた（機能は同じ）。
// Supabase のセッション管理をここで行う。
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 以下を除く全パスで実行:
     * - _next/static, _next/image（静的アセット）
     * - favicon.ico や画像ファイル
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
