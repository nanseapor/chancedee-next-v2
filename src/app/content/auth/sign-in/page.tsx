"use client";

import { login } from "@/domains/authentication/services/server/actions/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  signInWithEmail,
  signInWithFacebook,
  signInWithGoogle,
} from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

interface FormState {
  error: string | null;
}

const initialState: FormState = { error: null };

async function handleEmailAuth(
  data: z.infer<typeof formSchema>,
  redirectUrl: string,
): Promise<FormState> {
  const { email, password } = data;

  try {
    const user = await signInWithEmail(email, password);
    // Get the ID token
    const idToken = await user.user.getIdToken();
    // Call the server action to set the session cookie
    const result = await login(idToken);
    console.log("session creation: ", result);
    // Redirect to the specified URL after successful authentication
    window.location.href = redirectUrl || "/";
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to authenticate. Please try again." };
  }
}

export default function SignInPage({
  params,
  searchParams,
}: { params?: any; searchParams?: any }) {
  const query = searchParams?.query;
  const [redirectPath, setRedirectPath] = useState<string>("/");
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const storedRedirectPath = localStorage.getItem("redirect");
    if (storedRedirectPath) {
      setRedirectPath(storedRedirectPath);
    }
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const result = await handleEmailAuth(data, redirectPath);
    setFormState(result);
  };

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const user = await signInWithGoogle();
      // Get the ID token
      const idToken = await user.user.getIdToken();
      // Call the server action to set the session cookie
      const result = await login(idToken);
      console.log("session creation: ", result);
      router.push(redirectPath);
    } catch (error) {
      console.error(error);
      setFormState({
        error: "Failed to authenticate with Google. Please try again.",
      });
    }
  }, [redirectPath, router]);

  const handleFacebookSignIn = useCallback(async () => {
    try {
      const user = await signInWithFacebook();
      // Get the ID token
      const idToken = await user.user.getIdToken();
      // Call the server action to set the session cookie
      const result = await login(idToken);
      console.log("session creation: ", result);
      router.push(redirectPath);
    } catch (error) {
      console.error(error);
      setFormState({
        error: "Failed to authenticate with Facebook. Please try again.",
      });
    }
  }, [redirectPath, router]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100/75 from-10% via-transparent via-50% to-primary-100 to-90% flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md py-6">
        <CardHeader>
          <h1 className="text-3xl font-semibold text-center mb-2">
            เข้าสู่ระบบ CHANCEDEE
          </h1>
          <p className="text-muted-foreground text-center">
            Sign In your account for full access
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
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
              Sign in with Google
            </Button>
            <Button
              onClick={handleFacebookSignIn}
              variant="outline"
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Sign in with Facebook
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={togglePasswordVisibility}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
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
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-700 text-white font-semibold transition-colors duration-700 ease-out"
              >
                Login
              </Button>
            </form>
          </Form>
          {formState.error && (
            <p className="text-red-500 text-sm text-center">
              {formState.error}
            </p>
          )}
          <div className="flex flex-row justify-between">
            <div className="flex items-center mt-4 text-center text-sm font-light">
              <Link
                className="text-sm text-primary-500 font-medium px-4"
                href="/auth/reset"
              >
                Forget Password
              </Link>
            </div>
            <div className="mt-4 text-center text-sm font-light">
              {"Don't have an account?"}
              <Button
                variant="link"
                onClick={() => (window.location.href = "/auth/sign-up")}
              >
                {"Sign Up"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
