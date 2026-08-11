import RegisterForm from "@/src/component/form/RegisterForm";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-white mb-1">
          부스 등록
        </h1>

        <p className="text-sm text-zinc-400 mb-8">
          부스번호와 등록 코드를 입력해 부스에 연결하세요.
        </p>

        <RegisterForm />
      </div>
    </div>
  );
}
