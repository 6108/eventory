"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export default function Page() {
  const [boothNumber, setBoothNumber] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: rpcError } = await supabase.rpc("claim_booth", {
      p_booth_number: boothNumber.trim(),
      p_code: code.trim(),
    });

    setLoading(false);

    if (rpcError || !data) {
      setError("부스번호 또는 코드가 올바르지 않습니다.");
      return;
    }

    router.push(`/booths/${data}/manage`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-white mb-1">부스 등록</h1>
        <p className="text-sm text-zinc-400 mb-8">
          부스번호와 초대 코드를 입력해 부스에 연결하세요.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            placeholder="부스번호"
            value={boothNumber}
            onChange={(e) => setBoothNumber(e.target.value)}
            required
            className="w-full rounded p-3 py-2 bg-zinc-900 text-white placeholder:text-zinc-500 border border-zinc-800 focus:outline-none focus:border-primary"
          />
          <input
            placeholder="초대 코드"
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
      </div>
    </div>
  );
}