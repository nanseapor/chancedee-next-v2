/**
 * PDF Generation Tests
 * Comprehensive testing for PDF generation functionality
 */

import { PDFConverter } from "@/lib/pdf-converter";
import { PDFValidator } from "@/lib/pdf-validator";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock html2pdf.js
const mockHtml2Pdf = {
  set: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  save: vi.fn().mockResolvedValue(undefined),
  outputPdf: vi
    .fn()
    .mockResolvedValue(new Blob(["fake pdf"], { type: "application/pdf" })),
};

vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => mockHtml2Pdf),
}));

// Mock DOM methods
Object.defineProperty(global, "document", {
  value: {
    createElement: vi.fn((tag: string) => {
      const element = {
        tagName: tag.toUpperCase(),
        innerHTML: "",
        style: {},
        appendChild: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        querySelectorAll: vi.fn(() => []),
        textContent: "",
        innerText: "",
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
          contains: vi.fn(),
        },
      };

      // Special handling for div elements
      if (tag === "div") {
        Object.defineProperty(element, "innerHTML", {
          get: function () {
            return this._innerHTML || "";
          },
          set: function (value) {
            this._innerHTML = value;
            this.textContent = value.replace(/<[^>]*>/g, "");
            this.innerText = this.textContent;
          },
        });
      }

      return element;
    }),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  writable: true,
});

Object.defineProperty(global, "window", {
  value: {
    getComputedStyle: vi.fn(() => ({
      display: "block",
      visibility: "visible",
      opacity: "1",
    })),
  },
  writable: true,
});

