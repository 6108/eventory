export type OrderItem = {
  productId: string;
  optionId: string | null; // 옵션 있는 상품이면 옵션 id, 없으면 null
  name: string;
  price: number;
  quantity: number;
  remainingQuantity: number | null; // 담을 당시 남은 재고, null이면 무제한
  purchaseLimit: number | null;
};

export type Order = {
  id: string;
  boothId: string;
  clientTransactionId: string; // 오프라인 로컬 생성 id (동기화용)
  totalAmount: number;
  totalQuantity: number;
  status: "completed" | "cancelled";
  cancelledAt: string | null;
  items: OrderItem[];
  createdAt: string;
  synced: boolean; // 로컬 동기화 상태 표시용, DB엔 없는 프론트 전용 필드
};