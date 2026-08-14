// src/types/form.ts

// input의 값은 항상 string이라 state도 string으로 둠
// 숫자는 제출할 때만 Number()로 변환
// 상품 폼
export type ProductFormState = {
  name: string;
  price: string;
  category: string;
  subCategory: string;
  totalQuantity: string;
  purchaseLimit: string;
  description: string;
};

// 부스 폼
export type BoothFormState = {
  name: string;
  description: string;
  category: string;
};