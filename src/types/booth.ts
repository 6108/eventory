export type Booth = {
  id: string;
  boothNumber: string;
  boothName: string;
  artistIds: string[];
  category: "ADULT" | "GENERAL";
  description: string;
  products: string[];
};