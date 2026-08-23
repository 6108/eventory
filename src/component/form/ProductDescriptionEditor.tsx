"use client";

import { useMemo, useRef, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "@/src/styles/quill.css";

interface ProductDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  boothId: string;
  accentColor?: string; // 예: event.themeColor ("#f97316" 등). 없으면 기본 파란색
}

export default function ProductDescriptionEditor({
  value,
  onChange,
  boothId,
  accentColor,
}: ProductDescriptionEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const uploadingRef = useRef<Set<string>>(new Set());

  const uploadFile = useCallback(
    async (file: File | Blob, filename = "pasted-image.png") => {
      const formData = new FormData();
      formData.append(
        "file",
        file instanceof File ? file : new File([file], filename, { type: file.type })
      );
      formData.append("boothId", boothId);
      formData.append("type", "detail");

      const res = await fetch("/api/upload/product", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error ?? "이미지 업로드에 실패했습니다.");
        return null;
      }

      return result.url as string;
    },
    [boothId]
  );

  const handleImageUpload = () => {
    const input = document.createElement("input");

    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      try {
        const url = await uploadFile(file, file.name);

        if (!url) return;

        const editor = quillRef.current?.getEditor();

        if (!editor) return;

        const range = editor.getSelection(true);

        editor.insertEmbed(range.index, "image", url);
        editor.setSelection(range.index + 1, 0);
      } catch {
        alert("이미지 업로드 중 오류가 발생했습니다.");
      }
    };
  };

  const replaceBase64Images = useCallback(async () => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const contents = editor.getContents();

    for (const op of contents.ops ?? []) {
      const imageSrc = (op.insert as { image?: string } | undefined)?.image;

      if (imageSrc && imageSrc.startsWith("data:") && !uploadingRef.current.has(imageSrc)) {
        uploadingRef.current.add(imageSrc);

        try {
          const blob = await (await fetch(imageSrc)).blob();
          const url = await uploadFile(blob);

          if (url) {
            const latestOps = editor.getContents().ops ?? [];
            let pos = 0;

            for (const latestOp of latestOps) {
              if (typeof latestOp.insert === "string") {
                pos += latestOp.insert.length;
              } else {
                const latestSrc = (latestOp.insert as { image?: string } | undefined)?.image;

                if (latestSrc === imageSrc) {
                  editor.deleteText(pos, 1, "silent");
                  editor.insertEmbed(pos, "image", url, "silent");
                  break;
                }

                pos += 1;
              }
            }

            onChange(editor.root.innerHTML);
          }
        } catch {
          // 개별 이미지 업로드 실패는 조용히 무시 (base64로 남음)
        } finally {
          uploadingRef.current.delete(imageSrc);
        }
      }
    }
  }, [onChange, uploadFile]);

  const handleChange = useCallback(
    (html: string) => {
      onChange(html);
      setTimeout(() => {
        replaceBase64Images();
      }, 0);
    },
    [onChange, replaceBase64Images]
  );

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
          ["image"],
          ["clean"],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
    }),
    []
  );

  const formats = [
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "list",
    "link",
    "image",
  ];

  return (
    <div
      className="quill-dark overflow-hidden rounded border border-zinc-800"
      style={
        accentColor
          ? ({ "--quill-accent": accentColor } as React.CSSProperties)
          : undefined
      }
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder="상품 상세 설명을 입력해주세요. (이미지 복사/붙여넣기, 드래그앤드롭 가능)"
      />
    </div>
  );
}