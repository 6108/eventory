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
    .select("id, name, register_code")
    .eq("id", boothId)
    .single();

  if (!booth) {
    return <div>부스를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto w-full max-w-lg flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">부스 관리</h1>
        <p className="text-sm text-zinc-400">{booth.name}</p>
      </div>

      <section className="rounded border border-zinc-800 p-4">
        <h2 className="text-sm font-medium text-white mb-2">등록 코드</h2>
        <p className="text-sm text-zinc-400 mb-2">
          이 코드를 같은 부스 인원에게 공유하세요.
        </p>
        <code className="block rounded bg-zinc-900 px-3 py-2 text-primary text-lg tracking-widest">
          {booth.register_code}
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
        href={`/${eventId}/booths/${boothId}/manage/notices`}
        className="rounded bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm text-white text-center"
      >
        공지 관리
      </Link>
    </div>
  );
}