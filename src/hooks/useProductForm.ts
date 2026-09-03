// src/component/form/hooks/useProductForm.ts
import { useState } from "react";
import type { Product } from "@/src/types/product";
import type { ProductFormState } from "@/src/types/form";

function createInitialForm(product?: Product): ProductFormState {
  return {

    name: product?.name ?? "",
    price: product ? String(product.price) : "",
    category: product?.category ?? "",
    subCategory: product?.subCategory ?? "",
    initialQuantity: product?.initialQuantity?.toString() ?? "",
    remainingQuantity: product?.remainingQuantity?.toString() ?? "",
    purchaseLimit: product?.purchaseLimit?.toString() ?? "",
    description: product?.description ?? "",
    options:
      product?.options.map((option) => ({
        id: option.id,
        name: option.name,
        initialQuantity: option.initialQuantity?.toString() ?? "",
        remainingQuantity: option.remainingQuantity?.toString() ?? "",
      })) ?? [],
  };
}

export function useProductForm(product?: Product) {
  const [form, setForm] = useState<ProductFormState>(() =>
    createInitialForm(product)
  );

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addOption() {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { name: "", initialQuantity: "", remainingQuantity: "", }],
    }));
  }

  function updateOption(
    index: number,
    key: "name" | "initialQuantity" | "remainingQuantity",
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [key]: value } : option
      ),
    }));
  }

  function removeOption(index: number) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  }

  return {
    form,
    updateField,
    addOption,
    updateOption,
    removeOption,
  };
}