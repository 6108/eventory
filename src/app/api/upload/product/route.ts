import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

// 로그인한 사용자가 작품 이미지(대표/상세)를 Supabase Storage에 업로드하는 API
export async function POST(request: Request) {
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

  const formData = await request.formData();

  const file = formData.get("file");
  const boothId = formData.get("boothId");
  const type = formData.get("type");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "이미지 파일이 없습니다." },
      { status: 400 }
    );
  }

  if (typeof boothId !== "string") {
    return NextResponse.json(
      { error: "부스 정보가 없습니다." },
      { status: 400 }
    );
  }

  // type이 없으면 기존 대표 이미지 업로드와 동일하게 동작 (하위 호환)
  const folder = type === "detail" ? "detail" : "main";

  // 현재 로그인한 사용자가 해당 부스의 참여자인지 확인
  const { data: artist } = await supabase
    .from("booth_artists")
    .select("booth_id")
    .eq("booth_id", boothId)
    .eq("artist_id", user.id)
    .maybeSingle();

  if (!artist) {
    return NextResponse.json(
      { error: "이미지를 업로드할 권한이 없습니다." },
      { status: 403 }
    );
  }

  const extension = file.name.split(".").pop() ?? "jpg";

  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `${boothId}/${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error(uploadError);

    return NextResponse.json(
      { error: "이미지 업로드에 실패했습니다." },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("products")
    .getPublicUrl(filePath);

  return NextResponse.json({
    url: publicUrl,
  });
}