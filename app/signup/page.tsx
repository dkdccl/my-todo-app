"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getCallbackURL } from "@/lib/site-url";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 【デバッグ】signUp() に実際に渡している emailRedirectTo の値と、
  // Supabase クライアントが使う base URL。画面とコンソールの両方に出して、
  // "Invalid path specified in request URL" の発生箇所を確定させる。
  const emailRedirectTo = getCallbackURL();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(未設定)";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // 送信前に実値をコンソールへ。DevTools → Console で確認できる。
    console.log("[signup] emailRedirectTo =", emailRedirectTo);
    console.log("[signup] NEXT_PUBLIC_SUPABASE_URL =", supabaseUrl);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 確認メールのリンクから戻ってくる先。必ず「絶対URL」を渡すこと。
        emailRedirectTo,
      },
    });

    if (error) {
      // エラーの全情報（message / name / status）をコンソールに出す。
      // これで「どこが Invalid path を返しているか」が一発で分かる。
      console.error("[signup] signUp error =", {
        message: error.message,
        name: error.name,
        status: (error as { status?: number }).status,
        full: error,
      });
      setError(
        `${error.message}` +
          ((error as { status?: number }).status
            ? `（status=${(error as { status?: number }).status}）`
            : "")
      );
      setLoading(false);
      return;
    }

    // メール確認が無効なら session が返るのでトップへ。
    // 有効な場合は session が null なので確認を促す。
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setMessage(
        "確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。"
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <h1 className="mb-1 text-2xl font-semibold text-zinc-50">新規登録</h1>
        <p className="mb-6 text-sm text-zinc-400">
          メールアドレスとパスワードで登録します。
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-zinc-300">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-300"
            >
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              placeholder="6文字以上"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>

        {/* 【デバッグ】signUp() に渡している実値を画面に表示。原因特定後に削除する。 */}
        <div className="mt-4 break-all rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-xs text-zinc-400">
          <p className="mb-1 font-medium text-zinc-300">デバッグ情報</p>
          <p>emailRedirectTo:</p>
          <p className="text-amber-400">{emailRedirectTo}</p>
          <p className="mt-1">supabaseUrl:</p>
          <p className="text-amber-400">{supabaseUrl}</p>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-400">
          すでにアカウントをお持ちの方は{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            ログイン
          </Link>
        </p>
      </div>
    </main>
  );
}
