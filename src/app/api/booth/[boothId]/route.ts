import { NextResponse } from "next/server";
import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

// 로그인한 부스 참여자가 부스명, 설명, 유형을 수정하는 API
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;
  const { boothName, description, category } = await request.json();

  if (!boothName?.trim()) {
    return NextResponse.json(
      { error: "부스명을 입력해주세요." },
      { status: 400 }
    );
  }

  if (category !== "GENERAL" && category !== "ADULT") {
    return NextResponse.json(
      { error: "올바르지 않은 부스 유형입니다." },
      { status: 400 }
    );
  }

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

  const { data: booth, error } = await supabase
    .from("booths")
    .update({
      booth_name: boothName.trim(),
      description: description?.trim() ?? "",
      category,
    })
    .eq("id", boothId)
    .select("id, booth_name, description, category")
    .single();

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "부스 정보 수정에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ booth });
}