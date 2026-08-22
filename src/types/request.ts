// src/types/orderRequest.ts

// 고객이 부스러에게 미리 보내는 "주문 요청" 한 건
//
// 주의: 이건 대기열이 아니라 부스러의 실수 방지를 돕는 참고용 편의 도구.
// 여기서 orders(확정 주문/영수증)로 자동 승격되는 경우는 없음 — 항상 부스러가
// POS 상품판매 화면에서 결제를 눌러야만 확정됨.

export type OrderRequestItem = {
  id: string;
  orderRequestId: string;
  productId: string;
  optionId: string | null;
  productName: string;
  optionName: string | null;
  quantity: number;
};

export type OrderRequestStatus =
  | "requested"
  | "checked"
  | "cancelled"
  | "completed"; // 부스러가 확인 후 결제까지 마쳐서 실제 영수증(order)으로 이어진 상태

export type OrderRequest = {
  id: string;
  boothId: string;
  customerId: string;
  customerNickname: string;
  items: OrderRequestItem[];
  status: OrderRequestStatus;
  orderId: string | null; // completed일 때만 값 있음 — 어떤 영수증으로 이어졌는지
  createdAt: string;
  updatedAt: string; // 정렬 기준 (최신순) — 재전송 시 이 값이 갱신됨
};

export type MyOrderRequest = {
  id: string;
  boothId: string;
  boothName: string | null;
  items: OrderRequestItem[];
  status: OrderRequestStatus;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    totalAmount: number;
    totalQuantity: number;
    status: string;
    createdAt: string;
  } | null;
};