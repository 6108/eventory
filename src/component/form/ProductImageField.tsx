// src/component/form/ProductImageField.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

interface ProductImageFieldProps {
  initialPreviewUrl?: string | null;
  onImageChange: (file: File | null) => void;
  required?: boolean;
  hint?: string;
}

export function ProductImageField({
  initialPreviewUrl = null,
  onImageChange,
  required = false,
  hint,
}: ProductImageFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreviewUrl
  );
  const [isNewFile, setIsNewFile] = useState(false);

  useEffect(() => {
    return () => {
      if (isNewFile && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isNewFile, previewUrl]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      onImageChange(null);
      return;
    }

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp",
      });

      if (isNewFile && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(URL.createObjectURL(compressedFile));
      setIsNewFile(true);
      onImageChange(compressedFile);
    } catch {
      toast.error("이미지 처리에 실패했습니다.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-zinc-400">대표 이미지</label>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={required}
        onChange={handleChange}
        className="text-sm text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:text-white"
      />

      {hint && <p className="text-xs text-zinc-500">{hint}</p>}

      {previewUrl && (
        <div className="relative mt-2 aspect-square w-48 overflow-hidden rounded border border-zinc-800">
          <Image
            src={previewUrl}
            alt="상품 이미지 미리보기"
            fill
            sizes="192px"
            className="object-cover"
            unoptimized={isNewFile}
          />
        </div>
      )}
    </div>
  );
}