"use client";

import { useEffect, useRef, useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import IconActionButton from "../common/IconActionButton";
import { useAuth } from "@/src/hooks/useAuth";
import { useConfirmModalStore } from "@/src/store/confirmModalStore";

const SYNC_DELAY_MS = 500;

interface FollowButtonProps {
  boothId: string;
  currentUserId?: string;
  initialFollowed?: boolean;
  /** 팔로우 상태가 바뀐 직후(낙관적 업데이트 시점) 호출됨. 목록에서 제거하는 등의 용도 */
  onToggle?: (followed: boolean) => void;
};

/**
 * 화면은 클릭 즉시 반응시키되, 실제 팔로우/언팔로우 API는 SYNC_DELAY_MS 동안
 * 추가 클릭이 없을 때 "최종 상태" 1번만 보낸다. 연속 클릭(팔로우->언팔로우->
 * 팔로우)의 최종 결과가 처음 상태와 같으면 요청 자체를 생략한다.
 */
export default function FollowButton({
  boothId,
  currentUserId,
  initialFollowed = false,
  onToggle,
}: FollowButtonProps) {
  const [displayFollowed, setDisplayFollowed] = useState(initialFollowed);
  const [isSyncing, setIsSyncing] = useState(false);
  const { login } = useAuth();
  const openConfirmModal = useConfirmModalStore((s) => s.openConfirmModal);

  const confirmedRef = useRef(initialFollowed);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function scheduleSync() {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      timerRef.current = null;

      setDisplayFollowed((current) => {
        if (current === confirmedRef.current) return current; // 짝수 번 토글이면 요청 생략

        const targetFollowed = current;
        setIsSyncing(true);

        (async () => {
          try {
            const res = await fetch(`/api/booth/${boothId}/follow`, {
              method: targetFollowed ? "POST" : "DELETE",
            });

            if (!res.ok) throw new Error("요청 실패");
            confirmedRef.current = targetFollowed;
          } catch (error) {
            console.error(error);
            setDisplayFollowed(confirmedRef.current); // 실패 시 서버 확정 상태로 롤백
            onToggle?.(confirmedRef.current);
            toast.error(
              targetFollowed ? "팔로우에 실패했습니다." : "언팔로우에 실패했습니다."
            );
          } finally {
            setIsSyncing(false);
          }
        })();

        return current;
      });
    }, SYNC_DELAY_MS);
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
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

    const next = !displayFollowed;
    setDisplayFollowed(next);
    onToggle?.(next);
    scheduleSync();
  }

  return (
    <IconActionButton
      onClick={handleClick}
      active={displayFollowed}
      icon={
        displayFollowed ? (
          <UserCheck size={14} />
        ) : (
          <UserPlus size={14} />
        )
      }
      label={isSyncing ? "처리중..." : displayFollowed ? "팔로잉" : "팔로우"}
    />
  );
}