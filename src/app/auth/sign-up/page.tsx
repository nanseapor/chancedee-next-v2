"use client";

import { login } from "@/domains/authentication/services/server/actions/session";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import getAssets from "@/lib/assets";
import {
  signInWithFacebook,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/auth";
import { getRegisterBanner } from "@/lib/register";
import { type SignUpValues, signUpSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";

export default function SignUpPage({
  params,
  searchParams,
}: { params?: any; searchParams?: any }) {
  const query = searchParams?.query;
  const [error, setError] = useState("");
  const [redirectPath, setRedirectPath] = useState<string>("/");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  useEffect(() => {
    const storedRedirectPath = localStorage.getItem("redirect");
    if (storedRedirectPath) {
      setRedirectPath(storedRedirectPath);
    }
  }, []);

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

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      // Get the ID token
      const idToken = await user.user.getIdToken();
      // Call the server action to set the session cookie
      const result = await login(idToken);
      console.log("session creation: ", result);
      router.push(redirectPath || "/");
      // Handle successful sign-in here
    } catch (error) {
      setError("Failed to sign in with Google. Please try again.");
      console.error(error);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const user = await signInWithFacebook();
      // Get the ID token
      const idToken = await user.user.getIdToken();
      // Call the server action to set the session cookie
      const result = await login(idToken);
      console.log("session creation: ", result);
      router.push(redirectPath || "/");
      // Handle successful sign-in here
    } catch (error) {
      setError("Failed to sign in with Facebook. Please try again.");
      console.error(error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const { data, isLoading } = useSWR("register-banner", getRegisterBanner);
  const imageBanner =
    data && data.length > 0 && data[0].image
      ? getAssets(data[0].image)
      : "/images/article-3.avif";

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
          <div className="flex items-center justify-center px-8 md:px-12 lg:px-16">
            <div className="w-full max-w-[440px] space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{data && data[0].title}</h1>
              </div>
              <div className="space-y-4">
                <div className="space-y-4">
                  <Button
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button
                    onClick={handleFacebookSignIn}
                    variant="outline"
                    className="w-full"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="#1877F2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Continue with Facebook
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleEmailAuth)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ? (
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
                    <FormField
                      control={form.control}
                      name="passwordConfirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
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
                    <Button type="submit" className="w-full">
                      {"Sign Up"}
                    </Button>
                  </form>
                </Form>
              </div>
              <div className="text-center text-sm">
                {"Already have an account?"}
                <Button
                  variant="link"
                  onClick={() => (window.location.href = "/auth/sign-in")}
                >
                  {"Sign In"}
                </Button>
              </div>
              {error && <p className="text-red-500 text-center">{error}</p>}
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-muted/40" />
            <Image
              src={imageBanner}
              alt="Background"
              className="h-full w-full object-cover"
              width={1920}
              height={1080}
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
