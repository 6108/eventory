// src/app/[eventId]/booths/[boothId]/manage/stats/page.tsx
import { getBoothOrders } from "@/src/lib/data/order";
import { Order } from "@/src/types/order";

// 취소된 수량/금액은 제외한 "실제" 판매 수량·금액
// (Order.status === "cancelled"인 주문은 전량 취소된 것과 같으므로
//  item.quantity - item.cancelledQuantity 기준으로 계산하면 자동으로 0이 됨)
function netQuantity(item: Order["items"][number]) {
  return item.quantity - item.cancelledQuantity;
}

function netAmount(item: Order["items"][number]) {
  return netQuantity(item) * item.unitPrice;
}

type ProductStat = {
  key: string;
  productName: string;
  optionName: string | null;
  quantity: number;
  amount: number;
};

type HourStat = {
  hour: string; // "09시" 형태
  amount: number;
  quantity: number;
};

function buildProductStats(orders: Order[]): ProductStat[] {
  const map = new Map<string, ProductStat>();

  for (const order of orders) {
    for (const item of order.items) {
      const qty = netQuantity(item);
      if (qty <= 0) continue;

      const key = `${item.productId}-${item.optionId ?? "default"}`;
      const existing = map.get(key);

      if (existing) {
        existing.quantity += qty;
        existing.amount += netAmount(item);
      } else {
        map.set(key, {
          key,
          productName: item.productName,
          optionName: item.optionName,
          quantity: qty,
          amount: netAmount(item),
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function buildHourStats(orders: Order[]): HourStat[] {
  const map = new Map<string, HourStat>();

  for (const order of orders) {
    // 행사가 한국 기준이므로 시간대는 KST로 고정
    const hourLabel = new Date(order.createdAt).toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      hour12: false,
    });

    const orderAmount = order.items.reduce((sum, item) => sum + netAmount(item), 0);
    const orderQuantity = order.items.reduce((sum, item) => sum + netQuantity(item), 0);

    if (orderQuantity <= 0) continue;

    const existing = map.get(hourLabel);
    if (existing) {
      existing.amount += orderAmount;
      existing.quantity += orderQuantity;
    } else {
      map.set(hourLabel, { hour: hourLabel, amount: orderAmount, quantity: orderQuantity });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.hour.localeCompare(b.hour));
}

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string; boothId: string }>;
}) {
  const { boothId } = await params;
  const orders = await getBoothOrders(boothId);

  const validOrders = orders; // 부분취소 포함 전체를 기준으로 net 계산하므로 필터링 불필요

  const totalAmount = validOrders.reduce(
    (sum, order) => sum + order.items.reduce((s, item) => s + netAmount(item), 0),
    0
  );
  const totalQuantity = validOrders.reduce(
    (sum, order) => sum + order.items.reduce((s, item) => s + netQuantity(item), 0),
    0
  );
  const completedOrderCount = validOrders.filter((o) => o.status !== "cancelled").length;
  const cancelledOrderCount = validOrders.filter((o) => o.status === "cancelled").length;

  const productStats = buildProductStats(validOrders);
  const hourStats = buildHourStats(validOrders);
  const maxHourAmount = Math.max(1, ...hourStats.map((h) => h.amount));

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <h1 className="text-xl font-semibold text-white">정산 · 통계</h1>

      {/* 매출 요약 */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded border border-zinc-800 p-4">
          <p className="text-xs text-zinc-500">총 매출 (취소 제외)</p>
          <p className="mt-1 text-lg font-semibold text-primary">
            {totalAmount.toLocaleString()}원
          </p>
        </div>
        <div className="rounded border border-zinc-800 p-4">
          <p className="text-xs text-zinc-500">판매 수량</p>
          <p className="mt-1 text-lg font-semibold text-white">{totalQuantity}개</p>
        </div>
        <div className="rounded border border-zinc-800 p-4">
          <p className="text-xs text-zinc-500">유효 주문 건수</p>
          <p className="mt-1 text-lg font-semibold text-white">{completedOrderCount}건</p>
        </div>
        <div className="rounded border border-zinc-800 p-4">
          <p className="text-xs text-zinc-500">전체 취소 건수</p>
          <p className="mt-1 text-lg font-semibold text-white">{cancelledOrderCount}건</p>
        </div>
      </section>

      {/* 시간대별 판매 */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-white">시간대별 판매</h2>
        {hourStats.length === 0 ? (
          <p className="rounded border border-zinc-800 p-4 text-center text-sm text-zinc-500">
            아직 판매 데이터가 없습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 rounded border border-zinc-800 p-4">
            {hourStats.map((h) => (
              <div key={h.hour} className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-xs text-zinc-500">{h.hour}</span>
                <div className="h-4 flex-1 overflow-hidden rounded bg-zinc-900">
                  <div
                    className="h-full rounded bg-primary"
                    style={{ width: `${(h.amount / maxHourAmount) * 100}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-xs text-zinc-400">
                  {h.amount.toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 상품별 판매 */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-white">상품별 판매</h2>
        {productStats.length === 0 ? (
          <p className="rounded border border-zinc-800 p-4 text-center text-sm text-zinc-500">
            아직 판매 데이터가 없습니다.
          </p>
        ) : (
          <div className="overflow-hidden rounded border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                  <th className="px-3 py-2 font-normal">상품</th>
                  <th className="px-3 py-2 font-normal text-right">수량</th>
                  <th className="px-3 py-2 font-normal text-right">매출</th>
                </tr>
              </thead>
              <tbody>
                {productStats.map((p) => (
                  <tr key={p.key} className="border-b border-zinc-900 last:border-b-0">
                    <td className="px-3 py-2 text-white">
                      {p.productName}
                      {p.optionName && (
                        <span className="ml-1 text-xs text-zinc-500">({p.optionName})</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-zinc-300">{p.quantity}개</td>
                    <td className="px-3 py-2 text-right text-zinc-300">
                      {p.amount.toLocaleString()}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-center text-xs text-zinc-500">
        취소된 주문/수량은 매출·통계에서 자동으로 제외됩니다.
      </p>
    </div>
  );
}