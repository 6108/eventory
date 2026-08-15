import { Booth } from '@/src/types/booth';
import { EVENT_ID as eventId } from "@/src/constants/event";
import Link from 'next/link';
import { mockArtists } from '@/src/mocks/user';

interface BoothListItemProps {
  boothInfo: Booth;
}

export default function BoothListItem({ boothInfo }: BoothListItemProps) {
  const isAdult = boothInfo.category === "ADULT";

  const artists = mockArtists.filter(
    (artist) => boothInfo.artistIds.includes(artist.id)
  );

  return (
    <Link
      href={`/${eventId}/booths/${boothInfo.id}`}
      className="text-inherit no-underline"
    >
      <div className="flex border-t hover:bg-primary/40 hover:shadow-sm cursor-pointer p-1">
        <span className="w-16 text-right px-2 text-primary">
          {boothInfo.boothNumber}
        </span>

        <span className="flex-1 px-2 line-clamp-3">
          {boothInfo.boothName}
        </span>

        <span className="w-1/4 px-2 line-clamp-3">
          {boothInfo.artistName}
        </span>

        <span
          className={`w-20 text-center ${isAdult ? "text-primary" : ""
            }`}
        >
          {boothInfo.category}
        </span>
      </div>
    </Link>
  );
}