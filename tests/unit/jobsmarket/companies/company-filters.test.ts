import { describe, it, expect } from "vitest";
import {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  COMPANY_SORT_OPTIONS,
  DEFAULT_COMPANY_FILTER_STATE,
  COMPANIES_PER_PAGE,
  getIndustryLabel,
  getCompanySizeLabel,
  FILTER_REMOVAL_PRIORITY,
} from "@/lib/constants/jobsmarket/company-filters";

/**
 * Unit tests for company filter constants and helpers
 *
 * @specification COMP-R09 Company Directory
 */

describe("Company Filter Constants", () => {
  describe("INDUSTRY_OPTIONS", () => {
    it("should have 10 industry options", () => {
      expect(INDUSTRY_OPTIONS).toHaveLength(10);
    });

    it("should have all required properties for each option", () => {
      INDUSTRY_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
        expect(option).toHaveProperty("labelEn");
        expect(typeof option.value).toBe("string");
        expect(typeof option.label).toBe("string");
        expect(typeof option.labelEn).toBe("string");
      });
    });

    it("should have unique values", () => {
      const values = INDUSTRY_OPTIONS.map((opt) => opt.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it("should include expected industries", () => {
      const values = INDUSTRY_OPTIONS.map((opt) => opt.value);
      expect(values).toContain("technology");
      expect(values).toContain("finance");
      expect(values).toContain("healthcare");
      expect(values).toContain("education");
      expect(values).toContain("retail");
      expect(values).toContain("manufacturing");
      expect(values).toContain("hospitality");
      expect(values).toContain("construction");
      expect(values).toContain("logistics");
      expect(values).toContain("other");
    });
  });

  describe("COMPANY_SIZE_OPTIONS", () => {
    it("should have 3 size options", () => {
      expect(COMPANY_SIZE_OPTIONS).toHaveLength(3);
    });

    it("should have S, M, L values", () => {
      const values = COMPANY_SIZE_OPTIONS.map((opt) => opt.value);
      expect(values).toEqual(["S", "M", "L"]);
    });

    it("should have Thai and English labels", () => {
      COMPANY_SIZE_OPTIONS.forEach((option) => {
        expect(option.label.length).toBeGreaterThan(0);
        expect(option.labelEn.length).toBeGreaterThan(0);
      });
    });
  });

  describe("COMPANY_SORT_OPTIONS", () => {
    it("should have 3 sort options", () => {
      expect(COMPANY_SORT_OPTIONS).toHaveLength(3);
    });

    it("should have newest, alphabetical, most_jobs values", () => {
      const values = COMPANY_SORT_OPTIONS.map((opt) => opt.value);
      expect(values).toContain("newest");
      expect(values).toContain("alphabetical");
      expect(values).toContain("most_jobs");
    });

    it("should have newest as first option (default)", () => {
      expect(COMPANY_SORT_OPTIONS[0].value).toBe("newest");
    });
  });

  describe("DEFAULT_COMPANY_FILTER_STATE", () => {
    it("should have correct default values", () => {
      expect(DEFAULT_COMPANY_FILTER_STATE).toEqual({
        q: "",
        industries: [],
        sizes: [],
        sort: "newest",
        page: 1,
      });
    });

    it("should have empty string for keyword", () => {
      expect(DEFAULT_COMPANY_FILTER_STATE.q).toBe("");
    });

    it("should have empty arrays for multi-select filters", () => {
      expect(DEFAULT_COMPANY_FILTER_STATE.industries).toEqual([]);
      expect(DEFAULT_COMPANY_FILTER_STATE.sizes).toEqual([]);
    });

    it("should have newest as default sort", () => {
      expect(DEFAULT_COMPANY_FILTER_STATE.sort).toBe("newest");
    });

    it("should start at page 1", () => {
      expect(DEFAULT_COMPANY_FILTER_STATE.page).toBe(1);
    });
  });

  describe("COMPANIES_PER_PAGE", () => {
    it("should be 20", () => {
      expect(COMPANIES_PER_PAGE).toBe(20);
    });
  });

  describe("FILTER_REMOVAL_PRIORITY", () => {
    it("should have 3 items", () => {
      expect(FILTER_REMOVAL_PRIORITY).toHaveLength(3);
    });

    it("should prioritize sizes first, then industries, then keyword", () => {
      expect(FILTER_REMOVAL_PRIORITY[0]).toBe("sizes");
      expect(FILTER_REMOVAL_PRIORITY[1]).toBe("industries");
      expect(FILTER_REMOVAL_PRIORITY[2]).toBe("q");
    });
  });
});

describe("getIndustryLabel", () => {
  it("should return Thai label for valid industry", () => {
    expect(getIndustryLabel("technology")).toBe("เทคโนโลยีและสารสนเทศ");
    expect(getIndustryLabel("finance")).toBe("การเงินและธนาคาร");
    expect(getIndustryLabel("healthcare")).toBe("สุขภาพและการแพทย์");
    expect(getIndustryLabel("education")).toBe("การศึกษา");
    expect(getIndustryLabel("retail")).toBe("ค้าปลีก");
    expect(getIndustryLabel("manufacturing")).toBe("การผลิต");
    expect(getIndustryLabel("hospitality")).toBe("การโรงแรมและท่องเที่ยว");
    expect(getIndustryLabel("construction")).toBe("ก่อสร้างและอสังหาริมทรัพย์");
    expect(getIndustryLabel("logistics")).toBe("โลจิสติกส์และขนส่ง");
    expect(getIndustryLabel("other")).toBe("อื่นๆ");
  });

  it("should return 'ไม่ระบุ' for null", () => {
    expect(getIndustryLabel(null)).toBe("ไม่ระบุ");
  });

  it("should return 'ไม่ระบุ' for undefined", () => {
    expect(getIndustryLabel(undefined)).toBe("ไม่ระบุ");
  });

  it("should return input value for unknown industry", () => {
    expect(getIndustryLabel("unknown_industry")).toBe("unknown_industry");
  });

  it("should return 'ไม่ระบุ' for empty string", () => {
    expect(getIndustryLabel("")).toBe("ไม่ระบุ");
  });
});

describe("getCompanySizeLabel", () => {
  it("should return Thai label for valid sizes", () => {
    expect(getCompanySizeLabel("S")).toBe("เล็ก (1-50 คน)");
    expect(getCompanySizeLabel("M")).toBe("กลาง (51-200 คน)");
    expect(getCompanySizeLabel("L")).toBe("ใหญ่ (มากกว่า 200 คน)");
  });

  it("should return 'ไม่ระบุ' for null", () => {
    expect(getCompanySizeLabel(null)).toBe("ไม่ระบุ");
  });

  it("should return 'ไม่ระบุ' for undefined", () => {
    expect(getCompanySizeLabel(undefined)).toBe("ไม่ระบุ");
  });

  it("should return stringified value for unknown size", () => {
    expect(getCompanySizeLabel("XL")).toBe("XL");
  });

  it("should return 'ไม่ระบุ' for empty string", () => {
    expect(getCompanySizeLabel("")).toBe("ไม่ระบุ");
  });
});
