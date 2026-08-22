import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

// 부스 아티스트가 엑셀 파싱된 선입금 리스트를 저장 (기존 것 지우고 새로 덮어쓰기)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;
  const { rows } = await request.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: "업로드할 데이터가 없습니다." },
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

  const { data: artist } = await supabase
    .from("booth_artists")
    .select("booth_id")
    .eq("booth_id", boothId)
    .eq("artist_id", user.id)
    .maybeSingle();

  if (!artist) {
    return NextResponse.json(
      { error: "수정 권한이 없습니다." },
      { status: 403 }
    );
  }

  const { error: deleteError } = await supabase
    .from("prepaid")
    .delete()
    .eq("booth_id", boothId);

  if (deleteError) {
    console.error(deleteError);

    return NextResponse.json(
      { error: "기존 리스트 삭제에 실패했습니다." },
      { status: 500 }
    );
  }

  const { data: inserted, error: insertError } = await supabase
    .from("prepaid")
    .insert(
      rows.map((r: { cells: Record<string, string> }) => ({
        booth_id: boothId,
        row_data: r.cells,
      }))
    )
    .select("id, row_data, checked, created_at");

  if (insertError) {
    console.error(insertError);

    return NextResponse.json(
      { error: "선입금 리스트 저장에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ rows: inserted });
}

// 저장된 선입금 리스트 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;

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

  const { data: artist } = await supabase
    .from("booth_artists")
    .select("booth_id")
    .eq("booth_id", boothId)
    .eq("artist_id", user.id)
    .maybeSingle();

  if (!artist) {
    return NextResponse.json(
      { error: "조회 권한이 없습니다." },
      { status: 403 }
    );
  }

  const { data: rows, error } = await supabase
    .from("prepaid")
    .select("id, row_data, checked, created_at")
    .eq("booth_id", boothId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "선입금 리스트 조회에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ rows });
}