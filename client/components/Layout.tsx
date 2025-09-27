import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-sky-50">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500" />
            <div className="font-semibold">Task Manager</div>
          </a>
          {user && (
            <div className="flex items-center gap-3 text-sm">
              <div className="text-muted-foreground">Signed in as <span className="font-medium">{user.username}</span> ({user.role})</div>
              <Button variant="secondary" size="sm" onClick={logout}>Logout</Button>
            </div>
          )}
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-8 space-y-8">{children}</main>
      <footer className="border-t bg-white/80">
        <div className="container mx-auto px-4 h-12 flex items-center justify-center text-sm text-muted-foreground">
          Made by Harsh Raj
        </div>
      </footer>
    </div>
  );
}
