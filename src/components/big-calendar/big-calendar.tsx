"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/shared/utils";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { type CaptionProps, DayPicker, useNavigation } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CustomCaptionComponent(props: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  return (
    <h2>
      {format(props.displayMonth, "MMM yyy")}
      <Button
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
      >
        Previous
      </Button>
      <Button
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
      >
        Next
      </Button>
    </h2>
  );
}

function BigCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("", className)}
      classNames={{
        months: "flex flex-col w-full sm:flex-row sm:space-y-0 mx-auto",
        month: "w-full mx-auto",
        caption: "flex justify-between pt-1 relative items-center px-2",
        caption_label: "text-sm font-medium hidden",
        caption_dropdowns:
          "flex text-sm font-base items-center justify-between gap-2",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        // nav_button_previous: "absolute left-1",
        // nav_button_next: "absolute right-1",
        table: "w-full border-collapse m-0 p-0",
        head: "flex",
        head_row: "flex w-full",
        head_cell: "text-slate-900 text-sm w-full h-6 font-normal",
        row: "flex w-full",
        cell: "size-full text-center border border-primary-100 text-sm p-0 relative focus-within:relative focus-within:z-10",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-full p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-slate-100 text-primary-500 hover:bg-slate-100 hover:text-primary-600 focus:bg-slate-100 focus:text-primary-500 rounded-3xl",
        day_today: "bg-slate-100 text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="size-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="size-4" />,
        Caption: CustomCaptionComponent,
      }}
      {...props}
    />
  );
}
BigCalendar.displayName = "BigCalendar";

export { BigCalendar };
