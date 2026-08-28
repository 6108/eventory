import Image from "next/image";
import Link from "next/link";
import LoginRequiredToast from "@/src/component/toast/LoginRequiredToast";
import { EVENT_ID as eventId, EVENT_INFO } from "@/src/constants/event";

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <LoginRequiredToast />

      <div className="mx-auto w-full max-w-2xl pb-28">
        {/* ========================================
            상단 / 대표 이미지
        ======================================== */}
        <section className=" border-zinc-800 bg-zinc-950">
          <div className="relative mx-auto aspect-square w-50 overflow-hidden sm:w-50">
            <Image
              src="/images/logo.png"
              alt={EVENT_INFO.name}
              fill
              priority
              sizes="(max-width: 672px) 50vw, 300px"
              className="object-contain p-4 sm:p-10"
            />
          </div>
        </section>

        {/* ========================================
            행사 기본 정보
        ======================================== */}
        <section className="px-5 pb-7 pt-7 text-center sm:px-8">
          <h1 className="mt-2 text-2xl font-semibold leading-8 tracking-tight text-primary sm:text-3xl">
            {EVENT_INFO.name}
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            ¹) 구원; 구출되어 해방되다
            <br />
            ²) 속박; 제한하여 자유롭지 못하게 하다
          </p>
        </section>

        {/* 구분 */}
        <div className="h-px bg-primary" />

        {/* ========================================
            행사 정보
        ======================================== */}
        <section className="px-5 py-7 sm:px-8">
          <h2 className="text-base font-semibold text-white">
            행사 정보
          </h2>

          <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800 ">
            {/* 일시 */}
            <div className="flex border-b border-zinc-800 px-4 py-4">
              <div className="w-20 shrink-0 text-sm text-zinc-500">
                일시
              </div>

              <div className="text-sm leading-6 text-zinc-200">
                <div>{EVENT_INFO.dateLabel}</div>
                <div className="text-zinc-400">
                  {EVENT_INFO.timeLabel}
                </div>
              </div>
            </div>

            {/* 장소 */}
            <div className="flex border-b border-zinc-800 px-4 py-4">
              <div className="w-20 shrink-0 text-sm text-zinc-500">
                장소
              </div>

              <div className="min-w-0 flex-1 text-sm leading-6">
                <div className="text-zinc-200">
                  {EVENT_INFO.venueName}
                </div>

                <div className="text-zinc-500">
                  {EVENT_INFO.address}
                </div>

                <a
                  href={EVENT_INFO.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-xs font-medium text-primary hover:underline"
                >
                  지도에서 보기
                  <span className="ml-1">↗</span>
                </a>
              </div>
            </div>

            {/* 문의 */}
            <div className="flex px-4 py-4">
              <div className="w-20 shrink-0 text-sm text-zinc-500">
                문의
              </div>

              <a
                href={`mailto:${EVENT_INFO.contactEmail}`}
                className="min-w-0 break-all text-sm text-zinc-300 hover:text-primary"
              >
                {EVENT_INFO.contactEmail}
              </a>
            </div>
          </div>
        </section>

        {/* 구분 */}
        <div className="h-px bg-primary" />

        {/* ========================================
            럭키드로우
        ======================================== */}
        <section className="px-5 py-8 sm:px-8">
          <div className="mb-5">
            <p className="text-xs font-medium tracking-[0.18em] text-zinc-500">
              LUCKY DRAW
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              {EVENT_INFO.luckyDraw.title}
            </h2>


          </div>

          {/* 가로 2열 이미지 */}

          <div className="flex flex-col gap-3">
            {EVENT_INFO.luckyDraw.images.map((image) => (
              <div
                key={image.src}
                className="mx-auto w-full max-w-160"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={1500}
                  sizes="(max-width: 640px) 100vw, 640px"
                  className="h-auto w-full"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 구분 */}
        <div className="h-px bg-primary" />

        {/* ========================================
            참여 안내
        ======================================== */}
        <section className="px-5 py-8 sm:px-8">
          <p className="text-xs font-medium tracking-[0.18em] text-zinc-500">
            PARTICIPATE
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
            {/* 부스 둘러보기 */}
            <Link
              href={`/${eventId}/booths`}
              className="flex items-center justify-between  px-4 py-5 transition "
            >
              <div>
                <p className="text-sm font-medium text-white">
                  부스 둘러보기
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  참여 부스를 확인해보세요
                </p>
              </div>

              <span className="text-xl text-zinc-500">›</span>
            </Link>

            {/* 부스 등록 */}
            {/* <Link
              href={`/${eventId}/booths/register`}
              className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900 px-4 py-5 transition hover:bg-zinc-800"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  부스 등록하기
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  나의 부스를 등록해보세요
                </p>
              </div>

              <span className="text-xl text-zinc-500">›</span>
            </Link> */}
          </div>
        </section>

        {/* ========================================
            Footer
        ======================================== */}
        <footer className="px-5 pb-8 pt-8 text-center sm:px-8">
          <p className="text-sm text-zinc-600">
            © {new Date().getFullYear()} {EVENT_INFO.name}
          </p>
        </footer>
      </div>

      {/* ========================================
          하단 고정 버튼
      ======================================== */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Link
            href={`/${eventId}/booths`}
            className="flex h-12 flex-1 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
          >
            부스 둘러보기
          </Link>

          <Link
            href={`/${eventId}/booths/register`}
            className="flex h-12 flex-1 items-center justify-center rounded-md bg-primary text-sm font-medium text-white transition hover:opacity-90"
          >
            부스 등록하기
          </Link>
        </div>
      </div>
    </main>
  );
}