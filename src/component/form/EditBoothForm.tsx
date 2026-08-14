// src/component/form/EditBoothForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FormField } from "./FormField";
import { FormActions } from "./FormActions";
import type { BoothFormState } from "@/src/types/form";

type Category = "GENERAL" | "ADULT";

interface EditBoothFormProps {
  boothId: string;
  eventId: string;
  boothName: string;
  description: string | null;
  category: Category;
}

export default function EditBoothForm({
  boothId,
  eventId,
  boothName,
  description,
  category,
}: EditBoothFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<BoothFormState>({
    name: boothName,
    description: description ?? "",
    category,
  });
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof BoothFormState>(
    key: K,
    value: BoothFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/booth/${boothId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boothName: form.name,
        description: form.description,
        category: form.category,
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
      <FormField label="부스명">
        <input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      <FormField label="부스 설명">
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={5}
          className="resize-none rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        />
      </FormField>

      <FormField label="부스 유형">
        <div className="flex gap-3">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="category"
              value="GENERAL"
              checked={form.category === "GENERAL"}
              onChange={() => updateField("category", "GENERAL")}
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
              checked={form.category === "ADULT"}
              onChange={() => updateField("category", "ADULT")}
              className="peer sr-only"
            />
            <div className="rounded border border-zinc-800 px-4 py-2 text-sm text-zinc-400 transition peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-white">
              성인
            </div>
          </label>
        </div>
      </FormField>

      <FormActions
        onCancel={() => router.push(`/${eventId}/booths/${boothId}/manage`)}
        loading={loading}
        submitLabel="저장"
        loadingLabel="저장 중..."
      />
    </form>
  );
}