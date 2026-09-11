// src/types/form.ts

// 작품 옵션 폼
export type ProductOptionFormState = {
  id?: string;
  name: string;
  initialQuantity: string;
  remainingQuantity: string;
};

// 작품 폼
export type ProductFormState = {
  name: string;
  price: string;
  category: string;
  subCategory: string;
  initialQuantity: string;
  remainingQuantity: string;
  purchaseLimit: string;
  description: string;
  options: ProductOptionFormState[];
  visible: boolean;
};

// 부스 폼
export type BoothFormState = {
  name: string;
  description: string;
  category: string;
};