// 서버/브라우저 공용 쿼리 빌더. 실제 실행은 runner가 담당합니다
// (서버: 메모리 엔진 직접 호출 / 브라우저: /api/mock/db 로 전달).

export type Op = { m: string; a: any[] };

// supabase-js 의 User 타입 대신 쓰는 최소 형태
export type MockUser = {
  id: string;
  email: string | null;
  user_metadata?: Record<string, any>;
  [key: string]: any;
};
export type Result = { data: any; error: any; count?: number | null };

export type Runner = {
  query: (table: string, ops: Op[]) => Promise<Result> | Result;
  rpc: (fn: string, args: any) => Promise<Result> | Result;
};

class Builder implements PromiseLike<Result> {
  private ops: Op[] = [];
  constructor(private table: string, private runner: Runner) {}

  private push(m: string, a: any[]) {
    this.ops.push({ m, a });
    return this;
  }

  select(...a: any[]) { return this.push("select", a); }
  insert(...a: any[]) { return this.push("insert", a); }
  update(...a: any[]) { return this.push("update", a); }
  upsert(...a: any[]) { return this.push("upsert", a); }
  delete(...a: any[]) { return this.push("delete", a); }
  eq(...a: any[]) { return this.push("eq", a); }
  neq(...a: any[]) { return this.push("neq", a); }
  in(...a: any[]) { return this.push("in", a); }
  is(...a: any[]) { return this.push("is", a); }
  not(...a: any[]) { return this.push("not", a); }
  order(...a: any[]) { return this.push("order", a); }
  range(...a: any[]) { return this.push("range", a); }
  limit(...a: any[]) { return this.push("limit", a); }
  single() { return this.push("single", []); }
  maybeSingle() { return this.push("maybeSingle", []); }

  then<A = Result, B = never>(
    onfulfilled?: ((value: Result) => A | PromiseLike<A>) | null,
    onrejected?: ((reason: any) => B | PromiseLike<B>) | null
  ): PromiseLike<A | B> {
    return Promise.resolve(this.runner.query(this.table, this.ops)).then(onfulfilled, onrejected);
  }
}

export type AuthApi = {
  getUser: () => Promise<{ data: { user: any }; error: any }>;
  onAuthStateChange: (cb: (event: string, session: any) => void) => { data: { subscription: { unsubscribe: () => void } } };
  signInWithOAuth: (opts: any) => Promise<any>;
  signOut: () => Promise<any>;
  exchangeCodeForSession: (code: string) => Promise<any>;
};

export type StorageApi = {
  from: (bucket: string) => {
    upload: (path: string, file: File, opts?: any) => Promise<{ data: any; error: any }>;
    getPublicUrl: (path: string) => { data: { publicUrl: string } };
  };
};

export function makeClient(runner: Runner, auth: AuthApi, storage: StorageApi) {
  return {
    from: (table: string) => new Builder(table, runner),
    rpc: (fn: string, args: any = {}) => ({
      then: (ok: any, bad: any) => Promise.resolve(runner.rpc(fn, args)).then(ok, bad),
    }) as PromiseLike<Result>,
    auth,
    storage,
  };
}
