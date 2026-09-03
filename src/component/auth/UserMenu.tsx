"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { useAuth } from "@/src/hooks/useAuth";
import { useProfile } from "@/src/hooks/useProfile";
import BoothMenu from "./BoothMenu";
import UserMenuItem from "./UserMenuItem";
import { useBoothStore } from "@/src/store/boothStore";
import UserMenuSection from "./UserMenuSection";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { profile } = useProfile(user?.id);
  const { boothId, checked, fetchBoothId } = useBoothStore();

  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user || checked) return;
    fetchBoothId();
  }, [user, checked, fetchBoothId]);

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

  const nickname = profile?.name ?? "My";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="max-w-24 truncate text-md text-primary hover:text-white"
        title={nickname}
      >
        {nickname}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-md border border-zinc-800 bg-zinc-900 py-1 shadow-lg">
          <UserMenuSection>
            {/* <UserMenuItem
              href={`/${eventId}/likes`}
              onClick={() => setOpen(false)}
            >
              보관함
            </UserMenuItem> */}

            {/* <UserMenuItem
              href={`/${eventId}/my-orders`}
              onClick={() => setOpen(false)}
            >
              영수증
            </UserMenuItem> */}

            <UserMenuItem
              href={`/${eventId}/follow`}
              onClick={() => setOpen(false)}
            >
              팔로우한 부스
            </UserMenuItem>
          </UserMenuSection>

          <div className="my-1 h-px bg-zinc-800" />

          <UserMenuSection label="내 부스">
            <BoothMenu
              boothId={boothId}
              loading={!checked}
              onNavigate={() => setOpen(false)}
            />
          </UserMenuSection>

          <div className="my-1 h-px bg-zinc-800" />

          <UserMenuItem href="/mypage" onClick={() => setOpen(false)}>
            프로필 설정
          </UserMenuItem>

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