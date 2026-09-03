import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { ProductFormState } from "@/src/types/form";

interface Params {
  eventId: string;
  boothId: string;
}

export function useCreateProductMutation({ eventId, boothId }: Params) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function uploadImage(image: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("boothId", boothId);

    const res = await fetch("/api/upload/product", { method: "POST", body: formData });
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error ?? "이미지 업로드에 실패했습니다.");
      return null;
    }
    return result.url;
  }

  async function submit(form: ProductFormState, image: File, artistIds: string[]) {
    setLoading(true);
    try {
      const mainImageUrl = await uploadImage(image);
      if (!mainImageUrl) return;

      const res = await fetch(`/api/booth/${boothId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          mainImageUrl,
          price: Number(form.price),
          initialQuantity:
            form.options.length > 0
              ? null
              : form.initialQuantity
                ? Number(form.initialQuantity)
                : null,
          purchaseLimit: form.purchaseLimit ? Number(form.purchaseLimit) : null,
          options: form.options.map((option) => ({
            name: option.name,
            initialQuantity: Number(option.initialQuantity),
          })),
          artistIds,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "작품 추가에 실패했습니다.");
        return;
      }

      toast.success("작품이 추가되었습니다.");
      router.push(`/${eventId}/booths/${boothId}/manage/products`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("작품 추가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return { loading, submit };
}