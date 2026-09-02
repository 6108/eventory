// src/component/form/BoothArtistManager.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useConfirmModalStore } from "@/src/store/confirmModalStore";
import type { User } from "@/src/types/user";

interface BoothArtistManagerProps {
  boothId: string;
  eventId: string;
  initialArtists: User[];
  currentUserId: string;
}

export default function BoothArtistManager({
  boothId,
  eventId,
  initialArtists,
  currentUserId,
}: BoothArtistManagerProps) {
  const router = useRouter();
  const openConfirmModal = useConfirmModalStore((s) => s.openConfirmModal);

  const [artists, setArtists] = useState(initialArtists);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isLastArtist = artists.length <= 1;

  async function removeArtist(artistId: string) {
    setRemovingId(artistId);

    const res = await fetch(`/api/booth/${boothId}/artists/${artistId}`, {
      method: "DELETE",
    });

    const result = await res.json();

    setRemovingId(null);

    if (!res.ok) {
      toast.error(result.error ?? "삭제에 실패했습니다.");
      return;
    }

    const wasSelf = artistId === currentUserId;

    setArtists((prev) => prev.filter((a) => a.id !== artistId));
    toast.success(wasSelf ? "부스에서 나갔습니다." : "작가를 삭제했습니다.");
    router.refresh();

    // 스스로 나간 경우 더 이상 이 부스를 관리할 권한이 없으므로 부스 상세 페이지로 이동
    if (wasSelf) {
      router.push(`/${eventId}/booths/${boothId}`);
    }
  }

  function handleRemoveClick(artist: User) {
    const isSelf = artist.id === currentUserId;

    if (isLastArtist) {
      toast.error("마지막 남은 작가는 삭제할 수 없습니다.");
      return;
    }

    openConfirmModal({
      title: isSelf ? "부스에서 나가시겠습니까?" : `${artist.name ?? "이 작가"}를 삭제하시겠습니까?`,
      message: isSelf
        ? "나가면 이 부스를 더 이상 관리할 수 없습니다."
        : "삭제된 작가는 이 부스 관리 권한을 잃습니다. 등록한 작품은 그대로 남습니다.",
      confirmText: isSelf ? "나가기" : "삭제",
      cancelText: "취소",
      onConfirm: () => removeArtist(artist.id),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-zinc-300">작가 관리</p>

      <ul className="flex flex-col gap-2">
        {artists.map((artist) => {
          const isSelf = artist.id === currentUserId;

          return (
            <li
              key={artist.id}
              className="flex items-center justify-between rounded border border-zinc-800 px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="text-sm text-white">
                  {artist.name ?? "이름 없음"}
                  {isSelf && (
                    <span className="ml-2 text-xs text-zinc-500">(나)</span>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveClick(artist)}
                disabled={removingId === artist.id || isLastArtist}
                className="rounded px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {removingId === artist.id
                  ? "처리 중..."
                  : isSelf
                    ? "나가기"
                    : "삭제"}
              </button>
            </li>
          );
        })}
      </ul>

      {isLastArtist && (
        <p className="text-xs text-zinc-500">
          부스에 남은 작가가 한 명뿐이라 삭제/나가기를 할 수 없습니다.
        </p>
      )}
    </div>
  );
}