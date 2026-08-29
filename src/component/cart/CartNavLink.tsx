"use client";

import Link from "next/link";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { useCartStore } from "@/src/store/cartStore";
import { useHasMounted } from "@/src/hooks/useHasMounted";

export default function CartNavLink() {
  const hasMounted = useHasMounted();

  const totalQuantity = useCartStore((s) => s.totalQuantity());

  const displayQuantity = hasMounted ? totalQuantity : 0;

  return (
    <Link
      href={`/${eventId}/cart`}
      className="relative text-primary hover:text-white whitespace-nowrap inline-flex items-center gap-1"
    >
      구매할 것

      {displayQuantity > 0 && (
        <span
          className="
          inline-flex items-center justify-center
          h-4 min-w-4 rounded-full
          bg-red-500 px-1
          text-[10px] font-semibold leading-none text-white
          -translate-y-[1px]
      
          sm:absolute sm:-top-2 sm:-right-3 sm:translate-y-0
        "
        >
          {displayQuantity > 99 ? "99+" : displayQuantity}
        </span>
      )}
    </Link>
  );
}