import { EVENT_ID as eventId } from "@/src/constants/event";
import UserMenuItem from "./UserMenuItem";

interface BoothMenuProps {
  boothId: string | null;
  loading: boolean;
  onNavigate: () => void;
};

export default function BoothMenu({ boothId, loading, onNavigate }: BoothMenuProps) {
  if (loading) {
    return null;
  }

  if (!boothId) {
    return (
      <UserMenuItem href={`/${eventId}/booths/register`} onClick={onNavigate}>
        부스 연결
      </UserMenuItem>
    );
  }

  return (
    <>
      <UserMenuItem href={`/${eventId}/booths/${boothId}`} onClick={onNavigate}>
        부스 페이지 보기
      </UserMenuItem>

      <UserMenuItem href={`/${eventId}/booths/${boothId}/manage/pos`} onClick={onNavigate}>
        판매 (POS)
      </UserMenuItem>

      <UserMenuItem href={`/${eventId}/booths/${boothId}/manage`} onClick={onNavigate}>
        부스 관리
      </UserMenuItem>
    </>
  );
}