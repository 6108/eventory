// src/app/api/booth/[boothId]/order-requests/route.ts

import { NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";
import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";
import { OrderRequestItem } from "@/src/types/request";
import { getBoothOrderRequests } from "@/src/lib/data/request";

// 부스러가 자기 부스로 들어온 주문 요청 목록을 조회 (POS/관리 화면에서 폴링용).
// 부스 소유/스태프만 볼 수 있어야 하므로 requireBoothArtist로 권한 체크.

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;

  const authResult = await requireBoothArtist(boothId);

  if (authResult instanceof NextResponse) return authResult;

  const requests = await getBoothOrderRequests(boothId);

  return NextResponse.json({ requests });
}

// 손님이 주문 요청을 보냄 (로그인 필요).
// 대기열이 아니라 편의 도구이므로, 손님 한 명당 한 부스에 요청은 항상 1개만 유지 —
// 재전송 시 새로 만들지 않고 기존 요청을 갱신해서 "최신 내용으로 갱신"되게 함.

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;

  const { items } = (await request.json()) as {
    items: {
      productId: string;
      optionId: string | null;
      productName: string;
      optionName: string | null;
      quantity: number;
    }[];
  };

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "보낼 작품이 없습니다." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const nickname = user.user_metadata?.name ?? "손님";

  const { data: requestId, error } = await supabase.rpc(
    "create_order_request",
    {
      p_booth_id: boothId,
      p_customer_nickname: nickname,
      p_items: items.map((item) => ({
        product_id: item.productId,
        option_id: item.optionId,
        product_name: item.productName,
        option_name: item.optionName,
        quantity: item.quantity,
      })),
    }
  );

  if (error) {
    console.error("주문 요청 생성 실패:", error);

    if (error.message?.startsWith("unauthorized")) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    if (error.message?.startsWith("empty items")) {
      return NextResponse.json(
        { error: "보낼 작품이 없습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "주문 요청 전송에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    id: requestId,
  });
}