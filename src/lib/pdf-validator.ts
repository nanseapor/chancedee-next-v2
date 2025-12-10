/**
 * PDF Generation Validator
 * Validates HTML content and PDF generation process
 */

export interface PDFValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  contentAnalysis: {
    hasContent: boolean;
    hasVisibleElements: boolean;
    hasText: boolean;
    hasImages: boolean;
    estimatedSize: number;
    elementCount: number;
    textLength: number;
  };
}

export class PDFValidator {
  /**
   * Comprehensive HTML content validation for PDF generation
   */
  static validateHtmlContent(htmlContent: string): PDFValidationResult {
    const result: PDFValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: [],
      contentAnalysis: {
        hasContent: false,
        hasVisibleElements: false,
        hasText: false,
        hasImages: false,
        estimatedSize: 0,
        elementCount: 0,
        textLength: 0,
      },
    };

    // Basic content validation
    if (!htmlContent || htmlContent.trim().length === 0) {
      result.errors.push("HTML content is empty or null");
      result.isValid = false;
      return result;
    }

    // Estimate content size
    result.contentAnalysis.estimatedSize = new Blob([htmlContent]).size;

    // Check for HTML structure
    if (!htmlContent.includes("<") || !htmlContent.includes(">")) {
      result.errors.push("Invalid HTML structure - no HTML tags found");
      result.isValid = false;
      return result;
    }

    // Create a temporary DOM element for analysis
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    // Analyze content
    this.analyzeContent(tempDiv, result);

    // Validate for PDF conversion
    this.validateForPDFConversion(tempDiv, result);

    // Generate recommendations
    this.generateRecommendations(result);

