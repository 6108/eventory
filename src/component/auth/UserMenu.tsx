"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { useAuth } from "@/src/hooks/useAuth";
import { BoothMenu } from "./BoothMenu";
import { UserMenuItem } from "./UserMenuItem";

export function UserMenu() {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [boothId, setBoothId] = useState<string | null>(null);
  const [boothChecked, setBoothChecked] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user || boothChecked) return;

    fetch("/api/booth/my")
      .then((res) => res.json())
      .then((data) => {
        setBoothId(data?.boothId ?? null);
      })
      .finally(() => {
        setBoothChecked(true);
      });
  }, [user, boothChecked]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const nickname = user.user_metadata?.name ?? "My";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-sm text-primary hover:text-white"
      >
        {nickname}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-md border border-zinc-800 bg-zinc-900 py-1 shadow-lg">
          <UserMenuItem
            href={`/${eventId}/likes`}
            onClick={() => setOpen(false)}
          >
            좋아요 목록
          </UserMenuItem>

          <UserMenuItem
            href={`/${eventId}/mypage`}
            onClick={() => setOpen(false)}
          >
            마이페이지
          </UserMenuItem>

          <div className="my-1 h-px bg-zinc-800" />

          <BoothMenu
            boothId={boothId}
            loading={!boothChecked}
            onNavigate={() => setOpen(false)}
          />

          <div className="my-1 h-px bg-zinc-800" />

          <button
            onClick={async () => {
              await logout();
              setOpen(false);
              router.push(`/${eventId}`);
              router.refresh();
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