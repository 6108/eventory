import { ProductSummary, productCategories } from "@/src/types/product";
import { EVENT_ID as eventId } from "@/src/constants/event";
import Image from "next/image";
import Link from "next/link";
import Badge from "../booth/Badge";
import Like from "./Like";
import QuickAddButton from "../cart/QuickAddButton";

interface ProductListItemProps {
  productInfo: ProductSummary;
  boothName?: string;
  currentUserId?: string;
}

export default function ProductListItem({
  productInfo,
  boothName,
  currentUserId,
}: ProductListItemProps) {
  const isOwner = !!currentUserId && productInfo.artistIds?.includes(currentUserId);

  const category = productCategories.find(
    (item) => item.value === productInfo.category
  );

  const subCategory = category?.types.find(
    (item) => item.value === productInfo.subCategory
  );

  return (
    <div className="relative flex flex-col gap-4 rounded-md p-2 hover:bg-primary/40 transition-colors">
      <Link
        href={`/${eventId}/products/${productInfo.id}`}
        className="flex flex-col gap-4 cursor-pointer"
      >
        <div className="relative aspect-square w-full">
          <Image
            src={productInfo.mainImage}
            alt={productInfo.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover rounded"
          />

          <div className="flex justify-between">
            <Like productId={productInfo.id} isOwner={isOwner} />
          </div>

          <Badge />
        </div>

        <div className="flex flex-col justify-center w-full">
          <span className="text-xs text-zinc-500">
            {category?.label}
            {" > "}
            {subCategory?.label}
          </span>

          <div className="flex min-w-0 truncate text-sm text-zinc-400">
            <span className="truncate">
              {boothName}
            </span>

            <span className="shrink-0">
              {" - "}
              {productInfo.artistNames.join(", ")}
            </span>
          </div>

          <h3 className="text-base text-zinc-300 line-clamp-2 min-h-20">
            {productInfo.name}
          </h3>

          <p className="text-xl font-semibold">
            {productInfo.price.toLocaleString()}원
          </p>
        </div>
      </Link>

      {/* Link 바깥에 위치 -> 모달 배경 클릭 등으로 인한 버블링이
          Link의 클릭 핸들러(페이지 이동)까지 닿지 않음 */}
      <div className="absolute bottom-[168px] right-3">
        <QuickAddButton product={productInfo} />
      </div>
    </div>
  );
}