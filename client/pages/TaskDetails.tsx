import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTasks, Task } from "@/context/TasksContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "@/components/TaskForm";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const { getTask, deleteTask } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      const t = await getTask(id);
      if (mounted) {
        setTask(t);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, getTask]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!task) return <div className="p-8">Task not found or access denied.</div>;

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Task Details</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>Delete</Button>
          <Button onClick={() => nav(-1)}>Back</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Title</div>
            <div className="font-medium">{task.title}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Due Date</div>
            <div className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Priority</div>
            <div className="font-medium capitalize">{task.priority}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="font-medium capitalize">{task.status}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-sm text-muted-foreground">Description</div>
            <div className="mt-1 whitespace-pre-wrap">{task.description}</div>
          </div>
          {user?.role === "admin" && (
            <div>
              <div className="text-sm text-muted-foreground">Assigned To</div>
              <div className="font-medium">{task.assignedTo ?? "Unassigned"}</div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm initial={task} onSaved={(t) => { setTask(t); setEditing(false); }} />
          <DialogFooter />
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { await deleteTask(task.id); setConfirmOpen(false); nav("/"); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
