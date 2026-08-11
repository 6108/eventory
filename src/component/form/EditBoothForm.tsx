"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type Category = "GENERAL" | "ADULT";

type Props = {
  boothId: string;
  eventId: string;
  boothName: string;
  description: string | null;
  category: Category;
};

export default function EditBoothForm({
  boothId,
  eventId,
  boothName,
  description,
  category,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(boothName);
  const [desc, setDesc] = useState(description ?? "");
  const [selectedCategory, setSelectedCategory] =
    useState<Category>(category);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/booth/${boothId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        boothName: name,
        description: desc,
        category: selectedCategory,
      }),
    });

    const result = await res.json();

    setLoading(false);

    if (!res.ok) {
      toast.error(result.error ?? "수정에 실패했습니다.");
      return;
    }

    toast.success("부스 정보가 수정되었습니다.");
    router.push(`/${eventId}/booths/${boothId}/manage`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">부스명</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">부스 설명</label>

        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={5}
          className="resize-none rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </div>


      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">
          부스 유형
        </label>

        <div className="flex gap-3">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="category"
              value="GENERAL"
              checked={selectedCategory === "GENERAL"}
              onChange={() => setSelectedCategory("GENERAL")}
              className="peer sr-only"
            />

            <div className="rounded border border-zinc-800 px-4 py-2 text-sm text-zinc-400 transition peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-white">
              일반
            </div>
          </label>

          <label className="cursor-pointer">
            <input
              type="radio"
              name="category"
              value="ADULT"
              checked={selectedCategory === "ADULT"}
              onChange={() => setSelectedCategory("ADULT")}
              className="peer sr-only"
            />

            <div className="rounded border border-zinc-800 px-4 py-2 text-sm text-zinc-400 transition peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-white">
              성인
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() =>
            router.push(`/${eventId}/booths/${boothId}/manage`)
          }
          className="rounded px-4 py-2 text-sm text-zinc-400 hover:text-white"
        >
          취소
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}