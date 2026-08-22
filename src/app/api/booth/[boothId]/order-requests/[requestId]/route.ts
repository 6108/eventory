// src/app/api/booth/[boothId]/order-requests/[requestId]/route.ts

import { NextResponse } from "next/server";

import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

const ALLOWED_STATUSES = ["requested", "checked", "cancelled"] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

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

  const { error } = await supabase
    .from("order_requests")
    .update({ status })
    .eq("id", requestId)
    .eq("booth_id", boothId);

  if (error) {
    console.error("주문 요청 상태 변경 실패:", error);

    return NextResponse.json(
      { error: "상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}