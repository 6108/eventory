// [목업] Supabase 대신 메모리 DB 엔진을 사용합니다. (원본: createServerClient)
import { cookies } from "next/headers";
import { makeClient } from "@/src/lib/mock/builder";
import {
  AUTH_COOKIE,
  ctxFromCookie,
  execQuery,
  execRpc,
  files,
  getMockUser,
  mockUpload,
} from "@/src/lib/mock/engine";

export async function createClient() {
  const cookieStore = await cookies();
  const ctx = ctxFromCookie(cookieStore.get(AUTH_COOKIE)?.value);

  return makeClient(
    {
      query: (table, ops) => execQuery(table, ops, ctx),
      rpc: (fn, args) => execRpc(fn, args, ctx),
    },
    {
      getUser: async () => ({ data: { user: getMockUser(ctx) }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithOAuth: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: async () => ({ data: null, error: null }),
    },
    {
      from: () => ({
        upload: async (path, file) => {
          await mockUpload(path, file);
          return { data: { path }, error: null };
        },
        getPublicUrl: (path) => ({ data: { publicUrl: files[path] ?? "" } }),
      }),
    }
  );
}
