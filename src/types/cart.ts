export type CartItem = {
  productId: string;
  optionId?: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  boothId: string;
  clientTransactionId: string; // 오프라인 로컬 생성 id (동기화용)
  totalAmount: number;
  totalQuantity: number;
  items: CartItem[];
  createdAt: string;
  synced?: boolean; // 로컬 동기화 상태 표시용, DB엔 없는 프론트 전용 필드
};