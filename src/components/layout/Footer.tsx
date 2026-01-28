import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

import { authenticateSession } from "@/domains/authentication/services/server/core/auth-engine";

const Footer = async () => {
  const auth = await authenticateSession({ includeProfile: true });
  const user = auth?.profile;
  return (
    <footer className="flex min-h-[40dvh] flex-col items-center justify-center gap-10 px-4 py-10 lg:container">
      <div className="grid w-full grid-cols-1 gap-6 p-10 sm:grid-cols-3 sm:justify-between">
        <div
          className={clsx(
            `mx-auto flex size-full flex-col items-start text-sm leading-relaxed md:w-fit`
          )}
        >
          <Image alt="Image" src="/icons/brand-logo-44px.png" width={44} height={44} />
          <p className=" text-balance font-light text-muted-foreground">
            บริษัท เมตา พีเพิล จำกัด
          </p>
          <p className="text-balance font-light text-muted-foreground">
            709, 710 มิตรทาวน์ ออฟฟิศ ทาวเวอร์
          </p>
          <p className="text-balance font-light text-muted-foreground">
            พระราม 4 วังใหม่ ปทุมวัน 10330
            <br />
          </p>
        </div>
        <div
          className={clsx(
            `mx-auto flex size-full flex-col items-start justify-start gap-1 font-light md:w-fit`
          )}
        >
          <div className={clsx(`inline-block text-lg/6 font-normal `)}>
            ผู้สมัครงาน
          </div>
          <Link
            href={
              user?.info.roles.includes("candidate")
                ? `/candidates/${user.uid}/resume`
                : "/auth/login"
            }
            className={clsx("font-light")}
          >
            สร้างเรซูเม่
          </Link>
          <Link
            href={
              "/jobs?page=1&amp;pageSize=10&amp;MinSalary=30000&amp;MaxSalary=100000"
            }
            className={clsx("font-light")}
          >
            ตำแหน่งงาน
          </Link>
          <Link href={"/companies"} className={clsx("font-light")}>
            ค้นหาบริษัท
          </Link>
          <Link
            href={
              user?.info.roles.includes("candidate")
                ? `/candidates/${user.uid}/`
                : "/auth/login"
            }
            className={clsx("font-light")}
          >
            ชวนเพื่อน
          </Link>
          <Link
            href="/jobs?page=1&amp;pageSize=10&amp;MinSalary=30000&amp;MaxSalary=100000"
            className={clsx("font-light")}
          >
            งานมาใหม่
          </Link>
        </div>
        <div
          className={clsx(
            `mx-auto flex size-full flex-col items-start justify-start gap-1 font-light md:w-fit`
          )}
        >
          <div className={clsx(`inline-block text-lg/6 font-normal `)}>
            ผู้ประกอบการ
          </div>
          <Link
            href={
              user?.info.roles.includes("company") && !user?.info.roles.includes("pending")
                ? `/companies/${user.info.companyId}/dashboard`
                : "/auth/register"
            }
            className={clsx("font-light")}
          >
            ลงทะเบียน
          </Link>
          <Link
            href={
              user?.info.roles.includes("company") && !user?.info.roles.includes("pending")
                ? `/companies/${user.info.companyId}/dashboard`
                : "/auth/login"
            }
            className={clsx("font-light")}
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href={
              user?.info.roles.includes("company") && !user?.info.roles.includes("pending")
                ? `/companies/${user.info.companyId}/dashboard/jobs`
                : "/auth/login"
            }
            className={clsx("font-light")}
          >
            ประกาศงาน
          </Link>
          <Link
            href={
              user?.info.roles.includes("company") && !user?.info.roles.includes("pending")
                ? `/companies/${user.info.companyId}/dashboard/profile`
                : "/auth/login"
            }
            className={clsx("font-light")}
          >
            โปรไฟล์บริษัท
          </Link>
          <Link
            href={
              user?.info.roles.includes("company") && !user?.info.roles.includes("pending")
                ? `/companies/${user.info.companyId}/dashboard`
                : "/auth/login"
            }
            className={clsx("font-light")}
          >
            ผลิตภัณฑ์และค่าบริการ
          </Link>
          <Link href="#" className={clsx("font-light")}>
            คำถามที่พบบ่อย
          </Link>
          <Link href="/auth/delete-data-request" className={clsx("font-light")}>
            คำร้องขอลบข้อมูลออกจากระบบ
          </Link>
          <Link href="/privacy/cookie-settings" className={clsx("font-light")}>
            การตั้งค่าคุกกี้
          </Link>
          <Link href="/legal/privacy-policy" className={clsx("font-light")}>
            นโยบายความเป็นส่วนตัว
          </Link>
          <Link href="/legal/cookies-policy" className={clsx("font-light")}>
            นโยบายคุกกี้
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
