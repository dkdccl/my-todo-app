"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type Todo = {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
};

export default function TodoApp({
  initialTodos,
  userEmail,
}: {
  initialTodos: Todo[];
  userEmail: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setAdding(true);
    // user_id はログインユーザーの ID をセット（RLS の with check を満たす）。
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("todos")
      .insert({ title: trimmed, user_id: user.id })
      .select()
      .single();

    setAdding(false);
    if (error || !data) return;

    setTodos((prev) => [data as Todo, ...prev]);
    setTitle("");
  }

  async function toggleTodo(todo: Todo) {
    // 楽観的更新
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t
      )
    );
    const { error } = await supabase
      .from("todos")
      .update({ is_completed: !todo.is_completed })
      .eq("id", todo.id);

    // 失敗したら元に戻す
    if (error) {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, is_completed: todo.is_completed } : t
        )
      );
    }
  }

  async function deleteTodo(id: string) {
    const prev = todos;
    setTodos((p) => p.filter((t) => t.id !== id));
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) setTodos(prev); // 失敗時は復元
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const remaining = todos.filter((t) => !t.is_completed).length;

  return (
    <main className="flex min-h-screen items-start justify-center bg-zinc-950 px-4 py-16">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-50">TODO</h1>
            <p className="text-sm text-zinc-500">{userEmail}</p>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            ログアウト
          </button>
        </div>

        {/* 追加フォーム */}
        <form onSubmit={addTodo} className="mb-6 flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="新しいタスクを追加..."
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
          <button
            type="submit"
            disabled={adding || !title.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            追加
          </button>
        </form>

        {/* リスト */}
        <ul className="flex flex-col gap-2">
          {todos.length === 0 && (
            <li className="rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
              タスクはまだありません。
            </li>
          )}
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="group flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
            >
              <input
                type="checkbox"
                checked={todo.is_completed}
                onChange={() => toggleTodo(todo)}
                className="h-4 w-4 cursor-pointer accent-indigo-500"
              />
              <span
                className={`flex-1 text-sm ${
                  todo.is_completed
                    ? "text-zinc-500 line-through"
                    : "text-zinc-100"
                }`}
              >
                {todo.title}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-zinc-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                aria-label="削除"
              >
                削除
              </button>
            </li>
          ))}
        </ul>

        {todos.length > 0 && (
          <p className="mt-4 text-right text-xs text-zinc-500">
            残り {remaining} 件
          </p>
        )}
      </div>
    </main>
  );
}
