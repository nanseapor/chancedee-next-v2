import type { Metadata } from "next";

import { SelectRoleClient } from "./_components/SelectRoleClient";

export const metadata: Metadata = {
  title: "เลือกบทบาท - ChanceDee",
  description: "Select your role to continue",
};

export default function SelectRolePage() {
  return <SelectRoleClient />;
}
