// src/app/api/booth/[boothId]/order-requests/[requestId]/route.ts

import { NextResponse } from "next/server";

import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

const ALLOWED_STATUSES = ["requested", "checked", "cancelled"] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

// 각 목표 상태로 갈 수 있는 "현재 상태"의 화이트리스트.
// 부스당 POS 기기가 2대 이상일 때, 두 기기가 같은 요청을 거의 동시에
// 처리해도 한쪽만 성공하도록 조건부 UPDATE로 막기 위함.
const ALLOWED_FROM_STATUSES: Record<AllowedStatus, AllowedStatus[]> = {
  checked: ["requested"], // 확인: 아직 대기중인 요청만
  requested: ["checked"], // 되돌리기: 확인된 요청만
  cancelled: ["requested"], // 삭제: 아직 대기중인 요청만 (UI에서도 확인된 건 삭제 버튼 자체가 없음)
};

// 부스러가 주문 요청을 "확인함" 처리하거나(POS 담기와 함께 호출),
// 잘못 눌렀을 때 다시 "requested"로 되돌리는 용도.

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ boothId: string; requestId: string }> }
) {
  const { boothId, requestId } = await params;

  const { status } = (await request.json()) as { status: AllowedStatus };

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "잘못된 상태값입니다." },
      { status: 400 }
    );
  }

  const authResult = await requireBoothArtist(boothId);

  if (authResult instanceof NextResponse) return authResult;

  const { supabase } = authResult;

  // .in("status", ...)를 조건에 함께 걸어서, 이 요청이 여전히 기대하는
  // 상태일 때만 업데이트되게 한다. 다른 기기가 먼저 처리했다면 영향받은
  // row가 0개가 되어 update() 자체는 성공하지만 data가 비어있게 된다.
  //
  // .is("order_id", null)도 함께 건다 — status는 결제 완료 후에도 계속
  // 'checked'로 남아있고 order_id만 채워지는 구조라, status 조건만으로는
  // "이미 결제된 요청"을 걸러내지 못한다. 이게 없으면 기기 A에서 결제까지
  // 끝낸 요청을, 아직 화면이 안 새로고침된 기기 B에서 "되돌리기"를 눌러
  // 다시 대기 목록에 올려버릴 수 있다 (이미 판 걸 또 팔게 되는 위험).
  const { data, error } = await supabase
    .from("order_requests")
    .update({ status })
    .eq("id", requestId)
    .eq("booth_id", boothId)
    .in("status", ALLOWED_FROM_STATUSES[status])
    .is("order_id", null)
    .select("id");

  if (error) {
    console.error("주문 요청 상태 변경 실패:", error);

    return NextResponse.json(
      { error: "상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    // 이미 다른 기기(또는 이전 요청)가 상태를 바꿔놓은 경우.
    // 클라이언트는 이 응답을 받으면 캐시를 무효화해서 최신 상태를 다시 받아야 한다.
    return NextResponse.json(
      { error: "이미 다른 기기에서 처리된 요청입니다." },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true });
}