import BoothList from "@/src/component/booth/BoothList";
import { getBooths } from "@/src/lib/data/booth";
import Image from "next/image";

export default async function Page() {
  const booths = await getBooths();

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      {/* 부스 배치도 */}
      <div className="w-full md:w-1/2 md:sticky md:top-14 md:self-start md:h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="w-full max-w-150 mx-auto">
          <Image
            src="/images/booth_map.svg"
            alt="부스 배치도"
            width={1200}
            height={800}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>

      {/* 부스 목록 */}
      <BoothList booths={booths} />
    </div>
  );
}