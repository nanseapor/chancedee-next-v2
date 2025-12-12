"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CONTENT_HOST } from "@/config/hosts";
import { getFirebaseAuth } from "@/lib/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ResetSchema = z.object({
  email: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
});

const resetPassword = async (email: string) => {
  const actionCodeSettings = {
    url: `${CONTENT_HOST}/auth/sign-in`,
    handleCodeInApp: true,
  };
  const result = await sendPasswordResetEmail(
    getFirebaseAuth(),
    email,
    actionCodeSettings,
  )
    .then(() => ({ code: "200", message: "success" }))
    .catch((error) => {
      console.error(error);
      return { code: "500", message: "Internal error" };
    });
  return result;
};

const ResetPassword = () => {
  const router = useRouter();
  const [isError, setIsError] = useState<{
    code: string;
    message: string;
  } | null>(null);
  const [email, setEmail] = useState("");

  const formSchema = z.object({
    email: z
      .string()
      .min(1, { message: "โปรดกรอกข้อมูล" })
      .email("รูปแบบอีเมลไม่ถูกต้อง"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Need to be tested ... as 11-15-2023
  async function onSubmit(values: z.infer<typeof ResetSchema>) {
    const result = await resetPassword(values.email);
    if (result.code !== "200") {
      setIsError(result);
    } else {
      router.push("/auth/reset/success");
    }
  }

  const checkKeyDown = (
    e: React.KeyboardEvent<
      HTMLFormElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    e.key === "Enter" && e.preventDefault();
  };
  return (
    <section className="flex h-dvh flex-col items-center justify-center">
      <Card className="my-auto w-96">
        <CardContent className="p-10">
          <h1 className="pb-4 text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            ขอตั้งค่ารหัสผ่านใหม่
          </h1>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              onKeyDown={checkKeyDown}
              className="space-y-4 md:space-y-4"
            >
              <div className="space-y-4 md:space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อีเมล (Email)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          name="email"
                          id="email"
                          value={field.value}
                          onChange={field.onChange}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm"
                          placeholder="name@company.com"
                        ></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isError && (
                  <p className="text-sm font-medium text-red-500">
                    {isError.message}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <Button
                    size={"sm"}
                    type="submit"
                    variant={"outline"}
                    onClick={() => router.back()}
                  >
                    ย้อนกลับ
                  </Button>
                  <Button size={"sm"} type="submit">
                    ยืนยัน
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
};

export default ResetPassword;
