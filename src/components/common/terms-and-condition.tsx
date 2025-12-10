import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

const TermsAndConditions = (props: {
  checked: boolean;
  setChecked: (checked: boolean) => void;
}) => {
  return (
    <div className="flex flex-row items-start gap-2 text-sm text-gray-500 dark:text-gray-300">
      <div className="block pt-0.5">
        <Checkbox
          className="size-4 rounded border border-gray-300"
          checked={props.checked}
          onCheckedChange={(e) => props.setChecked(e && true)}
        />
      </div>
      <div className="block">
        <span className="dark:text-gray-300"></span>
        คุณรับทราบและตกลงตาม{" "}
        <Link
          className="font-medium text-secondary-950 underline hover:underline"
          target="_blank"
          href="/legal/terms-of-service"
        >
          เงื่อนไขการให้บริการ
        </Link>{" "}
        และ{" "}
        <Link
          className="font-medium text-secondary-950 underline hover:underline"
          target="_blank"
          href="/legal/privacy-policy"
        >
          นโยบายความเป็นส่วนตัว
        </Link>{" "}
      </div>
    </div>
  );
};

export default TermsAndConditions;
