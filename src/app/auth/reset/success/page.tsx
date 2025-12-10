import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowBigRight } from "lucide-react";
import Link from "next/link";

const CompanySuccessRegister = (props: any) => {
  return (
    <div className="flex h-dvh items-center justify-center">
      <Card className="h-40 w-2/3 border p-4">
        <CardHeader>
          <CardTitle>สมัครใช้บริการ</CardTitle>
          {/* <CardDescription>เข้าสู่ระบบ</CardDescription> */}
        </CardHeader>
        <CardContent>ลิ้งสำหรับตั้งค่ารหัสผ่านใหม่ได้ถูกส่งไปยังอีเมลของคุณแล้ว</CardContent>
        <CardFooter className="justify-end">
          <Link href="/auth/sign-in">
            <Button size={"sm"} className="w-48" variant={"outline"}>
              กลับไปที่หน้าเข้าสู่ระบบ{" "}
              <span>
                <ArrowBigRight />
              </span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CompanySuccessRegister;
