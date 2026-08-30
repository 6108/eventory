"use client";

import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/src/hooks/useAuth";
import { useConfirmModalStore } from "@/src/store/confirmModalStore";
import { useMyLikedProductIds, useToggleLike } from "@/src/hooks/useProductLikes";
import IconActionButton from "@/src/component/common/IconActionButton";

const SYNC_DELAY_MS = 500;

interface LikeButtonProps {
  productId: string;
  /** 좋아요 상태가 바뀐 직후(낙관적 업데이트 시점) 호출됨. 목록에서 제거하는 등의 용도 */
  onToggle?: (liked: boolean) => void;
}

/**
 * 이미지 위에 뜨는 원형 Like(좋아요 개수 표시용)와 달리,
 * 리스트 줄에서 QuickAddButton/FollowButton과 같은 pill 스타일로 보여줄 때 쓴다.
 *
 * 하트를 연속으로 톡톡톡 누르는(좋아요 -> 취소 -> 좋아요) 흔한 패턴에서
 * 클릭마다 API를 부르지 않도록, 화면은 클릭 즉시 반응시키되 실제 서버
 * 요청은 SYNC_DELAY_MS 동안 추가 클릭이 없을 때 "최종 상태" 1번만 보낸다.
 * 최종 상태가 서버에 저장된 상태와 같으면(짝수 번 토글) 아예 요청을 보내지 않는다.
 */
export default function LikeButton({ productId, onToggle }: LikeButtonProps) {
  const { user, login } = useAuth();
  const userId = user?.id ?? null;
  const openConfirmModal = useConfirmModalStore((s) => s.openConfirmModal);

  const { data: likedIds } = useMyLikedProductIds(userId);
  const toggleLike = useToggleLike(userId);

  const serverLiked = likedIds?.includes(productId) ?? false;

  // 화면에 즉시 반영되는 표시용 상태 (서버 확정 상태와 별개)
  const [displayLiked, setDisplayLiked] = useState(serverLiked);
  // 마지막으로 서버에 반영 완료(또는 확인)된 상태
  const confirmedRef = useRef(serverLiked);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 다른 곳(다른 컴포넌트의 토글 등)에서 서버 상태가 바뀌면 표시값도 맞춰준다.
  useEffect(() => {
    if (timerRef.current) return; // 내가 방금 조작 중이면 덮어쓰지 않음
    confirmedRef.current = serverLiked;
    setDisplayLiked(serverLiked);
  }, [serverLiked]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function scheduleSync() {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;

      setDisplayLiked((current) => {
        if (current === confirmedRef.current) {
          return current; // 최종 상태가 서버와 같으면(짝수 토글) 요청 자체를 생략
        }

        const targetLiked = current;

        toggleLike.mutate(
          { productId, liked: confirmedRef.current },
          {
            onSuccess: () => {
              confirmedRef.current = targetLiked;
            },
            onError: () => {
              // 실패 시 서버 확정 상태로 되돌림
              setDisplayLiked(confirmedRef.current);
              onToggle?.(confirmedRef.current);
              toast.error(
                targetLiked ? "좋아요에 실패했습니다." : "좋아요 취소에 실패했습니다."
              );
            },
          }
        );

        return current;
      });
    }, SYNC_DELAY_MS);
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

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

    const next = !displayLiked;
    setDisplayLiked(next);
    onToggle?.(next);
    scheduleSync();
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