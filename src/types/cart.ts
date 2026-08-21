// src/types/cart.ts

// 고객 장바구니 아이템
// POS의 OrderItem과 달리 부스 정보(boothId/boothName)를 들고 있음
// -> 고객은 여러 부스를 돌아다니며 담기 때문에, 담을 때 어느 부스 상품인지 같이 저장해둬야
//    부스별로 묶어서 보여주고 부스별로 주문서를 보낼 수 있음
export type CartItem = {
  productId: string;
  optionId: string | null;
  optionName: string | null; // 옵션 있으면 표시용 이름 (선택 화면에서 담을 때 같이 저장)
  boothId: string;
  boothName: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  remainingQuantity: number | null; // 담을 당시 남은 재고, null이면 무제한
  purchaseLimit: number | null;
};

// 부스별로 묶은 장바구니 (화면 렌더링/주문서 전송 단위)
export type CartGroup = {
  boothId: string;
  boothName: string;
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
};
