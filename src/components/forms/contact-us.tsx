"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast-notification";
import { sendContactUsMessage } from "@/lib/send-mail";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  email: z.string().email("รูปแบบอีเมล์ไม่ถูกต้อง"),
  subject: z.string(),
  message: z.string(),
});

async function sendMessage(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    console.error(
      "Field validation error",
      validatedFields.error.flatten().fieldErrors,
    );
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "รูปแบบอีเมลไม่ถูกต้อง กรุณากรอก อีเมลให้ถูกต้อง!",
      success: false,
      time: new Date().toISOString(),
    };
  }

  const result = await sendContactUsMessage(validatedFields.data);

  if (result < 300) {
    return {
      message: `ส่งข้อความสำเร็จ!`,
      success: true,
      submittedData: validatedFields.data,
      time: new Date().toISOString(),
    };
  } else {
    return {
      errors: {
        email: ["ไม่สามารถส่งข้อความได้"],
      },
      time: new Date().toISOString(),
      message: "ไม่สามารถส่งข้อความได้",
      success: false,
    };
  }

  // Here you would typically send the data to your API
  // For this example, we'll just simulate a successful subscription
}

type FormState = {
  errors?: {
    email?: string[];
  };
  message?: string;
  success?: boolean;
  submittedData?: {
    email: string;
  };
  time?: string;
};

const initialState: FormState = {};

export default function ContactUs({ cover_image }: { cover_image: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [state, formAction, isPending] = useFormState(
    sendMessage,
    initialState,
  );
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // เพิ่ม useEffect เพื่อดำเนินการเมื่อ state เปลี่ยนแปลง
    if (state.message) {
      if (state.success) {
        addToast(state.message, "success");
        setIsSuccess(true);
      } else {
        console.log("Contact us state error", state.errors);
        addToast(state.errors?.email?.join() || "", "error");
      }
    }
  }, [state.time]);

  return (
    <section className="px-4 lg:px-[6rem] 2xl:px-[12rem] pt-6 sm:pt-20">
      <Card className="flex flex-col-reverse gap-6 justify-between lg:flex-row w-full overflow-hidden max-w-screen-lg mx-auto rounded-2xl lg:h-[648px]">
        <CardContent className="flex flex-col gap-6 w-full lg:w-1/2 p-6 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-center">
            ติดต่อเรา
          </h1>
          {isSuccess ? (
            <div className="flex flex-col justify-between h-full gap-6">
              <p className=" font-light">
                ข้อความติดต่อได้ถูกส่งไปยังทีมงานของเราแล้ว เราจะติดต่อกลับไปยังคุณในอีกไม่ช้า
              </p>
              <Button
                onClick={() => router.push("/")}
                className="px-6 rounded-full text-sm sm:text-base h-10"
              >
                กลับสู่หน้าหลัก
              </Button>
            </div>
          ) : (
            <form action={formAction} className="space-y-4 sm:space-y-6">
              <p className=" font-light">
                หากคุณมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อเราผ่านแบบฟอร์มด้านล่าง
              </p>
              <Input
                type="text"
                name={"name"}
                placeholder="Full name"
                className="w-full bg-neutral-100 pr-40 text-sm font-light sm:text-base pl-4 sm:pl-8 h-10 rounded-full focus:ring-primary-500 focus-visible:ring-0"
              />
              <Input
                type="email"
                name={"email"}
                placeholder="Email"
                className="w-full bg-neutral-100 pr-40 text-sm font-light sm:text-base pl-4 sm:pl-8 h-10 rounded-full focus:ring-primary-500 focus-visible:ring-0"
              />
              <Input
                type="text"
                name={"subject"}
                placeholder="Subject"
                className="w-full bg-neutral-100 pr-40 text-sm font-light sm:text-base pl-4 sm:pl-8 h-10 rounded-full focus:ring-primary-500 focus-visible:ring-0"
              />
              <Textarea
                placeholder="Message"
                name={"message"}
                className="resize-none w-full bg-neutral-100 pr-40 text-sm font-light sm:text-base pl-4 sm:pl-8 h-40 rounded-3xl focus:ring-primary-500 focus-visible:ring-0"
              />
              <Button
                type="submit"
                className="px-6 rounded-full text-sm sm:text-base h-10"
              >
                Send Message
              </Button>
            </form>
          )}
        </CardContent>
        <div className="relative w-full lg:w-1/2 h-[300px] lg:h-auto">
          <Image
            src={cover_image}
            alt="Contact"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </Card>
    </section>
  );
}
