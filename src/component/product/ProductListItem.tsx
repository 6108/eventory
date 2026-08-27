"use client";

import { useState, useCallback } from "react";
import { ProductSummary, productCategories } from "@/src/types/product";
import Image from "next/image";
import Like from "./Like";
import QuickAddButton from "../cart/QuickAddButton";
import ImageLightbox from "./ImageLightbox";
import { EVENT_ID as eventId } from "@/src/constants/event";


interface ProductListItemProps {
  productInfo: ProductSummary;
  currentUserId?: string;
}

export default function ProductListItem({
  productInfo,
  currentUserId,
}: ProductListItemProps) {
  const isOwner = !!currentUserId && productInfo.artistIds?.includes(currentUserId);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const category = productCategories.find(
    (item) => item.value === productInfo.category
  );

  const subCategory = category?.types.find(
    (item) => item.value === productInfo.subCategory
  );

  const images = [productInfo.mainImage, ...productInfo.sampleImages].filter(Boolean);

  const openLightbox = useCallback(() => setIsLightboxOpen(true), []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox();
    }
  }

  return (
    <div className="relative flex flex-col gap-4 rounded-xl border border-primary/40  hover:bg-primary/40 hover:border-primary/70 transition-colors">
      <div
        role="button"
        tabIndex={0}
        onClick={openLightbox}
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-2 cursor-pointer text-left"
      >
        <div className="relative aspect-square w-full">
          <Image
            src={productInfo.mainImage}
            alt={productInfo.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover rounded-t-xl"
          />

          <div className="absolute top-2 right-2">
            <Like productId={productInfo.id} isOwner={isOwner} />
          </div>

          <div className="absolute bottom-2 right-2">
            <QuickAddButton product={productInfo} />
          </div>
        </div>

        <div className="flex flex-col justify-center w-full p-2">
          {/* 부스 정보 - 한 줄, 눈에 띄지 않게 */}
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <span className="rounded  px-1 py-0.5 font-medium text-zinc-400">
              [{productInfo.boothNumber}]
            </span>
            <span className="truncate">{productInfo.boothName}</span>
          </div>

          {/* 상품명 - 핵심 정보, 가장 크고 진하게 */}
          <h3 className="text- font-medium text-zinc-100 line-clamp-2 min-h-10 mt-1">
            {productInfo.name}
          </h3>

          {/* 가격 - 시선이 마지막에 꽂히는 자리 */}
          <p className="text-md font-bold text-primary mt-0.5">
            {productInfo.price.toLocaleString()}원
          </p>
        </div>
      </div>

      <ImageLightbox
        images={images}
        alt={productInfo.name}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        eventId={eventId}
        boothId={productInfo.boothId}
        boothName={productInfo.boothName}
      />
    </div>
  );
}