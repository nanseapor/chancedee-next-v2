import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

const CTASection = () => {
  return (
    <section
      className={clsx(`flex w-full flex-col items-start justify-between bg-white pb-12 pt-9 sm:container`)}
    >
      <h1 className="mb-4 text-start text-3xl font-semibold">
        Chancedee Job Market
      </h1>
      <div className="grid w-full grid-cols-1 gap-7 sm:grid-cols-2">
        <Card className="flex justify-between rounded-xl bg-primary-50 px-9 py-7">
          <div className="flex w-full flex-col items-start justify-center gap-6">
            <p className="flex min-h-[72px] max-w-sm">
              เตรียมปะทะกับโอกาสในชีวิตของคุณสร้างเรซูเม่ของคุณให้
              พร้อม เริ่มต้นชีวิตการทำงานที่นี่ Chacedee Jobs Market
            </p>
            <Link href="/candidate/resume">
              <Button variant={"default"} className="w-36  rounded-full">
                สร้าง Resume
              </Button>
            </Link>
          </div>

          <Image src={"/images/cta/left-cta.svg"} width="100" alt="left-cta" />
        </Card>
        <Card className="flex justify-between rounded-xl bg-secondary-50 px-9 py-7">
          <div className="flex w-full flex-col items-start justify-center gap-6">
            <p className="flex min-h-[72px] max-w-[355px] flex-col">
              Recruiter ของเราจะนำพา Candidate ไปส่งมอบให้คุณ
              อย่ารอช้า! องค์กรของคุณกำลังต้องการพนักงาน
              <span>เริ่มต้นประกาศงานทันที!</span>
            </p>
            <Link href="/jobs">
              <Button variant={"default"} className="w-36 rounded-full">
                ค้นหางาน
              </Button>
            </Link>
          </div>
          <Image src={"/images/cta/right-cta.svg"} width="100" alt="right-cta" />
        </Card>
      </div>
    </section>
  );
};

export default CTASection;
