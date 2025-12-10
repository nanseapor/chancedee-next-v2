import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";

const AIChatTermsAndConditions = (props: {
  disabled?: boolean;
  checked: boolean;
  setChecked: (checked: boolean) => void;
}) => {
  return (
    <div className="flex flex-row items-start gap-2 text-sm text-gray-500 dark:text-gray-300">
      <div className="block pt-0.5">
        <Checkbox className="size-4 rounded border border-primary-500 focus-visible:ring-primary-500 data-[state=checked]:bg-primary-500 data-[state=checked]:text-white" checked={props.checked} disabled={props.disabled} onCheckedChange={(e) => props.setChecked(e && true)} />
      </div>
      <div className="block font-light">
        <span className="dark:text-gray-300"></span>
        ข้าพเจ้ายินยอมให้ ChanceDee เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลตามนโยบายความเป็นส่วนตัว
        <Link
          className="font-medium text-primary-600 underline hover:text-primary-700 hover:underline"
          target="_blank"
          href="/legal/privacy-policy"
        >
          อ่านเพิ่มเติม
        </Link>{" "}
      </div>
    </div>
  );
};

export default AIChatTermsAndConditions;
