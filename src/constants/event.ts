export const EVENT_ID = "moonhalo-fest";

// [목업] 포트폴리오용 가상 행사 정보입니다. (실제 행사/장소/연락처와 무관)
// 지금은 단일 행사 전용 MVP라 EVENT_ID처럼 코드에 직접 박아둠.
// 여러 행사를 지원하게 되면 이 내용은 events 테이블 컬럼으로 옮기고
// 주최자가 직접 입력하는 폼을 만들면 됨 (지금 당장은 과함).
export const EVENT_INFO = {
  name: "달무리 창작 페스타 : 𝐌𝐨𝐨𝐧𝐡𝐚𝐥𝐨 𝐌𝐚𝐫𝐤𝐞𝐭",
  brand: "𝐌𝐨𝐨𝐧𝐡𝐚𝐥𝐨",

  // 날짜/시간
  dateLabel: "2026.11.14 (토)",
  timeLabel: "10:00 ~ 17:00",

  // 장소 (가상)
  venueName: "샘플 전시컨벤션센터 B홀",
  address: "서울특별시 샘플구 예시로 123 (가상 주소)",
  mapUrl: "https://naver.me/5hua3oQi",

  // 문의
  contactEmail: "hello@moonhalo-fest.example",

  timeTable: {
    src: "/images/event/time_table.svg",
    alt: "일정표",
  },

  notice: {
    title: "입장안내",
    images: [
      { src: "/images/event/notice_01.svg", alt: "입장안내 및 공지" },
      { src: "/images/event/notice_02.svg", alt: "입장안내 및 공지2" },
    ],
  },

  luckyDraw: {
    title: "럭키드로우 안내",
    images: [
      { src: "/images/event/lucky_draw_01.svg", alt: "럭키드로우 안내 이미지" },
    ],
  },
};
