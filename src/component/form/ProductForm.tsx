"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FormField from "./FormField";
import ProductImageField from "./ProductImageField";
import CategorySelect from "./CategorySelect";
import ArtistSelectField from "./ArtistSelectField";
import ProductOptionsField from "./ProductOptionsField";
import FormActions from "./FormActions";
import { Input } from "@/src/component/common/Input";
import { useProductForm } from "@/src/hooks/useProductForm";
import { useArtistSelection } from "@/src/hooks/useArtistSelection";
import { useProductMutation } from "@/src/hooks/useProductMutation";
import type { Product } from "@/src/types/product";
import { User } from "@/src/types/user";
import ProductSampleImagesField from "./ProductSampleImagesField";

interface ProductFormProps {
  eventId: string;
  boothId: string;
  artists: User[];
  productId?: string;
  product?: Product;
}

export default function ProductForm({
  eventId,
  boothId,
  artists,
  productId,
  product,
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const { form, updateField, addOption, updateOption, removeOption } =
    useProductForm(product);

  const { selectedArtistIds, toggleArtist } = useArtistSelection(
    product?.artistIds
  );

  const { loading, deleting, submit, remove } = useProductMutation({
    eventId,
    boothId,
    productId,
    currentImageUrl: product?.mainImage,
  });

  const [image, setImage] = useState<File | null>(null);
  const [sampleImageFiles, setSampleImageFiles] = useState<File[]>([]);
  const [keptSampleImageUrls, setKeptSampleImageUrls] = useState<string[]>(
    product?.sampleImages ?? []
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isEdit && !image) {
      toast.error("대표 이미지를 선택해주세요.");
      return;
    }

    if (!form.category || !form.subCategory) {
      toast.error("카테고리를 선택해주세요.");
      return;
    }

    if (selectedArtistIds.length === 0) {
      toast.error("작가를 한 명 이상 선택해주세요.");
      return;
    }

    submit(form, image, selectedArtistIds, sampleImageFiles, keptSampleImageUrls);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FormField label="작품명">
        <Input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
        />
      </FormField>

      <ProductImageField
        required={!isEdit}
        initialPreviewUrl={product?.mainImage}
        onImageChange={setImage}
        hint={isEdit ? "비워두면 기존 이미지가 유지됩니다" : undefined}
      />

      <ProductSampleImagesField
        initialUrls={product?.sampleImages}
        onChange={(files, keptUrls) => {
          setSampleImageFiles(files);
          setKeptSampleImageUrls(keptUrls);
        }}
      />

      <FormField label="가격">
        <Input
          type="number"
          min="0"
          value={form.price}
          onChange={(e) => updateField("price", e.target.value)}
          required
        />
      </FormField>

      <CategorySelect
        category={form.category}
        subCategory={form.subCategory}
        onCategoryChange={(value) => updateField("category", value)}
        onSubCategoryChange={(value) => updateField("subCategory", value)}
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
        isEdit={isEdit}
      />

      {form.options.length === 0 && (
        <>
          <FormField label="초기 수량">
            <Input
              type="number"
              min="0"
              value={form.initialQuantity}
              onChange={(e) =>
                updateField("initialQuantity", e.target.value)
              }
              placeholder="비워두면 제한 없음"
            />
          </FormField>

          {isEdit && (
            <FormField label="현재 남은 수량">
              <Input
                type="number"
                min="0"
                value={form.remainingQuantity}
                onChange={(e) =>
                  updateField(
                    "remainingQuantity",
                    e.target.value
                  )
                }
                placeholder="현재 남은 수량"
              />
            </FormField>
          )}
        </>
      )}

      <FormField label="1인 구매 제한">
        <Input
          type="number"
          min="1"
          value={form.purchaseLimit}
          onChange={(e) => updateField("purchaseLimit", e.target.value)}
          placeholder="비워두면 제한 없음"
        />
      </FormField>

      <FormActions
        onCancel={() => router.push(`/${eventId}/booths/${boothId}/manage/products`)}
        loading={loading}
        submitLabel={isEdit ? "정보 수정" : "정보 추가"}
        loadingLabel={isEdit ? "수정 중..." : "추가 중..."}
      />

      {isEdit && (
        <button
          type="button"
          onClick={remove}
          disabled={deleting}
          className="mt-2 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {deleting ? "삭제 중..." : "정보 삭제"}
        </button>
      )}
    </form>
  );
}