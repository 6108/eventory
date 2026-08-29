"use client";

import { useState, useCallback } from "react";
import { ProductSummary, productCategories } from "@/src/types/product";
import Image from "next/image";
import Like from "./Like";
import QuickAddButton from "../cart/QuickAddButton";
import ImageLightbox from "./ImageLightbox";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { ImageIcon } from "lucide-react";

interface ProductListItemProps {
  productInfo: ProductSummary;
  currentUserId?: string;
  priority?: boolean;
}

export default function ProductListItem({
  productInfo,
  currentUserId,
  priority = false,
}: ProductListItemProps) {
  const isOwner =
    !!currentUserId && productInfo.artistIds?.includes(currentUserId);

  const isSoldOut =
    productInfo.remainingQuantity !== null &&
    productInfo.remainingQuantity <= 0;

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const category = productCategories.find(
    (item) => item.value === productInfo.category
  );

  const subCategory = category?.types.find(
    (item) => item.value === productInfo.subCategory
  );

  const images = [
    productInfo.mainImage,
    ...productInfo.sampleImages,
  ].filter(Boolean);

  const openLightbox = useCallback(() => {
    setIsLightboxOpen(true);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox();
    }
  }

  return (
    <div className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-primary/40 transition-colors hover:border-primary/70 hover:bg-primary/40">
      {/* 이미지 + 작품 정보 */}
      <div
        role="button"
        tabIndex={0}
        onClick={openLightbox}
        onKeyDown={handleKeyDown}
        className="flex min-w-0 flex-1 cursor-pointer flex-col gap-2 text-left"
      >
        {/* 이미지 */}
        <div className="relative aspect-square w-full min-w-0 shrink-0">
          <Image
            src={productInfo.mainImage}
            alt={productInfo.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, 33vw"
            className={`rounded-t-xl object-cover ${isSoldOut ? "opacity-20" : ""
              }`}
          />

          {/* 이미지 개수 + 좋아요 */}
          <div className="absolute inset-0">
            {/* 좋아요 */}
            <div className="absolute right-2 top-2">
              <Like
                productId={productInfo.id}
                isOwner={isOwner}
              />
            </div>

            {/* 상세 이미지 */}
            {productInfo.sampleImages.length > 0 && (
              <div className="absolute bottom-2 right-2 flex max-w-[80%] items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <ImageIcon className="h-3.5 w-3.5 shrink-0" />

                <span className="truncate">
                  상세 이미지 {productInfo.sampleImages.length}장
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 작품 정보 */}
        <div className="flex w-full min-w-0 flex-1 flex-col p-2">
          {/* 부스 */}
          <div className="flex min-w-0 items-center gap-1 text-sm text-zinc-500 sm:text-md">
            <span className="shrink-0 rounded py-0.5 font-medium text-zinc-400">
              [{productInfo.boothNumber}]
            </span>

            <span className="min-w-0 truncate">
              {productInfo.boothName}
            </span>
          </div>

          {/* 작품명 */}
          <h3 className="line-clamp-2 min-h-6 overflow-hidden break-keep font-medium  text-zinc-100 sm:min-h-7">
            {productInfo.name}
          </h3>

          {/* 가격 + 담기 */}
          <div className="mt-auto flex min-w-0 items-end justify-between gap-1">
            {/* 가격 영역 */}
            <div className="min-w-0 flex-1">
              {/* 수량 제한 */}
              <div className="h-4">
                {!isSoldOut && productInfo.purchaseLimit != null && (
                  <p className="whitespace-nowrap text-[clamp(10px,2.5vw,13px)] font-medium leading-4 text-zinc-400">
                    (1인 {productInfo.purchaseLimit}개 한정)
                  </p>
                )}
              </div>

              {/* 가격 */}
              <p className="whitespace-nowrap text-[clamp(15px,3.5vw,20px)] font-bold leading-6 text-primary">
                {isSoldOut
                  ? "품절"
                  : `${productInfo.price.toLocaleString()}원`}
              </p>
            </div>

            {/* 담기 */}
            {!isSoldOut && (
              <div
                className="shrink-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <QuickAddButton product={productInfo} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 이미지 라이트박스 */}
      <ImageLightbox
        images={images}
        alt={productInfo.name}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        eventId={eventId}
        boothId={productInfo.boothId}
        boothName={productInfo.boothName}
        currentUserId={currentUserId}
        product={productInfo}
      />
    </div>
  );
}