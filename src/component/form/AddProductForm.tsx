"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { productCategories } from "@/src/types/product";
import imageCompression from "browser-image-compression";

type Props = {
  eventId: string;
  boothId: string;
};

export default function AddProductForm({
  eventId,
  boothId,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [purchaseLimit, setPurchaseLimit] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCategory = productCategories.find(
    (item) => item.value === category
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      setImage(null);
      setPreviewUrl(null);
      return;
    }

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp",
      });

      setImage(compressedFile);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(URL.createObjectURL(compressedFile));
    } catch {
      toast.error("이미지 처리에 실패했습니다.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!image) {
      toast.error("대표 이미지를 선택해주세요.");
      return;
    }

    if (!category || !subCategory) {
      toast.error("상품 카테고리를 선택해주세요.");
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
      const res = await fetch(`/api/booth/${boothId}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          mainImageUrl: uploadResult.url,
          price: Number(price),
          category,
          subCategory,
          totalQuantity: totalQuantity
            ? Number(totalQuantity)
            : null,
          purchaseLimit: purchaseLimit
            ? Number(purchaseLimit)
            : null,
          description,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(
          result.error ?? "상품 추가에 실패했습니다."
        );
        return;
      }

      toast.success("상품이 추가되었습니다.");

      router.push(
        `/${eventId}/booths/${boothId}/manage`
      );
      router.refresh();
    } catch {
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
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">
          상품명
        </label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </div>

      {/* 대표 이미지 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">
          대표 이미지
        </label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={handleImageChange}
          className="text-sm text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:text-white"
        />

        {previewUrl && (
          <div className="relative mt-2 aspect-square w-48 overflow-hidden rounded border border-zinc-800">
            <Image
              src={previewUrl}
              alt="선택한 이미지 미리보기"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* 가격 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">
          가격
        </label>

        <input
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </div>

      {/* 카테고리 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">
          카테고리
        </label>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubCategory("");
          }}
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        >
          <option value="">
            카테고리 선택
          </option>

          {productCategories.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* 세부 카테고리 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">
          세부 카테고리
        </label>

        <select
          value={subCategory}
          onChange={(e) =>
            setSubCategory(e.target.value)
          }
          disabled={!selectedCategory}
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none disabled:opacity-40 focus:border-primary"
        >
          <option value="">
            세부 카테고리 선택
          </option>

          {selectedCategory?.types.map((type) => (
            <option
              key={type.value}
              value={type.value}
            >
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* 총 수량 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">
          총 수량
        </label>

        <input
          type="number"
          min="0"
          value={totalQuantity}
          onChange={(e) =>
            setTotalQuantity(e.target.value)
          }
          placeholder="비워두면 제한 없음"
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </div>

      {/* 구매 제한 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">
          1인 구매 제한
        </label>

        <input
          type="number"
          min="1"
          value={purchaseLimit}
          onChange={(e) =>
            setPurchaseLimit(e.target.value)
          }
          placeholder="비워두면 제한 없음"
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </div>

      {/* 상품 설명 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">
          상품 설명
        </label>

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          rows={5}
          className="resize-none rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/${eventId}/booths/${boothId}/manage`
            )
          }
          disabled={loading}
          className="rounded px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
        >
          취소
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "추가 중..." : "상품 추가"}
        </button>
      </div>
    </form>
  );
}
