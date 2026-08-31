// src/component/product/LikeButton.tsx
"use client";

import { Heart } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useRequireLogin } from "@/src/hooks/useRequireLogin";
import { useOptimisticToggle } from "@/src/hooks/useOptimisticToggle";
import { useMyLikedProductIds, useToggleLike } from "@/src/hooks/useProductLikes";
import IconActionButton from "@/src/component/common/IconActionButton";

interface LikeButtonProps {
  productId: string;
  onToggle?: (liked: boolean) => void;
}

export default function LikeButton({ productId, onToggle }: LikeButtonProps) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const requireLogin = useRequireLogin();

  const { data: likedIds } = useMyLikedProductIds(userId);
  const toggleLike = useToggleLike(userId);

  const serverLiked = likedIds?.includes(productId) ?? false;

  const { displayValue: displayLiked, toggle } = useOptimisticToggle({
    initialValue: serverLiked,
    serverValue: serverLiked,
    onToggle,
    sync: (target) =>
      toggleLike.mutateAsync({ productId, liked: !target }),
    errorMessage: (target) =>
      target ? "좋아요에 실패했습니다." : "좋아요 취소에 실패했습니다.",
  });

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      requireLogin("좋아요는 로그인 후 이용할 수 있습니다.");
      return;
    }

    toggle(!displayLiked);
  }

  return (
    <IconActionButton
      onClick={handleClick}
      active={displayLiked}
      icon={<Heart size={14} className={displayLiked ? "fill-primary" : ""} />}
      label="좋아요"
    />
  );
}
