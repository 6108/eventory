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
}

export default function ProductListItem({
  productInfo,
  currentUserId,
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
    <div className="relative flex flex-col gap-4 rounded-xl border border-primary/40 transition-colors hover:border-primary/70 hover:bg-primary/40">
      {/* 이미지 */}
      <div
        role="button"
        tabIndex={0}
        onClick={openLightbox}
        onKeyDown={handleKeyDown}
        className="flex cursor-pointer flex-col gap-2 text-left"
      >
        <div className="relative aspect-square w-full">
          <Image
            src={productInfo.mainImage}
            alt={productInfo.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className={`rounded-t-xl object-cover ${isSoldOut ? "opacity-20" : ""
              }`}
          />

          {/* 이미지 개수 + 좋아요 */}
          <div className="absolute inset-0">
            {/* 좋아요 - 오른쪽 위 */}
            <div className="absolute top-2 right-2">
              <Like
                productId={productInfo.id}
                isOwner={isOwner}
              />
            </div>

            {/* 상세 이미지 - 오른쪽 아래 */}
            {productInfo.sampleImages.length > 0 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>상세 이미지 {productInfo.sampleImages.length}장</span>
              </div>
            )}
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="flex w-full flex-col justify-center p-2">
          {/* 부스 */}
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <span className="rounded px-1 py-0.5 font-medium text-zinc-400">
              [{productInfo.boothNumber}]
            </span>

            <span className="truncate">
              {productInfo.boothName}
            </span>
          </div>

          {/* 상품명 */}
          <h3 className="mt-1 line-clamp-2 min-h-10 font-medium text-zinc-100">
            {productInfo.name}
          </h3>

          {/* 가격 + 담기 */}
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xl font-bold text-primary">
                {isSoldOut ? (
                  <span>품절</span>
                ) : (
                  <>
                    {productInfo.price.toLocaleString()}원
                  </>
                )}
              </p>

              {!isSoldOut && productInfo.purchaseLimit != null && (
                <span className="text-xs font-medium text-muted-foreground">
                  (1인 {productInfo.purchaseLimit}개 한정)
                </span>
              )}
            </div>

            {!isSoldOut && (
              <div
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
