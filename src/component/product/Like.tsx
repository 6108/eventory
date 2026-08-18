"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";
import { useConfirmModalStore } from "@/src/store/confirmModalStore";
import { getMyProductLike, getProductLikeCount } from "@/src/lib/data/productLike";

interface LikeProps {
  productId: string;
  isOwner?: boolean; // 로그인 유저가 이 상품을 올린 작가 본인인지
}

export default function Like({ productId, isOwner = false }: LikeProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { login } = useAuth();
  const openConfirmModal = useConfirmModalStore((s) => s.openConfirmModal);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      if (user) {
        setLiked(await getMyProductLike(productId, user.id));
      }

      if (isOwner) {
        setCount(await getProductLikeCount(productId));
      }
    }

    load();
  }, [productId, isOwner]);

  const toggleLike = async () => {
    const supabase = createClient();

    if (liked) {
      setLiked(false);
      setCount((c) => (c !== null ? c - 1 : c));

      const { error } = await supabase
        .from("product_likes")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", userId!);

      if (error) {
        console.error("좋아요 취소 실패:", error);
        setLiked(true);
        setCount((c) => (c !== null ? c + 1 : c));
      }
    } else {
      setLiked(true);
      setCount((c) => (c !== null ? c + 1 : c));

      const { error } = await supabase
        .from("product_likes")
        .insert({ product_id: productId, user_id: userId! });

      if (error) {
        console.error("좋아요 실패:", error);
        setLiked(false);
        setCount((c) => (c !== null ? c - 1 : c));
      }
    }
  };

  const handleClick = () => {
    if (!userId) {
      openConfirmModal({
        title: "로그인이 필요해요",
        message: "좋아요는 로그인 후 이용할 수 있어요.",
        confirmText: "로그인",
        cancelText: "취소",
        onConfirm: () => login(),
      });
      return;
    }

    toggleLike();
  };

  return (
    <div
      className="absolute top-1 right-1 z-10 flex items-center gap-1"
      onMouseEnter={(e) => e.stopPropagation()}
    >
      {isOwner && count !== null && (
        <span className="rounded-full bg-zinc-300/70 px-2 py-1 text-xs font-semibold text-primary">
          {count}
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClick();
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-300/70 text-primary hover:bg-zinc-200 transition-colors"
      >
        <Heart size={20} className={liked ? "fill-primary" : ""} />
      </button>
    </div>
  );
}