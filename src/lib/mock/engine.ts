// Supabase 없이 동작하도록 만든 메모리 DB 엔진.
// 실제 코드에서 쓰는 쿼리 패턴(select 중첩 조인 / eq·in·is·not·neq / order·range /
// single·maybeSingle / insert·update·upsert·delete / rpc)만 구현했습니다.

import { buildSeed, MOCK_ARTIST_ID, type Db, type Row } from "./seed";
import { AUTH_COOKIE } from "./constants";
export { AUTH_COOKIE };

const g = globalThis as unknown as { __MOCK_DB__?: Db; __MOCK_FILES__?: Record<string, string> };
export const db: Db = (g.__MOCK_DB__ ??= buildSeed());
export const files: Record<string, string> = (g.__MOCK_FILES__ ??= {});

export type Ctx = { userId: string | null };
export type Op = { m: string; a: any[] };
export type Result = { data: any; error: any; count?: number | null };

// AUTH_COOKIE: "out" 이면 로그아웃 상태, 그 외에는 작가(하늘달)로 로그인된 상태

let seq = 1000;
const uid = (p = "id") => `${p}-${(++seq).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const now = () => new Date().toISOString();
const err = (message: string, code?: string) => ({ message, code, details: null, hint: null });

// ---------- 관계 정의 (FK) ----------
type Rel = { kind: "one" | "many"; target: string; fk: string };
export const REL: Record<string, Record<string, Rel>> = {
  products: {
    booths: { kind: "one", target: "booths", fk: "booth_id" },
    product_options: { kind: "many", target: "product_options", fk: "product_id" },
  },
  booths: { events: { kind: "one", target: "events", fk: "event_id" } },
  booth_artists: { booths: { kind: "one", target: "booths", fk: "booth_id" } },
  booth_follows: { booths: { kind: "one", target: "booths", fk: "booth_id" } },
  product_likes: { products: { kind: "one", target: "products", fk: "product_id" } },
  cart_items: {
    products: { kind: "one", target: "products", fk: "product_id" },
    product_options: { kind: "one", target: "product_options", fk: "option_id" },
  },
  orders: { order_items: { kind: "many", target: "order_items", fk: "order_id" } },
  order_requests: {
    booths: { kind: "one", target: "booths", fk: "booth_id" },
    orders: { kind: "one", target: "orders", fk: "order_id" },
    order_request_items: { kind: "many", target: "order_request_items", fk: "order_request_id" },
  },
};

// ---------- select 문자열 파서 ----------
type Node = { name: string; children?: Node[] };
function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}
export function parseSelect(s: string): Node[] {
  return splitTop(s).map((part) => {
    const i = part.indexOf("(");
    if (i === -1) return { name: part };
    return { name: part.slice(0, i).trim(), children: parseSelect(part.slice(i + 1, part.lastIndexOf(")"))) };
  });
}
function project(table: string, row: Row, nodes: Node[]): Row {
  const out: Row = {};
  for (const n of nodes) {
    if (n.name === "*") { Object.assign(out, row); continue; }
    if (!n.children) { out[n.name] = row[n.name] ?? null; continue; }
    const rel = REL[table]?.[n.name];
    if (!rel) { out[n.name] = null; continue; }
    if (rel.kind === "one") {
      const t = db[rel.target].find((r) => r.id === row[rel.fk]);
      out[n.name] = t ? project(rel.target, t, n.children) : null;
    } else {
      out[n.name] = db[rel.target].filter((r) => r[rel.fk] === row.id).map((r) => project(rel.target, r, n.children!));
    }
  }
  return out;
}

// ---------- 테이블별 기본값 / 유니크 제약 ----------
function withDefaults(table: string, row: Row): Row {
  const r: Row = { ...row };
  if (!r.id && table !== "booth_artists" && table !== "booth_codes") r.id = uid(table.slice(0, 4));
  if (!("created_at" in r)) r.created_at = now();
  if (table === "products") { r.visible ??= true; r.artist_ids ??= []; r.sample_images ??= []; }
  if (table === "cart_items") { r.purchased ??= false; r.updated_at = now(); }
  if (table === "order_requests") { r.status ??= "requested"; r.order_id ??= null; r.updated_at = now(); }
  if (table === "prepaid") r.checked ??= false;
  if (table === "order_items") r.cancelled_quantity ??= 0;
  if (table === "orders") r.status ??= "completed";
  return r;
}
const UNIQUE: Record<string, string[][]> = {
  booth_follows: [["user_id", "booth_id"]],
  product_likes: [["user_id", "product_id"]],
  orders: [["client_transaction_id"]],
};
const keyOf = (table: string, r: Row, cols: string[]) =>
  cols.map((c) => (table === "cart_items" && c === "option_key" ? r.option_id ?? "" : r[c]));
const sameKey = (a: any[], b: any[]) => a.every((v, i) => v === b[i]);

// ---------- 쿼리 실행 ----------
export function execQuery(table: string, ops: Op[], ctx: Ctx): Result {
  if (!db[table]) return { data: null, error: err(`unknown table ${table}`, "42P01") };

  let action: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  let payload: any = null;
  let upsertOpts: any = {};
  let selectStr: string | null = null;
  let selectOpts: any = {};
  let wantsReturn = false;
  const filters: ((r: Row) => boolean)[] = [];
  let order: { col: string; asc: boolean }[] = [];
  let range: [number, number] | null = null;
  let limit: number | null = null;
  let single: "single" | "maybe" | null = null;

  for (const { m, a } of ops) {
    switch (m) {
      case "select":
        if (action === "select") { selectStr = a[0] ?? "*"; selectOpts = a[1] ?? {}; }
        else { wantsReturn = true; selectStr = a[0] ?? "*"; }
        break;
      case "insert": case "update": case "upsert": case "delete":
        action = m as any; payload = a[0]; if (m === "upsert") upsertOpts = a[1] ?? {}; break;
      case "eq": filters.push((r) => r[a[0]] === a[1]); break;
      case "neq": filters.push((r) => r[a[0]] !== a[1]); break;
      case "in": filters.push((r) => (a[1] as any[]).includes(r[a[0]])); break;
      case "is": filters.push((r) => (a[1] === null ? r[a[0]] == null : r[a[0]] === a[1])); break;
      case "not":
        if (a[1] === "is") filters.push((r) => (a[2] === null ? r[a[0]] != null : r[a[0]] !== a[2]));
        else filters.push((r) => r[a[0]] !== a[2]);
        break;
      case "order": order.push({ col: a[0], asc: a[1]?.ascending !== false }); break;
      case "range": range = [a[0], a[1]]; break;
      case "limit": limit = a[0]; break;
      case "single": single = "single"; break;
      case "maybeSingle": single = "maybe"; break;
    }
  }

  const match = (r: Row) => filters.every((f) => f(r));
  const shape = (rows: Row[], count: number | null = null): Result => {
    const nodes = parseSelect(selectStr ?? "*");
    const out = rows.map((r) => project(table, r, nodes));
    if (single) {
      if (out.length === 1) return { data: out[0], error: null, count };
      if (out.length === 0 && single === "maybe") return { data: null, error: null, count };
      return { data: null, error: err("JSON object requested, multiple (or no) rows returned", "PGRST116"), count };
    }
    return { data: out, error: null, count };
  };
  const sortRows = (rows: Row[]) => {
    if (!order.length) return rows;
    return [...rows].sort((x, y) => {
      for (const { col, asc } of order) {
        const a = x[col], b = y[col];
        if (a === b) continue;
        if (a == null) return 1;
        if (b == null) return -1;
        return (a < b ? -1 : 1) * (asc ? 1 : -1);
      }
      return 0;
    });
  };

  if (action === "select") {
    let rows = sortRows(db[table].filter(match));
    const total = rows.length;
    if (range) rows = rows.slice(range[0], range[1] + 1);
    if (limit != null) rows = rows.slice(0, limit);
    return shape(rows, selectOpts?.count ? total : null);
  }

  if (action === "insert" || action === "upsert") {
    const list: Row[] = Array.isArray(payload) ? payload : [payload];
    const touched: Row[] = [];
    for (const raw of list) {
      const row = withDefaults(table, raw);
      if (action === "upsert") {
        const cols: string[] = (upsertOpts.onConflict ?? "id").split(",").map((s: string) => s.trim());
        const existing = db[table].find((r) => sameKey(keyOf(table, r, cols), keyOf(table, row, cols)));
        if (existing) {
          if (!upsertOpts.ignoreDuplicates) {
            Object.assign(existing, raw);
            if ("updated_at" in existing) existing.updated_at = now();
          }
          touched.push(existing);
          continue;
        }
      } else {
        for (const cols of UNIQUE[table] ?? []) {
          if (db[table].some((r) => sameKey(keyOf(table, r, cols), keyOf(table, row, cols)))) {
            return { data: null, error: err(`duplicate key value violates unique constraint (${cols.join(",")})`, "23505") };
          }
        }
      }
      db[table].push(row);
      touched.push(row);
    }
    return wantsReturn ? shape(touched) : { data: null, error: null };
  }

  if (action === "update") {
    const rows = db[table].filter(match);
    rows.forEach((r) => { Object.assign(r, payload); if ("updated_at" in r) r.updated_at = now(); });
    return wantsReturn ? shape(rows) : { data: null, error: null };
  }

  // delete
  const doomed = db[table].filter(match);
  db[table] = db[table].filter((r) => !doomed.includes(r));
  // db 객체 자체가 공유되므로 같은 참조에 반영
  (globalThis as any).__MOCK_DB__[table] = db[table];
  return wantsReturn ? shape(doomed) : { data: null, error: null };
}

// ---------- RPC (원래 DB 함수) ----------
const isMember = (ctx: Ctx, boothId: string) =>
  !!ctx.userId && db.booth_artists.some((r) => r.booth_id === boothId && r.artist_id === ctx.userId);

export function execRpc(fn: string, args: Record<string, any>, ctx: Ctx): Result {
  const ok = (data: any = null): Result => ({ data, error: null });
  const fail = (message: string, code?: string): Result => ({ data: null, error: err(message, code) });

  switch (fn) {
    case "my_booth_ids":
      return ok(db.booth_artists.filter((r) => r.artist_id === ctx.userId).map((r) => r.booth_id));

    case "get_booth_code": {
      if (!isMember(ctx, args.p_booth_id)) return ok(null);
      return ok(db.booth_codes.find((c) => c.booth_id === args.p_booth_id)?.code ?? null);
    }

    case "claim_booth": {
      if (!ctx.userId) return fail("unauthorized");
      const booth = db.booths.find((b) => b.booth_number === args.p_booth_number);
      const code = booth && db.booth_codes.find((c) => c.booth_id === booth.id);
      if (!booth || !code || code.code !== args.p_code) return ok(null);
      if (!isMember(ctx, booth.id)) {
        const name = db.users.find((u) => u.id === ctx.userId)?.name ?? "";
        db.booth_artists.push({ artist_id: ctx.userId, booth_id: booth.id, artist_name: name, created_at: now() });
        booth.artist_names = [...(booth.artist_names ?? []), name];
      }
      return ok(booth.id);
    }

    case "remove_booth_artist": {
      if (!isMember(ctx, args.p_booth_id)) return fail("unauthorized");
      const removed = db.booth_artists.find((r) => r.booth_id === args.p_booth_id && r.artist_id === args.p_artist_id);
      db.booth_artists = db.booth_artists.filter((r) => r !== removed);
      (globalThis as any).__MOCK_DB__.booth_artists = db.booth_artists;
      const booth = db.booths.find((b) => b.id === args.p_booth_id);
      if (booth && removed) booth.artist_names = (booth.artist_names ?? []).filter((n: string) => n !== removed.artist_name);
      return ok();
    }

    case "sync_artist_name": {
      const { p_user_id: id, p_new_name: name } = args;
      db.booth_artists.filter((r) => r.artist_id === id).forEach((r) => {
        const old = r.artist_name;
        r.artist_name = name;
        const booth = db.booths.find((b) => b.id === r.booth_id);
        if (booth) booth.artist_names = (booth.artist_names ?? []).map((n: string) => (n === old ? name : n));
      });
      db.products.forEach((p) => {
        const idx = (p.artist_ids ?? []).indexOf(id);
        if (idx >= 0) p.artist_names = p.artist_names.map((n: string, i: number) => (i === idx ? name : n));
      });
      return ok();
    }

    case "create_order_request": {
      if (!ctx.userId) return fail("unauthorized");
      const items: any[] = args.p_items ?? [];
      if (!items.length) return fail("empty items");
      const prev = db.order_requests.find((r) => r.booth_id === args.p_booth_id && r.customer_id === ctx.userId && r.order_id === null && r.status !== "cancelled");
      if (prev?.status === "checked") return fail("already_checked");
      let id: string;
      if (prev) {
        id = prev.id;
        prev.status = "requested"; prev.updated_at = now();
        db.order_request_items = db.order_request_items.filter((i) => i.order_request_id !== id);
        (globalThis as any).__MOCK_DB__.order_request_items = db.order_request_items;
      } else {
        id = uid("req");
        db.order_requests.push(withDefaults("order_requests", { id, booth_id: args.p_booth_id, customer_id: ctx.userId, customer_nickname: args.p_customer_nickname }));
      }
      items.forEach((it) => db.order_request_items.push({ id: uid("ri"), order_request_id: id, product_id: it.product_id, option_id: it.option_id ?? null, product_name: it.product_name, option_name: it.option_name ?? null, quantity: it.quantity }));
      return ok(id);
    }

    case "create_order": {
      if (!isMember(ctx, args.p_booth_id)) return fail("unauthorized");
      if (db.orders.some((o) => o.client_transaction_id === args.p_client_transaction_id)) return fail("duplicate", "23505");
      const lines: { p: Row; o: Row | null; qty: number }[] = [];
      for (const it of args.p_items ?? []) {
        const p = db.products.find((x) => x.id === it.product_id && x.booth_id === args.p_booth_id);
        if (!p) return fail("invalid product");
        const o = it.option_id ? db.product_options.find((x) => x.id === it.option_id && x.product_id === p.id) ?? null : null;
        if (it.option_id && !o) return fail("invalid option");
        const stock = o ? o.remaining_quantity : p.remaining_quantity;
        if (stock != null && stock < it.quantity) return fail("out of stock");
        lines.push({ p, o, qty: it.quantity });
      }
      const orderId = uid("order");
      let amt = 0, qty = 0;
      lines.forEach(({ p, o, qty: q }) => {
        const unit = o?.price ?? p.price;
        if (o && o.remaining_quantity != null) o.remaining_quantity -= q;
        else if (!o && p.remaining_quantity != null) p.remaining_quantity -= q;
        db.order_items.push({ id: uid("oi"), order_id: orderId, product_id: p.id, option_id: o?.id ?? null, product_name: p.name, option_name: o?.name ?? null, unit_price: unit, quantity: q, cancelled_quantity: 0, subtotal: unit * q });
        amt += unit * q; qty += q;
      });
      db.orders.push({ id: orderId, booth_id: args.p_booth_id, client_transaction_id: args.p_client_transaction_id, total_amount: amt, total_quantity: qty, status: "completed", cancelled_at: null, created_at: now() });
      const reqIds: string[] = args.p_order_request_ids ?? [];
      db.order_requests.filter((r) => reqIds.includes(r.id)).forEach((r) => { r.order_id = orderId; r.updated_at = now(); });
      return ok(orderId);
    }

    case "cancel_order_item": {
      const item = db.order_items.find((i) => i.id === args.p_order_item_id);
      if (!item) return fail("invalid order item");
      const order = db.orders.find((o) => o.id === item.order_id);
      if (!order || !isMember(ctx, order.booth_id)) return fail("unauthorized");
      if (order.status === "cancelled") return fail("order already cancelled");
      const q = args.p_cancel_quantity;
      if (!(q > 0) || q > item.quantity - item.cancelled_quantity) return fail("invalid cancel quantity");
      item.cancelled_quantity += q;
      // 재고 복구
      const opt = item.option_id ? db.product_options.find((o) => o.id === item.option_id) : null;
      const prod = db.products.find((p) => p.id === item.product_id);
      if (opt && opt.remaining_quantity != null) opt.remaining_quantity += q;
      else if (!opt && prod && prod.remaining_quantity != null) prod.remaining_quantity += q;
      const items = db.order_items.filter((i) => i.order_id === order.id);
      order.total_quantity = items.reduce((s, i) => s + (i.quantity - i.cancelled_quantity), 0);
      order.total_amount = items.reduce((s, i) => s + i.unit_price * (i.quantity - i.cancelled_quantity), 0);
      if (order.total_quantity === 0) { order.status = "cancelled"; order.cancelled_at = now(); }
      return ok({ success: true, orderId: order.id, orderStatus: order.status, totalAmount: order.total_amount, totalQuantity: order.total_quantity });
    }

    case "cancel_order": {
      const order = db.orders.find((o) => o.id === args.p_order_id);
      if (!order || !isMember(ctx, order.booth_id)) return fail("unauthorized");
      db.order_items.filter((i) => i.order_id === order.id).forEach((i) => (i.cancelled_quantity = i.quantity));
      order.status = "cancelled"; order.cancelled_at = now(); order.total_amount = 0; order.total_quantity = 0;
      return ok();
    }
  }
  return fail(`unknown rpc ${fn}`);
}

// ---------- Auth ----------
export function getMockUser(ctx: Ctx) {
  if (!ctx.userId) return null;
  const u = db.users.find((x) => x.id === ctx.userId);
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    aud: "authenticated",
    role: "authenticated",
    app_metadata: { provider: "google" },
    user_metadata: { name: u.name, email: u.email },
    created_at: u.created_at,
  };
}

export function ctxFromCookie(cookieValue: string | undefined | null): Ctx {
  return { userId: cookieValue === "out" ? null : MOCK_ARTIST_ID };
}

// ---------- Storage (업로드 이미지는 data URL로 메모리에 보관) ----------
export async function mockUpload(path: string, file: File) {
  const buf = Buffer.from(await file.arrayBuffer());
  files[path] = `data:${file.type || "image/jpeg"};base64,${buf.toString("base64")}`;
}
