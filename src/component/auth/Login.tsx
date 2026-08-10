"use client";

import { useAuth } from "@/src/hooks/useAuth";

export function Login() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return <span className="w-16" />;
  }

  if (!user) {
    return (
      <button
        onClick={login}
        className="cursor-pointer text-primary hover:text-white"
      >
        로그인
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-400">
        {user.user_metadata?.name ?? "솔샇러"}
      </span>
      <button
        onClick={logout}
        className="cursor-pointer text-primary hover:text-white"
      >
        로그아웃
      </button>
    </div>
  );
}