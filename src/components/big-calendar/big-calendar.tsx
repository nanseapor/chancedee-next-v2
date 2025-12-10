"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/shared/utils";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { type MonthCaptionProps, DayPicker, useDayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CustomCaptionComponent(props: MonthCaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker();
  return (
    <h2>
      {format(props.calendarMonth.date, "MMM yyy")}
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
        month_caption: "flex justify-between pt-1 relative items-center px-2",
        caption_label: "text-sm font-medium hidden",
        dropdowns:
          "flex text-sm font-base items-center justify-between gap-2",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse m-0 p-0",
        weekdays: "flex",
        weekday: "text-slate-900 text-sm w-full h-6 font-normal",
        week: "flex w-full",
        day: "size-full text-center border border-primary-100 text-sm p-0 relative focus-within:relative focus-within:z-10",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-full p-0 font-normal aria-selected:opacity-100",
        ),
        range_end: "day-range-end",
        selected:
          "bg-slate-100 text-primary-500 hover:bg-slate-100 hover:text-primary-600 focus:bg-slate-100 focus:text-primary-500 rounded-3xl",
        today: "bg-slate-100 text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />,
        MonthCaption: CustomCaptionComponent,
      }}
      {...props}
    />
  );
}
BigCalendar.displayName = "BigCalendar";

export { BigCalendar };
