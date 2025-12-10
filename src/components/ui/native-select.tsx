"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as React from "react";

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-9 w-full appearance-none items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&>option]:bg-background [&>option]:text-foreground",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    );
  },
);

NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
