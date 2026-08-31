// src/component/cart/ProductOptionSelect.tsx
import type { ProductOption } from "@/src/types/product";

interface ProductOptionSelectProps {
  options: ProductOption[];
  value: string | null;
  onChange: (optionId: string) => void;
  className?: string;
}

export default function ProductOptionSelect({
  options,
  value,
  onChange,
  className = "rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white",
}: ProductOptionSelectProps) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {options.map((option) => {
        const optionSoldOut =
          option.remainingQuantity !== null && option.remainingQuantity <= 0;

        return (
          <option key={option.id} value={option.id} disabled={optionSoldOut}>
            {option.name}
            {optionSoldOut ? " (품절)" : ""}
          </option>
        );
      })}
    </select>
  );
}
