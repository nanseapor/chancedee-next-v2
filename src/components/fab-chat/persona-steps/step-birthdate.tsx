"use client";

import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { KVMonths } from "@/constant/constant";
import { th } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  type MonthCaptionProps,
  type DayProps,
  useDayPicker,
} from "react-day-picker";
import { BigCalendar } from "../../big-calendar/big-calendar";
import { AIAvatar } from "./shared/ai-avatar";

type StepBirthdateProps = {
  birthdate: Date;
  onBirthdateChange: (date: Date) => void;
  hasSelected: boolean;
  onNext: () => void;
  currentStep: number;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
};

function CustomCaptionComponent(
  props: MonthCaptionProps,
  selectedMonth: number,
  selectedYear: number,
  onMonthChange: (month: number) => void,
  onYearChange: (year: number) => void,
  birthdate: Date,
  goToDate: (date: Date) => void,
) {
  const getCurrentBuddhistYear = () => {
    return new Date().getFullYear();
  };

  const generateYearOptions = () => {
    const currentYear = getCurrentBuddhistYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 70; year--) {
      years.push(year);
    }
    return years;
  };

  const monthOptions = KVMonths.map((month) => ({
    value: month.value.toString(),
    label: month.label,
  }));

  const yearOptions = generateYearOptions().map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

  return (
    <div className="flex flex-col gap-2 px-6 py-2">
      <div className="flex flex-row items-center justify-center gap-2">
        <CustomSelect
          value={selectedMonth.toString()}
          onChange={(val) => {
            const date = birthdate || new Date();
            onMonthChange(Number.parseInt(val));
            goToDate(
              new Date(selectedYear, Number.parseInt(val) - 1, date.getDate()),
            );
          }}
          options={monthOptions}
          className="h-9 w-[90px] border-gray-300 text-slate-500"
        />
        <CustomSelect
          value={selectedYear.toString()}
          onChange={(val) => {
            const date = birthdate || new Date();
            onYearChange(Number.parseInt(val));
            goToDate(
              new Date(Number.parseInt(val), selectedMonth - 1, date.getDate()),
            );
          }}
          options={yearOptions}
          className="h-9 w-[90px] border-gray-300 text-slate-500"
        />
      </div>
    </div>
  );
}

const formatYearCaption = (year: Date) => {
  return `${year.getFullYear()}`;
};

function CustomDay(props: DayProps) {
  const { day, modifiers } = props;
  const isSelected = modifiers.selected;
  const isToday = modifiers.today;

  return (
    <div className="flex size-full flex-row justify-end p-1">
      <div className="flex flex-row justify-end">
        <div
          className={`${
            isSelected
              ? "bg-primary-500 text-white"
              : isToday
                ? "bg-orange-50"
                : "bg-white"
          } ${
            isToday ? "text-primary-500" : "text-slate-900"
          } flex size-6 items-center justify-center rounded-full`}
        >
          {day.date.getDate()}
        </div>
      </div>
    </div>
  );
}

export function StepBirthdate({
  birthdate,
  onBirthdateChange,
  hasSelected,
  onNext,
  currentStep,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: StepBirthdateProps) {
  return (
    <motion.div
      className="flex gap-2 items-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <AIAvatar />
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm max-w-[85%] w-fit">
        <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold mb-3">
          2️⃣ วันเดือนปีเกิดของคุณ
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg">
          <BigCalendar
            locale={th}
            mode="single"
            numberOfMonths={1}
            fromYear={new Date().getFullYear() - 100}
            toYear={new Date().getFullYear()}
            formatters={{ formatYearDropdown: formatYearCaption }}
            selected={birthdate}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01") || currentStep > 1
            }
            onSelect={(thisSelectedDate) => {
              if (!thisSelectedDate || currentStep > 1) return;
              onBirthdateChange(thisSelectedDate);
            }}
            components={{
              Day: CustomDay,
              MonthCaption: (props) => {
                const { goToMonth } = useDayPicker();
                return CustomCaptionComponent(
                  props,
                  selectedMonth,
                  selectedYear,
                  onMonthChange,
                  onYearChange,
                  birthdate,
                  goToMonth,
                );
              },
            }}
            initialFocus
            fixedWeeks
          />
        </div>
        <Button
          onClick={onNext}
          disabled={!hasSelected || currentStep !== 1}
          className="w-full mt-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2 rounded-lg font-kanit text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ถัดไป
        </Button>
      </div>
    </motion.div>
  );
}
