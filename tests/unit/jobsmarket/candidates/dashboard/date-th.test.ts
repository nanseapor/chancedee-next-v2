import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  formatThaiDate,
  formatThaiTime,
  formatThaiDateTime,
  getRelativeTimeThai,
  formatThaiDateRange,
} from "@/lib/utils/date-th";

/**
 * Unit tests for Thai date formatting utilities
 * Per CAND-R01 Implementation Plan
 *
 * Tests formatting functions for Thai locale:
 * - Buddhist Era year conversion (+543)
 * - Thai month and day names
 * - Various date formats
 * - Relative time calculations
 *
 * Coverage Target: 90%+
 */

describe("formatThaiDate", () => {
  const testDate = new Date("2024-12-15T14:30:00"); // 15 Dec 2024 (2567 BE)

  describe("Format: short", () => {
    it("should format date in short format (day + short month + 2-digit year)", () => {
      const result = formatThaiDate(testDate, "short");
      expect(result).toBe("15 ธ.ค. 67");
    });

    it("should handle timestamp input", () => {
      const timestamp = testDate.getTime();
      const result = formatThaiDate(timestamp, "short");
      expect(result).toBe("15 ธ.ค. 67");
    });
  });

  describe("Format: medium (default)", () => {
    it("should format date in medium format (day + full month + full year)", () => {
      const result = formatThaiDate(testDate, "medium");
      expect(result).toBe("15 ธันวาคม 2567");
    });

    it("should use medium format by default when no format specified", () => {
      const result = formatThaiDate(testDate);
      expect(result).toBe("15 ธันวาคม 2567");
    });
  });

  describe("Format: long", () => {
    it("should include day name in long format", () => {
      const result = formatThaiDate(testDate, "long");
      // 15 Dec 2024 is Sunday
      expect(result).toContain("วันอาทิตย์ที่");
      expect(result).toContain("15 ธันวาคม 2567");
    });
  });

  describe("Format: full", () => {
    it("should include พ.ศ. prefix in full format", () => {
      const result = formatThaiDate(testDate, "full");
      expect(result).toContain("วันอาทิตย์ที่");
      expect(result).toContain("พ.ศ. 2567");
    });
  });

  describe("Buddhist Era Conversion", () => {
    it("should convert Gregorian year to Buddhist Era (+543)", () => {
      const date2000 = new Date("2000-01-01");
      const result = formatThaiDate(date2000, "medium");
      expect(result).toContain("2543"); // 2000 + 543
    });

    it("should handle year 2025 correctly", () => {
      const date2025 = new Date("2025-06-15");
      const result = formatThaiDate(date2025, "medium");
      expect(result).toContain("2568"); // 2025 + 543
    });
  });

  describe("All Months", () => {
    it("should format all Thai months correctly", () => {
      const months = [
        { month: 0, short: "ม.ค.", full: "มกราคม" },
        { month: 1, short: "ก.พ.", full: "กุมภาพันธ์" },
        { month: 2, short: "มี.ค.", full: "มีนาคม" },
        { month: 3, short: "เม.ย.", full: "เมษายน" },
        { month: 4, short: "พ.ค.", full: "พฤษภาคม" },
        { month: 5, short: "มิ.ย.", full: "มิถุนายน" },
        { month: 6, short: "ก.ค.", full: "กรกฎาคม" },
        { month: 7, short: "ส.ค.", full: "สิงหาคม" },
        { month: 8, short: "ก.ย.", full: "กันยายน" },
        { month: 9, short: "ต.ค.", full: "ตุลาคม" },
        { month: 10, short: "พ.ย.", full: "พฤศจิกายน" },
        { month: 11, short: "ธ.ค.", full: "ธันวาคม" },
      ];

      months.forEach(({ month, short, full }) => {
        const date = new Date(2024, month, 15);
        expect(formatThaiDate(date, "short")).toContain(short);
        expect(formatThaiDate(date, "medium")).toContain(full);
      });
    });
  });
});

describe("formatThaiTime", () => {
  it("should format time in 24-hour HH:MM format", () => {
    const date = new Date("2024-12-15T14:30:00");
    expect(formatThaiTime(date)).toBe("14:30");
  });

  it("should pad single-digit hours and minutes with zero", () => {
    const date = new Date("2024-12-15T09:05:00");
    expect(formatThaiTime(date)).toBe("09:05");
  });

  it("should handle midnight", () => {
    const date = new Date("2024-12-15T00:00:00");
    expect(formatThaiTime(date)).toBe("00:00");
  });

  it("should handle timestamp input", () => {
    const timestamp = new Date("2024-12-15T14:30:00").getTime();
    expect(formatThaiTime(timestamp)).toBe("14:30");
  });
});

