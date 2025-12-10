"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-background">
      <h2 className="text-center text-2xl font-bold text-primary mb-4">
        เป็นความผิดของเรา!
      </h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        เราต้องขออภัยในความไม่สะดวก ขณะนี้เกิดข้อผิดพลาดที่ไม่คาดคิดขึ้น
      </p>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            // Full page reload to clear cache
            window.location.reload();
          }}
        >
          ลองอีกครั้ง
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          กลับสู่หน้าหลัก
        </Button>
      </div>
    </main>
  );
}
