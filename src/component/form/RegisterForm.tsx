"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

export default function RegisterForm() {
  const [boothNumber, setBoothNumber] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      login();
    }
  }, [authLoading, user, login]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boothNumber: boothNumber.trim(),
        code: code.trim(),
      }),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error ?? "부스번호 또는 등록 코드가 올바르지 않습니다.");
      return;
    }

    router.push(`/${result.eventId}/booths/${result.boothId}/manage`);
    router.refresh();
  }

  if (authLoading || !user) return null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        placeholder="부스번호"
        value={boothNumber}
        onChange={(e) => setBoothNumber(e.target.value)}
        required
        className="w-full rounded p-3 py-2 bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-800 focus:outline-none focus:border-primary"
      />

      <input
        placeholder="등록 코드"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        className="w-full rounded p-3 py-2 bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-800 focus:outline-none focus:border-primary"
      />

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded p-3 py-2 bg-primary text-white font-medium disabled:opacity-50 mt-2"
      >
        {loading ? "확인 중..." : "부스 연결하기"}
      </button>
    </form>
  );
}