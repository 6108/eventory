export type OrderItem = {
  id: string;
  productId: string;
  optionId: string | null;
  productName: string;
  optionName: string | null;
  unitPrice: number;
  quantity: number;
  cancelledQuantity: number;
  subtotal: number;
};

export type Order = {
  id: string;
  boothId: string;
  clientTransactionId: string;
  // 주문 당시 총액/총수량
  totalAmount: number;
  totalQuantity: number;
  status: "completed" | "cancelled";
  cancelledAt: string | null;
  items: OrderItem[];
  createdAt: string;
  synced?: boolean;
};

export type ReceiptOrderItem = {
  productName: string;
  optionName: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type ReceiptOrder = {
  id: string;
  totalAmount: number;
  totalQuantity: number;
  status: "completed" | "cancelled";
  createdAt: string;
  items: ReceiptOrderItem[];
};