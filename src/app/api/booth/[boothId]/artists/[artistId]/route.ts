import { NextResponse } from "next/server";
import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

// 부스 소속 작가를 부스에서 내보내는 API.
// 다른 작가를 잘못 등록했을 때 내보내는 용도로도, 본인이 스스로
// 나가는 용도로도 쓸 수 있다 (artistId가 로그인한 유저 자신이어도 됨).
//
// 주의: 이 작업은 booth_artists 관계만 삭제한다.
// - 해당 유저의 계정(users)이나 로그인 자체는 건드리지 않는다.
// - 그 작가가 이미 등록한 products(artist_ids/artist_names)는
//   그대로 남는다 — 상품은 이미 만들어진 결과물이라 소속이 바뀌었다고
//   작성자 기록까지 지우는 건 과하다고 판단. 필요하면 별도 정리 필요.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ boothId: string; artistId: string }> }
) {
  const { boothId, artistId } = await params;

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

  const { error } = await supabase.rpc("remove_booth_artist", {
    p_booth_id: boothId,
    p_artist_id: artistId,
  });

  if (error) {
    console.error("부스 작가 삭제 실패:", error);

    // RPC에서 raise exception으로 던진 한글 메시지를 그대로 노출
    // (마지막 남은 작가 삭제 시도, 권한 없음 등)
    return NextResponse.json(
      { error: error.message || "작가 삭제에 실패했습니다." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}