"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useOrderStore } from "@/src/store/orderStore";
import { ordersKey } from "@/src/hooks/useOrders";

interface OrderPanelProps {
  boothId: string;
}

export default function OrderPanel({ boothId }: OrderPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const items = useOrderStore((s) => s.items);
  const checkedRequests = useOrderStore((s) => s.checkedRequests);

  const increment = useOrderStore((s) => s.increment);
  const decrement = useOrderStore((s) => s.decrement);
  const removeItem = useOrderStore((s) => s.removeItem);
  const clear = useOrderStore((s) => s.clear);
  const totalAmount = useOrderStore((s) => s.totalAmount());
  const getOrCreatePendingClientTransactionId = useOrderStore(
    (s) => s.getOrCreatePendingClientTransactionId
  );

  const [loading, setLoading] = useState(false);
  // 네트워크 자체가 끊겨서 요청이 서버에 도달했는지조차 알 수 없는 상태.
  // 서버가 응답한 4xx/5xx(재고 부족 등 "진짜" 실패)와는 구분해서 보여준다 —
  // 이 경우엔 같은 clientTransactionId로 재시도해도 안전하다.
  const [offlineError, setOfflineError] = useState(false);

  // 오프라인 실패 후 인터넷이 돌아오면 자동으로 한 번 재시도한다.
  // 행사장 와이파이처럼 몇 초~몇 분 끊겼다 돌아오는 상황에서, 사용자가
  // 버튼을 다시 누르지 않아도 되게 하기 위함. clientTransactionId는
  // pendingClientTransactionId로 유지되고 있어 재시도해도 안전하다.
  useEffect(() => {
    if (!offlineError) return;

    function handleOnline() {
      handleCheckout();
    }

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineError]);

  async function handleCheckout() {
    if (items.length === 0) return;

    setLoading(true);
    setOfflineError(false);

    try {
      // 현재 판매에 포함된 주문 요청 ID
      const requestIds = Object.keys(checkedRequests);

      // 체크아웃 시작 시 한 번만 생성되고, 실패 후 재시도해도 동일한 값을
      // 재사용한다. 서버의 client_transaction_id UNIQUE 제약과 맞물려
      // "요청은 서버에 도달해 처리됐지만 응답을 못 받은" 상황에서
      // 중복 주문이 생기는 것을 막아준다.
      const clientTransactionId = getOrCreatePendingClientTransactionId();

      let res: Response;

      try {
        res = await fetch(`/api/booth/${boothId}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientTransactionId,
            items: items.map((i) => ({
              productId: i.productId,
              optionId: i.optionId,
              quantity: i.quantity,
            })),
          }),
        });
      } catch {
        // fetch 자체가 던지는 예외 = 요청이 아예 나가지 못했거나
        // 응답을 받지 못한 경우(와이파이 끊김 등). 서버 처리 여부를
        // 알 수 없으므로 clientTransactionId를 유지한 채 재시도를 유도한다.
        setOfflineError(true);
        toast.error(
          "네트워크 연결을 확인해주세요. 판매 등록이 완료됐을 수도 있으니, 연결이 복구되면 같은 버튼으로 다시 시도해주세요."
        );
        return;
      }

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "판매 등록에 실패했습니다.");
        return;
      }

      const orderId = result.orderId;

      // 주문 요청이 포함된 판매라면
      // 해당 요청들을 실제 영수증(order)과 연결
      if (requestIds.length > 0 && orderId) {
        const completeRes = await fetch(
          `/api/booth/${boothId}/order-requests/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requestIds,
              orderId,
            }),
          }
        );

        const completeResult = await completeRes.json();

        if (!completeRes.ok || completeResult.success === false) {
          console.error(
            "주문 요청 연결 실패:",
            completeResult.error
          );

          // 판매 자체는 성공했으므로 판매 성공 메시지는 유지
          toast.success("판매가 등록되었습니다.");
          toast.error("주문 요청 연결에 실패했습니다.");
        } else {
          toast.success("판매가 등록되었습니다.");
        }

        // 결제 완료(orderId 연결)된 요청은 "확인한 주문" 목록에서 빠져야 하므로,
        // 손님 주문 탭이 비활성 상태라 폴링이 멈춰있어도 캐시를 바로 무효화해서
        // 다음에 그 탭을 열 때 최신 상태(완료 항목 제외)로 보이게 함
        queryClient.invalidateQueries({ queryKey: ["orderRequests", boothId] });
      } else {
        toast.success("판매가 등록되었습니다.");
      }

      // 영수증 탭(ReceiptList)이 별도의 쿼리 캐시를 쓰고 있어서,
      // 여기서 명시적으로 무효화해야 방금 등록한 판매가 영수증 탭에 바로 보인다.
      queryClient.invalidateQueries({ queryKey: ordersKey(boothId) });

      clear();
      router.refresh();
    } catch (error) {
      // 응답은 받았지만 이후 처리(JSON 파싱 등)에서 예기치 못한 오류가 난 경우.
      // 이때도 서버 요청 자체는 도달했을 수 있으므로 clientTransactionId는
      // 그대로 두고(clear 호출 안 함) 재시도 가능하게 한다.
      console.error(error);
      toast.error("판매 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-3 text-sm font-medium text-white">
        주문 목록
      </h2>

      {offlineError && (
        <div className="mb-3 flex items-center justify-between gap-2 rounded border border-amber-700 bg-amber-950/50 px-3 py-2 text-xs text-amber-300">
          <span>
            네트워크 연결이 끊겼습니다. 판매가 이미 등록됐을 수 있으니
            확인 후 다시 시도해주세요.
          </span>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="shrink-0 rounded bg-amber-800 px-2 py-1 font-medium text-white disabled:opacity-50"
          >
            재시도
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="flex-1 text-sm text-zinc-500">
          작품을 선택해주세요.
        </p>
      ) : (
        <ul className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.optionId ?? "default"}`}
              className="flex items-center justify-between gap-2 rounded border border-zinc-800 p-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">
                  {item.productName}
                </p>

                {item.optionName && (
                  <p className="truncate text-xs text-zinc-500">
                    {item.optionName}
                  </p>
                )}

                <p className="text-xs text-zinc-400">
                  {item.unitPrice.toLocaleString()}원
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    decrement(item.productId, item.optionId)
                  }
                  className="h-6 w-6 rounded bg-zinc-800 text-white"
                >
                  −
                </button>

                <span className="w-5 text-center text-sm text-white">
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    increment(item.productId, item.optionId)
                  }
                  className="h-6 w-6 rounded bg-zinc-800 text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={() =>
                  removeItem(item.productId, item.optionId)
                }
                className="text-xs text-red-400"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-zinc-800 pt-4">
        <div className="mb-3 flex justify-between text-sm">
          <span className="text-zinc-400">합계</span>

          <span className="font-medium text-white">
            {totalAmount.toLocaleString()}원
          </span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={items.length === 0 || loading}
          className="w-full rounded bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "등록 중..." : "판매 완료"}
        </button>
      </div>
    </div>
  );
}