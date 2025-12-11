"use client";

import { KVMonths } from "@/constants/constant";

export const checkKeyDown = (
  e: React.KeyboardEvent<
    HTMLFormElement | HTMLInputElement | HTMLTextAreaElement
  >,
) => {
  if (e.key === "Enter") e.preventDefault();
};

export function getMonthLabel(field: { value: number }) {
  const month = KVMonths.find((m) => m.value === field.value);
  if (month) {
    return {
      value: month.value.toString(),
      label: month.label.toString(),
    };
  }
  return undefined;
}
