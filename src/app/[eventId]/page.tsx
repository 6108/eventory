import LoginRequiredToast from "@/src/component/toast/LoginRequiredToast";
import Image from "next/image";


export default function Page() {
  return (
    <div className="flex w-full items-center justify-center">
      <LoginRequiredToast />

      <Image
        src="/images/logo.png"
        alt="메인 이미지"
        width={500}
        height={500}
        className="w-1/4 h-auto"
        priority
      />
    </div>
  );
}