// 포트폴리오용 목업 데이터. 실제 서비스의 행사/유저/작품 정보는 전혀 포함되어 있지 않고,
// 모든 이름·이미지는 가상으로 만든 값입니다.

export type Row = Record<string, any>;
export type Db = Record<string, Row[]>;

export const MOCK_EVENT_ID = "moonhalo-fest";
export const MOCK_ARTIST_ID = "user-artist-haneuldal";
export const MOCK_ARTIST_NAME = "하늘달";
export const MOCK_BOOTH_ID = "booth-a07";

// ---------- 이미지: 외부 파일 없이 SVG data URI로 생성 ----------
function art(label: string, hue: number, motif: number = 0): string {
  const c1 = `hsl(${hue} 70% 82%)`;
  const c2 = `hsl(${(hue + 40) % 360} 65% 62%)`;
  const c3 = `hsl(${(hue + 200) % 360} 55% 30%)`;
  const shapes = [
    `<circle cx="300" cy="270" r="120" fill="${c3}" opacity=".85"/><circle cx="350" cy="240" r="95" fill="${c1}"/>`,
    `<rect x="170" y="150" width="260" height="260" rx="40" fill="${c3}" opacity=".85" transform="rotate(12 300 280)"/><rect x="200" y="180" width="200" height="200" rx="30" fill="${c1}" transform="rotate(12 300 280)"/>`,
    `<path d="M300 140 L420 380 L180 380 Z" fill="${c3}" opacity=".85"/><circle cx="300" cy="300" r="55" fill="${c1}"/>`,
    `<path d="M300 400 C140 300 170 160 300 230 C430 160 460 300 300 400Z" fill="${c3}" opacity=".85"/><circle cx="300" cy="260" r="40" fill="${c1}"/>`,
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/>${shapes[motif % shapes.length]}<text x="300" y="515" font-family="sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="${c3}">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export function buildSeed(): Db {
  const db: Db = {
    events: [{ id: MOCK_EVENT_ID, name: "달무리 창작 페스타 : 𝐌𝐨𝐨𝐧𝐡𝐚𝐥𝐨 𝐌𝐚𝐫𝐤𝐞𝐭" }],
    users: [
      { id: MOCK_ARTIST_ID, email: "haneuldal@example.com", name: MOCK_ARTIST_NAME, profile_image: null, created_at: minutesAgo(60 * 24 * 30), last_notice_seen_at: null },
      { id: "user-artist-saebyeok", email: "saebyeok@example.com", name: "새벽잉크", profile_image: null, created_at: minutesAgo(60 * 24 * 28), last_notice_seen_at: null },
      { id: "user-visitor-1", email: "visitor1@example.com", name: "봄바람", profile_image: null, created_at: minutesAgo(60 * 24 * 10), last_notice_seen_at: null },
      { id: "user-visitor-2", email: "visitor2@example.com", name: "구름빵", profile_image: null, created_at: minutesAgo(60 * 24 * 9), last_notice_seen_at: null },
      { id: "user-visitor-3", email: "visitor3@example.com", name: "민트초코", profile_image: null, created_at: minutesAgo(60 * 24 * 8), last_notice_seen_at: null },
    ],
    booths: [],
    booth_codes: [],
    booth_artists: [],
    booth_follows: [],
    booth_notices: [],
    products: [],
    product_options: [],
    product_likes: [],
    cart_items: [],
    orders: [],
    order_items: [],
    order_requests: [],
    order_request_items: [],
    prepaid: [],
  };

  // ---------- 부스 ----------
  const booths: [string, string, string, string[], string, string][] = [
    ["booth-a01", "A-01", "별밤 문구점", ["은하수"], "GENERAL", "밤하늘을 모티브로 한 스티커와 엽서를 만들어요."],
    ["booth-a02", "A-02", "밤하늘 수집가", ["오로라", "별사탕"], "GENERAL", "별자리 일러스트 아크릴과 포스터 부스입니다."],
    ["booth-a05", "A-05", "여우비 스튜디오", ["여우비"], "GENERAL", "비 오는 날의 동물 친구들 굿즈."],
    [MOCK_BOOTH_ID, "A-07", "오후의 잉크", [MOCK_ARTIST_NAME, "새벽잉크"], "GENERAL", "느긋한 오후의 일상 만화와 엽서, 키링을 선보입니다. 신간 아트북 «여름의 끝» 현장 판매!"],
    ["booth-b03", "B-03", "모래시계 공방", ["모래"], "GENERAL", "손그림 핀 버튼과 천 파우치."],
    ["booth-b06", "B-06", "소금빵 아트북", ["소금", "버터"], "GENERAL", "빵집 일러스트 아트북 전문 부스."],
    ["booth-c01", "C-01", "달팽이 우체국", ["달팽이"], "GENERAL", "느리지만 정성스러운 엽서 · 편지지 세트."],
    ["booth-c04", "C-04", "솜사탕 팩토리", ["솜사탕", "캔디"], "GENERAL", "파스텔 톤 쉐이커 키링과 스티커."],
  ];
  booths.forEach(([id, no, name, artists, cat, desc], i) => {
    db.booths.push({ id, event_id: MOCK_EVENT_ID, booth_number: no, booth_name: name, artist_names: artists, category: cat, description: desc, created_at: minutesAgo(5000 - i) });
    db.booth_codes.push({ booth_id: id, code: id === MOCK_BOOTH_ID ? "MOON-0707" : `CODE-${no.replace("-", "")}`, created_at: minutesAgo(5000) });
  });

  // 로그인한 작가 = 오후의 잉크 부스 소속
  db.booth_artists.push(
    { artist_id: MOCK_ARTIST_ID, booth_id: MOCK_BOOTH_ID, artist_name: MOCK_ARTIST_NAME, created_at: minutesAgo(4000) },
    { artist_id: "user-artist-saebyeok", booth_id: MOCK_BOOTH_ID, artist_name: "새벽잉크", created_at: minutesAgo(3900) }
  );

  // 팔로우 / 공지
  db.booth_follows.push(
    { id: "follow-1", user_id: MOCK_ARTIST_ID, booth_id: "booth-a02", created_at: minutesAgo(300) },
    { id: "follow-2", user_id: MOCK_ARTIST_ID, booth_id: "booth-b06", created_at: minutesAgo(200) }
  );

  // ---------- 작품 ----------
  // [id, boothId, name, price, category, sub, hue, motif, initial, remaining, limit, artistIds, artistNames, desc, options]
  type Opt = [string, number | null, number | null, number | null];
  const P: [string, string, string, number, string, string, number, number, number | null, number | null, number | null, string[], string[], string, Opt[]][] = [
    // A-07 오후의 잉크 (로그인한 작가의 부스)
    ["p-a07-1", MOCK_BOOTH_ID, "여름의 끝 (아트북)", 15000, "book", "artbook", 200, 1, 80, 52, 2, [MOCK_ARTIST_ID, "user-artist-saebyeok"], [MOCK_ARTIST_NAME, "새벽잉크"], "<p>여름의 마지막 일주일을 그린 32p 아트북입니다.</p><p>무광 코팅 표지 / 풀컬러</p>", []],
    ["p-a07-2", MOCK_BOOTH_ID, "오후의 엽서 세트", 5000, "paper", "postcard", 30, 0, 120, 97, null, [MOCK_ARTIST_ID], [MOCK_ARTIST_NAME], "<p>일상 일러스트 엽서 4종 세트.</p>", []],
    ["p-a07-3", MOCK_BOOTH_ID, "졸린 고양이 키링", 7000, "acrylic", "keyring", 330, 3, null, null, 3, [MOCK_ARTIST_ID], [MOCK_ARTIST_NAME], "<p>양면 인쇄 아크릴 키링 (5cm).</p>", [["기본형", 7000, 40, 28], ["별 참 추가", 8000, 30, 19], ["한정 컬러", 9000, 10, 0]]],
    ["p-a07-4", MOCK_BOOTH_ID, "새벽 낙서장 (소설)", 9000, "book", "novel", 260, 2, 50, 41, 1, ["user-artist-saebyeok"], ["새벽잉크"], "<p>짧은 글 모음집, 48p.</p>", []],
    ["p-a07-5", MOCK_BOOTH_ID, "구름 스티커 인스", 3000, "sticker", "sheet", 190, 0, 100, 66, null, [MOCK_ARTIST_ID], [MOCK_ARTIST_NAME], "<p>A6 사이즈 인스 스티커.</p>", []],
    // 다른 부스
    ["p-a01-1", "booth-a01", "별똥별 반칼 스티커", 2500, "sticker", "cut", 250, 2, 100, 74, null, ["x"], ["은하수"], "<p>방수 반칼 스티커 6종.</p>", []],
    ["p-a01-2", "booth-a01", "야간비행 엽서", 1500, "paper", "postcard", 220, 1, 150, 130, null, ["x"], ["은하수"], "<p>낱장 엽서.</p>", []],
    ["p-a02-1", "booth-a02", "별자리 스탠드", 8000, "acrylic", "stand", 270, 3, 60, 33, 2, ["x"], ["오로라", "별사탕"], "<p>12 별자리 중 택1.</p>", [["양자리", null, 5, 2], ["황소자리", null, 5, 5], ["쌍둥이자리", null, 5, 0], ["게자리", null, 5, 4]]],
    ["p-a02-2", "booth-a02", "밤하늘 포스터", 6000, "paper", "poster", 240, 0, 40, 22, null, ["x"], ["오로라"], "<p>A3 포스터.</p>", []],
    ["p-a05-1", "booth-a05", "여우비 코롯토", 9000, "acrylic", "corotto", 20, 3, 50, 12, 1, ["x"], ["여우비"], "<p>우산 쓴 여우 코롯토.</p>", []],
    ["p-a05-2", "booth-a05", "비 오는 날 만화책", 8000, "book", "comic", 210, 1, 70, 55, 2, ["x"], ["여우비"], "<p>단편 만화 24p.</p>", []],
    ["p-b03-1", "booth-b03", "손그림 핀 버튼 세트", 4000, "etc", "button", 150, 0, 120, 90, null, ["x"], ["모래"], "<p>38mm 핀 버튼 3종.</p>", []],
    ["p-b03-2", "booth-b03", "모래색 파우치", 12000, "etc", "cloth", 40, 2, 30, 14, 2, ["x"], ["모래"], "<p>면 소재 미니 파우치.</p>", []],
    ["p-b06-1", "booth-b06", "소금빵 아트북", 18000, "book", "artbook", 45, 1, 60, 9, 1, ["x"], ["소금", "버터"], "<p>빵집 일러스트 52p.</p>", []],
    ["p-b06-2", "booth-b06", "버터 스티커 팩", 3500, "sticker", "roll", 55, 3, 100, 71, null, ["x"], ["버터"], "<p>롤 스티커.</p>", []],
    ["p-c01-1", "booth-c01", "달팽이 편지지 세트", 4500, "paper", "etc", 100, 0, 80, 60, null, ["x"], ["달팽이"], "<p>편지지 + 봉투.</p>", []],
    ["p-c01-2", "booth-c01", "느린 우체통 엽서", 1500, "paper", "postcard", 120, 2, 100, 88, null, ["x"], ["달팽이"], "<p>낱장 엽서.</p>", []],
    ["p-c04-1", "booth-c04", "솜사탕 쉐이커 키링", 8500, "acrylic", "shaker", 320, 3, 70, 31, 2, ["x"], ["솜사탕", "캔디"], "<p>반짝이 쉐이커 키링.</p>", [["핑크", null, 25, 12], ["민트", null, 25, 9], ["퍼플", null, 20, 10]]],
    ["p-c04-2", "booth-c04", "캔디 스티커 인스", 3000, "sticker", "sheet", 340, 1, 100, 80, null, ["x"], ["캔디"], "<p>A6 인스.</p>", []],
    ["p-c04-3", "booth-c04", "무료 배포 : 솜사탕 엽서", 0, "freebie", "free", 310, 0, 100, 61, 1, ["x"], ["솜사탕"], "<p>선착순 무료 배포.</p>", []],
  ];
  P.forEach(([id, boothId, name, price, cat, sub, hue, motif, init, rem, limit, aIds, aNames, desc, opts], i) => {
    db.products.push({
      id, booth_id: boothId, name, price, category: cat, sub_category: sub,
      main_image: art(name.slice(0, 10), hue, motif),
      sample_images: [art("sample 1", (hue + 20) % 360, motif + 1), art("sample 2", (hue + 40) % 360, motif + 2)],
      initial_quantity: init, remaining_quantity: rem, purchase_limit: limit,
      artist_ids: aIds, artist_names: aNames, description: desc, visible: true,
      created_at: minutesAgo(2000 - i * 10),
    });
    opts.forEach(([oname, oprice, oinit, orem], j) => {
      db.product_options.push({ id: `${id}-o${j + 1}`, product_id: id, name: oname, price: oprice, initial_quantity: oinit, remaining_quantity: orem, created_at: minutesAgo(1900) });
    });
  });

  // 좋아요
  db.product_likes.push(
    { id: "like-1", user_id: MOCK_ARTIST_ID, product_id: "p-b06-1", created_at: minutesAgo(100) },
    { id: "like-2", user_id: MOCK_ARTIST_ID, product_id: "p-c04-1", created_at: minutesAgo(90) },
    { id: "like-3", user_id: "user-visitor-1", product_id: "p-a07-1", created_at: minutesAgo(80) },
    { id: "like-4", user_id: "user-visitor-2", product_id: "p-a07-1", created_at: minutesAgo(70) },
    { id: "like-5", user_id: "user-visitor-3", product_id: "p-a07-3", created_at: minutesAgo(60) }
  );

  // ---------- 주문 (오후의 잉크 부스) ----------
  type Line = [string, string | null, number]; // productId, optionId, qty
  const mkOrder = (n: number, minsAgo: number, lines: Line[], cancelled = 0, cancelOnItem = -1, boothId = MOCK_BOOTH_ID) => {
    const orderId = `order-${n}`;
    let totalAmt = 0, totalQty = 0;
    lines.forEach(([pid, oid, qty], idx) => {
      const p = db.products.find((x) => x.id === pid)!;
      const o = oid ? db.product_options.find((x) => x.id === oid)! : null;
      const unit = o?.price ?? p.price;
      const cq = idx === cancelOnItem ? cancelled : 0;
      db.order_items.push({
        id: `${orderId}-i${idx + 1}`, order_id: orderId, product_id: pid, option_id: oid,
        product_name: p.name, option_name: o?.name ?? null, unit_price: unit,
        quantity: qty, cancelled_quantity: cq, subtotal: unit * qty,
      });
      totalAmt += unit * (qty - cq); totalQty += qty - cq;
    });
    db.orders.push({
      id: orderId, booth_id: boothId, client_transaction_id: `seed-tx-${n}`,
      total_amount: totalAmt, total_quantity: totalQty, status: "completed",
      cancelled_at: null, created_at: minutesAgo(minsAgo),
    });
    return orderId;
  };
  mkOrder(1, 240, [["p-a07-1", null, 1], ["p-a07-2", null, 1]]);
  mkOrder(2, 215, [["p-a07-3", "p-a07-3-o1", 2]]);
  mkOrder(3, 190, [["p-a07-5", null, 3], ["p-a07-2", null, 2]]);
  mkOrder(4, 150, [["p-a07-1", null, 2], ["p-a07-4", null, 1]], 1, 1);
  mkOrder(5, 95, [["p-a07-3", "p-a07-3-o2", 1], ["p-a07-5", null, 1]]);
  mkOrder(6, 40, [["p-a07-2", null, 4]]);

  // 로그인한 작가가 "손님"으로서 다른 부스에서 이미 결제한 주문 (내 주문 화면용)
  const otherOrder = mkOrder(7, 70, [["p-a01-1", null, 2], ["p-a01-2", null, 3]], 0, -1, "booth-a01");

  // 손님 주문 요청 (부스 POS 화면의 "손님 요청" 탭)
  const mkReq = (id: string, cust: string, nick: string, status: string, mins: number, lines: Line[], orderId: string | null = null, boothId = MOCK_BOOTH_ID) => {
    db.order_requests.push({ id, booth_id: boothId, customer_id: cust, customer_nickname: nick, order_id: orderId, status, created_at: minutesAgo(mins), updated_at: minutesAgo(mins) });
    lines.forEach(([pid, oid, qty], i) => {
      const p = db.products.find((x) => x.id === pid)!;
      const o = oid ? db.product_options.find((x) => x.id === oid)! : null;
      db.order_request_items.push({ id: `${id}-i${i + 1}`, order_request_id: id, product_id: pid, option_id: oid, product_name: p.name, option_name: o?.name ?? null, quantity: qty });
    });
  };
  mkReq("req-1", "user-visitor-1", "봄바람", "requested", 6, [["p-a07-1", null, 1], ["p-a07-3", "p-a07-3-o1", 1]]);
  mkReq("req-2", "user-visitor-2", "구름빵", "requested", 3, [["p-a07-2", null, 2]]);
  mkReq("req-4", MOCK_ARTIST_ID, MOCK_ARTIST_NAME, "checked", 75, [["p-a01-1", null, 2], ["p-a01-2", null, 3]], otherOrder, "booth-a01");
  mkReq("req-3", "user-visitor-3", "민트초코", "checked", 12, [["p-a07-4", null, 1], ["p-a07-5", null, 2]]);

  // 로그인한 작가의 장바구니 (다른 부스 작품)
  db.cart_items.push(
    { id: "cart-1", user_id: MOCK_ARTIST_ID, product_id: "p-a02-1", option_id: "p-a02-1-o1", option_key: "p-a02-1-o1", quantity: 1, purchased: false, created_at: minutesAgo(30), updated_at: minutesAgo(30) },
    { id: "cart-2", user_id: MOCK_ARTIST_ID, product_id: "p-c04-1", option_id: "p-c04-1-o2", option_key: "p-c04-1-o2", quantity: 2, purchased: false, created_at: minutesAgo(25), updated_at: minutesAgo(25) },
    { id: "cart-3", user_id: MOCK_ARTIST_ID, product_id: "p-b06-1", option_id: null, option_key: "", quantity: 1, purchased: false, created_at: minutesAgo(20), updated_at: minutesAgo(20) }
  );

  // 선입금 체크리스트
  const pre: Record<string, string>[] = [
    { 닉네임: "봄바람", 품목: "여름의 끝 (아트북)", 수량: "2", 비고: "현장 수령" },
    { 닉네임: "구름빵", 품목: "졸린 고양이 키링", 수량: "1", 비고: "기본형" },
    { 닉네임: "민트초코", 품목: "오후의 엽서 세트", 수량: "3", 비고: "" },
    { 닉네임: "소라게", 품목: "새벽 낙서장 (소설)", 수량: "1", 비고: "오후 방문 예정" },
  ];
  pre.forEach((cells, i) => db.prepaid.push({ id: `prepaid-${i + 1}`, booth_id: MOCK_BOOTH_ID, row_data: cells, checked: i === 0, created_at: minutesAgo(500 - i) }));

  return db;
}
