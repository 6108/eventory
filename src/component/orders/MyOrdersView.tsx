"use client";

import toast from "react-hot-toast";

import { useHasMounted } from "@/src/hooks/useHasMounted";
import { useMyOrderRequests } from "@/src/hooks/useMyOrderRequests";
import { formatOrderNumber } from "@/src/lib/format";

export default function MyOrdersView() {
  const hasMounted = useHasMounted();

  const {
    requests,
    isLoading,
    pendingRequestId,
    cancelRequest,
  } = useMyOrderRequests();

  if (!hasMounted || isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-8">
        <h1 className="text-xl font-semibold text-white">
          내 주문내역
        </h1>

        <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
          불러오는 중...
        </div>
      </div>
    );
  }

  // order_id가 아직 없는 요청
  const pendingRequests = requests.filter(
    (request) =>
      request.orderId === null &&
      request.status !== "cancelled"
  );

  // order_id가 생긴 요청
  const completedRequests = requests.filter(
    (request) => request.orderId !== null
  );

  async function handleCancel(requestId: string) {
    try {
      await cancelRequest(requestId);

      toast.success("구매 목록을 취소했습니다.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "취소에 실패했습니다."
      );
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-8">


      {/* 구매 완료 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-300">
          구매 완료
        </h2>

        {completedRequests.length === 0 ? (
          <p className="rounded border border-zinc-800 p-4 text-sm text-zinc-500">
            아직 구매 완료된 작품이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {completedRequests.map((request) => {
              const order = request.order;
              const isCancelled = order?.status === "cancelled";

              return (
                <li
                  key={request.id}
                  className="overflow-hidden rounded border border-zinc-800 bg-zinc-900"
                >
                  {/* 영수증 헤더 */}
                  <div className="border-b border-zinc-800 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {request.boothName ?? "부스"}
                        </p>

                        <p className="mt-1 text-[11px] text-zinc-500">
                          {order
                            ? formatDate(order.createdAt)
                            : ""}
                        </p>
                      </div>

                      {isCancelled ? (
                        <span className="rounded bg-red-500/10 px-2 py-1 text-[11px] font-medium text-red-400">
                          취소됨
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-400">
                          구매 완료
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 주문 상품 */}
                  {order && (
                    <>
                      <div className="p-4">
                        <div className="mb-3 text-[11px] font-medium text-zinc-500">
                          구매 상품
                        </div>

                        <ul className="flex flex-col gap-3">
                          {order.items.map((item, index) => (
                            <li
                              key={`${item.productName}-${item.optionName ?? ""}-${index}`}
                              className="flex items-start justify-between gap-4"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-zinc-200">
                                  {item.productName}
                                </p>

                                {item.optionName && (
                                  <p className="mt-0.5 text-xs text-zinc-500">
                                    {item.optionName}
                                  </p>
                                )}

                                <p className="mt-0.5 text-xs text-zinc-600">
                                  {item.unitPrice.toLocaleString()}
                                  원 × {item.quantity}
                                </p>
                              </div>

                              <p className="shrink-0 text-sm text-white">
                                {item.subtotal.toLocaleString()}
                                원
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 결제 금액 */}
                      <div className="border-t border-zinc-800 p-4">
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>총 수량</span>
                          <span>
                            {order.totalQuantity}개
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-zinc-300">
                            결제 금액
                          </span>

                          <span className="text-lg font-semibold text-white">
                            {order.totalAmount.toLocaleString()}
                            원
                          </span>
                        </div>
                      </div>

                      {/* 주문번호 */}
                      <div className="border-t border-zinc-800 px-4 py-3">
                        <div className="flex justify-between text-[11px] text-zinc-600">
                          <span>주문번호</span>

                          <span>{formatOrderNumber(order.id)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}