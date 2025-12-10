"use client";

import { login, logout } from "@/domains/authentication/services/server/actions/session";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { signUpWithEmail } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  ChangePasswordSchema,
  type ChangePasswordTypes,
  type SignUpValues,
  signUpSchema,
} from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { Eye, EyeIcon, EyeOff, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Input } from "../ui/input";

const ChangePasswordForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string>("/");
  const [error, setError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isError, setIsError] = useState<{
    code: string;
    message: string;
  } | null>(null);

  const form = useForm<ChangePasswordTypes>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: getFirebaseAuth().currentUser?.email || "",
      password: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    },
  });

  const currentUser = getFirebaseAuth().currentUser;
  const userType = useMemo(() => {
    return currentUser?.providerData;
  }, [currentUser]);

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const handleEmailAuth = async (values: SignUpValues) => {
    setError("");
    try {
      const user = await signUpWithEmail(values.email, values.password);
      // Get the ID token
      const idToken = await user.user.getIdToken();
      // Call the server action to set the session cookie
      const result = await login(idToken);
      console.log("session creation: ", result);
      router.push(redirectPath || "/");
      // Handle successful sign-in/sign-up here
    } catch (error) {
      setError("Failed to authenticate. Please try again.");
      console.error(error);
    }
  };

  useEffect(() => {
    const storedRedirectPath = localStorage.getItem("redirect");
    if (storedRedirectPath) {
      setRedirectPath(storedRedirectPath);
    }
  }, []);

  const onSubmit = useCallback(
    (values: z.infer<typeof ChangePasswordSchema>) => {
      setIsLoading(true);
      signInWithEmailAndPassword(
        getFirebaseAuth(),
        values.email,
        values.password.oldPassword,
      )
        .then((userCredential) => {
          const user = userCredential.user;
          if (user) {
            updatePassword(user, values.password.newPassword)
              .then(() => {
                console.log("success");
                logout();
              })
              .catch((err) => {
                setIsLoading(false);
                setIsError({
                  code: "500",
                  message: err.message,
                });
              });
          } else {
            setIsLoading(false);
            setIsError({
              code: "400",
              message: "รหัสผ่านเดิมไม่ถูกต้อง หรือยังไม่เคยสมัครใช้งานแบบอีเมล",
            });
          }
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
          setIsError({
            code: "400",
            message: "รหัสผ่านเดิมไม่ถูกต้อง หรือยังไม่เคยสมัครใช้งานแบบอีเมล",
          });
        });
    },
    [form],
  );

  const checkKeyDown = (
    e: React.KeyboardEvent<
      HTMLFormElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    e.key === "Enter" && e.preventDefault();
  };

  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors: any, e) => {
          console.log("Form submission error", errors, e);
          setIsError({
            code: "400",
            message: "ยืนยันพาสเวิร์ดใหม่ไม่สำเร็จ พาสเวิร์ดไม่ตรงกัน",
          });
        })}
        onKeyDown={checkKeyDown}
        className="space-y-4 md:space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>อีเมล (Email)</FormLabel>
              <FormControl>
                <Label
                  disabled
                  className="block w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm"
                  {...field}
                >
                  {field.value}
                </Label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password.oldPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รหัสผ่านเดิม (Old Password)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleOldPasswordVisibility}
                    aria-label={
                      showOldPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showOldPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password.newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รหัสผ่านใหม่ (New Password)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleNewPasswordVisibility}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password.confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ยืนยันรหัสผ่านใหม่ (Confirm New Password)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isError && (
          <p className="text-sm font-medium text-red-500">{isError.message}</p>
        )}
        <div className="flex items-center justify-between">
          <a
            href="/auth/reset"
            className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
          >
            <p className="text-primary-500">ลืมรหัสผ่าน?</p>
          </a>
        </div>

        <div className="flex items-center justify-end w-full">
          <Button size={"sm"} type="submit">
            ยืนยัน
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChangePasswordForm;
