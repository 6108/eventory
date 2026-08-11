"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { useRouter } from "next/navigation";

export function Login() {
  const { user, loading, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 드롭다운 바깥 클릭하면 닫히게
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const nickname = user.user_metadata?.name ?? "My";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer text-sm text-primary hover:text-white"
      >
        {nickname}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-md border border-zinc-800 bg-zinc-900 py-1 shadow-lg z-50">
          <Link
            href={`/${eventId}/likes`}
            className="block px-4 py-2 text-sm text-primary hover:bg-zinc-800 hover:text-white"
            onClick={() => setOpen(false)}
          >
            좋아요 목록
          </Link>

          <Link
            href={`/${eventId}/mypage`}
            className="block px-4 py-2 text-sm text-primary hover:bg-zinc-800 hover:text-white"
            onClick={() => setOpen(false)}
          >
            마이페이지
          </Link>

          <Link
            href={`/${eventId}/booths/register`}
            className="block px-4 py-2 text-sm text-primary hover:bg-zinc-800 hover:text-white"
            onClick={() => setOpen(false)}
          >
            부스 등록
          </Link>

          <div className="my-1 h-px bg-zinc-800" />

          <button
            onClick={async () => {
              await logout();     // signOut 완전히 끝날 때까지 기다림
              setOpen(false);
              router.push(`/${eventId}`); // 로그아웃 후 무조건 홈으로
              router.refresh(); // proxy(예전 미들웨어) 다시 태워서 서버 상태 재확인
            }}
            className="block w-full px-4 py-2 text-left text-sm text-primary hover:bg-zinc-800 hover:text-white"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}