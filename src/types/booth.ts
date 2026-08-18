// input의 값은 항상 string이라 state도 string으로 둠
// 숫자는 제출할 때만 Number()로 변환
export type Booth = {
  id: string;
  eventId: string;
  boothNumber: string;
  boothName: string;
  artistNames: string[];
  category: "ADULT" | "GENERAL";
  description: string;
}