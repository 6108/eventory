"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/src/hooks/useAuth";

interface ProfileFormProps {
  name: string;
}

export default function ProfileForm({
  name,
}: ProfileFormProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextName = value.trim();

    if (!nextName) {
      toast.error("이름을 입력해주세요.");
      return;
    }

    if (nextName === name) {
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/mypage/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nextName,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(
          result.error ?? "이름 수정에 실패했습니다."
        );
        return;
      }

      toast.success("이름이 수정되었습니다.");
      router.refresh();
    } catch {
      toast.error("이름 수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "정말 회원 탈퇴하시겠습니까?\n탈퇴하면 계정 정보를 복구할 수 없습니다."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch("/api/mypage/profile", {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(
          result.error ?? "회원 탈퇴에 실패했습니다."
        );
        return;
      }

      await logout();

      router.push("/");
      router.refresh();
    } catch {
      toast.error("회원 탈퇴 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 이름 수정 */}
      <form
        onSubmit={handleNameSubmit}
        className="flex flex-col gap-2"
      >
        <label
          htmlFor="name"
          className="text-sm font-medium text-zinc-300"
        >
          이름
        </label>

        <div className="flex gap-2">
          <input
            id="name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={30}
            className="min-w-0 flex-1 rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-primary"
            placeholder="이름을 입력해주세요."
          />

          <button
            type="submit"
            disabled={
              saving ||
              deleting ||
              !value.trim() ||
              value.trim() === name
            }
            className="shrink-0 rounded bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>

      {/* 회원 탈퇴 */}
      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-medium text-zinc-300">
          회원 탈퇴
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          탈퇴하면 계정 정보를 복구할 수 없습니다.
        </p>

        <button
          type="button"
          onClick={handleDelete}
          disabled={saving || deleting}
          className="mt-3 rounded border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950 disabled:opacity-50"
        >
          {deleting ? "탈퇴 처리 중..." : "회원 탈퇴"}
        </button>
      </div>
    </div>
  );
}