export type ProductOption = {
  name: string;
  quantity: number;
};

type ProductCategoryType =
  | {
    category: "ACRYLIC"; // 아크릴 굿즈
    type: "KEYRING" | "STAND" | "MAGNET" | "SHAKER" | "CLIP" | "COROTTO";
  }
  | {
    category: "STICKER"; // 스티커
    type: "SHEET" | "CUT" | "DIE_CUT" | "ROLL";
  }
  | {
    category: "PAPER"; // 인쇄물
    type: "POSTCARD" | "PHOTOCARD" | "POSTER";
  }
  | {
    category: "BOOK"; // 인쇄 출판물
    type: "COMIC" | "NOVEL" | "ARTBOOK";
  }
  | {
    category: "ETC"; // 기타
    type: "CLOTH" | "BADGE";
  };

export const productCategoryLabel = {
  ACRYLIC: "아크릴",
  STICKER: "스티커",
  PAPER: "인쇄물",
  BOOK: "회지",
  ETC: "기타",
};

export const productTypeLabel = {
  KEYRING: "키링",
  STAND: "스탠드",
  MAGNET: "자석",
  SHAKER: "쉐이커",
  CLIP: "집게",
  COROTTO: "코롯토",

  SHEET: "시트",
  CUT: "컷팅",
  DIE_CUT: "다이컷",
  ROLL: "롤",

  POSTCARD: "엽서",
  PHOTOCARD: "포토카드",
  POSTER: "포스터",

  COMIC: "만화책",
  NOVEL: "소설",
  ARTBOOK: "아트북",

  CLOTH: "천 굿즈",
  BADGE: "뱃지",
};

export type Product = {
  id: string;
  boothId: string;
  artistId: string;
  mainImage: string;
  sampleImages: string[];
  name: string;
  price: number;
  totalQuantity?: number;
  purchaseLimit?: number;
  description: string;
  options?: ProductOption[];
} & ProductCategoryType;