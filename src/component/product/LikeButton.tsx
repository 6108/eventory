"use client";

import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/src/hooks/useAuth";
import { useConfirmModalStore } from "@/src/store/confirmModalStore";
import { useMyLikedProductIds, useToggleLike } from "@/src/hooks/useProductLikes";
import IconActionButton from "@/src/component/common/IconActionButton";

interface LikeButtonProps {
  productId: string;
  /** 좋아요 상태가 바뀐 직후(낙관적 업데이트 시점) 호출됨. 목록에서 제거하는 등의 용도 */
  onToggle?: (liked: boolean) => void;
}

/**
 * 이미지 위에 뜨는 원형 Like(좋아요 개수 표시용)와 달리,
 * 리스트 줄에서 QuickAddButton/FollowButton과 같은 pill 스타일로 보여줄 때 쓴다.
 */
export default function LikeButton({ productId, onToggle }: LikeButtonProps) {
  const { user, login } = useAuth();
  const userId = user?.id ?? null;
  const openConfirmModal = useConfirmModalStore((s) => s.openConfirmModal);

  const { data: likedIds } = useMyLikedProductIds(userId);
  const toggleLike = useToggleLike(userId);

  const liked = likedIds?.includes(productId) ?? false;

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

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

    const next = !liked;
    onToggle?.(next);
    toggleLike.mutate(
      { productId, liked },
      {
        onError: () => {
          onToggle?.(liked); // 실패 시 목록에서 제거/추가했던 것 되돌리기
          toast.error(
            next ? "좋아요에 실패했습니다." : "좋아요 취소에 실패했습니다."
          );
        },
      }
    );
  }

  return (
    <IconActionButton
      onClick={handleClick}
      disabled={toggleLike.isPending}
      active={liked}
      icon={<Heart size={14} className={liked ? "fill-primary" : ""} />}
      label="좋아요"
    />
  );
}