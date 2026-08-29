// src/app/[eventId]/cart/page.tsx
import CartView from "@/src/component/cart/CartView";

export default function Page() {
  // 구매할 것 목록은 로그인 여부와 상관없이 로컬(zustand persist)에 저장됨 (likes 페이지와 달리 로그인 필수 아님)
  return (
    <div className="px-4 py-6">
      <CartView />
    </div>
  );
}
