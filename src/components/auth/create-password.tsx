"use client";

import { login } from "@/domains/authentication/services/server/actions/session";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signUpWithEmail } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  ChangePasswordSchema,
  type ChangePasswordTypes,
  type SignUpValues,
  signUpSchema,
} from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const CreatePasswordForm = () => {
  const router = useRouter();
  const [redirectPath, setRedirectPath] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("redirect") || "/";
    }
    return "/";
  });
  const [_error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: getFirebaseAuth().currentUser?.email || "",
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


  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Form {...signUpForm}>
      <form
        onSubmit={signUpForm.handleSubmit(handleEmailAuth)}
        className="space-y-4"
      >
        <FormField
          control={signUpForm.control}
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
          control={signUpForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleNewPasswordVisibility}
                  >
                    {showNewPassword ? (
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
          control={signUpForm.control}
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
          {"Create password"}
        </Button>
      </form>
    </Form>
  );
};

export default CreatePasswordForm;
