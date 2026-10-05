// [목업] 브라우저에서도 같은 메모리 DB를 쓰기 위해 /api/mock/db 로 요청을 전달합니다.
// (원본: createBrowserClient)
import { makeClient, type Op, type Result } from "@/src/lib/mock/builder";

const AUTH_COOKIE = "mock_auth";

async function post(body: unknown): Promise<any> {
  const res = await fetch("/api/mock/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  return res.json();
}

type Listener = (event: string, session: any) => void;
const listeners = new Set<Listener>();

let client: ReturnType<typeof build> | undefined;

function build() {
  return makeClient(
    {
      query: (table: string, ops: Op[]): Promise<Result> => post({ kind: "query", table, ops }),
      rpc: (fn: string, args: unknown): Promise<Result> => post({ kind: "rpc", fn, args }),
    },
    {
      getUser: async () => {
        const { user } = await post({ kind: "auth" });
        return { data: { user }, error: null };
      },
      onAuthStateChange: (cb) => {
        listeners.add(cb);
        return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
      },
      // 구글 로그인 대신: 쿠키만 지우고(=작가 계정으로 로그인) 원래 가려던 페이지로 이동
      signInWithOAuth: async (opts: any) => {
        document.cookie = `${AUTH_COOKIE}=; Max-Age=0; path=/`;
        let next = "/";
        try {
          next = new URL(opts?.options?.redirectTo).searchParams.get("next") || "/";
        } catch {}
        window.location.assign(next);
        return { data: null, error: null };
      },
      signOut: async () => {
        document.cookie = `${AUTH_COOKIE}=out; path=/`;
        listeners.forEach((cb) => cb("SIGNED_OUT", null));
        return { error: null };
      },
      exchangeCodeForSession: async () => ({ data: null, error: null }),
    },
    {
      from: () => ({
        upload: async () => ({ data: null, error: { message: "browser upload unsupported in mock" } }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    }
  );
}

export function createClient() {
  if (!client) client = build();
  return client;
}
