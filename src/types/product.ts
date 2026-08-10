export const productCategories = [
  {
    value: "acrylic",
    label: "아크릴",
    types: [
      { value: "keyring", label: "키링" },
      { value: "stand", label: "스탠드" },
      { value: "magnet", label: "자석" },
      { value: "shaker", label: "쉐이커" },
      { value: "clip", label: "집게" },
      { value: "corotto", label: "코롯토" },
    ],
  },
  {
    value: "sticker",
    label: "스티커",
    types: [
      { value: "sheet", label: "인스" },
      { value: "cut", label: "반칼" },
      { value: "die_cut", label: "완칼" },
      { value: "roll", label: "롤" },
    ],
  },
  {
    value: "paper",
    label: "인쇄물",
    types: [
      { value: "postcard", label: "엽서" },
      { value: "photocard", label: "포토카드" },
      { value: "poster", label: "포스터" },
    ],
  },
  {
    value: "book",
    label: "회지",
    types: [
      { value: "comic", label: "만화책" },
      { value: "novel", label: "소설" },
      { value: "artbook", label: "아트북" },
    ],
  },
  {
    value: "etc",
    label: "기타",
    types: [
      { value: "cloth", label: "천 굿즈" },
      { value: "badge", label: "뱃지" },
    ],
  },
] as const;

// 배열에서 타입을 자동으로 뽑아냄
type CategoryItem = (typeof productCategories)[number];
export type ProductCategory = CategoryItem["value"];
export type ProductSubCategory = CategoryItem["types"][number]["value"];

export type ProductOption = {
  id: string;
  name: string;
  quantity: number;
};

export type Product = {
  id: string;
  boothId: string;
  artistIds?: string[]; //공동 창작물(회지 등) 가능
  mainImage: string;
  sampleImages: string[];
  name: string;
  price: number;
  totalQuantity?: number;
  purchaseLimit?: number;
  description: string;
  options?: ProductOption[];

  category: ProductCategory;
  subCategory: ProductSubCategory;
} 