// src/component/form/EditProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FormField } from "./FormField";
import { ProductImageField } from "./ProductImageField";
import { CategorySelect } from "./CategorySelect";
import { FormActions } from "./FormActions";
import type { ProductFormState } from "@/src/types/form";

interface EditProductFormProps {
  eventId: string;
  boothId: string;
  productId: string;
  product: {
    name: string;
    price: number;
    category: string | null;
    sub_category: string | null;
    total_quantity: number | null;
    purchase_limit: number | null;
    description: string | null;
    main_image_url: string | null;
  };
}

export default function EditProductForm({
  eventId,
  boothId,
  productId,
  product,
}: EditProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<ProductFormState>({
    name: product.name,
    price: String(product.price),
    category: product.category ?? "",
    subCategory: product.sub_category ?? "",
    totalQuantity:
      product.total_quantity != null ? String(product.total_quantity) : "",
    purchaseLimit:
      product.purchase_limit != null ? String(product.purchase_limit) : "",
    description: product.description ?? "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.category || !form.subCategory) {
      toast.error("상품 카테고리를 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      let mainImageUrl = product.main_image_url;

      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("boothId", boothId);

        const uploadRes = await fetch("/api/upload/product", {
          method: "POST",
          body: formData,
        });

        const uploadResult = await uploadRes.json();

        if (!uploadRes.ok) {
          toast.error(uploadResult.error ?? "이미지 업로드에 실패했습니다.");
          return;
        }

        mainImageUrl = uploadResult.url;
      }

      const res = await fetch(
        `/api/booth/${boothId}/products/${productId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            mainImageUrl,
            price: Number(form.price),
            totalQuantity: form.totalQuantity ? Number(form.totalQuantity) : null,
            purchaseLimit: form.purchaseLimit ? Number(form.purchaseLimit) : null,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "상품 수정에 실패했습니다.");
        return;
      }

      toast.success("상품이 수정되었습니다.");
      router.push(`/${eventId}/booths/${boothId}/manage/products`);
      router.refresh();
    } catch {
      toast.error("상품 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("이 상품을 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `/api/booth/${boothId}/products/${productId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error ?? "삭제에 실패했습니다.");
        return;
      }

      toast.success("상품이 삭제되었습니다.");
      router.push(`/${eventId}/booths/${boothId}/manage/products`);
      router.refresh();
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
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
        initialPreviewUrl={product.main_image_url}
        onImageChange={setImage}
        hint="비워두면 기존 이미지가 유지돼요."
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
        onCategoryChange={(v) => updateField("category", v)}
        onSubCategoryChange={(v) => updateField("subCategory", v)}
      />

      <FormField label="총 수량">
        <input
          type="number"
          min="0"
          value={form.totalQuantity}
          onChange={(e) => updateField("totalQuantity", e.target.value)}
          placeholder="비워두면 제한 없음"
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      <FormField label="1인 구매 제한">
        <input
          type="number"
          min="1"
          value={form.purchaseLimit}
          onChange={(e) => updateField("purchaseLimit", e.target.value)}
          placeholder="비워두면 제한 없음"
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      <FormField label="상품 설명">
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={5}
          className="resize-none rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      <FormActions
        onCancel={() =>
          router.push(`/${eventId}/booths/${boothId}/manage/products`)
        }
        loading={loading}
        submitLabel="상품 수정"
        loadingLabel="수정 중..."
      />

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="mt-2 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
      >
        {deleting ? "삭제 중..." : "상품 삭제"}
      </button>
    </form>
  );
}