export type Booth = {
  id: string;
  boothNumber: string;
  boothName: string;
  artistIds: string[]; // 합동 부스 대응, 작가 여러 명 가능
  category: "ADULT" | "GENERAL";
  description?: string;
};