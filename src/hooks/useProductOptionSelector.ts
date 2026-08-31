// src/hooks/useProductOptionSelector.ts
"use client";

import { useState } from "react";
import type { ProductOption } from "@/src/types/product";

interface SelectableProduct {
  remainingQuantity: number | null;
  options: ProductOption[];
}

export function useProductOptionSelector(product: SelectableProduct) {
  const hasOptions = product.options.length > 0;

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    hasOptions ? product.options[0].id : null
  );

  const selectedOption = hasOptions
    ? product.options.find((option) => option.id === selectedOptionId) ?? null
    : null;

  const remainingQuantity = hasOptions
    ? selectedOption?.remainingQuantity ?? null
    : product.remainingQuantity;

  const isSoldOut = remainingQuantity !== null && remainingQuantity <= 0;

  return {
    hasOptions,
    selectedOptionId,
    setSelectedOptionId,
    selectedOption,
    remainingQuantity,
    isSoldOut,
  };
}