describe("formatThaiDateTime", () => {
  it("should combine date and time with เวลา separator", () => {
    const date = new Date("2024-12-15T14:30:00");
    const result = formatThaiDateTime(date);
    expect(result).toBe("15 ธ.ค. 67 เวลา 14:30");
  });

  it("should handle timestamp input", () => {
    const timestamp = new Date("2024-12-15T14:30:00").getTime();
    const result = formatThaiDateTime(timestamp);
    expect(result).toBe("15 ธ.ค. 67 เวลา 14:30");
  });
});

describe("getRelativeTimeThai", () => {
  beforeEach(() => {
    // Mock current time to 2024-12-15 14:30:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-12-15T14:30:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return เมื่อสักครู่ for times less than 1 minute ago", () => {
    const now = new Date();
    const justNow = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
    expect(getRelativeTimeThai(justNow)).toBe("เมื่อสักครู่");
  });

  it("should return X นาทีที่แล้ว for times less than 1 hour ago", () => {
    const now = new Date();
    const minutes30Ago = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
    expect(getRelativeTimeThai(minutes30Ago)).toBe("30 นาทีที่แล้ว");

    const minute1Ago = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute ago
    expect(getRelativeTimeThai(minute1Ago)).toBe("1 นาทีที่แล้ว");
  });

  it("should return X ชั่วโมงที่แล้ว for times less than 1 day ago", () => {
    const now = new Date();
    const hours5Ago = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago
    expect(getRelativeTimeThai(hours5Ago)).toBe("5 ชั่วโมงที่แล้ว");

    const hour1Ago = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
    expect(getRelativeTimeThai(hour1Ago)).toBe("1 ชั่วโมงที่แล้ว");
  });

  it("should return X วันที่แล้ว for 1-7 days ago", () => {
    const now = new Date();
    const days3Ago = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    expect(getRelativeTimeThai(days3Ago)).toBe("3 วันที่แล้ว");

    const day1Ago = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
    expect(getRelativeTimeThai(day1Ago)).toBe("1 วันที่แล้ว");
  });

  it("should return formatted short date for more than 7 days ago", () => {
    const now = new Date();
    const days10Ago = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    const result = getRelativeTimeThai(days10Ago);
    // Should return short date format
    expect(result).toMatch(/\d+ \S+ \d+/);
  });

  it("should handle timestamp input", () => {
    const now = new Date();
    const hours2Ago = now.getTime() - 2 * 60 * 60 * 1000;
    expect(getRelativeTimeThai(hours2Ago)).toBe("2 ชั่วโมงที่แล้ว");
  });
});

describe("formatThaiDateRange", () => {
  describe("Same Day", () => {
    it("should return single date for same day", () => {
      const start = new Date("2024-12-15T10:00:00");
      const end = new Date("2024-12-15T14:00:00");
      expect(formatThaiDateRange(start, end)).toBe("15 ธ.ค. 67");
    });
  });

  describe("Same Month and Year", () => {
    it("should format range within same month", () => {
      const start = new Date("2024-12-15");
      const end = new Date("2024-12-18");
      expect(formatThaiDateRange(start, end)).toBe("15-18 ธ.ค. 67");
    });
  });

  describe("Same Year, Different Months", () => {
    it("should format range across months in same year", () => {
      const start = new Date("2024-11-25");
      const end = new Date("2024-12-05");
      const result = formatThaiDateRange(start, end);
      expect(result).toContain("พ.ย.");
      expect(result).toContain("ธ.ค.");
      expect(result).toContain("67");
    });
  });

  describe("Different Years", () => {
    it("should format range across years", () => {
      const start = new Date("2024-12-25");
      const end = new Date("2025-01-05");
      const result = formatThaiDateRange(start, end);
      expect(result).toContain("67");
      expect(result).toContain("68");
    });
  });

  describe("Timestamp Inputs", () => {
    it("should handle timestamp inputs", () => {
      const start = new Date("2024-12-15").getTime();
      const end = new Date("2024-12-18").getTime();
      expect(formatThaiDateRange(start, end)).toBe("15-18 ธ.ค. 67");
    });
  });
});
