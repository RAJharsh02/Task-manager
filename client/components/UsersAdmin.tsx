import React, { useState } from "react";
import { useAuth, Role, User } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function UserRow({ user, onToggleRole }: { user: User; onToggleRole: () => void }) {
  const { updateUser, deleteUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState(user.password);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateUser(user.id, { username, password });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex flex-1 items-center gap-3">
        {editing ? (
          <div className="grid gap-2 sm:grid-cols-2 w-full max-w-xl">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="font-medium">{user.username}</div>
            <div className="text-xs text-muted-foreground">{user.role}</div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={onToggleRole}>Make {user.role === "admin" ? "User" : "Admin"}</Button>
            <Button size="sm" onClick={() => setEditing(true)}>Edit</Button>
            <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>Delete</Button>
          </>
        )}
      </div>
    </div>
  );
}

export function UsersAdmin() {
  const { users, createUser, deleteUser, updateUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createUser({ username, password, role });
      setUsername("");
      setPassword("");
      setRole("user");
    } catch (err: any) {
      setError(err?.message || "Unable to add user");
    } finally {
      setSaving(false);
    }
  }

  async function toggleRole(u: User) {
    const next: Role = u.role === "admin" ? "user" : "admin";
    await updateUser(u.id, { role: next });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addUser} className="grid gap-3 sm:grid-cols-4 items-end">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Username</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="username" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="password" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-4 flex justify-between items-center">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add User"}</Button>
        </div>
      </form>
      <div className="rounded-lg border divide-y">
        {users.map((u) => (
          <UserRow key={u.id} user={u} onToggleRole={() => toggleRole(u)} />
        ))}
      </div>
    </div>
  );
}
