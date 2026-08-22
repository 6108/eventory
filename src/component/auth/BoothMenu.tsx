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
        href={`/${eventId}/booths/${boothId}`}
        onClick={onNavigate}
      >
        내 부스 보기
      </UserMenuItem>

      <UserMenuItem
        href={`/${eventId}/booths/${boothId}/manage/pos`}
        onClick={onNavigate}
      >
        포스기
      </UserMenuItem>

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

      <UserMenuItem
        href={`/${eventId}/booths/${boothId}/manage/prepaid`}
        onClick={onNavigate}
      >
        선입금 등록
      </UserMenuItem>
    </>
  );
}