    return result;
  }

  /**
   * Analyze HTML content structure
   */
  private static analyzeContent(
    element: HTMLElement,
    result: PDFValidationResult,
  ): void {
    const allElements = element.querySelectorAll("*");
    result.contentAnalysis.elementCount = allElements.length;

    // Check for text content
    const textContent = element.textContent || element.innerText || "";
    result.contentAnalysis.textLength = textContent.trim().length;
    result.contentAnalysis.hasText = result.contentAnalysis.textLength > 0;

    // Check for visible elements
    const visibleElements = Array.from(allElements).filter((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0"
      );
    });
    result.contentAnalysis.hasVisibleElements = visibleElements.length > 0;

    // Check for images
    const images = element.querySelectorAll("img");
    result.contentAnalysis.hasImages = images.length > 0;

    // Check for basic content
    result.contentAnalysis.hasContent =
      result.contentAnalysis.hasText ||
      result.contentAnalysis.hasImages ||
      result.contentAnalysis.elementCount > 0;
  }

  /**
   * Validate content specifically for PDF conversion
   */
  private static validateForPDFConversion(
    element: HTMLElement,
    result: PDFValidationResult,
  ): void {
    // Check for problematic CSS properties
    const elementsWithProblematicStyles = element.querySelectorAll(
      '[style*="position: fixed"], [style*="position: absolute"], [style*="transform"]',
    );

    if (elementsWithProblematicStyles.length > 0) {
      result.warnings.push(
        `Found ${elementsWithProblematicStyles.length} elements with potentially problematic CSS (position: fixed/absolute, transforms)`,
      );
    }

    // Check for external resources
    const externalImages = element.querySelectorAll('img[src^="http"]');
    if (externalImages.length > 0) {
      result.warnings.push(
        `Found ${externalImages.length} external images that may not load in PDF`,
      );
    }

    // Check for missing content
    if (!result.contentAnalysis.hasText && !result.contentAnalysis.hasImages) {
      result.errors.push("No visible text or images found - PDF will be blank");
      result.isValid = false;
    }

    // Check for very small content
    if (result.contentAnalysis.textLength < 10) {
      result.warnings.push(
        "Very little text content - PDF may appear mostly empty",
      );
    }

    // Check for very large content
    if (result.contentAnalysis.estimatedSize > 1024 * 1024) {
      // 1MB
      result.warnings.push(
        "Large HTML content may cause PDF generation performance issues",
      );
    }
  }

  /**
   * Generate optimization recommendations
   */
  private static generateRecommendations(result: PDFValidationResult): void {
    if (!result.contentAnalysis.hasText) {
      result.recommendations.push("Add text content to make PDF more readable");
    }

    if (result.contentAnalysis.elementCount > 1000) {
      result.recommendations.push(
        "Consider simplifying HTML structure for better PDF performance",
      );
    }

    if (!result.contentAnalysis.hasVisibleElements) {
      result.recommendations.push(
        "Ensure elements are visible (check CSS display, visibility, opacity)",
      );
    }

    result.recommendations.push(
      "Use web-safe fonts for better PDF compatibility",
    );
    result.recommendations.push(
      "Avoid complex CSS layouts that may not render properly in PDF",
    );
  }

  /**
   * Validate PDF blob after generation
   */
  static async validatePDFBlob(blob: Blob): Promise<{
    isValid: boolean;
    size: number;
    errors: string[];
    warnings: string[];
  }> {
    const result = {
      isValid: true,
      size: blob.size,
      errors: [] as string[],
      warnings: [] as string[],
    };

    // Check blob size
    if (blob.size === 0) {
      result.errors.push("PDF blob is empty (0 bytes)");
      result.isValid = false;
      return result;
    }

    // Check for very small PDF (likely blank)
    if (blob.size < 1000) {
      // Less than 1KB
      result.warnings.push(
        "PDF is very small - may be blank or contain minimal content",
      );
    }

    // Check MIME type
    if (blob.type !== "application/pdf") {
      result.warnings.push(
        `Unexpected MIME type: ${blob.type}, expected: application/pdf`,
      );
    }

    // Basic PDF header validation
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Check PDF header (%PDF-)
      const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 5));
      if (!pdfHeader.startsWith("%PDF-")) {
        result.errors.push("Invalid PDF header - file may be corrupted");
        result.isValid = false;
      }

      // Check for EOF marker
      const endBytes = uint8Array.slice(-10);
      const endString = String.fromCharCode(...endBytes);
      if (!endString.includes("%%EOF")) {
        result.warnings.push("PDF may be incomplete - missing EOF marker");
      }
    } catch (error) {
      result.errors.push(`Error validating PDF structure: ${error}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Test PDF generation with sample content
   */
  static async testPDFGeneration(): Promise<{
    success: boolean;
    error?: string;
    validationResult?: PDFValidationResult;
    generatedSize?: number;
  }> {
    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #000;">
        <h1 style="color: #333;">Test Resume</h1>
        <h2 style="color: #666;">Personal Information</h2>
        <p><strong>Name:</strong> John Doe</p>
        <p><strong>Email:</strong> john.doe@example.com</p>
        <p><strong>Phone:</strong> +1 (555) 123-4567</p>
        
        <h2 style="color: #666;">Experience</h2>
        <div style="margin-bottom: 15px;">
          <h3 style="margin-bottom: 5px;">Software Engineer</h3>
          <p style="margin: 0; font-style: italic;">Tech Company</p>
          <p style="margin: 0; font-size: 14px; color: #666;">2020 - Present</p>
          <p>Developed web applications using React and Node.js</p>
        </div>

        <h2 style="color: #666;">Education</h2>
        <div style="margin-bottom: 15px;">
          <h3 style="margin-bottom: 5px;">Bachelor of Computer Science</h3>
          <p style="margin: 0; font-style: italic;">University of Technology</p>
          <p style="margin: 0; font-size: 14px; color: #666;">2016 - 2020</p>
        </div>

        <h2 style="color: #666;">Skills</h2>
        <ul>
          <li>JavaScript</li>
          <li>React</li>
          <li>Node.js</li>
          <li>TypeScript</li>
          <li>Python</li>
        </ul>
      </div>
    `;

    try {
      // Validate HTML content first
      const validationResult = this.validateHtmlContent(testHtml);

      if (!validationResult.isValid) {
        return {
          success: false,
          error: `HTML validation failed: ${validationResult.errors.join(", ")}`,
          validationResult,
        };
      }

      // Try to generate PDF
      const { PDFConverter } = await import("./pdf-converter");
      const blob = await PDFConverter.convertToBlob(testHtml);

      // Validate generated PDF
      const pdfValidation = await this.validatePDFBlob(blob);

      return {
        success: pdfValidation.isValid,
        error: pdfValidation.isValid
          ? undefined
          : pdfValidation.errors.join(", "),
        validationResult,
        generatedSize: blob.size,
      };
    } catch (error) {
      return {
        success: false,
        error: `PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

export default PDFValidator;
