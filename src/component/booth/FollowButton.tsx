"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

type Props = {
  boothId: string;
  currentUserId?: string;
  initialFollowed?: boolean;
};

export default function FollowButton({
  boothId,
  currentUserId,
  initialFollowed = false,
}: Props) {
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
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${isFollowed
          ? "border-primary bg-primary/10 text-primary"
          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        }`}
    >
      <Heart size={16} className={isFollowed ? "fill-primary" : ""} />
      {isPending ? "처리중..." : isFollowed ? "팔로잉" : "팔로우"}
    </button>
  );
}