import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Role = "admin" | "user";

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (u: Omit<User, "id">) => Promise<User>;
  updateUser: (id: string, updates: Partial<Omit<User, "id">>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  reloadUsers: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = "tm_users";
const SESSION_KEY = "tm_session";

function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function loadUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

function saveUsers(list: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function ensureDefaultAdmin() {
  let list = loadUsers();
  if (list.length === 0) {
    const admin: User = {
      id: uid("user"),
      username: "admin",
      password: "admin",
      role: "admin",
    };
    list = [admin];
    saveUsers(list);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    ensureDefaultAdmin();
    const raw = localStorage.getItem(SESSION_KEY);
    const list = loadUsers();
    setUsers(list);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { userId: string };
        const current = list.find((u) => u.id === parsed.userId) || null;
        setUser(current);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const persistSession = useCallback((u: User | null) => {
    if (!u) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: u.id }));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const list = loadUsers();
    const uname = username.trim().toLowerCase();
    const pwd = password; // passwords are case sensitive
    const found = list.find((u) => u.username.trim().toLowerCase() === uname && u.password === pwd);
    if (found) {
      setUser(found);
      persistSession(found);
      setUsers(list);
      return true;
    }
    return false;
  }, [persistSession]);

  const logout = useCallback(() => {
    setUser(null);
    persistSession(null);
  }, [persistSession]);

  const createUser = useCallback(async (u: Omit<User, "id">) => {
    const list = loadUsers();
    const uname = u.username.trim();
    if (!uname || !u.password) throw new Error("Username and password are required");
    const exists = list.some((x) => x.username.trim().toLowerCase() === uname.toLowerCase());
    if (exists) throw new Error("Username already exists");
    const next: User = { ...u, username: uname, id: uid("user") };
    const updated = [...list, next];
    saveUsers(updated);
    setUsers(updated);
    return next;
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<Omit<User, "id">>) => {
    const list = loadUsers();
    const idx = list.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("User not found");
    const updated = { ...list[idx], ...updates } as User;
    list[idx] = updated;
    saveUsers(list);
    setUsers(list);
    if (user && user.id === id) {
      setUser(updated);
      persistSession(updated);
    }
    return updated;
  }, [user, persistSession]);

  const deleteUser = useCallback(async (id: string) => {
    let list = loadUsers();
    list = list.filter((u) => u.id !== id);
    saveUsers(list);
    setUsers(list);
    if (user && user.id === id) {
      setUser(null);
      persistSession(null);
    }
  }, [user, persistSession]);

  const reloadUsers = useCallback(() => setUsers(loadUsers()), []);

  const value = useMemo<AuthContextValue>(() => ({ user, users, login, logout, createUser, updateUser, deleteUser, reloadUsers }), [user, users, login, logout, createUser, updateUser, deleteUser, reloadUsers]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
