"use client";

import toast from "react-hot-toast";
import { useOrderStore } from "@/src/store/orderStore";
import type { PosProduct } from "@/src/types/product";
import type { OrderRequest } from "@/src/types/request";
import { useOrderRequests } from "@/src/hooks/useOrderRequests";
import { useIsActiveTab } from "./PosTabContext";

interface Props {
  boothId: string;
  products: PosProduct[];
}

export default function OrderRequests({ boothId, products }: Props) {
  const isActive = useIsActiveTab("requests");
  const { requests, isLoading, setStatus } = useOrderRequests(boothId, isActive);
  const addItem = useOrderStore((s) => s.addItem);
  const decrementBy = useOrderStore((s) => s.decrementBy);
  const markRequestChecked = useOrderStore((s) => s.markRequestChecked);
  const unmarkRequestChecked = useOrderStore((s) => s.unmarkRequestChecked);

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
    const added: {
      productId: string;
      optionId: string | null;
      quantity: number;
    }[] = [];

    for (const item of request.items) {
      const info = findProductPrice(item.productId, item.optionId);

      if (!info) {
        toast.error(
          `${item.productName}은(는) 더 이상 판매하지 않는 상품이에요. 손님에게 확인해주세요.`
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
    } catch {
      toast.error("상태 변경에 실패했습니다.");
    }
  }

  async function handleUndo(request: OrderRequest) {
    const added = unmarkRequestChecked(request.id);

    for (const item of added) {
      decrementBy(item.productId, item.optionId, item.quantity);
    }

    try {
      await setStatus(request.id, "requested");
    } catch {
      toast.error("되돌리기에 실패했습니다.");
    }
  }

  async function handleCancel(request: OrderRequest) {
    try {
      await setStatus(request.id, "cancelled");
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-zinc-500">불러오는 중...</div>;
  }

  const activeRequests = requests.filter((r) => r.status === "requested");
  const checkedRequests = requests.filter((r) => r.status === "checked");

  return (
    <div className="h-full overflow-y-auto p-4">
      <p className="mb-4 rounded border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-400">
        손님이 담아둔 상품 목록입니다.
        손님이 다시 담으면 이전 내용은 최신 내용으로 바뀝니다.
      </p>

      {requests.length === 0 ? (
        <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-500">
          손님이 장바구니를 확정하면 이곳에 표시됩니다.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {activeRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
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
  onCheck,
  onUndo,
  onDelete,
}: {
  request: OrderRequest;
  checked?: boolean;
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
          onClick={checked ? onUndo : onCheck}
          className="min-w-0 flex-1 text-left"
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
            {checked
              ? "잘못 눌렀다면 다시 눌러서 되돌릴 수 있습니다."
              : "탭하면 판매 화면에 담깁니다."}
          </p>
        </button>

        {!checked && (
          <button
            type="button"
            onClick={onDelete}
            className="shrink-0 text-xs text-zinc-600 hover:text-red-400"
          >
            지우기
          </button>
        )}
      </div>
    </li>
  );
}