// src/app/[eventId]/booths/[boothId]/manage/page.tsx
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string; boothId: string }>;
}) {
  const { eventId, boothId } = await params;
  const supabase = await createClient();

  const { data: booth } = await supabase
    .from("booths")
    .select("id, booth_name, booth_number")
    .eq("id", boothId)
    .single();

  if (!booth) {
    return <div>부스를 찾을 수 없습니다.</div>;
  }

  // register_code는 컬럼이 아니라 booth_codes 테이블에 분리되어 있고,
  // RLS로 직접 조회가 막혀있어서 권한 체크가 포함된 RPC로만 가져올 수 있음
  const { data: boothCode, error: boothCodeError } = await supabase.rpc(
    "get_booth_code",
    { p_booth_id: boothId }
  );

  if (boothCodeError) {
    console.error("부스 코드 조회 실패:", boothCodeError);
  }

  return (
    <div className="mx-auto w-full max-w-lg flex flex-col gap-2">
      <div>
        <h1 className="text-xl font-semibold text-white pb-8">부스 관리</h1>
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-primary" />
          <p className="text-lg font-semibold tracking-tight text-zinc-100">
            {booth.booth_name}
          </p>
        </div>
        <p className=" text-zinc-500">부스 번호: {booth.booth_number}</p>
      </div>

      <section className="rounded border border-zinc-800 p-4">
        <h2 className="text-sm font-medium text-white mb-2">등록 코드</h2>
        <p className="text-sm text-zinc-400 mb-2">
          이 코드를 같은 부스 인원에게 공유하세요.
        </p>
        <code className="block rounded bg-zinc-900 px-3 py-2 text-primary text-lg tracking-widest">
          {boothCode ?? "코드를 불러올 수 없습니다."}
        </code>
      </section>

      <Link
        href={`/${eventId}/booths/${boothId}/manage/edit`}
        className="rounded bg-primary px-4 py-2 text-sm text-white text-center"
      >
        부스 정보 수정
      </Link>

      <Link
        href={`/${eventId}/booths/${boothId}/manage/products`}
        className="rounded bg-primary px-4 py-2 text-sm text-white text-center"
      >
        상품 관리
      </Link>

      <Link
        href={`/${eventId}/booths/${boothId}/manage/prepaid`}
        className="rounded bg-primary px-4 py-2 text-sm text-white text-center"
      >
        선입금 관리
      </Link>

      <Link
        href={`/${eventId}/booths/${boothId}/manage/stats`}
        className="rounded bg-primary px-4 py-2 text-sm text-white text-center"
      >
        정산 · 통계
      </Link>
    </div>
  );
}