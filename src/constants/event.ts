export const EVENT_ID = "redemption0919";

// 지금은 단일 행사 전용 MVP라 EVENT_ID처럼 코드에 직접 박아둠.
// 여러 행사를 지원하게 되면 이 내용은 events 테이블 컬럼으로 옮기고
// 주최자가 직접 입력하는 폼을 만들면 됨 (지금 당장은 과함).
export const EVENT_INFO = {
  name: "솔음사헌 배포전 : 𝐑𝐞𝐝𝐞𝐦𝐩𝐭𝐢𝐨𝐧",

  // 날짜/시간
  dateLabel: "2026.09.19 (토)",
  timeLabel: "00:00 ~ 00:00",

  // 장소
  venueName: "장소명",
  address: "상세 주소",
  mapUrl: "https://map.naver.com/", // 실제 링크로 교체

  // 문의
  contactEmail: "butchershop.sesh@gmail.com",

  luckyDraw: {
    title: "럭키드로우 안내",
    images: [
      {
        src: "/images/event/lucky_draw_01.webp",
        alt: "럭키드로우 안내 이미지 1 (임시 이미지)",
      },
      {
        src: "/images/event/lucky_draw_02.webp",
        alt: "럭키드로우 안내 이미지 2 (임시 이미지)",
      },
    ],
  },
};