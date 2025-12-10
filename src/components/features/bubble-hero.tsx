import Link from "next/link";
import { Button } from "../ui/button";

export default async function BubbleHero() {
  return (
    <div className="relative min-h-[calc(70dvh-68px)] w-full overflow-hidden bg-gradient-to-br from-primary-100/75 from-10% via-transparent via-50% to-primary-100 to-90% flex flex-col items-center justify-center">
      {/* Bubbles */}
      <div className="absolute inset-0">
        <div className="absolute left-[25%] bottom-4 w-12 h-12 bg-primary-500 rounded-full opacity-20 animate-rise max-sm:hidden"></div>
        <div className="absolute left-[50%] bottom-4 w-24 h-24 bg-primary-500 rounded-full opacity-10 animate-rise-slow max-sm:hidden"></div>
        <div className="absolute left-[75%] bottom-4 w-16 h-16 bg-primary-500 rounded-full opacity-30 animate-rise-slower"></div>
        <div className="absolute left-1/3 bottom-4 w-20 h-20 bg-primary-500 rounded-full opacity-15 animate-rise"></div>
        <div className="absolute left-2/3 bottom-4 w-8 h-8 bg-primary-500 rounded-full opacity-25 animate-rise-slow"></div>
        <div className="absolute left-[10%] bottom-4 w-10 h-10 bg-primary-500 rounded-full opacity-20 animate-rise-slower"></div>
        <div className="absolute left-[80%] bottom-4 w-14 h-14 bg-primary-500 rounded-full opacity-15 animate-rise max-sm:hidden"></div>
        <div className="absolute left-[15%] bottom-4 w-16 h-16 bg-primary-500 rounded-full opacity-25 animate-rise-slow"></div>
        <div className="absolute left-[60%] bottom-4 w-12 h-12 bg-primary-500 rounded-full opacity-20 animate-rise-slower max-sm:hidden"></div>
        <div className="absolute left-[85%] bottom-4 w-20 h-20 bg-primary-500 rounded-full opacity-10 animate-rise"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full m-auto">
        <h1 className="text-[2rem] md:text-[3rem] 2xl:text-[4rem] text-secondary-950 px-4  2xl:px-[12rem]  text-center">
          <span className="bg-gradient-to-br from-primary-500 to-primary-400 text-transparent bg-clip-text ">
            #จุดนัดพบ
          </span>{" "}
          ของเหล่า{" "}
          <span className="bg-gradient-to-br from-primary-500 to-primary-400 text-transparent bg-clip-text ">
            Grower
          </span>{" "}
          พื้นที่แลกเปลี่ยน
          <span className="bg-gradient-to-br from-primary-500 to-primary-400 text-transparent bg-clip-text ">
            เรียนรู้
          </span>
          เทคนิคการ
          <span className="bg-gradient-to-br from-primary-500 to-primary-400 text-transparent bg-clip-text ">
            เอาตัวรอด
          </span>{" "}
          และสารพัดวิธี
          <span className="bg-gradient-to-br from-primary-500 to-primary-400 text-transparent bg-clip-text ">
            สร้างความสุข
          </span>
          ในการทำงานที่มนุษย์เงินเดือนขาดไม่ได้
        </h1>
        <Link href={`#newsletter`}>
          <Button
            size="default"
            variant="outline"
            className="hidden gap-2 lg:gap-4 rounded-full border px-3 lg:px-6 h-12 lg:h-16 bg-gradient-to-r from-primary-500  to-primary-400 hover:border-primary-500 hover:from-primary-400 hover:to-primary-300 transition-all duration-500 ease-in-out text-secondary-50 hover:text-secondary-50 hover:scale-110"
          >
            <p className="text-base">Join Now! - Lets party!</p>
          </Button>
        </Link>
      </div>
    </div>
  );
}
