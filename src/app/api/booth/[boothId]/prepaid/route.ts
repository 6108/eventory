import { NextResponse } from "next/server";
import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

// GET 라우트가 정적으로 캐시되면(브라우저/CDN/Next 라우트 캐시) 새로고침 시
// 체크 전 상태의 옛 응답이 재사용돼 "체크박스가 새로고침하면 풀리는" 것처럼
// 보일 수 있다. 매 요청마다 항상 새로 조회하도록 강제한다.
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

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

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

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