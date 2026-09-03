"use client";

import { useState } from "react";
import Link from "next/link";
import { FollowedBooth } from "@/src/types/booth";
import FollowButton from "@/src/component/booth/FollowButton";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { useAuth } from "@/src/hooks/useAuth";

export default function FollowedBoothList({
  followedBooths: initialFollowedBooths,
}: {
  followedBooths: FollowedBooth[];
}) {
  const { user } = useAuth();

  // 서버에서 내려온 초기 목록은 그대로 두고, 해제한 항목의 id만
  // 숨김 처리 -> 실패해서 롤백되면 다시 보여줄 수 있게
  const [hiddenBoothIds, setHiddenBoothIds] = useState<Set<string>>(
    new Set()
  );

  const followedBooths = initialFollowedBooths.filter(
    ({ booth }) => !hiddenBoothIds.has(booth.id)
  );

  function setFollowedBoothHidden(boothId: string, hidden: boolean) {
    setHiddenBoothIds((prev) => {
      const next = new Set(prev);
      if (hidden) next.add(boothId);
      else next.delete(boothId);
      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-white">
        팔로우한 부스 ({followedBooths.length})
      </h1>

      {followedBooths.length === 0 ? (
        <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
          아직 북마크한 상점이 없습니다.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {followedBooths.map(({ followId, booth }) => (
            <li key={followId}>
              <Link
                href={`/${eventId}/booths/${booth.id}`}
                className="flex items-center justify-between gap-3 rounded border border-zinc-800 p-3 hover:bg-zinc-900"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-sm truncate">
                    <span className="text-lg font-medium text-white">
                      [{booth.boothNumber}]
                    </span>
                    <span className="text-white truncate">
                      {booth.boothName}
                      {" / "}
                      <span className={booth.category === "ADULT" ? "text-primary" : ""}>
                        {booth.category === "ADULT" ? "성인 부스" : "일반 부스"}
                      </span>
                    </span>
                  </div>
                  {booth.artistNames.length > 0 && (
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {booth.artistNames.join(", ")}
                    </p>
                  )}
                  {booth.description && (
                    <p className="text-xs text-zinc-200 whitespace-pre-wrap mt-0.5">
                      {booth.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* FollowButton이 preventDefault/stopPropagation을 직접 처리하므로
                      Link 안에 있어도 페이지 이동 없이 언팔로우만 됨 */}
                  <FollowButton
                    boothId={booth.id}
                    currentUserId={user?.id}
                    initialFollowed
                    onToggle={(followed) =>
                      setFollowedBoothHidden(booth.id, !followed)
                    }
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}