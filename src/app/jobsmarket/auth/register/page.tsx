/**
 * Registration Page
 * Per AUTH-R02 Implementation Plan
 * Per RIS AUTH-R02 §6 - State machine orchestration
 *
 * Route: /jobsmarket/auth/register
 */

import { RegisterClient } from "./_components/RegisterClient";

export const metadata = {
  title: "สมัครสมาชิก | Chancedee Jobs",
  description: "ลงทะเบียนสมาชิกใหม่ เลือกระหว่างผู้หางานหรือบริษัท",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
