/**
 * PDF Debug Helper
 * Utilities for debugging PDF generation issues
 */

import { PDFConverter } from "./pdf-converter";
import { PDFValidator } from "./pdf-validator";

export interface PDFDebugReport {
  timestamp: string;
  htmlContent: {
    original: string;
    cleaned: string;
    length: number;
    preview: string;
  };
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    contentAnalysis: any;
  };
  generation: {
    success: boolean;
    error?: string;
    pdfSize?: number;
    generationTime?: number;
  };
  recommendations: string[];
}

export class PDFDebugHelper {
  /**
   * Generate comprehensive debug report for PDF generation
   */
  static async generateDebugReport(
    htmlContent: string,
  ): Promise<PDFDebugReport> {
    const startTime = Date.now();

    const report: PDFDebugReport = {
      timestamp: new Date().toISOString(),
      htmlContent: {
        original: htmlContent,
        cleaned: "",
        length: htmlContent.length,
        preview: htmlContent.substring(0, 500),
      },
      validation: {
        isValid: false,
        errors: [],
        warnings: [],
        contentAnalysis: {},
      },
      generation: {
        success: false,
      },
      recommendations: [],
    };

    try {
      // Step 1: Validate HTML content
      const validation = PDFValidator.validateHtmlContent(htmlContent);
      report.validation = validation;

      // Step 2: Clean HTML content
      const cleanedHtml = this.cleanHtmlForDebug(htmlContent);
      report.htmlContent.cleaned = cleanedHtml;

      // Step 3: Attempt PDF generation
      if (validation.isValid) {
        try {
          const blob = await PDFConverter.convertToBlob(cleanedHtml);
          const endTime = Date.now();

          report.generation.success = true;
          report.generation.pdfSize = blob.size;
          report.generation.generationTime = endTime - startTime;

          // Step 4: Validate generated PDF
          const pdfValidation = await PDFValidator.validatePDFBlob(blob);
          if (!pdfValidation.isValid) {
            report.generation.success = false;
            report.generation.error = `Generated PDF validation failed: ${pdfValidation.errors.join(", ")}`;
          }
        } catch (error) {
          report.generation.success = false;
          report.generation.error =
            error instanceof Error ? error.message : "Unknown error";
        }
      } else {
        report.generation.success = false;
        report.generation.error = `HTML validation failed: ${validation.errors.join(", ")}`;
      }

      // Step 5: Generate recommendations
      report.recommendations = this.generateRecommendations(report);
    } catch (error) {
      report.generation.success = false;
      report.generation.error =
        error instanceof Error ? error.message : "Unknown error";
      report.recommendations = ["Fix the underlying error before proceeding"];
    }

    return report;
  }

