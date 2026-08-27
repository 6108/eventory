// src/app/likes/likes-tabs.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FollowedBooth } from "@/src/types/booth";
import { LikedProduct } from "@/src/types/product";
import ImageLightbox from "@/src/component/product/ImageLightbox";

export function LikesTabs({
  likedProducts,
  followedBooths,
}: {
  likedProducts: LikedProduct[];
  followedBooths: FollowedBooth[];
}) {
  const [activeTab, setActiveTab] = useState<"products" | "booths">(
    "products"
  );
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  const openProduct = likedProducts.find(
    ({ product }) => product.id === openProductId
  )?.product;

  return (
    <div className="mx-auto w-full max-w-lg flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-white">보관함</h1>

      <div className="flex rounded border border-zinc-800 overflow-hidden">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 py-2 text-center text-sm ${activeTab === "products"
            ? "bg-primary text-white"
            : "bg-zinc-900 text-zinc-400"
            }`}
        >
          좋아요한 상품 ({likedProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("booths")}
          className={`flex-1 py-2 text-center text-sm ${activeTab === "booths"
            ? "bg-primary text-white"
            : "bg-zinc-900 text-zinc-400"
            }`}
        >
          팔로우한 부스 ({followedBooths.length})
        </button>
      </div>

      {activeTab === "products" ? (
        likedProducts.length === 0 ? (
          <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
            아직 좋아요한 상품이 없습니다.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {likedProducts.map(({ likeId, product }) => {
              const soldOut =
                typeof product.remainingQuantity === "number" &&
                product.remainingQuantity <= 0;

              return (
                <li key={likeId}>
                  <button
                    type="button"
                    onClick={() => setOpenProductId(product.id)}
                    className="flex w-full items-center gap-3 rounded border border-zinc-800 p-3 text-left hover:bg-zinc-900"
                  >
                    {product.mainImage ? (
                      <Image
                        src={product.mainImage}
                        alt={product.name}
                        width={56}
                        height={56}
                        className="rounded object-cover w-14 h-14 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 shrink-0 rounded bg-zinc-800" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {product.name}
                      </p>
                      {product.artistNames.length > 0 && (
                        <p className="text-xs text-zinc-400 truncate">
                          {product.artistNames.join(", ")}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-primary">
                          {product.price.toLocaleString()}원
                        </p>
                        {soldOut && (
                          <span className="text-xs text-zinc-500">품절</span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : followedBooths.length === 0 ? (
        <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
          아직 팔로우한 부스가 없습니다.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {followedBooths.map(({ followId, booth }) => (
            <li key={followId}>
              <Link
                href={`/booths/${booth.id}`}
                className="flex items-center justify-between gap-3 rounded border border-zinc-800 p-3 hover:bg-zinc-900"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">
                    {booth.boothName}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    {booth.boothNumber}
                    {booth.artistNames.length
                      ? ` · ${booth.artistNames.join(", ")}`
                      : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-xs text-zinc-400">
                  {booth.category === "ADULT" ? "성인" : "전체"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {openProduct && (
        <ImageLightbox
          images={[openProduct.mainImage, ...openProduct.sampleImages].filter(Boolean)}
          alt={openProduct.name}
          isOpen={!!openProductId}
          onClose={() => setOpenProductId(null)}
        />
      )}
    </div>
  );
}