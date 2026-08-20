// src/component/booth/FollowButton.tsx

"use client";

import { useState, useTransition } from "react";

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

    startTransition(async () => {
      try {
        if (isFollowed) {
          // await unfollowBooth(boothId);
          setIsFollowed(false);
        } else {
          // await followBooth(boothId);
          setIsFollowed(true);
        }
      } catch (error) {
        console.error(error);
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
      {isPending
        ? "처리중..."
        : isFollowed
          ? "♥ 팔로잉"
          : "♡ 팔로우"}
    </button>
  );
}