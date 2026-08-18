// src/component/product/ProductManageListItem.tsx
import Link from "next/link";
import Image from "next/image";

interface ProductManageListItemProps {
  href: string;
  name: string;
  price: number;
  mainImageUrl: string | null;
  priority?: boolean;
}

export default function ProductManageListItem({
  href,
  name,
  price,
  mainImageUrl,
  priority = false,
}: ProductManageListItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded border border-zinc-800 p-3 hover:bg-zinc-900"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-zinc-900">
        {mainImageUrl && (
          <Image
            src={mainImageUrl}
            alt={name}
            width={56}
            height={56}
            priority={priority}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-white">{name}</p>
        <p className="text-sm text-zinc-400">{price.toLocaleString()}원</p>
      </div>

      <span className="shrink-0 text-xs text-zinc-500">
        재고 {"-"}
      </span>
    </Link>
  );
}