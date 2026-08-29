import { ReceiptOrder } from "./order";

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
  | "cancelled";

export type OrderRequest = {
  id: string;
  boothId: string;
  customerId: string;
  customerNickname: string;
  // 요청이 걸린 부스 이름 (마이 오더 영수증 헤더에 표시)
  boothName: string | null;
  items: OrderRequestItem[];
  status: OrderRequestStatus;
  orderId: string | null;
  // order_id가 생기면(POS에서 결제 완료) 실제 영수증 데이터.
  // 아직 결제 전이면 null.
  order: ReceiptOrder | null;
  createdAt: string;
  updatedAt: string;
};