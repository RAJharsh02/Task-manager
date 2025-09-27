import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks, TaskPriority, TaskStatus, Task } from "@/context/TasksContext";
import { useAuth } from "@/context/AuthContext";

export function TaskForm({
  onCreated,
  initial,
  onSaved,
}: {
  onCreated?: (task: Task) => void;
  initial?: Task;
  onSaved?: (task: Task) => void;
}) {
  const { createTask, updateTask } = useTasks();
  const { user, users } = useAuth();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate?.slice(0, 10) ?? "");
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? "medium");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "pending");
  const [assignedTo, setAssignedTo] = useState<string | null>(initial?.assignedTo ?? (user ? user.id : null));
  const [saving, setSaving] = useState(false);

  const isEdit = !!initial;
  const canAssign = user?.role === "admin";

  const selectableUsers = useMemo(() => users, [users]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (!isEdit) {
        const created = await createTask({
          title,
          description,
          dueDate: new Date(dueDate).toISOString(),
          priority,
          assignedTo: assignedTo ?? null,
          status: "pending",
        });
        onCreated?.(created);
        setTitle("");
        setDescription("");
        setDueDate("");
        setPriority("medium");
        setAssignedTo(user ? user.id : null);
      } else {
        const updated = await updateTask(initial!.id, {
          title,
          description,
          dueDate: new Date(dueDate).toISOString(),
          priority,
          status,
          assignedTo,
        });
        onSaved?.(updated);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Task title" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Describe the task" rows={4} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {canAssign && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Assign To</label>
            <Select value={assignedTo ?? undefined} onValueChange={(v) => setAssignedTo(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {selectableUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.username}{u.role === "admin" ? " (admin)" : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          {isEdit ? (saving ? "Saving..." : "Save Changes") : (saving ? "Creating..." : "Create Task")}
        </Button>
      </div>
    </form>
  );
}
