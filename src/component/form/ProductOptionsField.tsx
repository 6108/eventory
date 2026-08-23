// src/component/form/ProductOptionsField.tsx
import { FormField } from "./FormField";
import { Input } from "@/src/component/common/Input";
import type { ProductOptionFormState } from "@/src/types/form";

interface Props {
  options: ProductOptionFormState[];
  onAdd: () => void;
  onUpdate: (index: number, key: "name" | "initialQuantity", value: string) => void;
  onRemove: (index: number) => void;
}

export function ProductOptionsField({ options, onAdd, onUpdate, onRemove }: Props) {
  return (
    <FormField label="상품 옵션">
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option.name}
              onChange={(e) => onUpdate(index, "name", e.target.value)}
              placeholder="옵션명"
              className="flex-1"
            />
            <Input
              type="number"
              min="0"
              value={option.initialQuantity}
              onChange={(e) => onUpdate(index, "initialQuantity", e.target.value)}
              placeholder="수량"
              className="w-32"
            />
            <button type="button" onClick={() => onRemove(index)} className="px-2 text-sm text-red-400">
              삭제
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
        >
          + 옵션 추가
        </button>
      </div>
    </FormField>
  );
}