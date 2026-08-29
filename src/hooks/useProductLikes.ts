"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import { getMyLikedProductIds, getProductLikeCount } from "@/src/lib/action/product";

const myLikesKey = (userId: string) => ["myLikes", userId] as const;
const likeCountKey = (productId: string) => ["productLikeCount", productId] as const;

// 로그인 유저가 좋아요 누른 작품 id 목록 — 페이지 안에서 몇 번을 호출해도
// 쿼리 키가 같으면 실제 네트워크 요청은 1번만 나감
export function useMyLikedProductIds(userId: string | null) {
  return useQuery({
    queryKey: myLikesKey(userId ?? ""),
    queryFn: () => getMyLikedProductIds(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

// 작가 본인 작품일 때만 조회 (enabled로 제어)
export function useProductLikeCount(productId: string, isOwner: boolean) {
  return useQuery({
    queryKey: likeCountKey(productId),
    queryFn: () => getProductLikeCount(productId),
    enabled: isOwner,
    staleTime: 30_000,
  });
}

export function useToggleLike(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, liked }: { productId: string; liked: boolean }) => {
      const supabase = createClient();

      if (liked) {
        const { error } = await supabase
          .from("product_likes")
          .delete()
          .eq("product_id", productId)
          .eq("user_id", userId!);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("product_likes")
          .insert({ product_id: productId, user_id: userId! });
        if (error) throw error;
      }
    },
    onMutate: async ({ productId, liked }) => {
      if (!userId) return;

      const key = myLikesKey(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const prevIds = queryClient.getQueryData<string[]>(key) ?? [];

      queryClient.setQueryData<string[]>(
        key,
        liked
          ? prevIds.filter((id) => id !== productId)
          : [...prevIds, productId]
      );

      const countKey = likeCountKey(productId);
      const prevCount = queryClient.getQueryData<number>(countKey);
      if (prevCount !== undefined) {
        queryClient.setQueryData<number>(countKey, prevCount + (liked ? -1 : 1));
      }

      return { prevIds, prevCount, key, countKey };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(ctx.key, ctx.prevIds);
      if (ctx.prevCount !== undefined) {
        queryClient.setQueryData(ctx.countKey, ctx.prevCount);
      }
    },
  });
}