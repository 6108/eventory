// src/app/likes/likes-tabs.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { FollowedBooth } from "@/src/types/booth";
// import { LikedProduct } from "@/src/types/product";
// import ImageLightbox from "@/src/component/product/ImageLightbox";
// import QuickAddButton from "@/src/component/cart/QuickAddButton";
// import LikeButton from "@/src/component/product/LikeButton";
// import FollowButton from "@/src/component/booth/FollowButton";
// import { EVENT_ID as eventId } from "@/src/constants/event";
// import { useAuth } from "@/src/hooks/useAuth";


export default function LikesTabs() {
  return (
    <div>LikesTabs</div>
  )
}


// export default function LikesTabs({
//   likedProducts: initialLikedProducts,
//   followedBooths: initialFollowedBooths,
// }: {
//   likedProducts: LikedProduct[];
//   followedBooths: FollowedBooth[];
// }) {
//   const { user } = useAuth();
//   const [activeTab, setActiveTab] = useState<"products" | "booths">(
//     "products"
//   );
//   const [openProductId, setOpenProductId] = useState<string | null>(null);

//   // 서버에서 내려온 초기 목록은 그대로 두고, 해제한 항목의 id만
//   // 숨김 처리 -> 실패해서 롤백되면 다시 보여줄 수 있게
//   const [hiddenProductIds, setHiddenProductIds] = useState<Set<string>>(
//     new Set()
//   );
//   const [hiddenBoothIds, setHiddenBoothIds] = useState<Set<string>>(
//     new Set()
//   );

//   const likedProducts = initialLikedProducts.filter(
//     ({ product }) => !hiddenProductIds.has(product.id)
//   );
//   const followedBooths = initialFollowedBooths.filter(
//     ({ booth }) => !hiddenBoothIds.has(booth.id)
//   );

//   const openProduct = likedProducts.find(
//     ({ product }) => product.id === openProductId
//   )?.product;

//   function setLikedProductHidden(productId: string, hidden: boolean) {
//     setHiddenProductIds((prev) => {
//       const next = new Set(prev);
//       if (hidden) next.add(productId);
//       else next.delete(productId);
//       return next;
//     });
//   }

//   function setFollowedBoothHidden(boothId: string, hidden: boolean) {
//     setHiddenBoothIds((prev) => {
//       const next = new Set(prev);
//       if (hidden) next.add(boothId);
//       else next.delete(boothId);
//       return next;
//     });
//   }

//   return (
//     <div className="mx-auto w-full max-w-lg flex flex-col gap-4">
//       <h1 className="text-xl font-semibold text-white">보관함</h1>

//       <div className="flex rounded border border-zinc-800 overflow-hidden">
//         <button
//           onClick={() => setActiveTab("products")}
//           className={`flex-1 py-2 text-center text-sm ${activeTab === "products"
//             ? "bg-primary text-white"
//             : "bg-zinc-900 text-zinc-400"
//             }`}
//         >
//           좋아요한 작품 ({likedProducts.length})
//         </button>
//         <button
//           onClick={() => setActiveTab("booths")}
//           className={`flex-1 py-2 text-center text-sm ${activeTab === "booths"
//             ? "bg-primary text-white"
//             : "bg-zinc-900 text-zinc-400"
//             }`}
//         >
//           팔로우한 부스 ({followedBooths.length})
//         </button>
//       </div>

//       {activeTab === "products" ? (
//         likedProducts.length === 0 ? (
//           <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
//             아직 좋아요한 작품이 없습니다.
//           </div>
//         ) : (
//           <ul className="flex flex-col gap-2">
//             {likedProducts.map(({ likeId, product }) => {
//               const soldOut =
//                 typeof product.remainingQuantity === "number" &&
//                 product.remainingQuantity <= 0;

