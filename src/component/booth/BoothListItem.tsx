import { Booth } from "@/src/types/booth";
import { EVENT_ID as eventId } from "@/src/constants/event";
import Link from "next/link";

interface BoothListItemProps {
  boothInfo: Booth;
}

const categoryLabel: Record<Booth["category"], string> = {
  ADULT: "성인",
  GENERAL: "일반",
};

export default function BoothListItem({
  boothInfo,
}: BoothListItemProps) {
  const isAdult = boothInfo.category === "ADULT";

  return (
    <Link
      href={`/${eventId}/booths/${boothInfo.id}`}
      className="text-inherit no-underline"
    >
      <div className="grid grid-cols-[4rem_minmax(0,1fr)_5rem_3.5rem] items-center gap-0 border-t border-zinc-800 py-2 sm:grid-cols-[4rem_minmax(0,1fr)_6rem_5rem] sm:py-1">
        <span className="truncate text-center text-primary">
          {boothInfo.boothNumber}
        </span>

        <span className="min-w-0 line-clamp-3 px-2">
          {boothInfo.boothName}
        </span>

        <span className="min-w-0 line-clamp-3 px-1 text-center text-sm text-zinc-400 sm:text-base sm:text-inherit">
          {boothInfo.artistNames.length > 0
            ? boothInfo.artistNames.join(", ")
            : "-"}
        </span>

        <span
          className={`text-center text-sm sm:text-base ${isAdult ? "text-primary" : ""
            }`}
        >
          {categoryLabel[boothInfo.category]}
        </span>
      </div>
    </Link>
  );
}