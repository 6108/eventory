// src/component/likes/BoothFollowItem.tsx
import Link from "next/link";
import { EVENT_ID as eventId } from "@/src/constants/event";

interface BoothFollowItemProps {
  booth: {
    id: string;
    boothNumber: string;
    name: string;
    category: string;
  };
}

export default function BoothFollowItem({ booth }: BoothFollowItemProps) {
  return (
    <Link href={`/${eventId}/booths/${booth.id}`}>
      <div className="flex flex-col gap-1 rounded-md border border-zinc-800 p-4 hover:bg-zinc-900 transition-colors">
        <span className="text-xs text-zinc-500">{booth.boothNumber}</span>
        <h3 className="text-base text-zinc-200 truncate">{booth.name}</h3>
        <span className="text-xs text-zinc-500">{booth.category}</span>
      </div>
    </Link>
  );
}