"use client";

import { useAuth } from "@/src/hooks/useAuth";
import UserMenu from "./UserMenu";

export default function Login() {
  const { user, loading, login } = useAuth();

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

  return <UserMenu />;
}