describe("PDF Generation System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PDFValidator", () => {
    describe("validateHtmlContent", () => {
      it("should reject empty or null content", () => {
        const result1 = PDFValidator.validateHtmlContent("");
        const result2 = PDFValidator.validateHtmlContent("   ");

        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain("HTML content is empty or null");

        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain("HTML content is empty or null");
      });

      it("should reject invalid HTML structure", () => {
        const result = PDFValidator.validateHtmlContent(
          "Just plain text without HTML tags",
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "Invalid HTML structure - no HTML tags found",
        );
      });

      it("should validate proper HTML content", () => {
        const validHtml = `
          <div>
            <h1>Test Resume</h1>
            <p>Name: John Doe</p>
            <p>Email: john@example.com</p>
          </div>
        `;

        const result = PDFValidator.validateHtmlContent(validHtml);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.contentAnalysis.hasContent).toBe(true);
        expect(result.contentAnalysis.hasText).toBe(true);
        expect(result.contentAnalysis.textLength).toBeGreaterThan(0);
      });

      it("should detect content without visible text", () => {
        const htmlWithoutText = '<div><img src="test.jpg" alt="test"></div>';

        const result = PDFValidator.validateHtmlContent(htmlWithoutText);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "No visible text or images found - PDF will be blank",
        );
      });

      it("should warn about very small content", () => {
        const smallHtml = "<div>Hi</div>";

        const result = PDFValidator.validateHtmlContent(smallHtml);

        expect(result.warnings).toContain(
          "Very little text content - PDF may appear mostly empty",
        );
      });

      it("should analyze content structure correctly", () => {
        const complexHtml = `
          <div>
            <h1>Title</h1>
            <h2>Subtitle</h2>
            <p>Some paragraph text</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
            <img src="test.jpg" alt="test">
          </div>
        `;

        const result = PDFValidator.validateHtmlContent(complexHtml);

        expect(result.contentAnalysis.hasContent).toBe(true);
        expect(result.contentAnalysis.hasText).toBe(true);
        expect(result.contentAnalysis.elementCount).toBeGreaterThan(0);
        expect(result.contentAnalysis.textLength).toBeGreaterThan(20);
      });
    });

    describe("validatePDFBlob", () => {
      it("should reject empty blob", async () => {
        const emptyBlob = new Blob([], { type: "application/pdf" });

        const result = await PDFValidator.validatePDFBlob(emptyBlob);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("PDF blob is empty (0 bytes)");
      });

      it("should warn about very small PDF", async () => {
        const smallBlob = new Blob(["small"], { type: "application/pdf" });

        const result = await PDFValidator.validatePDFBlob(smallBlob);

        expect(result.warnings).toContain(
          "PDF is very small - may be blank or contain minimal content",
        );
      });

      it("should validate PDF header", async () => {
        const validPdfBlob = new Blob(["%PDF-1.4\n...content...%%EOF"], {
          type: "application/pdf",
        });

        const result = await PDFValidator.validatePDFBlob(validPdfBlob);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should reject invalid PDF header", async () => {
        const invalidPdfBlob = new Blob(["INVALID HEADER"], {
          type: "application/pdf",
        });

        const result = await PDFValidator.validatePDFBlob(invalidPdfBlob);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "Invalid PDF header - file may be corrupted",
        );
      });
    });

    describe("testPDFGeneration", () => {
      it("should successfully test PDF generation with sample content", async () => {
        const result = await PDFValidator.testPDFGeneration();

        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.validationResult).toBeDefined();
        expect(result.generatedSize).toBeGreaterThan(0);
      });
    });
  });

  describe("PDFConverter", () => {
    describe("validateHtmlContent", () => {
      it("should return false for empty content", () => {
        expect(PDFConverter.validateHtmlContent("")).toBe(false);
        expect(PDFConverter.validateHtmlContent("   ")).toBe(false);
      });

      it("should return true for valid HTML", () => {
        expect(PDFConverter.validateHtmlContent("<div>Test</div>")).toBe(true);
        expect(PDFConverter.validateHtmlContent("<p>Some text</p>")).toBe(true);
      });
    });

    describe("isSupported", () => {
      it("should return true in browser environment", () => {
        expect(PDFConverter.isSupported()).toBe(true);
      });
    });

    describe("generateFilename", () => {
      it("should generate default filename", () => {
        const filename = PDFConverter.generateFilename();
        expect(filename).toMatch(/^resume_\d{4}-\d{2}-\d{2}\.pdf$/);
      });

      it("should generate filename with user data", () => {
        const resumeData = {
          personalInfo: {
            name: "John Doe",
          },
        };
        const filename = PDFConverter.generateFilename(resumeData);
        expect(filename).toMatch(/^john_doe_\d{4}-\d{2}-\d{2}\.pdf$/);
      });

      it("should clean special characters from name", () => {
        const resumeData = {
          personalInfo: {
            name: "สมชาย ใจดี@#$%",
          },
        };
        const filename = PDFConverter.generateFilename(resumeData);
        expect(filename).toMatch(/^____\d{4}-\d{2}-\d{2}\.pdf$/);
      });
    });

    describe("convertToPDF", () => {
      it("should handle successful PDF conversion", async () => {
        const testHtml = "<div>Test Resume Content</div>";

        await expect(
          PDFConverter.convertToPDF(testHtml),
        ).resolves.toBeUndefined();

        expect(mockHtml2Pdf.set).toHaveBeenCalled();
        expect(mockHtml2Pdf.from).toHaveBeenCalled();
        expect(mockHtml2Pdf.save).toHaveBeenCalled();
      });

      it("should handle PDF conversion errors", async () => {
        mockHtml2Pdf.save.mockRejectedValueOnce(
          new Error("PDF generation failed"),
        );

        const testHtml = "<div>Test Content</div>";

        await expect(PDFConverter.convertToPDF(testHtml)).rejects.toThrow(
          "Failed to convert resume to PDF",
        );
      });

      it("should use fallback on conversion failure", async () => {
        mockHtml2Pdf.save.mockRejectedValueOnce(
          new Error("Primary conversion failed"),
        );

        const testHtml = "<div>Test Content</div>";

        // Should not throw error due to fallback
        await expect(
          PDFConverter.convertToPDF(testHtml),
        ).resolves.toBeUndefined();
      });
    });

    describe("convertToBlob", () => {
      it("should return PDF blob", async () => {
        const testHtml = "<div>Test Resume Content</div>";

        const blob = await PDFConverter.convertToBlob(testHtml);

        expect(blob).toBeInstanceOf(Blob);
        expect(blob.size).toBeGreaterThan(0);
      });

      it("should handle blob conversion errors", async () => {
        mockHtml2Pdf.outputPdf.mockRejectedValueOnce(
          new Error("Blob conversion failed"),
        );

        const testHtml = "<div>Test Content</div>";

        await expect(PDFConverter.convertToBlob(testHtml)).rejects.toThrow(
          "Failed to convert resume to PDF",
        );
      });
    });
  });

  describe("Integration Tests", () => {
    describe("Full PDF Generation Workflow", () => {
      it("should complete full workflow from HTML to PDF", async () => {
        const testHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>John Doe</h1>
            <h2>Software Engineer</h2>
            <p>Email: john.doe@example.com</p>
            <p>Phone: +1 (555) 123-4567</p>
            
            <h3>Experience</h3>
            <div>
              <h4>Senior Developer</h4>
              <p>Tech Company (2020 - Present)</p>
              <p>Developed web applications using React and Node.js</p>
            </div>
            
            <h3>Education</h3>
            <div>
              <h4>Bachelor of Computer Science</h4>
              <p>University of Technology (2016 - 2020)</p>
            </div>
            
            <h3>Skills</h3>
            <ul>
              <li>JavaScript</li>
              <li>TypeScript</li>
              <li>React</li>
              <li>Node.js</li>
            </ul>
          </div>
        `;

        // Step 1: Validate HTML content
        const validation = PDFValidator.validateHtmlContent(testHtml);
        expect(validation.isValid).toBe(true);
        expect(validation.contentAnalysis.hasContent).toBe(true);
        expect(validation.contentAnalysis.hasText).toBe(true);
        expect(validation.contentAnalysis.textLength).toBeGreaterThan(50);

        // Step 2: Generate PDF
        const blob = await PDFConverter.convertToBlob(testHtml);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.size).toBeGreaterThan(0);

        // Step 3: Validate generated PDF
        const pdfValidation = await PDFValidator.validatePDFBlob(blob);
        expect(pdfValidation.isValid).toBe(true);
        expect(pdfValidation.size).toBeGreaterThan(0);
      });

      it("should handle malformed HTML gracefully", async () => {
        const malformedHtml =
          "<div><p>Unclosed paragraph<span>Nested content</div>";

        const validation = PDFValidator.validateHtmlContent(malformedHtml);
        expect(validation.isValid).toBe(true); // Browser will fix malformed HTML
        expect(validation.contentAnalysis.hasContent).toBe(true);
      });

      it("should provide detailed error information on failure", async () => {
        const emptyHtml = "";

        const validation = PDFValidator.validateHtmlContent(emptyHtml);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain("HTML content is empty or null");
        expect(validation.contentAnalysis.hasContent).toBe(false);
      });
    });
  });
});

// Performance Tests
describe("PDF Generation Performance", () => {
  it("should handle large HTML content efficiently", async () => {
    const largeHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Large Resume</h1>
        ${Array.from(
          { length: 100 },
          (_, i) => `
          <div>
            <h3>Section ${i + 1}</h3>
            <p>This is a large amount of content to test performance. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
        `,
        ).join("")}
      </div>
    `;

    const startTime = Date.now();
    const validation = PDFValidator.validateHtmlContent(largeHtml);
    const endTime = Date.now();

    expect(validation.isValid).toBe(true);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
  });

  it("should detect performance warnings for very large content", async () => {
    const veryLargeHtml = "x".repeat(2 * 1024 * 1024); // 2MB of content

    const validation = PDFValidator.validateHtmlContent(
      `<div>${veryLargeHtml}</div>`,
    );

    expect(validation.warnings).toContain(
      "Large HTML content may cause PDF generation performance issues",
    );
  });
});
