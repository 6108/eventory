"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import IconActionButton from "../common/IconActionButton";

interface FollowButtonProps {
  boothId: string;
  currentUserId?: string;
  initialFollowed?: boolean;
};

export default function FollowButton({
  boothId,
  currentUserId,
  initialFollowed = false,
}: FollowButtonProps) {
  const [isFollowed, setIsFollowed] = useState(initialFollowed);
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const next = !isFollowed;
    setIsFollowed(next); // 낙관적 업데이트

    startTransition(async () => {
      try {
        const res = await fetch(`/api/booth/${boothId}/follow`, {
          method: next ? "POST" : "DELETE",
        });

        if (!res.ok) throw new Error("요청 실패");
      } catch (error) {
        console.error(error);
        setIsFollowed(!next); // 실패 시 롤백
      }
    });
  }

  return (
    <IconActionButton
      onClick={handleClick}
      disabled={isPending}
      active={isFollowed}
      icon={<Heart size={14} className={isFollowed ? "fill-primary" : ""} />}
      label={isPending ? "처리중..." : isFollowed ? "팔로잉" : "팔로우"}
    />
  );
}