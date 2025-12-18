/**
 * Thai date formatting utilities
 * Per CAND-R01 Implementation Plan
 */

const THAI_MONTHS_SHORT = [
  "ม.ค.", // มกราคม
  "ก.พ.", // กุมภาพันธ์
  "มี.ค.", // มีนาคม
  "เม.ย.", // เมษายน
  "พ.ค.", // พฤษภาคม
  "มิ.ย.", // มิถุนายน
  "ก.ค.", // กรกฎาคม
  "ส.ค.", // สิงหาคม
  "ก.ย.", // กันยายน
  "ต.ค.", // ตุลาคม
  "พ.ย.", // พฤศจิกายน
  "ธ.ค.", // ธันวาคม
];

const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

const THAI_DAYS_FULL = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
];

/**
 * Format date to Thai format
 * @param date - Date object or timestamp (milliseconds)
 * @param format - Format type
 * @returns Formatted Thai date string
 *
 * Examples:
 * - "short": "15 ธ.ค. 67" (day + short month + short year)
 * - "medium": "15 ธันวาคม 2567" (day + full month + full year)
 * - "long": "วันศุกร์ที่ 15 ธันวาคม 2567" (day name + date)
 * - "full": "วันศุกร์ที่ 15 ธันวาคม พ.ศ. 2567" (with พ.ศ. prefix)
 */
export function formatThaiDate(
  date: Date | number,
  format: "short" | "medium" | "long" | "full" = "medium"
): string {
  const d = typeof date === "number" ? new Date(date) : date;

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear() + 543; // Convert to Buddhist Era
  const dayOfWeek = d.getDay();

  switch (format) {
    case "short":
      return `${day} ${THAI_MONTHS_SHORT[month]} ${String(year).slice(-2)}`;

    case "medium":
      return `${day} ${THAI_MONTHS_FULL[month]} ${year}`;

    case "long":
      return `วัน${THAI_DAYS_FULL[dayOfWeek]}ที่ ${day} ${THAI_MONTHS_FULL[month]} ${year}`;

    case "full":
      return `วัน${THAI_DAYS_FULL[dayOfWeek]}ที่ ${day} ${THAI_MONTHS_FULL[month]} พ.ศ. ${year}`;

    default:
      return `${day} ${THAI_MONTHS_FULL[month]} ${year}`;
  }
}

/**
 * Format time to Thai 24-hour format
 * @param date - Date object or timestamp
 * @returns Time string like "14:30"
 */
export function formatThaiTime(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Format datetime to Thai format with time
 * @param date - Date object or timestamp
 * @returns String like "15 ธ.ค. 67 เวลา 14:30"
 */
export function formatThaiDateTime(date: Date | number): string {
  const dateStr = formatThaiDate(date, "short");
  const timeStr = formatThaiTime(date);
  return `${dateStr} เวลา ${timeStr}`;
}

/**
 * Get relative time in Thai (e.g., "2 วันที่แล้ว", "3 ชั่วโมงที่แล้ว")
 * @param date - Date object or timestamp
 * @returns Relative time string in Thai
 */
export function getRelativeTimeThai(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 7) {
    return formatThaiDate(d, "short");
  }
  if (diffDay > 0) {
    return `${diffDay} วันที่แล้ว`;
  }
  if (diffHour > 0) {
    return `${diffHour} ชั่วโมงที่แล้ว`;
  }
  if (diffMin > 0) {
    return `${diffMin} นาทีที่แล้ว`;
  }
  return "เมื่อสักครู่";
}

/**
 * Format date range in Thai
 * @param start - Start date
 * @param end - End date
 * @returns Range string like "15-18 ธ.ค. 67"
 */
export function formatThaiDateRange(
  start: Date | number,
  end: Date | number
): string {
  const startDate = typeof start === "number" ? new Date(start) : start;
  const endDate = typeof end === "number" ? new Date(end) : end;

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();
  const startYear = startDate.getFullYear() + 543;
  const endYear = endDate.getFullYear() + 543;

  // Same day
  if (
    startDay === endDay &&
    startMonth === endMonth &&
    startYear === endYear
  ) {
    return formatThaiDate(startDate, "short");
  }

  // Same month and year
  if (startMonth === endMonth && startYear === endYear) {
    return `${startDay}-${endDay} ${THAI_MONTHS_SHORT[startMonth]} ${String(startYear).slice(-2)}`;
  }

  // Same year
  if (startYear === endYear) {
    return `${startDay} ${THAI_MONTHS_SHORT[startMonth]} - ${endDay} ${THAI_MONTHS_SHORT[endMonth]} ${String(startYear).slice(-2)}`;
  }

  // Different years
  return `${formatThaiDate(startDate, "short")} - ${formatThaiDate(endDate, "short")}`;
}
