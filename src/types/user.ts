// 로그인한 모든 유저 공통 (일반 입장객 + 작가 둘 다 이 타입)
export type User = {
  id: string;
  email: string | null;
  name: string | null;
  profileImage: string;
};
