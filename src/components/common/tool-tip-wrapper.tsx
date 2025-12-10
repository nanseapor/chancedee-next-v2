import type React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const ToolTipWrapper = ({
  text,
  children,
}: { text?: string; children: React.ReactNode }) => {
  if (!text) return <>{children}</>;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className=" text-primary-900 bg-primary-100">
          <p className="max-w-sm sm:p-4 sm:text-base">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ToolTipWrapper;
