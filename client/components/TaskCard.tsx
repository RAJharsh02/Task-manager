import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskPriority } from "@/context/TasksContext";
import { useTasks } from "@/context/TasksContext";
import { useNavigate } from "react-router-dom";

function statusColor(status: Task["status"]) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
}

export function TaskCard({ task, onChanged, onGlobalChange }: { task: Task; onChanged?: () => void; onGlobalChange?: () => void }) {
  const { updateTask } = useTasks();
  const nav = useNavigate();

  const due = new Date(task.dueDate).toLocaleDateString();

  async function markCompleted() {
    await updateTask(task.id, { status: "completed" });
    onChanged?.();
    onGlobalChange?.();
  }

  async function changePriority(p: TaskPriority) {
    await updateTask(task.id, { priority: p });
    onChanged?.();
    onGlobalChange?.();
  }

  return (
    <div className="w-full rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-sm leading-6 break-words line-clamp-2">{task.title}</div>
          <div className="text-xs text-muted-foreground mt-1">Due {due}</div>
        </div>
        <Badge className={statusColor(task.status)}>{task.status}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-muted-foreground">Priority</span>
          <Select value={task.priority} onValueChange={(v) => changePriority(v as TaskPriority)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 ml-auto sm:pl-4">
          {task.status !== "completed" && (
            <Button size="sm" variant="secondary" onClick={markCompleted}>
              Mark Completed
            </Button>
          )}
          <Button size="sm" onClick={() => nav(`/tasks/${task.id}`)}>Details</Button>
        </div>
      </div>
    </div>
  );
}
