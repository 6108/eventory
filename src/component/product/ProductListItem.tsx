import { Product, productCategories } from "@/src/types/product";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { mockBooths } from "@/src/mocks/booths";
import { mockArtists } from "@/src/mocks/user";
import Image from "next/image";
import Link from "next/link";
import Badge from "../booth/Badge";
import Like from "./Like";

interface ProductListItemProps {
  productInfo: Product;
}

export default function ProductListItem({
  productInfo,
}: ProductListItemProps) {
  const booth = mockBooths.find(
    (booth) => booth.id === productInfo.boothId
  );

  const artist = mockArtists.find(
    (artist) => artist.id === productInfo.artistId
  );

  const category = productCategories.find(
    (item) => item.value === productInfo.category
  );

  const subCategory = category?.types.find(
    (item) => item.value === productInfo.subCategory
  );

  return (
    <Link href={`/${eventId}/products/${productInfo.id}`}>
      <div className="flex flex-col gap-4 cursor-pointer rounded-md p-2 hover:bg-primary/40 transition-colors">
        <div className="relative aspect-square w-full">
          <Image
            src={productInfo.mainImage}
            alt={productInfo.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover rounded"
          />

          <div className="flex justify-between">
            <span className="absolute top-1 left-1 flex items-center justify-center px-2 py-1 bg-primary text-zinc-300 rounded-sm text-xs font-semibold">
              신상품
            </span>
            <Like />
          </div>


          <Badge />
        </div>

        <div className="flex flex-col justify-center w-full">
          <span className="text-xs text-zinc-500">
            <span>
              {category?.label}
              {" > "}
              {subCategory?.label}
            </span>
          </span>
          <div className="flex min-w-0 truncate text-sm text-zinc-400">
            <span className="truncate">
              {booth?.boothName}
            </span>
            <span className="shrink-0">
              {" - "}{artist?.name}
            </span>
          </div>
          <h3 className="text-base text-zinc-300 line-clamp-2 min-h-20">
            {productInfo.name}
          </h3>

          <p className="text-xl font-semibold">
            {productInfo.price.toLocaleString()}원
          </p>
        </div>
      </div>
    </Link >
  );
}