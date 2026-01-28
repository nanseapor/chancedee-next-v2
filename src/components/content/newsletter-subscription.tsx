"use client";

import useSubscription from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast-notification";
import { subscribeNewsletter } from "@/lib/subscription";
import { userAtom } from "@/store/atom-store";
import { useAtomValue } from "jotai";
import { useActionState, useEffect, useState, startTransition } from "react";
import { z } from "zod";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";

const schema = z.object({
  email: z.string().email("รูปแบบอีเมล์ไม่ถูกต้อง"),
});

async function subscribeUser(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    email: formData.get("email"),
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

  // Here you would typically send the data to your API
  // For this example, we'll just simulate a successful subscription

  const result = await subscribeNewsletter({
    email: validatedFields.data.email,
  });
  if (result.error) {
    return {
      errors: {
        email: [result.message],
      },
      time: new Date().toISOString(),
      message: result.message,
      success: false,
    };
  } else {
    return {
      message: `การลงทะเบียนรับข้อมูลสำเร็จ!`,
      success: true,
      submittedData: validatedFields.data,
      time: new Date().toISOString(),
    };
  }
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

export default function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const { addToast } = useToast();
  const [state, formAction, isPending] = useActionState(
    subscribeUser,
    initialState,
  );
  const user = useAtomValue(userAtom);
  const { subscription, isLoading } = useSubscription();

  useEffect(() => {
    // เพิ่ม useEffect เพื่อดำเนินการเมื่อ state เปลี่ยนแปลง
    if (state.message) {
      if (state.success) {
        addToast(state.message, "success");
      } else {
        console.log("Newsletter state error", state.errors);
        addToast(state.errors?.email?.join() || "", "error");
      }
    }
  }, [state.time, state.message, state.success, state.errors, addToast]);

  useEffect(() => {
    startTransition(() => {
      setEmail(user?.email || "");
    });
  }, [user]);

  const isNotSubscribed = !(
    subscription &&
    subscription.length > 0 &&
    subscription.find((sub) => sub.email === user?.email)
  );

  return (
    <>
      {isNotSubscribed && (
        <section
          id={"newsletter"}
          className="px-4  2xl:px-[12rem] flex flex-col items-center gap-6 sm:gap-7 py-6 sm:py-10"
        >
          <Card className="flex flex-col items-center justify-between bg-white shadow-none border-none rounded-lg lg:px-6 sm:px-12 xl:p-[4rem] w-full">
            <CardContent className="max-sm:p-2 w-full  max-w-screen-sm space-y-4">
              <h2 className=" text-2xl sm:text-3xl text-center font-semibold mb-2">
                สมัครรับข่าวสาร
              </h2>
              <p className="text-sm sm:text-base text-center">
                คุ้มค่าในทุกการอ่าน ส่งตรงถึงอีเมลคุณ สมัครฟรีวันนี้!
              </p>
            </CardContent>
            <CardContent className="w-full max-w-screen-sm bg-white/25 border border-white/50 p-2 sm:px-6 xl:px-12 rounded-xl">
              <form action={formAction} className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <Input
                    type="email"
                    name="email"
                    placeholder="กรอกอีเมลของคุณ"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-100 pr-40 text-sm sm:text-base pl-4 sm:pl-8 h-12 rounded-full focus:ring-primary-500 focus-visible:ring-0"
                  />
                  <Button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full text-sm sm:text-base h-9"
                  >
                    Subscribe
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      )}
    </>
  );
}
