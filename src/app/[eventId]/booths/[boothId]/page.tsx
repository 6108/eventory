import ProductExplorer from "@/src/component/product/ProductExplorer";
import { createClient } from "@/src/lib/supabase/server";
import { getBooth } from "@/src/lib/data/booth";
import { getProductSummaries } from "@/src/lib/data/product";

export default async function Page({
  params,
}: {
  params: Promise<{ boothId: string }>;
}) {
  const { boothId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const booth = await getBooth(boothId);

  if (!booth) {
    return <div>부스를 찾을 수 없습니다.</div>;
  }

  const products = await getProductSummaries(boothId);

  return (
    <div>
      <h1>{booth.boothName}</h1>

      <p>부스번호: {booth.boothNumber}</p>

      <p>작가: {booth.artistNames.join(", ")}</p>


      <p>구분: {booth.category}</p>

      <p>선입금 링크: </p>

      <h2 className="pt-24">판매 제품</h2>

      <ProductExplorer
        products={products}
        currentUserId={user?.id}
      />
    </div>
  );
}