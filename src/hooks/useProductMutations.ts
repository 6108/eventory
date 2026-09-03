import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { ProductFormState } from "@/src/types/form";

interface Params {
  eventId: string;
  boothId: string;
  productId: string;
  currentImageUrl: string;
}

export function useProductMutations({
  eventId,
  boothId,
  productId,
  currentImageUrl,
}: Params) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function uploadImage(image: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("boothId", boothId);

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
    artistIds: string[]
  ) {
    setLoading(true);

    try {
      let mainImageUrl = currentImageUrl;

      if (image) {
        const uploadedUrl = await uploadImage(image);

        if (!uploadedUrl) return;

        mainImageUrl = uploadedUrl;
      }

      const res = await fetch(
        `/api/booth/${boothId}/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            mainImageUrl,
            artistIds,
            price: Number(form.price),
            initialQuantity:
              form.options.length > 0
                ? null
                : form.initialQuantity
                  ? Number(form.initialQuantity)
                  : null,
            purchaseLimit: form.purchaseLimit
              ? Number(form.purchaseLimit)
              : null,
            options: form.options.map((option) => ({
              name: option.name,
              initialQuantity: Number(option.initialQuantity),
            })),
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "상품 수정에 실패했습니다.");
        return;
      }

      toast.success("상품이 수정되었습니다.");

      router.push(
        `/${eventId}/booths/${boothId}/manage/products`
      );
      router.refresh();
    } catch {
      toast.error("상품 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("이 상품을 삭제하시겠습니까? 되돌릴 수 없습니다.")) {
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch(
        `/api/booth/${boothId}/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error ?? "삭제에 실패했습니다.");
        return;
      }

      toast.success("상품이 삭제되었습니다.");

      router.push(
        `/${eventId}/booths/${boothId}/manage/products`
      );
      router.refresh();
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  return {
    loading,
    deleting,
    submit,
    remove,
  };
}