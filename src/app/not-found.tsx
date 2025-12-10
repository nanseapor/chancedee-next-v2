import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-background">
      <h2 className="text-center text-2xl font-bold text-primary mb-4">
        เป็นความผิดของเรา!
      </h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        เราต้องขออภัยในความไม่สะดวก เราไม่พบหน้าที่คุณต้องการ
      </p>

      <div className="flex gap-4">
        <Link href="/">
          <Button variant="outline">กลับสู่หน้าหลัก</Button>
        </Link>
      </div>
    </main>
  );
}
