export type Booth = {
  id: string;
  eventId: string;
  boothNumber: string;
  boothName: string;
  artistName: string; // 이건 그냥 이름만 표시하려고
  artistIds: string[]; // 합동 부스 대응, 작가 여러 명 가능
  category: "ADULT" | "GENERAL";
  description?: string;
};