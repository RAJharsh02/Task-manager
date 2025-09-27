import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTasks, TaskPriority, Task } from "@/context/TasksContext";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/TaskForm";
import { TaskCard } from "@/components/TaskCard";
import { UsersAdmin } from "@/components/UsersAdmin";

function Section({
  title,
  color,
  priority,
  reloadAt,
  onAnyChange,
}: {
  title: string;
  color: string;
  priority: TaskPriority;
  reloadAt?: number;
  onAnyChange?: () => void;
}) {
  const { listTasks } = useTasks();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const pageSize = 5;

  async function load() {
    setLoading(true);
    const res = await listTasks({ priority, page, pageSize });
    setItems(res.items);
    setTotal(res.total);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, reloadAt]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex min-h-[480px] max-h-[70vh] flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className={`px-4 py-3 rounded-t-2xl ${color} text-white font-semibold`}>{title}</div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {loading && (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-md bg-muted" />
            ))}
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="text-sm text-muted-foreground">No tasks.</div>
        )}
        {!loading && items.map((t) => <TaskCard key={t.id} task={t} onChanged={load} onGlobalChange={onAnyChange} />)}
      </div>
      <div className="border-t px-4 py-2 flex items-center justify-between bg-white/60">
        <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <Button size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}

function LoginView() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const ok = await login(username.trim(), password);
    setLoading(false);
    if (!ok) setError("Invalid credentials");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-sky-50">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-sky-600">Task Manager</div>
            <div className="text-sm text-muted-foreground mt-1">Sign in to continue</div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input className="w-full h-10 rounded-md border px-3" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input className="w-full h-10 rounded-md border px-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
          </form>
        </div>
      </div>
      <footer className="border-t bg-white/80">
        <div className="container mx-auto px-4 h-12 flex items-center justify-center text-sm text-muted-foreground">Made by Harsh Raj</div>
      </footer>
    </div>
  );
}

import { Layout } from "@/components/Layout";

export default function Index() {
  const { user } = useAuth();
  const [reloadAt, setReloadAt] = useState(0);

  if (!user) return <LoginView />;

  return (
    <Layout>
      <section className="rounded-2xl bg-white p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create a Task</h2>
        </div>
        <TaskForm onCreated={() => setReloadAt((v) => v + 1)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Section title="Low Priority" color="bg-emerald-600" priority="low" reloadAt={reloadAt} onAnyChange={() => setReloadAt((v) => v + 1)} />
        <Section title="Medium Priority" color="bg-amber-500" priority="medium" reloadAt={reloadAt} onAnyChange={() => setReloadAt((v) => v + 1)} />
        <Section title="High Priority" color="bg-rose-600" priority="high" reloadAt={reloadAt} onAnyChange={() => setReloadAt((v) => v + 1)} />
      </section>

      {user.role === "admin" && (
        <section className="rounded-2xl bg-white p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">User Management</h2>
            <div className="text-sm text-muted-foreground">Admin only</div>
          </div>
          <UsersAdmin />
        </section>
      )}
    </Layout>
  );
}
