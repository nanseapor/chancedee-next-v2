import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบด้วย Social | Chancedee Jobs",
  description: "เข้าสู่ระบบด้วยบัญชี Social Media",
};

export default function SocialAuthPage() {
  // Redirect to main login page which has social auth options
  redirect("/auth/login");
}
