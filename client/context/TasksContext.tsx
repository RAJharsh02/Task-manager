import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string | null; // user id
  createdAt: string;
  updatedAt: string;
}

interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface TasksContextValue {
  createTask: (input: Omit<Task, "id" | "createdAt" | "updatedAt" | "status"> & { status?: TaskStatus }) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => Promise<Task | null>;
  listTasks: (opts: { priority?: TaskPriority; page?: number; pageSize?: number }) => Promise<Paged<Task>>;
}

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

const TASKS_KEY = "tm_tasks";

function uid(prefix = "task"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function loadTasks(): Task[] {
  const raw = localStorage.getItem(TASKS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

function saveTasks(list: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(list));
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const createTask = useCallback(async (input: Omit<Task, "id" | "createdAt" | "updatedAt" | "status"> & { status?: TaskStatus }) => {
    await sleep(350);
    const now = new Date().toISOString();
    const task: Task = {
      id: uid("task"),
      status: input.status ?? "pending",
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    const list = [...loadTasks(), task];
    saveTasks(list);
    return task;
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
    await sleep(250);
    const list = loadTasks();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Task not found");
    const now = new Date().toISOString();
    const updated = { ...list[idx], ...updates, updatedAt: now } as Task;
    list[idx] = updated;
    saveTasks(list);
    return updated;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await sleep(200);
    const list = loadTasks().filter((t) => t.id !== id);
    saveTasks(list);
  }, []);

  const getTask = useCallback(async (id: string) => {
    await sleep(200);
    const list = loadTasks();
    const t = list.find((x) => x.id === id) || null;
    if (!t) return null;
    if (user?.role !== "admin" && t.assignedTo && user && t.assignedTo !== user.id) {
      return null;
    }
    return t;
  }, [user]);

  const listTasks = useCallback(async (opts: { priority?: TaskPriority; page?: number; pageSize?: number }) => {
    await sleep(300);
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 5;
    let list = loadTasks();

    // Access control: non-admin users only see their tasks
    if (user && user.role !== "admin") {
      list = list.filter((t) => t.assignedTo === user.id);
    }

    if (opts.priority) {
      list = list.filter((t) => t.priority === opts.priority);
    }

    // Sort: nearest due date first, then status
    list.sort((a, b) => (a.dueDate.localeCompare(b.dueDate)) || a.status.localeCompare(b.status));

    const total = list.length;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);
    return { items, total, page, pageSize };
  }, [user]);

  const value = useMemo<TasksContextValue>(() => ({ createTask, updateTask, deleteTask, getTask, listTasks }), [createTask, updateTask, deleteTask, getTask, listTasks]);

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
