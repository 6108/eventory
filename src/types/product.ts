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
      { value: "etc", label: "기타" },

    ],
  },
  {
    value: "sticker",
    label: "스티커",
    types: [
      { value: "sheet", label: "인스" },
      { value: "cut", label: "반칼" },
      { value: "die_cut", label: "완칼/조각" },
      { value: "roll", label: "롤" },
      { value: "kiss", label: "키스컷" },
      { value: "etc", label: "기타" },

    ],
  },
  {
    value: "paper",
    label: "인쇄물",
    types: [
      { value: "postcard", label: "엽서" },
      { value: "photocard", label: "포토카드" },
      { value: "poster", label: "포스터" },
      { value: "etc", label: "기타" },

    ],
  },
  {
    value: "book",
    label: "회지",
    types: [
      { value: "comic", label: "만화책" },
      { value: "novel", label: "소설" },
      { value: "artbook", label: "아트북" },
      { value: "etc", label: "기타" },

    ],
  },
  {
    value: "etc",
    label: "기타",
    types: [
      { value: "cloth", label: "천 굿즈" },
      { value: "button", label: "핀 버튼" },
      { value: "etc", label: "기타" },

    ],
  },
  {
    value: "freebie",
    label: "무료나눔",
    types: [
      { value: "event", label: "이벤트 증정" },
      { value: "gift", label: "구매 증정" },
      { value: "free", label: "무료 배포" },
      { value: "etc", label: "기타" },

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
  price: number | null;
  initialQuantity: number | null;
  remainingQuantity: number | null;
};

// 작품 정보 타입
export type Product = {
  id: string;
  boothId: string;
  artistIds: string[]; // 공동 창작물(회지 등) 가능
  artistNames: string[];
  mainImage: string;
  sampleImages: string[];
  name: string;
  price: number;
  initialQuantity: number | null; // null이면 수량 제한 없음
  remainingQuantity: number | null; // null이면 수량 제한 없음, 판매/취소에 따라 갱신됨
  purchaseLimit: number | null; // null이면 구매 제한 없음
  description: string;
  options: ProductOption[];

  category: ProductCategory;
  subCategory: ProductSubCategory;
};

// POS에서 사용할 작품 정보 타입
export type PosProduct = {
  id: string;
  name: string;
  price: number;
  mainImage: string;
  category: ProductCategory;
  subCategory: ProductSubCategory;
  initialQuantity: number | null;
  remainingQuantity: number | null;
  purchaseLimit: number | null;
  options: ProductOption[];
};

// 작품 요약 정보 타입
export type ProductSummary = {
  id: string;
  boothId: string;
  boothName: string;
  boothNumber: string;
  artistIds: string[];
  artistNames: string[];
  mainImage: string;
  sampleImages: string[];
  name: string;
  price: number;
  category: ProductCategory;
  subCategory: ProductSubCategory;
  remainingQuantity: number | null;
  purchaseLimit: number | null;
  options: ProductOption[];
};

// 좋아요한 작품
export type LikedProduct = {
  likeId: string;
  likedAt: string;
  product: ProductSummary;
};

// 상품 카테고리 개수
export type ProductCategoryCounts = {
  categories: {
    value: ProductCategory;
    count: number;
  }[];
  subCategories: {
    value: ProductSubCategory;
    count: number;
  }[];
};

//페이지네이션
export type ProductListPage = {
  products: ProductSummary[];
  hasMore: boolean;
  nextPage: number | null;
  total: number | null;
};
