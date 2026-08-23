"use client";

import { useState, useTransition } from "react";

type Props = {
  eventId: string;
  boothId: string;
  currentUserId?: string;
  initialFollowed?: boolean;
};

export default function FollowButton({
  eventId,
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
        const res = await fetch(`/api/${eventId}booth/${boothId}/follow`, {
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
      className={`
        rounded-xl px-4 py-2 text-sm font-medium transition
        ${isFollowed
          ? "border border-pink-500 bg-pink-50"
          : "border bg-white hover:bg-gray-50"
        }
      `}
    >
      {isPending ? "처리중..." : isFollowed ? "♥ 팔로잉" : "♡ 팔로우"}
    </button>
  );
}