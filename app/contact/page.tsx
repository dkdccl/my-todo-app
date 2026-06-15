"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
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

            <button
              type="submit"
              className="mt-2 flex h-12 items-center justify-center rounded-full bg-foreground px-5 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              送信する
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
