"use client";

import { Heart } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useConfirmModalStore } from "@/src/store/confirmModalStore";
import {
  useMyLikedProductIds,
  useProductLikeCount,
  useToggleLike,
} from "@/src/hooks/useProductLikes";

interface LikeProps {
  productId: string;
  isOwner?: boolean;
}

export default function Like({ productId, isOwner = false }: LikeProps) {
  const { user, login } = useAuth();
  const userId = user?.id ?? null;
  const openConfirmModal = useConfirmModalStore((s) => s.openConfirmModal);

  const { data: likedIds } = useMyLikedProductIds(userId);
  const { data: count } = useProductLikeCount(productId, isOwner);
  const toggleLike = useToggleLike(userId);

  const liked = likedIds?.includes(productId) ?? false;

  const handleClick = () => {
    if (!userId) {
      openConfirmModal({
        title: "로그인 필요",
        message: "좋아요는 로그인 후 이용할 수 있습니다.",
        confirmText: "로그인",
        cancelText: "취소",
        onConfirm: () => login(),
      });
      return;
    }

    toggleLike.mutate({ productId, liked });
  };

  return (
    <div
      className="absolute top-1 right-1 z-10"
      onMouseEnter={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClick();
        }}
        className="flex h-8 w-8 flex-col items-center justify-center rounded-full bg-zinc-300/70 text-primary backdrop-blur-sm transition-colors hover:bg-zinc-200"
      >
        <Heart size={18} className={liked ? "fill-primary" : ""} />

        {count !== undefined && (
          <span className="text-[9px] font-semibold leading-none">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}