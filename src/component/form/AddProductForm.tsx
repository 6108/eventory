// AddProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { FormField } from "./FormField";
import { ProductImageField } from "./ProductImageField";
import { CategorySelect } from "./CategorySelect";
import { ArtistSelectField } from "./ArtistSelectField";
import { ProductOptionsField } from "./ProductOptionsField";
import { FormActions } from "./FormActions";
import { useProductForm } from "@/src/hooks/useProductForm";
import { useArtistSelection } from "@/src/hooks/useArtistSelection";
import { useCreateProductMutation } from "@/src/hooks/useCreateProductMutation";
import { User } from "@/src/types/user";

interface AddProductFormProps {
  eventId: string;
  boothId: string;
  artists: User[];
}

const ProductDescriptionEditor = dynamic(
  () => import("./ProductDescriptionEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse rounded border border-zinc-800 bg-zinc-900" />
    ),
  }
);

export default function AddProductForm({
  eventId,
  boothId,
  artists,
}: AddProductFormProps) {
  const router = useRouter();

  const {
    form,
    updateField,
    addOption,
    updateOption,
    removeOption,
  } = useProductForm();

  const { selectedArtistIds, toggleArtist } = useArtistSelection();
  const { loading, submit } = useCreateProductMutation({
    eventId,
    boothId,
  });

  const [image, setImage] = useState<File | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!image) {
      toast.error("대표 이미지를 선택해주세요.");
      return;
    }

    if (!form.category || !form.subCategory) {
      toast.error("상품 카테고리를 선택해주세요.");
      return;
    }

    if (selectedArtistIds.length === 0) {
      toast.error("상품 작가를 한 명 이상 선택해주세요.");
      return;
    }

    submit(form, image, selectedArtistIds);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FormField label="상품명">
        <input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      <ProductImageField
        required
        onImageChange={setImage}
      />

      <FormField label="가격">
        <input
          type="number"
          min="0"
          value={form.price}
          onChange={(e) => updateField("price", e.target.value)}
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      <CategorySelect
        category={form.category}
        subCategory={form.subCategory}
        onCategoryChange={(value) => updateField("category", value)}
        onSubCategoryChange={(value) =>
          updateField("subCategory", value)
        }
      />

      <ArtistSelectField
        artists={artists}
        selectedArtistIds={selectedArtistIds}
        onToggle={toggleArtist}
      />

      <ProductOptionsField
        options={form.options}
        onAdd={addOption}
        onUpdate={updateOption}
        onRemove={removeOption}
      />

      {form.options.length === 0 && (
        <FormField label="초기 수량">
          <input
            type="number"
            min="0"
            value={form.initialQuantity}
            onChange={(e) =>
              updateField("initialQuantity", e.target.value)
            }
            placeholder="비워두면 제한 없음"
            className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
          />
        </FormField>
      )}

      <FormField label="1인 구매 제한">
        <input
          type="number"
          min="1"
          value={form.purchaseLimit}
          onChange={(e) =>
            updateField("purchaseLimit", e.target.value)
          }
          placeholder="비워두면 제한 없음"
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      <FormField label="상품 설명">
        <ProductDescriptionEditor
          value={form.description}
          onChange={(value) =>
            updateField("description", value)
          }
          boothId={boothId}
        />
      </FormField>

      <FormActions
        onCancel={() =>
          router.push(
            `/${eventId}/booths/${boothId}/manage/products`
          )
        }
        loading={loading}
        submitLabel="상품 추가"
        loadingLabel="추가 중..."
      />
    </form>
  );
}