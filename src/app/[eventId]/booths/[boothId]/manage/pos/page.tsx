// src/app/[eventId]/booths/[boothId]/manage/pos/page.tsx
import { createClient } from "@/src/lib/supabase/server";
import PosProductExplorer from "@/src/component/pos/PosProductExplorer";
import CartPanel from "@/src/component/pos/OrderPanel";
import MobileCart from "@/src/component/pos/MobileOrder";

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string; boothId: string }>;
}) {
  const { boothId } = await params;
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, price, main_image_url, category, sub_category, total_quantity, purchase_limit"
    )
    .eq("booth_id", boothId)
    .order("created_at", { ascending: false });

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="h-full overflow-y-auto pb-20 lg:pb-0">
        <PosProductExplorer products={products ?? []} />
      </div>

      {/* PC */}
      <div className="fixed right-0 top-16 hidden h-[calc(100vh-4rem)] w-80 border-l border-zinc-800 bg-black p-6 lg:block">
        <CartPanel boothId={boothId} />
      </div>

      {/* 모바일 */}
      <MobileCart boothId={boothId} />
    </div>
  );
}