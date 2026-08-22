// src/store/orderStore.ts
import { create } from "zustand";
import { OrderItem } from "../types/order";

// 어떤 고객 주문 요청을 "확인"해서 담았을 때, 정확히 뭘 얼마나 담았는지 기록.
// 용도 두 가지:
// 1) 되돌리기 — 부스러가 그 사이 수량을 더 늘렸어도 원래 담긴 만큼만 정확히 뺄 수 있게
// 2) 결제 완료 시 — 이 결제가 어떤 고객 주문 요청들에서 왔는지 알아야
//    해당 요청들을 completed로 표시하고 영수증과 연결할 수 있음
type CheckedRequestEntry = {
  items: { productId: string; optionId: string | null; quantity: number }[];
};

interface OrderState {
  items: OrderItem[];
  checkedRequests: Record<string, CheckedRequestEntry>; // key: orderRequestId

  addItem: (item: OrderItem) => void;
  increment: (productId: string, optionId: string | null) => void;
  decrement: (productId: string, optionId: string | null) => void;
  // 지정한 수량만큼만 줄임 (0 이하가 되면 항목 제거). 고객 주문 요청 "되돌리기" 전용 —
  // 부스러가 그 사이 수량을 더 늘려놨어도 원래 담겼던 만큼만 정확히 빼기 위함
  decrementBy: (
    productId: string,
    optionId: string | null,
    quantity: number
  ) => void;
  removeItem: (productId: string, optionId: string | null) => void;
  clear: () => void;
  totalAmount: () => number;
  totalQuantity: () => number;

  markRequestChecked: (
    requestId: string,
    items: CheckedRequestEntry["items"]
  ) => void;
  unmarkRequestChecked: (requestId: string) => CheckedRequestEntry["items"];
}

export const useOrderStore = create<OrderState>((set, get) => ({
  items: [],
  checkedRequests: {},

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) =>
          i.productId === item.productId && i.optionId === item.optionId
      );

      if (existing) {
        const nextQuantity = existing.quantity + item.quantity;

        return {
          items: state.items.map((i) =>
            i.productId === item.productId && i.optionId === item.optionId
              ? { ...i, quantity: nextQuantity }
              : i
          ),
        };
      }

      return {
        items: [...state.items, item],
      };
    }),

  increment: (productId, optionId) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.productId !== productId || item.optionId !== optionId) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }),
    })),

  decrement: (productId, optionId) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.productId === productId && item.optionId === optionId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),

  decrementBy: (productId, optionId, quantity) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.productId === productId && item.optionId === optionId
            ? { ...item, quantity: item.quantity - quantity }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),

  removeItem: (productId, optionId) =>
    set((state) => ({
      items: state.items.filter(
        (item) =>
          !(item.productId === productId && item.optionId === optionId)
      ),
    })),

  clear: () => set({ items: [], checkedRequests: {} }),

  totalAmount: () =>
    get().items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    ),

  totalQuantity: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  markRequestChecked: (requestId, items) =>
    set((state) => ({
      checkedRequests: {
        ...state.checkedRequests,
        [requestId]: { items },
      },
    })),

  unmarkRequestChecked: (requestId) => {
    const entry = get().checkedRequests[requestId];

    set((state) => {
      const next = { ...state.checkedRequests };
      delete next[requestId];
      return { checkedRequests: next };
    });

    return entry?.items ?? [];
  },
}));