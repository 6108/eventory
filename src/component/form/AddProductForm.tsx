// src/component/form/AddProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FormField } from "./FormField";
import { ProductImageField } from "./ProductImageField";
import { CategorySelect } from "./CategorySelect";
import { FormActions } from "./FormActions";
import type { ProductFormState } from "@/src/types/form";

interface Artist {
  id: string;
  name: string;
}

interface AddProductFormProps {
  eventId: string;
  boothId: string;
  artists: Artist[];
}

export default function AddProductForm({
  eventId,
  boothId,
  artists,
}: AddProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<ProductFormState>({
    name: "",
    price: "",
    category: "",
    subCategory: "",
    totalQuantity: "",
    purchaseLimit: "",
    description: "",
  });

  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>(
    []
  );

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function toggleArtist(artistId: string) {
    setSelectedArtistIds((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
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

    setLoading(true);

    try {
      // 이미지 업로드
      const formData = new FormData();

      formData.append("file", image);
      formData.append("boothId", boothId);

      const uploadRes = await fetch("/api/upload/product", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadRes.json();

      if (!uploadRes.ok) {
        toast.error(
          uploadResult.error ?? "이미지 업로드에 실패했습니다."
        );
        return;
      }

      // 상품 생성
      const res = await fetch(
        `/api/booth/${boothId}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,

            mainImageUrl: uploadResult.url,

            price: Number(form.price),

            totalQuantity: form.totalQuantity
              ? Number(form.totalQuantity)
              : null,

            purchaseLimit: form.purchaseLimit
              ? Number(form.purchaseLimit)
              : null,

            // 선택한 작가들
            artistIds: selectedArtistIds,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(
          result.error ?? "상품 추가에 실패했습니다."
        );
        return;
      }

      toast.success("상품이 추가되었습니다.");

      router.push(
        `/${eventId}/booths/${boothId}/manage/products`
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("상품 추가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {/* 상품명 */}
      <FormField label="상품명">
        <input
          value={form.name}
          onChange={(e) =>
            updateField("name", e.target.value)
          }
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      {/* 대표 이미지 */}
      <ProductImageField
        required
        onImageChange={setImage}
      />

      {/* 가격 */}
      <FormField label="가격">
        <input
          type="number"
          min="0"
          value={form.price}
          onChange={(e) =>
            updateField("price", e.target.value)
          }
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      {/* 카테고리 */}
      <CategorySelect
        category={form.category}
        subCategory={form.subCategory}
        onCategoryChange={(value) =>
          updateField("category", value)
        }
        onSubCategoryChange={(value) =>
          updateField("subCategory", value)
        }
      />

      {/* 작가 */}
      <FormField label="상품 작가">
        {artists.length === 0 ? (
          <div className="rounded border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-500">
            등록된 작가가 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-1 rounded border border-zinc-800 bg-zinc-900 p-2">
            {artists.map((artist) => {
              const selected = selectedArtistIds.includes(
                artist.id
              );

              return (
                <label
                  key={artist.id}
                  className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 hover:bg-zinc-800"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleArtist(artist.id)
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm text-white">
                    {artist.name}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        {selectedArtistIds.length > 0 && (
          <p className="mt-2 text-xs text-zinc-500">
            {selectedArtistIds.length}명 선택됨
          </p>
        )}
      </FormField>

      {/* 총 수량 */}
      <FormField label="총 수량">
        <input
          type="number"
          min="0"
          value={form.totalQuantity}
          onChange={(e) =>
            updateField(
              "totalQuantity",
              e.target.value
            )
          }
          placeholder="비워두면 제한 없음"
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      {/* 구매 제한 */}
      <FormField label="1인 구매 제한">
        <input
          type="number"
          min="1"
          value={form.purchaseLimit}
          onChange={(e) =>
            updateField(
              "purchaseLimit",
              e.target.value
            )
          }
          placeholder="비워두면 제한 없음"
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      {/* 설명 */}
      <FormField label="상품 설명">
        <textarea
          value={form.description}
          onChange={(e) =>
            updateField(
              "description",
              e.target.value
            )
          }
          rows={5}
          className="resize-none rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      {/* 버튼 */}
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