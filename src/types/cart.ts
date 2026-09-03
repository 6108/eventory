// src/types/cart.ts

export type CartItem = {
  productId: string;
  boothId: string;
  optionId: string | null;
  productName: string;
  boothNumber: string;
  boothName: string;
  optionName: string | null; // 옵션 있으면 표시용 이름 (선택 화면에서 담을 때 같이 저장)
  price: number;
  image: string;
  quantity: number;
  remainingQuantity: number | null; // 담을 당시 남은 재고, null이면 무제한
  purchaseLimit: number | null;
  purchased: boolean; // 손님이 "구매 완료"로 개인적으로 체크했는지 (부스로 전송되지 않는 개인 기록용)
};

// 부스별로 묶은 예상목록 (화면 렌더링/주문서 전송 단위)
export type CartGroup = {
  boothId: string;
  boothNumber: string;
  boothName: string;
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
  purchased: boolean; // 이 부스 항목을 통째로 "구매 완료"로 체크했는지
};

export type ServerCartItem = {
  id: string;
  productId: string;
  optionId: string | null;
  quantity: number;
};