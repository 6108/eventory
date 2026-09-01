"use client";

import toast from "react-hot-toast";
import { useOrderStore } from "@/src/store/orderStore";
import type { PosProduct } from "@/src/types/product";
import type { OrderRequest } from "@/src/types/request";
import { useOrderRequests, StatusConflictError } from "@/src/hooks/useOrderRequests";
import useIsActiveTab, { usePosTabSwitch } from "./PosTabContext";

interface OrderRequestsProps {
  boothId: string;
  products: PosProduct[];
}

export default function OrderRequests({ boothId, products }: OrderRequestsProps) {
  const isActive = useIsActiveTab("requests");
  const { requests, isLoading, pendingRequestId, setStatus } = useOrderRequests(boothId, isActive);
  const addItem = useOrderStore((s) => s.addItem);
  const clear = useOrderStore((s) => s.clear);
  const decrementBy = useOrderStore((s) => s.decrementBy);
  const markRequestChecked = useOrderStore((s) => s.markRequestChecked);
  const unmarkRequestChecked = useOrderStore((s) => s.unmarkRequestChecked);
  const setTab = usePosTabSwitch();

  function findProductPrice(productId: string, optionId: string | null) {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;

    if (optionId) {
      const option = product.options.find((o) => o.id === optionId);
      if (!option) return null;

      return {
        price: option.price ?? product.price,
      };
    }

    return {
      price: product.price,
    };
  }

  async function handleCheck(request: OrderRequest) {
    // 손님별로 결제를 분리하기 위해, 확인을 누르는 순간 현재 판매 화면을 비움.
    // (여러 손님 요청을 연달아 체크하면 하나의 주문으로 합쳐져서 인당 구매 제한이
    //  무의미해지는 문제가 있었음 - QA 5-6 관련)
    clear();

    const added: {
      productId: string;
      optionId: string | null;
      quantity: number;
    }[] = [];


    for (const item of request.items) {
      const info = findProductPrice(item.productId, item.optionId);

      if (!info) {
        toast.error(
          `${item.productName}은(는) 더 이상 판매하지 않는 작품입니다. 손님에게 확인해주세요.`
        );
        continue;
      }


      addItem({
        id: crypto.randomUUID(),
        productId: item.productId,
        optionId: item.optionId,
        productName: item.productName,
        optionName: item.optionName,
        unitPrice: info.price,
        quantity: item.quantity,
        cancelledQuantity: 0,
        subtotal: info.price * item.quantity,
      });

      added.push({
        productId: item.productId,
        optionId: item.optionId,
        quantity: item.quantity,
      });
    }


    markRequestChecked(request.id, added);

    try {
      await setStatus(request.id, "checked");
    } catch (err) {
      // 다른 기기가 먼저 이 요청을 처리했다면, 방금 이 판매 화면에
      // 담아둔 항목들도 되돌려야 한다. 그대로 두면 이미 다른 기기에서
      // 결제된 손님 주문을 여기서도 또 팔게 될 수 있다.
      const addedItems = unmarkRequestChecked(request.id);
      for (const item of addedItems) {
        decrementBy(item.productId, item.optionId, item.quantity);
      }

      if (err instanceof StatusConflictError) {
        toast.error("다른 기기에서 이미 처리한 요청입니다. 목록을 새로고침했습니다.");
      } else {
        toast.error("상태 변경에 실패했습니다.");
      }
      return;
    }

    // 확인한 손님의 주문이 담긴 판매 화면으로 바로 이동시켜서
    // 결제를 마치기 전에 다른 손님 요청을 또 체크하는 상황을 방지
    setTab("sell");
  }

  async function handleUndo(request: OrderRequest) {
    const added = unmarkRequestChecked(request.id);

    for (const item of added) {
      decrementBy(item.productId, item.optionId, item.quantity);
    }

    try {
      await setStatus(request.id, "requested");
    } catch (err) {
      toast.error(
        err instanceof StatusConflictError
          ? "다른 기기에서 이미 처리한 요청입니다. 목록을 새로고침했습니다."
          : "되돌리기에 실패했습니다."
      );
    }
  }

  async function handleCancel(request: OrderRequest) {
    try {
      await setStatus(request.id, "cancelled");
    } catch (err) {
      toast.error(
        err instanceof StatusConflictError
          ? "다른 기기에서 이미 처리한 요청입니다. 목록을 새로고침했습니다."
          : "삭제에 실패했습니다."
      );
    }
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-zinc-500">불러오는 중...</div>;
  }

  const activeRequests = requests.filter((r) => r.status === "requested");
  // "확인함" 상태여도 결제(orderId 연결)까지 끝난 건 더 이상 대기 목록에 보일 필요 없음
  const checkedRequests = requests.filter(
    (r) => r.status === "checked" && !r.orderId
  );

  return (
    <div className="h-full p-4">
      <p className="mb-4 rounded border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-400">
        손님이 담아둔 작품 목록입니다.
        손님이 다시 담으면 이전 내용은 최신 내용으로 바뀝니다.
      </p>

      {requests.length === 0 ? (
        <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-500">
          손님이 구매하고 싶은 목록을 확정하면 이곳에 표시됩니다.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {activeRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              pending={pendingRequestId === request.id}
              onCheck={() => handleCheck(request)}
              onDelete={() => handleCancel(request)}
            />
          ))}

          {checkedRequests.length > 0 && (
            <li className="mt-4 mb-1 text-xs text-zinc-600">확인한 주문</li>
          )}

          {checkedRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              checked
              pending={pendingRequestId === request.id}
              onUndo={() => handleUndo(request)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestCard({
  request,
  checked = false,
  pending = false,
  onCheck,
  onUndo,
  onDelete,
}: {
  request: OrderRequest;
  checked?: boolean;
  pending?: boolean;
  onCheck?: () => void;
  onUndo?: () => void;
  onDelete?: () => void;
}) {
  return (
    <li
      className={`rounded border border-zinc-800 p-3 ${checked ? "opacity-40" : "bg-zinc-900"
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={checked ? onUndo : onCheck}
          className="min-w-0 flex-1 text-left disabled:opacity-50"
        >
          <p className="text-sm font-medium text-white">
            {request.customerNickname}
          </p>

          <ul className="mt-1 flex flex-col gap-0.5">
            {request.items.map((item) => (
              <li key={item.id} className="text-xs text-zinc-400">
                {item.productName}
                {item.optionName ? ` (${item.optionName})` : ""} ×{" "}
                {item.quantity}
              </li>
            ))}
          </ul>

          <p className="mt-1 text-[11px] text-zinc-600">
            {pending
              ? "처리중..."
              : checked
                ? "잘못 눌렀다면 다시 눌러서 되돌릴 수 있습니다."
                : "탭하면 판매 화면에 담깁니다."}
          </p>
        </button>

        {/* {!checked && (
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className="shrink-0 text-xs text-zinc-600 hover:text-red-400 disabled:opacity-50"
          >
            지우기
          </button>
        )} */}
      </div>
    </li>
  );
}