"use client";

import toast from "react-hot-toast";
import { useHasMounted } from "@/src/hooks/useHasMounted";
import { useMyOrderRequests } from "@/src/hooks/useMyOrderRequests";

export default function MyOrdersView() {
  const hasMounted = useHasMounted();
  const { requests, isLoading, cancelRequest } = useMyOrderRequests();

  if (!hasMounted || isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-8">
        <h1 className="text-xl font-semibold text-white">내 주문내역</h1>
        <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
          불러오는 중...
        </div>
      </div>
    );
  }

  // "보낸 주문"이라는 표현 유지 — 대기/예약이 아니라 참고용 요청이라는 뉘앙스를 여기서도 지킴
  const sentRequests = requests.filter(
    (r) => r.status === "requested" || r.status === "checked"
  );
  const completedRequests = requests.filter((r) => r.status === "completed");

  async function handleCancel(requestId: string) {
    try {
      await cancelRequest(requestId);
      toast.success("주문을 취소했습니다.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "취소에 실패했습니다.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-8">
      <h1 className="text-xl font-semibold text-white">내 주문내역</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-300">보낸 주문</h2>

        {sentRequests.length === 0 ? (
          <p className="rounded border border-zinc-800 p-4 text-sm text-zinc-500">
            보낸 주문이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sentRequests.map((r) => (
              <li key={r.id} className="rounded border border-zinc-800 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{r.boothName ?? "부스"}</p>

                  {r.status === "requested" ? (
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="text-xs text-zinc-500 hover:text-red-400"
                    >
                      취소
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500">부스러 확인함</span>
                  )}
                </div>

                <ul className="mt-1 flex flex-col gap-0.5">
                  {r.items.map((item, idx) => (
                    <li key={idx} className="text-xs text-zinc-400">
                      {item.productName}
                      {item.optionName ? ` (${item.optionName})` : ""} × {item.quantity}
                    </li>
                  ))}
                </ul>

                {/*
                  자동으로 확정되는 게 아니라는 걸 여기서도 다시 확인시켜줌.
                  특히 checked 상태(부스러가 이미 담음)일 때는 취소 버튼이 없는 이유를 설명.
                */}
                <p className="mt-2 text-[11px] text-zinc-600">
                  {r.status === "requested"
                    ? "아직 부스러가 확인하지 않았습니다. 마음이 바뀌면 취소할 수 있습니다."
                    : "부스러가 확인해서 담았습니다. 부스 앞에서 변경 사항이 있다면 직접 말씀해주세요."}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-300">결제 완료</h2>

        {completedRequests.length === 0 ? (
          <p className="rounded border border-zinc-800 p-4 text-sm text-zinc-500">
            아직 결제 완료된 주문이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {completedRequests.map((r) => (
              <li key={r.id} className="rounded border border-zinc-800 p-3">
                <p className="text-sm font-medium text-white">{r.boothName ?? "부스"}</p>

                <ul className="mt-1 flex flex-col gap-0.5">
                  {r.items.map((item, idx) => (
                    <li key={idx} className="text-xs text-zinc-400">
                      {item.productName}
                      {item.optionName ? ` (${item.optionName})` : ""} × {item.quantity}
                    </li>
                  ))}
                </ul>

                {r.order && (
                  <p className="mt-2 text-sm font-medium text-white">
                    {r.order.totalAmount.toLocaleString()}원 결제 완료
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
