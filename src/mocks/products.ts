import { Product } from "../types/product";

export const mockProducts: Product[] = [
  {
    id: "product_001",
    boothId: "booth_001",
    artistId: "artist_001",

    category: "ACRYLIC",
    type: "KEYRING",

    mainImage: "/images/logo.png",
    sampleImages: ["/images/logo.png"],

    name: "달빛 고양이 아크릴 키링",
    price: 8000,
    totalQuantity: 50,
    purchaseLimit: 2,
    description: "달빛 고양이 캐릭터 아크릴 키링입니다.",

    options: [
      { name: "하늘색", quantity: 25 },
      { name: "보라색", quantity: 25 },
    ],
  },

  {
    id: "product_002",
    boothId: "booth_001",
    artistId: "artist_002",

    category: "STICKER",
    type: "SHEET",

    mainImage: "/images/logo.png",
    sampleImages: [],

    name: "냥냥 인스 스티커",
    price: 3000,
    totalQuantity: 100,
    purchaseLimit: 5,
    description: "여러 캐릭터가 들어있는 인쇄 스티커 시트입니다.",
  },

  {
    id: "product_003",
    boothId: "booth_001",
    artistId: "artist_001",

    category: "BOOK",
    type: "ARTBOOK",

    mainImage: "/images/logo.png",
    sampleImages: ["/images/logo.png"],

    name: "별의 기록 일러스트북",
    price: 15000,
    totalQuantity: 30,
    purchaseLimit: 1,
    description: "창작 일러스트 모음집입니다.",
  },

  {
    id: "product_004",
    boothId: "booth_001",
    artistId: "artist_002",

    category: "PAPER",
    type: "POSTCARD",

    mainImage: "/images/logo.png",
    sampleImages: [],

    name: "푸른 정원 엽서 세트",
    price: 5000,
    purchaseLimit: 3,
    description: "오리지널 일러스트 엽서 5종 세트입니다.",
  },

  {
    id: "product_005",
    boothId: "booth_001",
    artistId: "artist_001",

    category: "ETC",
    type: "BADGE",

    mainImage: "/images/logo.png",
    sampleImages: [],

    name: "캐릭터 캔뱃지",
    price: 2500,
    totalQuantity: 80,
    purchaseLimit: 5,
    description: "캐릭터 일러스트 캔뱃지입니다.",
  },

  {
    id: "product_006",
    boothId: "booth_001",
    artistId: "artist_002",

    category: "ACRYLIC",
    type: "STAND",

    mainImage: "/images/logo.png",
    sampleImages: [],

    name: "별빛 아크릴 스탠드",
    price: 12000,
    totalQuantity: 40,
    purchaseLimit: 2,
    description: "캐릭터 일러스트 아크릴 스탠드입니다.",
  },

  {
    id: "product_007",
    boothId: "booth_003",
    artistId: "artist_004",

    category: "STICKER",
    type: "DIE_CUT",

    mainImage: "/images/logo.png",
    sampleImages: [],

    name: "캐릭터 다이컷 스티커",
    price: 2000,
    totalQuantity: 150,
    purchaseLimit: 5,
    description: "캐릭터 모양으로 재단된 스티커입니다.",
  },

  {
    id: "product_008",
    boothId: "booth_003",
    artistId: "artist_005",

    category: "PAPER",
    type: "PHOTOCARD",

    mainImage: "/images/logo.png",
    sampleImages: ["/images/logo.png"],

    name: "일러스트 포토카드 세트",
    price: 3000,
    totalQuantity: 100,
    purchaseLimit: 3,
    description: "오리지널 일러스트 포토카드 세트입니다.",

    options: [
      { name: "A 타입", quantity: 50 },
      { name: "B 타입", quantity: 50 },
    ],
  },

  {
    id: "product_009",
    boothId: "booth_005",
    artistId: "artist_008",

    category: "BOOK",
    type: "COMIC",

    mainImage: "/images/logo.png",
    sampleImages: [],

    name: "캐릭터 단편 만화 회지",
    price: 7000,
    totalQuantity: 60,
    purchaseLimit: 2,
    description: "캐릭터들의 이야기를 담은 단편 만화 회지입니다.",
  },

  {
    id: "product_010",
    boothId: "booth_002",
    artistId: "artist_003",

    category: "ACRYLIC",
    type: "MAGNET",

    mainImage: "/images/logo.png",
    sampleImages: [],

    name: "아크릴 자석 굿즈",
    price: 5000,
    totalQuantity: 70,
    purchaseLimit: 3,
    description: "냉장고나 금속 표면에 붙일 수 있는 아크릴 자석입니다.",
  },
];