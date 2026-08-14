import { EVENT_ID as eventId } from "@/src/constants/event";
import { UserMenuItem } from "./UserMenuItem";

type Props = {
  boothId: string | null;
  loading: boolean;
  onNavigate: () => void;
};

export function BoothMenu({
  boothId,
  loading,
  onNavigate,
}: Props) {
  if (loading) {
    return null;
  }

  if (!boothId) {
    return (
      <UserMenuItem
        href={`/${eventId}/booths/register`}
        onClick={onNavigate}
      >
        부스 등록
      </UserMenuItem>
    );
  }

  return (
    <>
      <UserMenuItem
        href={`/${eventId}/booths/${boothId}/manage`}
        onClick={onNavigate}
      >
        부스 관리
      </UserMenuItem>

      <UserMenuItem
        href={`/${eventId}/booths/${boothId}/manage/products`}
        onClick={onNavigate}
      >
        상품 관리
      </UserMenuItem>
    </>
  );
}