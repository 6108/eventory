"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Store } from "lucide-react";
import FollowButton from "../booth/FollowButton"; // 실제 경로에 맞게 수정

interface ImageLightboxProps {
  images: string[];
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  boothId: string;
  boothName: string;
  currentUserId?: string;
  initialFollowed?: boolean;
}

export default function ImageLightbox({
  images,
  alt,
  isOpen,
  onClose,
  eventId,
  boothId,
  boothName,
  currentUserId,
  initialFollowed,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  if (!isOpen || images.length === 0) return null;

  const hasMultiple = images.length > 1;

  function goPrev(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function goNext(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  function handleClose() {
    setIndex(0);
    onClose();
  }

  function goToBooth(e: React.MouseEvent) {
    e.stopPropagation();
    handleClose();
    router.push(`/events/${eventId}/booths/${boothId}`); // 실제 라우트 구조에 맞게 수정
  }

  return (
    <div
      className="fixed inset-0 z-999 flex flex-col items-center justify-center bg-black/90 p-4"
      onClick={handleClose}
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-4 right-4 text-zinc-300 hover:text-white"
      >
        <X size={28} />
      </button>

      <div className="flex h-full w-full max-w-2xl flex-col items-center justify-center gap-3">
        {/* 이미지 영역 - 남는 공간 다 차지, 최소 높이 보장 */}
        <div
          className="relative min-h-0 w-full flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={images[index]}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-contain"
            priority
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* 도트 인디케이터 - 고정 높이 */}
        {hasMultiple && (
          <div className="flex shrink-0 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-zinc-600"
                  }`}
              />
            ))}
          </div>
        )}

        {/* 부스 정보 바 - 고정 높이, 항상 보임 */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex w-full shrink-0 items-center justify-between rounded-xl bg-zinc-900 px-4 py-3"
        >
          <button
            type="button"
            onClick={goToBooth}
            className="flex items-center gap-2 text-left text-zinc-100 hover:text-white"
          >
            <Store size={18} className="shrink-0 text-zinc-400" />
            <span className="truncate text-sm font-medium">{boothName}</span>
          </button>

          <FollowButton
            boothId={boothId}
            currentUserId={currentUserId}
            initialFollowed={initialFollowed}
          />
        </div>
      </div>
    </div>
  );
}