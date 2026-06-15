import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサービスについて",
  description: "このサービスについての簡単な説明ページです。",
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-24 dark:bg-black">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          このサービスについて
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          このサービスは、日々の作業をもっとシンプルに、もっと快適にする
          ために作られました。必要な機能だけを使いやすくまとめ、誰でも
          かんたんに始められることを目指しています。
        </p>
      </div>
    </main>
  );
}
