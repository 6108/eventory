// src/app/api/booth/[boothId]/prepaid/[id]/route.ts
// QA #9: usePrepaidRows.toggleRow가 이 엔드포인트로 PATCH를 보내는데
// 라우트 자체가 존재하지 않아 매번 404 → 클라이언트가 낙관적 업데이트를
// 롤백해서 체크가 저장되지 않는 것처럼 보였음. 라우트를 새로 추가해 해결.
// (재업로드 시 체크가 초기화되는 것은 기존 리스트를 삭제 후 새로 삽입하는
// 정책상 의도된 동작이므로 그대로 둠 — 이번 수정 범위 아님)
import { NextResponse } from "next/server";

import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

// 부스 아티스트가 선입금 명단의 특정 행을 "수령 확인" 체크/해제하는 API
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ boothId: string; id: string }> }
) {
  const { boothId, id } = await params;
  const { checked } = (await request.json()) as { checked: boolean };

  if (typeof checked !== "boolean") {
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

  const { data, error } = await supabase
    .from("prepaid")
    .update({ checked })
    .eq("id", id)
    .eq("booth_id", boothId)
    .select("id, row_data, checked, created_at")
    .single();

  if (error) {
    console.error("선입금 체크 상태 변경 실패:", error);

    return NextResponse.json(
      { error: "체크 상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ row: data });
}