//               return (
//                 <li key={likeId}>
//                   <div className="flex w-full items-center gap-3 rounded border border-zinc-800 p-3 hover:bg-zinc-900">
//                     <button
//                       type="button"
//                       onClick={() => setOpenProductId(product.id)}
//                       className="flex flex-1 min-w-0 items-center gap-3 text-left"
//                     >
//                       {product.mainImage ? (
//                         <Image
//                           src={product.mainImage}
//                           alt={product.name}
//                           width={56}
//                           height={56}
//                           className={`rounded object-cover w-14 h-14 shrink-0 ${soldOut ? "opacity-40" : ""
//                             }`}
//                         />
//                       ) : (
//                         <div className="w-14 h-14 shrink-0 rounded bg-zinc-800" />
//                       )}

//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm text-white truncate">
//                           {product.name}
//                         </p>
//                         {product.artistNames.length > 0 && (
//                           <p className="text-xs text-zinc-400 truncate">
//                             {product.artistNames.join(", ")}
//                           </p>
//                         )}
//                         <div className="flex items-center justify-between gap-2 mt-1">
//                           <p className="text-sm text-primary">
//                             {product.price.toLocaleString()}원
//                           </p>
//                           {soldOut && (
//                             <span className="text-xs font-semibold text-red-500">
//                               품절
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </button>

//                     <div className="flex shrink-0 items-center gap-2">
//                       {!soldOut && <QuickAddButton product={product} />}

//                       <LikeButton
//                         productId={product.id}
//                         onToggle={(liked) =>
//                           setLikedProductHidden(product.id, !liked)
//                         }
//                       />
//                     </div>
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//         )
//       ) : followedBooths.length === 0 ? (
//         <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
//           아직 팔로우한 부스가 없습니다.
//         </div>
//       ) : (
//         <ul className="flex flex-col gap-2">
//           {followedBooths.map(({ followId, booth }) => (
//             <li key={followId}>
//               <Link
//                 href={`/${eventId}/booths/${booth.id}`}
//                 className="flex items-center justify-between gap-3 rounded border border-zinc-800 p-3 hover:bg-zinc-900"
//               >
//                 <div className="min-w-0">
//                   <div className="flex items-center gap-1 text-sm truncate">
//                     <span className="font-medium text-zinc-400">
//                       [{booth.boothNumber}]
//                     </span>
//                     <span className="text-white truncate">
//                       {booth.boothName}{' / '}
//                       {booth.category === "ADULT" ? "성인 부스" : "일반 부스"}

//                     </span>

//                   </div>
//                   {booth.artistNames.length > 0 && (
//                     <p className="text-xs text-zinc-400 truncate mt-0.5">
//                       {booth.artistNames.join(", ")}
//                     </p>
//                   )}
//                 </div>

//                 <div className="flex shrink-0 items-center gap-2">
//                   <span
//                     className={`text-xs font-medium ${booth.category === "ADULT" ? "text-red-400" : "text-zinc-500"
//                       }`}
//                   >
//                   </span>

//                   {/* FollowButton이 preventDefault/stopPropagation을 직접 처리하므로
//                       Link 안에 있어도 페이지 이동 없이 언팔로우만 됨 */}
//                   <FollowButton
//                     boothId={booth.id}
//                     currentUserId={user?.id}
//                     initialFollowed
//                     onToggle={(followed) =>
//                       setFollowedBoothHidden(booth.id, !followed)
//                     }
//                   />
//                 </div>
//               </Link>
//             </li>
//           ))}
//         </ul>
//       )}

//       {openProduct && (
//         <ImageLightbox
//           images={[openProduct.mainImage, ...(openProduct.sampleImages ?? [])].filter(Boolean)}
//           alt={openProduct.name}
//           isOpen={!!openProductId}
//           onClose={() => setOpenProductId(null)}
//           eventId={eventId}
//           boothId={openProduct.boothId}
//           boothName={openProduct.boothName}
//           currentUserId={user?.id}
//           product={openProduct}
//         />
//       )}
//     </div>
//   );
// }