import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{
    eventId: string;
    boothId: string;
  }>;
}) {
  const { eventId, boothId } = await params;

  return (
    <div>
      <h1>부스 관리</h1>

      <p>이벤트: {eventId}</p>
      <p>부스 ID: {boothId}</p>

      <Link
        href={`/${eventId}/booths/${boothId}/manage/edit`}
        className="inline-block mt-4 rounded bg-primary px-4 py-2 text-sm text-white"
      >
        부스 정보 수정
      </Link>
    </div>
  );
}