  /**
   * Clean HTML content for debugging
   */
  private static cleanHtmlForDebug(htmlContent: string): string {
    // Remove problematic elements and attributes
    let cleaned = htmlContent;

    // Remove script tags
    cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

    // Remove style tags with complex CSS
    cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

    // Remove data attributes
    cleaned = cleaned.replace(/data-[^=]*="[^"]*"/gi, "");

    // Remove event handlers
    cleaned = cleaned.replace(/on\w+="[^"]*"/gi, "");

    // Ensure basic structure
    if (!cleaned.includes("<html") && !cleaned.includes("<body")) {
      cleaned = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
              h1, h2, h3 { color: #333; margin-bottom: 10px; }
              p { margin-bottom: 8px; line-height: 1.5; }
              ul, ol { margin-bottom: 10px; }
              li { margin-bottom: 4px; }
            </style>
          </head>
          <body>
            ${cleaned}
          </body>
        </html>
      `;
    }

    return cleaned;
  }

  /**
   * Generate recommendations based on debug report
   */
  private static generateRecommendations(report: PDFDebugReport): string[] {
    const recommendations: string[] = [];

    // HTML content recommendations
    if (report.htmlContent.length === 0) {
      recommendations.push("Add HTML content - the content is empty");
    } else if (report.htmlContent.length < 100) {
      recommendations.push(
        "Add more content - very short content may result in blank PDF",
      );
    }

    // Validation recommendations
    if (!report.validation.isValid) {
      recommendations.push("Fix HTML validation errors before generating PDF");
      report.validation.errors.forEach((error) => {
        recommendations.push(`- Fix: ${error}`);
      });
    }

    // Content analysis recommendations
    const analysis = report.validation.contentAnalysis;
    if (analysis) {
      if (!analysis.hasText) {
        recommendations.push(
          "Add text content - PDF needs visible text to be meaningful",
        );
      }

      if (!analysis.hasVisibleElements) {
        recommendations.push(
          "Ensure elements are visible (check CSS display, visibility, opacity)",
        );
      }

      if (analysis.textLength < 50) {
        recommendations.push("Add more text content for a complete resume");
      }
    }

    // Generation recommendations
    if (!report.generation.success) {
      recommendations.push("Fix PDF generation error before proceeding");
      if (report.generation.error) {
        recommendations.push(`- Error: ${report.generation.error}`);
      }
    }

    // Performance recommendations
    if (
      report.generation.generationTime &&
      report.generation.generationTime > 10000
    ) {
      recommendations.push(
        "Consider optimizing HTML content - generation is slow",
      );
    }

    // PDF size recommendations
    if (report.generation.pdfSize && report.generation.pdfSize < 1000) {
      recommendations.push(
        "PDF is very small - check if content is properly rendered",
      );
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        "PDF generation looks good! Consider testing with different content types",
      );
    }

    return recommendations;
  }

  /**
   * Test PDF generation with various content types
   */
  static async runComprehensiveTest(): Promise<{
    testResults: Array<{
      name: string;
      success: boolean;
      error?: string;
      pdfSize?: number;
      generationTime?: number;
    }>;
    overallSuccess: boolean;
  }> {
    const testCases = [
      {
        name: "Empty Content",
        html: "",
      },
      {
        name: "Plain Text",
        html: "Just plain text without HTML tags",
      },
      {
        name: "Simple HTML",
        html: "<div>Simple HTML content</div>",
      },
      {
        name: "Basic Resume",
        html: `
          <div>
            <h1>John Doe</h1>
            <p>Software Engineer</p>
            <p>Email: john@example.com</p>
          </div>
        `,
      },
      {
        name: "Complex Resume",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Jane Smith</h1>
            <h2>Senior Software Engineer</h2>
            <p>Email: jane@example.com | Phone: (555) 123-4567</p>
            
            <h3>Experience</h3>
            <div>
              <h4>Lead Developer</h4>
              <p>Tech Company (2020 - Present)</p>
              <ul>
                <li>Led team of 5 developers</li>
                <li>Implemented microservices architecture</li>
                <li>Improved system performance by 40%</li>
              </ul>
            </div>
            
            <h3>Education</h3>
            <div>
              <h4>MS Computer Science</h4>
              <p>University of Technology (2018 - 2020)</p>
            </div>
            
            <h3>Skills</h3>
            <ul>
              <li>JavaScript, TypeScript</li>
              <li>React, Vue.js</li>
              <li>Node.js, Python</li>
              <li>AWS, Docker</li>
            </ul>
          </div>
        `,
      },
      {
        name: "HTML with Images",
        html: `
          <div>
            <h1>Resume with Image</h1>
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNzNlNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGhvdG88L3RleHQ+PC9zdmc+" alt="Profile Photo" style="width: 100px; height: 100px;">
            <h2>John Doe</h2>
            <p>Software Engineer</p>
          </div>
        `,
      },
    ];

    const testResults = [];
    let overallSuccess = true;

    for (const testCase of testCases) {
      const startTime = Date.now();

      try {
        const report = await this.generateDebugReport(testCase.html);
        const endTime = Date.now();

        testResults.push({
          name: testCase.name,
          success: report.generation.success,
          error: report.generation.error,
          pdfSize: report.generation.pdfSize,
          generationTime: endTime - startTime,
        });

        if (!report.generation.success) {
          overallSuccess = false;
        }
      } catch (error) {
        testResults.push({
          name: testCase.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          generationTime: Date.now() - startTime,
        });
        overallSuccess = false;
      }
    }

    return {
      testResults,
      overallSuccess,
    };
  }

  /**
   * Log debug report in a readable format
   */
  static logDebugReport(report: PDFDebugReport): void {
    console.group("📄 PDF Generation Debug Report");
    console.log("🕐 Timestamp:", report.timestamp);

    console.group("📝 HTML Content");
    console.log("Length:", report.htmlContent.length);
    console.log("Preview:", report.htmlContent.preview);
    console.groupEnd();

    console.group("✅ Validation");
    console.log("Is Valid:", report.validation.isValid);
    if (report.validation.errors.length > 0) {
      console.error("Errors:", report.validation.errors);
    }
    if (report.validation.warnings.length > 0) {
      console.warn("Warnings:", report.validation.warnings);
    }
    console.log("Content Analysis:", report.validation.contentAnalysis);
    console.groupEnd();

    console.group("🔄 Generation");
    console.log("Success:", report.generation.success);
    if (report.generation.error) {
      console.error("Error:", report.generation.error);
    }
    if (report.generation.pdfSize) {
      console.log("PDF Size:", report.generation.pdfSize, "bytes");
    }
    if (report.generation.generationTime) {
      console.log("Generation Time:", report.generation.generationTime, "ms");
    }
    console.groupEnd();

    console.group("💡 Recommendations");
    report.recommendations.forEach((rec) => console.log("•", rec));
    console.groupEnd();

    console.groupEnd();
  }
}

export default PDFDebugHelper;
