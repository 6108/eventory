// src/component/booth/FollowButton.tsx
"use client";

import { UserPlus, UserCheck } from "lucide-react";
import IconActionButton from "../common/IconActionButton";
import { useRequireLogin } from "@/src/hooks/useRequireLogin";
import { useOptimisticToggle } from "@/src/hooks/useOptimisticToggle";

interface FollowButtonProps {
  boothId: string;
  currentUserId?: string;
  initialFollowed?: boolean;
  onToggle?: (followed: boolean) => void;
}

export default function FollowButton({
  boothId,
  currentUserId,
  initialFollowed = false,
  onToggle,
}: FollowButtonProps) {
  const requireLogin = useRequireLogin();

  const { displayValue: displayFollowed, isSyncing, toggle } = useOptimisticToggle({
    initialValue: initialFollowed,
    onToggle,
    sync: async (target) => {
      const res = await fetch(`/api/booth/${boothId}/follow`, {
        method: target ? "POST" : "DELETE",
      });

      if (!res.ok) throw new Error("요청 실패");
    },
    errorMessage: (target) =>
      target ? "팔로우에 실패했습니다." : "언팔로우에 실패했습니다.",
  });

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      requireLogin("부스 팔로우는 로그인 후 이용할 수 있습니다.");
      return;
    }

    toggle(!displayFollowed);
  }

  return (
    <IconActionButton
      onClick={handleClick}
      active={displayFollowed}
      icon={
        displayFollowed ? (
          <UserCheck size={14} />
        ) : (
          <UserPlus size={14} />
        )
      }
      label={isSyncing ? "처리중..." : displayFollowed ? "팔로잉" : "팔로우"}
    />
  );
}
