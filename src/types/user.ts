// 로그인한 모든 유저 공통 (일반 입장객 + 작가 둘 다 이 타입)
export type User = {
  id: string;
  email: string;
  name: string;
  profileImage: string;
};

// 작가는 User + 부스 활동 관련 추가 정보를 가진 유저
export type Artist = User & {
  artistName: string; // 활동명 (name과 다를 수 있어 별도 필드)
  instagram: string;
  twitter: string;
  homepage: string;
};