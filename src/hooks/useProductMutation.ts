// src/hooks/useProductMutation.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { ProductFormState } from "@/src/types/form";

interface Params {
  eventId: string;
  boothId: string;
  productId?: string;
  currentImageUrl?: string;
}

export function useProductMutation({
  eventId,
  boothId,
  productId,
  currentImageUrl,
}: Params) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isEdit = Boolean(productId);

  async function uploadImage(image: File, type?: "detail"): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("boothId", boothId);
    if (type) formData.append("type", type);

    const res = await fetch("/api/upload/product", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error ?? "이미지 업로드에 실패했습니다.");
      return null;
    }

    return result.url;
  }

  async function submit(
    form: ProductFormState,
    image: File | null,
    artistIds: string[],
    sampleImageFiles: File[] = [],
    keptSampleImageUrls: string[] = []
  ) {
    setLoading(true);

    try {
      let mainImageUrl = currentImageUrl ?? "";

      if (image) {
        const uploadedUrl = await uploadImage(image);
        if (!uploadedUrl) return;
        mainImageUrl = uploadedUrl;
      }

      const uploadedSampleUrls: string[] = [];
      for (const file of sampleImageFiles) {
        const uploadedUrl = await uploadImage(file, "detail");
        if (!uploadedUrl) {
          toast.error("상세 이미지 업로드 중 일부가 실패했습니다.");
          return;
        }
        uploadedSampleUrls.push(uploadedUrl);
      }

      const sampleImageUrls = [...keptSampleImageUrls, ...uploadedSampleUrls];

      const url = isEdit
        ? `/api/booth/${boothId}/products/${productId}`
        : `/api/booth/${boothId}/products`;

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          mainImageUrl,
          sampleImageUrls,
          artistIds,
          price: Number(form.price),
          initialQuantity:
            form.options.length > 0
              ? null
              : form.initialQuantity
                ? Number(form.initialQuantity)
                : null,
          purchaseLimit: form.purchaseLimit ? Number(form.purchaseLimit) : null,
          options: form.options.map((option) => ({
            id: option.id,
            name: option.name,
            initialQuantity: Number(option.initialQuantity),
          })),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? (isEdit ? "작품 수정에 실패했습니다." : "작품 추가에 실패했습니다."));
        return;
      }

      toast.success(isEdit ? "작품이 수정되었습니다." : "작품이 추가되었습니다.");
      router.push(`/${eventId}/booths/${boothId}/manage/products`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(isEdit ? "작품 수정 중 오류가 발생했습니다." : "작품 추가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!productId) return;

    if (!confirm("이 상품을 삭제하시겠습니까? 되돌릴 수 없습니다.")) {
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch(`/api/booth/${boothId}/products/${productId}`, {
        method: "DELETE",
      });

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

  return { loading, deleting, submit, remove };
}