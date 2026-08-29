"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import IconActionButton from "../common/IconActionButton";
import { useAuth } from "@/src/hooks/useAuth";
import { useConfirmModalStore } from "@/src/store/confirmModalStore";

interface FollowButtonProps {
  boothId: string;
  currentUserId?: string;
  initialFollowed?: boolean;
  /** 팔로우 상태가 바뀐 직후(낙관적 업데이트 시점) 호출됨. 목록에서 제거하는 등의 용도 */
  onToggle?: (followed: boolean) => void;
};

export default function FollowButton({
  boothId,
  currentUserId,
  initialFollowed = false,
  onToggle,
}: FollowButtonProps) {
  const [isFollowed, setIsFollowed] = useState(initialFollowed);
  const [isPending, startTransition] = useTransition();
  const { login } = useAuth();
  const openConfirmModal = useConfirmModalStore((s) => s.openConfirmModal);

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      openConfirmModal({
        title: "로그인 하시겠습니까?",
        message: "부스 팔로우는 로그인 후 이용할 수 있습니다.",
        confirmText: "로그인",
        cancelText: "취소",
        onConfirm: () => login(),
      });
      return;
    }

    const next = !isFollowed;
    setIsFollowed(next); // 낙관적 업데이트
    onToggle?.(next);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/booth/${boothId}/follow`, {
          method: next ? "POST" : "DELETE",
        });

        if (!res.ok) throw new Error("요청 실패");
      } catch (error) {
        console.error(error);
        setIsFollowed(!next); // 실패 시 롤백
        onToggle?.(!next);
        toast.error(
          next ? "팔로우에 실패했습니다." : "언팔로우에 실패했습니다."
        );
      }
    });
  }

  return (
    <IconActionButton
      onClick={handleClick}
      disabled={isPending}
      active={isFollowed}
      icon={
        isFollowed ? (
          <UserCheck size={14} />
        ) : (
          <UserPlus size={14} />
        )
      }
      label={isPending ? "처리중..." : isFollowed ? "팔로잉" : "팔로우"}
    />
  );
}