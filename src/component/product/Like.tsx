"use client";

import { Heart } from "lucide-react";
import toast from "react-hot-toast";
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
  /** 좋아요 상태가 바뀐 직후(낙관적 업데이트 시점) 호출됨. 목록에서 제거하는 등의 용도 */
  onToggle?: (liked: boolean) => void;
}

export default function Like({ productId, isOwner = false, onToggle }: LikeProps) {
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
        title: "로그인 하시겠습니까?",
        message: "좋아요는 로그인 후 이용할 수 있습니다.",
        confirmText: "로그인",
        cancelText: "취소",
        onConfirm: () => login(),
      });
      return;
    }

    const next = !liked;
    onToggle?.(next);
    toggleLike.mutate(
      { productId, liked },
      {
        onError: () => {
          onToggle?.(liked); // 실패 시 되돌리기
          toast.error(
            next ? "좋아요에 실패했습니다." : "좋아요 취소에 실패했습니다."
          );
        },
      }
    );
  };

  return (
    <div
      className="absolute top-1 right-1 z-10"
      onMouseEnter={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={toggleLike.isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClick();
        }}
        className={`flex gap-1 min-h-8 w-8 flex-col items-center justify-center rounded-full px-0 py-1 backdrop-blur-sm transition-colors disabled:opacity-50 ${liked
          ? "bg-primary text-white hover:bg-primary/90"
          : "bg-zinc-300/70 text-primary hover:bg-zinc-200"
          }`}
      >
        <Heart
          size={18}
          className={liked ? "fill-white text-white" : ""}
        />

        {count !== undefined && (
          <span className="text-sm font-semibold leading-none">
            {count}
          </span>
        )}
      </button>

    </div>
  );
}