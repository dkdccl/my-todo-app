"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? "送信に失敗しました。時間をおいてお試しください。");
        return;
      }

      // 送信成功して初めて完了画面に切り替える。
      setSubmitted(true);
    } catch {
      setError("ネットワークエラーが発生しました。接続を確認してください。");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-24 dark:bg-black">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          お問い合わせ
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          ご質問・ご要望は下記フォームよりお気軽にお送りください。
        </p>

        {submitted ? (
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 px-6 py-8 text-center dark:border-green-900 dark:bg-green-950">
            <p className="text-lg font-medium text-green-800 dark:text-green-300">
              お問い合わせありがとうございます。
            </p>
            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
              内容を確認のうえ、担当者よりご連絡いたします。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                お名前
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="message"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                お問い合わせ内容
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100"
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="mt-2 flex h-12 items-center justify-center rounded-full bg-foreground px-5 font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-[#ccc]"
            >
              {sending ? "送信中..." : "送信する"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
