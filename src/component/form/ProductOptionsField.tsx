import FormField from "./FormField";
import { Input } from "@/src/component/common/Input";
import type { ProductOptionFormState } from "@/src/types/form";

interface ProductOptionsFieldProps {
  options: ProductOptionFormState[];

  onAdd: () => void;

  onUpdate: (
    index: number,
    key: "name" | "initialQuantity" | "remainingQuantity",
    value: string
  ) => void;

  onRemove: (index: number) => void;

  isEdit?: boolean;
}

export default function ProductOptionsField({
  options,
  onAdd,
  onUpdate,
  onRemove,
  isEdit = false,
}: ProductOptionsFieldProps) {
  return (
    <FormField label="옵션">
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <div key={option.id ?? index} className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-zinc-500">옵션명</label>
              <Input
                value={option.name}
                onChange={(e) =>
                  onUpdate(index, "name", e.target.value)
                }
                placeholder="옵션명"
              />
            </div>

            {isEdit && (
              <div className="flex w-32 flex-col gap-1">
                <label className="text-xs text-zinc-500">남은 수량</label>
                <Input
                  type="number"
                  min="0"
                  value={option.remainingQuantity}
                  onChange={(e) =>
                    onUpdate(
                      index,
                      "remainingQuantity",
                      e.target.value
                    )
                  }
                  placeholder="남은 수량"
                />
              </div>
            )}

            <div className="flex w-32 flex-col gap-1">
              <label className="text-xs text-zinc-500">전체 수량</label>
              <Input
                type="number"
                min="0"
                value={option.initialQuantity}
                onChange={(e) =>
                  onUpdate(
                    index,
                    "initialQuantity",
                    e.target.value
                  )
                }
                placeholder="전체 수량"
              />
            </div>

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-2 pb-2 text-sm text-red-400"
            >
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