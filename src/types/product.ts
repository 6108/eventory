export const productCategories = [
  {
    value: "ACRYLIC",
    label: "아크릴",
    types: [
      { value: "KEYRING", label: "키링" },
      { value: "STAND", label: "스탠드" },
      { value: "MAGNET", label: "자석" },
      { value: "SHAKER", label: "쉐이커" },
      { value: "CLIP", label: "집게" },
      { value: "COROTTO", label: "코롯토" },
    ],
  },
  {
    value: "STICKER",
    label: "스티커",
    types: [
      { value: "SHEET", label: "인스" },
      { value: "CUT", label: "반칼" },
      { value: "DIE_CUT", label: "완칼" },
      { value: "ROLL", label: "롤" },
    ],
  },
  {
    value: "PAPER",
    label: "인쇄물",
    types: [
      { value: "POSTCARD", label: "엽서" },
      { value: "PHOTOCARD", label: "포토카드" },
      { value: "POSTER", label: "포스터" },
    ],
  },
  {
    value: "BOOK",
    label: "회지",
    types: [
      { value: "COMIC", label: "만화책" },
      { value: "NOVEL", label: "소설" },
      { value: "ARTBOOK", label: "아트북" },
    ],
  },
  {
    value: "ETC",
    label: "기타",
    types: [
      { value: "CLOTH", label: "천 굿즈" },
      { value: "BADGE", label: "뱃지" },
    ],
  },
] as const;

export type ProductCategory =
  | "ACRYLIC"
  | "STICKER"
  | "PAPER"
  | "BOOK"
  | "ETC";

export type ProductSubCategory =
  | "KEYRING"
  | "STAND"
  | "MAGNET"
  | "SHAKER"
  | "CLIP"
  | "COROTTO"
  | "SHEET"
  | "CUT"
  | "DIE_CUT"
  | "ROLL"
  | "POSTCARD"
  | "PHOTOCARD"
  | "POSTER"
  | "COMIC"
  | "NOVEL"
  | "ARTBOOK"
  | "CLOTH"
  | "BADGE";

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