// src/app/[eventId]/booths/[boothId]/manage/pos/page.tsx

import PosTabs from "@/src/component/pos/PosTabs";
import PosProductExplorer from "@/src/component/pos/PosProductExplorer";
import CartPanel from "@/src/component/pos/OrderPanel";
import MobileCart from "@/src/component/pos/MobileOrder";
import PrepaidChecklist from "@/src/component/pos/PrepaidChecklist";
import CustomerOrderRequests from "@/src/component/pos/CustomerOrderRequests";
import { getPosProducts } from "@/src/lib/data/product";
import ReceiptList from "@/src/component/pos/ReceiptList";

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string; boothId: string }>;
}) {
  const { boothId } = await params;

  const products = await getPosProducts(boothId);

  const sellContent = (
    <div className="h-full">
      <div className="h-full overflow-y-auto pb-20 lg:pb-0">
        <PosProductExplorer products={products} />
      </div>

      {/* PC */}
      <div className="fixed right-0 top-16 hidden h-[calc(100vh-4rem)] w-80 border-l border-zinc-800 bg-black p-6 lg:block">
        <CartPanel boothId={boothId} />
      </div>

      {/* 모바일 */}
      <MobileCart boothId={boothId} />
    </div>
  );

  const prepaidContent = <PrepaidChecklist boothId={boothId} />;
  const requestsContent = <CustomerOrderRequests boothId={boothId} products={products} />;

  return (
    <div className="h-[calc(100vh-4rem)]">
      <PosTabs
        sellContent={sellContent}
        requestsContent={requestsContent}
        prepaidContent={prepaidContent}
        receiptContent={<ReceiptList boothId={boothId} />}
      />
    </div>
  );
}