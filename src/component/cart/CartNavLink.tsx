// src/component/cart/CartNavLink.tsx
"use client";

import Link from "next/link";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { useCartStore } from "@/src/store/cartStore";
import { useHasMounted } from "@/src/hooks/useHasMounted";

export default function CartNavLink() {
  const hasMounted = useHasMounted();

  // 로그인 여부와 무관하게 항상 노출 (누구나 장바구니 담을 수 있음)
  const totalQuantity = useCartStore((s) => s.totalQuantity());

  // 마운트 전(서버 렌더링 시점)에는 localStorage 값을 알 수 없으므로
  // 항상 0으로 취급해서 서버/클라이언트 렌더링 결과를 맞춤 -> hydration mismatch 방지
  const displayQuantity = hasMounted ? totalQuantity : 0;

  return (
    <Link
      href={`/${eventId}/cart`}
      className="relative text-primary hover:text-white whitespace-nowrap"
    >
      장바구니
      {displayQuantity > 0 && (
        <span className="absolute -top-2 -right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {displayQuantity > 99 ? "99+" : displayQuantity}
        </span>
      )}
    </Link>
  );
}