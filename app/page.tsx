import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TodoApp, { type Todo } from "./todo-app";

export default async function Home() {
  const supabase = await createClient();

  // proxy でも保護しているが、念のためサーバー側でも確認（多層防御）。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RLS により自分の TODO だけが返る。
  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <TodoApp initialTodos={(todos as Todo[]) ?? []} userEmail={user.email!} />
  );
}
