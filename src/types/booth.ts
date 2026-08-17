export type Booth = {
  id: string;
  eventId: string;
  boothNumber: string;
  boothName: string;
  artistNames: string[];
  category: "ADULT" | "GENERAL";
  description: string;
};