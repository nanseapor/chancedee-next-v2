"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getSubscriberByEmail,
  unsubscribeNewsLetter,
} from "@/lib/subscription";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const { data: unsubscribeEmailIds, isLoading } = useSWR(
    email,
    getSubscriberByEmail,
  );

  useEffect(() => {
    if (isLoading) {
      setStatus("loading");
      return;
    }
    const unsubscribe = async () => {
      if (!unsubscribeEmailIds || unsubscribeEmailIds.length === 0) {
        setStatus("error");
        setErrorMessage("ไม่พบอีเมล์นี้ในระบบ");
        return;
      }

      const unsubscribeEmailId = unsubscribeEmailIds[0];
      if (!unsubscribeEmailId?.id) {
        setStatus("error");
        setErrorMessage("ไม่พบข้อมูลการสมัครรับข่าวสาร");
        return;
      }

      try {
        const result = await unsubscribeNewsLetter({
          id: unsubscribeEmailId.id,
        });
        if (result.error) {
          throw new Error(result.message);
        }
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setErrorMessage("เกิดข้อผิดพลาดขณะทำการยกเลิกการสมัครรับข่าวสาร");
      }
    };

    if (unsubscribeEmailIds) {
      unsubscribe();
    }
  }, [unsubscribeEmailIds, isLoading]);

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            {status === "loading" ? "กำลังดำเนินการ..." : "ยกเลิกการรับข่าวสาร"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner size="lg" className="w-12 h-12" />
              <p className="text-sm text-gray-500">กรุณารอสักครู่...</p>
            </div>
          )}
          {status === "success" && (
            <p className="text-center text-green-600">
              ดำเนินการยกเลิกการรับข่าวสารผ่านอีเมล {email} เรียบร้อยแล้ว
            </p>
          )}
          {status === "error" && (
            <p className="text-center text-red-600">{errorMessage}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
