"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { X } from "lucide-react";

const MAX_IMAGES = 5;

interface SampleImageItem {
  id: string;
  file?: File; // 새로 추가한 파일 (없으면 기존 업로드된 이미지)
  previewUrl: string;
  isExisting: boolean;
}

interface ProductSampleImagesFieldProps {
  initialUrls?: string[];
  onChange: (files: File[], keptExistingUrls: string[]) => void;
}

export function ProductSampleImagesField({
  initialUrls = [],
  onChange,
}: ProductSampleImagesFieldProps) {
  const [items, setItems] = useState<SampleImageItem[]>(() =>
    initialUrls.map((url) => ({
      id: url,
      previewUrl: url,
      isExisting: true,
    }))
  );

  useEffect(() => {
    onChange(
      items.filter((item) => item.file).map((item) => item.file!),
      items.filter((item) => item.isExisting).map((item) => item.previewUrl)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (!item.isExisting) URL.revokeObjectURL(item.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (files.length === 0) return;

    if (items.length + files.length > MAX_IMAGES) {
      toast.error(`상세 이미지는 최대 ${MAX_IMAGES}장까지 등록할 수 있습니다.`);
      return;
    }

    try {
      const compressed = await Promise.all(
        files.map((file) =>
          imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
            fileType: "image/webp",
          })
        )
      );

      const newItems: SampleImageItem[] = compressed.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        isExisting: false,
      }));

      setItems((prev) => [...prev, ...newItems]);
    } catch {
      toast.error("이미지 처리에 실패했습니다.");
    }
  }

  function handleRemove(id: string) {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && !target.isExisting) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-zinc-400">
        상세 이미지 ({items.length}/{MAX_IMAGES})
      </label>

      {items.length < MAX_IMAGES && (
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleAdd}
          className="text-sm text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:text-white"
        />
      )}

      <p className="text-xs text-zinc-500">
        작품 상세 컷, 옵션별 컬러 등 손님이 참고할 이미지를 추가로 올릴 수 있습니다.
      </p>

      {items.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square overflow-hidden rounded border border-zinc-800"
            >
              <Image
                src={item.previewUrl}
                alt="상세 이미지 미리보기"
                fill
                sizes="(min-width: 640px) 25vw, 33.33vw"
                className="object-cover"
                unoptimized={!item.isExisting}
              />

              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}