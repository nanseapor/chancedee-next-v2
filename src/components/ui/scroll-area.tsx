"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          orientation === "vertical" ? "overflow-y-auto" : "overflow-x-auto",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
