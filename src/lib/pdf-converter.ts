/**
 * PDF Converter Utility
 * Converts HTML resume content to PDF using html2pdf.js
 */

export interface PDFOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  format?: "a4" | "letter" | "a3" | "a5";
  orientation?: "portrait" | "landscape";
  quality?: number;
  enableLinks?: boolean;
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    letterRendering?: boolean;
  };
  jsPDF?: {
    unit?: "mm" | "cm" | "in" | "px";
    format?: string;
    orientation?: "portrait" | "landscape";
  };
}

export class PDFConverter {
  private static defaultOptions: PDFOptions = {
    margin: [10, 10, 10, 10], // Top, Right, Bottom, Left in mm
    format: "a4",
    orientation: "portrait",
    quality: 2,
    enableLinks: true,
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  };

  /**
   * Convert HTML content to PDF and download
   */
  static async convertToPDF(
    htmlContent: string,
    options: PDFOptions = {},
  ): Promise<void> {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined" || typeof document === "undefined") {
        throw new Error("PDF conversion is only available in the browser");
      }

      // Enhanced debug logging
      if (process.env.NODE_ENV === "development") {
        console.log("PDF Generation Debug Info:");
        console.log("- Original HTML length:", htmlContent.length);
        console.log("- HTML preview:", htmlContent.substring(0, 500));
      }

      // Try to load html2pdf - handle chunk loading errors
      let html2pdf;
      try {
        const html2pdfModule = await import("html2pdf.js");
        html2pdf = html2pdfModule.default;
      } catch (importError) {
        console.error("Failed to load html2pdf.js:", importError);
        throw new Error(
          "PDF library failed to load. Please refresh the page and try again.",
        );
      }

      if (!html2pdf) {
        throw new Error(
          "PDF library is not available. Please check your internet connection.",
        );
      }

      const mergedOptions = { ...this.defaultOptions, ...options };

      // Create a temporary container for the HTML content
      const container = document.createElement("div");

      // Clean and prepare HTML content
      const cleanHtml = this.cleanHtmlForPdf(htmlContent);
      container.innerHTML = cleanHtml;

      // Verify container has content
      if (!container.textContent && !container.innerHTML) {
        throw new Error("Container is empty after HTML processing");
      }

      // Enhanced debug logging
      if (process.env.NODE_ENV === "development") {
        console.log("Container Debug Info:");
        console.log(
          "- Container innerHTML length:",
          container.innerHTML.length,
        );
        console.log(
          "- Container textContent length:",
          container.textContent?.length || 0,
        );
        console.log(
          "- Container preview:",
          container.innerHTML.substring(0, 300),
        );
      }

      // Enhanced container styling for PDF with better visibility
      container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 794px;
        min-height: 1123px;
        background: #ffffff;
        padding: 40px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #000000;
        box-sizing: border-box;
        overflow: visible;
        display: block;
      `;

      document.body.appendChild(container);

      // Enhanced debug logging for content verification
      if (process.env.NODE_ENV === "development") {
        console.log("Container Debug After Styling:");
        console.log("- Container scrollHeight:", container.scrollHeight);
        console.log("- Container scrollWidth:", container.scrollWidth);
        console.log(
          "- Container textContent length:",
          container.textContent?.length || 0,
        );
        console.log(
          "- Container first 200 chars:",
          container.textContent?.substring(0, 200) || "NO TEXT",
        );
      }

      // Wait longer for content to be rendered and fonts to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify content exists and is visible
      const textContent = container.textContent || container.innerText || "";
      if (textContent.trim().length < 10) {
        console.warn("Very little text content detected:", textContent);
        throw new Error(
          "No sufficient content found for PDF generation. Please ensure your resume has text content.",
        );
      }

      // Check for invisible elements (common cause of blank PDFs)
      const hasVisibleContent =
        container.scrollHeight > 50 && container.scrollWidth > 100;
      if (!hasVisibleContent) {
        console.warn("Container appears to have no visible content:", {
          scrollHeight: container.scrollHeight,
          scrollWidth: container.scrollWidth,
          innerHTML: container.innerHTML.substring(0, 200),
        });
        throw new Error(
          "Content is not visible for PDF generation. Please check your resume content.",
        );
      }

      // Enhanced PDF options for better content rendering
      const pdfOptions = {
        margin: [20, 20, 20, 20] as [number, number, number, number],
        filename: mergedOptions.filename || `resume-${Date.now()}.pdf`,
        image: {
          type: "jpeg" as const,
          quality: 0.95,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: true,
          letterRendering: true,
          width: 794,
          height: 1123,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
          windowHeight: 1123,
        },
        jsPDF: {
          unit: "mm" as const,
          format: "a4",
          orientation: "portrait" as const,
          compress: true,
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
          before: ".page-break-before",
          after: ".page-break-after",
        },
      };

      // Try image-based PDF generation first (more reliable)
      console.log("Attempting image-based PDF generation...");
      document.body.removeChild(container); // Clean up early

      try {
        const { PDFImageConverter } = await import("./pdf-image-converter");
        await PDFImageConverter.convertToPDF(htmlContent, {
          filename: mergedOptions.filename || `resume-${Date.now()}.pdf`,
          quality: 0.95,
          scale: 2,
        });
        console.log("Image-based PDF generation completed successfully");
        return; // Success, exit early
      } catch (imageError) {
        console.warn(
          "Image-based PDF generation failed, falling back to html2pdf:",
          imageError,
        );

        // Recreate container for html2pdf fallback
        const fallbackContainer = document.createElement("div");
        fallbackContainer.innerHTML = cleanHtml;
        fallbackContainer.style.cssText = container.style.cssText;
        document.body.appendChild(fallbackContainer);

        // Generate PDF directly with html2pdf as fallback
        console.log("Starting html2pdf fallback generation...");
        await html2pdf().set(pdfOptions).from(fallbackContainer).save();

        document.body.removeChild(fallbackContainer);
        console.log("HTML2PDF fallback generation completed successfully");
      }
    } catch (error) {
      console.error("PDF conversion failed:", error);

      // Try fallback simple conversion
      try {
        console.log("Attempting fallback PDF conversion...");
        await this.simpleFallbackPDF(
          htmlContent,
          options.filename || `resume-${Date.now()}.pdf`,
        );
      } catch (fallbackError) {
        console.error("Fallback PDF conversion also failed:", fallbackError);
        throw new Error(
          "Failed to convert resume to PDF. Please refresh the page and try again.",
        );
      }
    }
  }

  /**
   * Convert HTML element to PDF and download
   */
  static async convertElementToPDF(
    element: HTMLElement,
    options: PDFOptions = {},
  ): Promise<void> {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined" || typeof document === "undefined") {
        throw new Error("PDF conversion is only available in the browser");
      }

      // Dynamically import html2pdf to avoid SSR issues
      const { default: html2pdf } = await import("html2pdf.js");

      const mergedOptions = { ...this.defaultOptions, ...options };

      // Clone the element to avoid modifying the original
      const clonedElement = element.cloneNode(true) as HTMLElement;
      clonedElement.style.position = "absolute";
      clonedElement.style.left = "-9999px";
      clonedElement.style.top = "-9999px";
      clonedElement.style.width = "210mm"; // A4 width
      clonedElement.style.backgroundColor = "white";

      // Apply resume-specific styles
      this.applyResumeStyles(clonedElement);

      document.body.appendChild(clonedElement);

      const pdfOptions = {
        margin: mergedOptions.margin,
        filename: mergedOptions.filename || `resume-${Date.now()}.pdf`,
        image: {
          type: "jpeg" as const,
          quality: mergedOptions.quality || 0.98,
        },
        html2canvas: {
          scale: mergedOptions.html2canvas?.scale || 2,
          useCORS: mergedOptions.html2canvas?.useCORS || true,
          letterRendering: mergedOptions.html2canvas?.letterRendering || true,
        },
        jsPDF: {
          unit: mergedOptions.jsPDF?.unit || "mm",
          format: mergedOptions.format || "a4",
          orientation: mergedOptions.orientation || "portrait",
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(pdfOptions).from(clonedElement).save();

      // Clean up
      document.body.removeChild(clonedElement);
    } catch (error) {
      console.error("PDF conversion failed:", error);
      throw new Error("Failed to convert resume to PDF. Please try again.");
    }
  }

  /**
   * Get PDF as blob (for further processing)
   */
  static async convertToBlob(
    htmlContent: string,
    options: PDFOptions = {},
  ): Promise<Blob> {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined" || typeof document === "undefined") {
        throw new Error("PDF conversion is only available in the browser");
      }

      // Try to load html2pdf - handle chunk loading errors
      let html2pdf;
      try {
        const html2pdfModule = await import("html2pdf.js");
        html2pdf = html2pdfModule.default;
      } catch (importError) {
        console.error("Failed to load html2pdf.js:", importError);
        throw new Error(
          "PDF library failed to load. Please refresh the page and try again.",
        );
      }

      if (!html2pdf) {
        throw new Error(
          "PDF library is not available. Please check your internet connection.",
        );
      }

      const mergedOptions = { ...this.defaultOptions, ...options };

      const container = document.createElement("div");
      container.innerHTML = htmlContent;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "210mm";
      container.style.backgroundColor = "white";
      container.style.padding = "20px";

      this.applyResumeStyles(container);
      document.body.appendChild(container);

      const pdfOptions = {
        margin: mergedOptions.margin,
        image: {
          type: "jpeg" as const,
          quality: mergedOptions.quality || 0.98,
        },
        html2canvas: {
          scale: mergedOptions.html2canvas?.scale || 2,
          useCORS: mergedOptions.html2canvas?.useCORS || true,
          letterRendering: mergedOptions.html2canvas?.letterRendering || true,
        },
        jsPDF: {
          unit: mergedOptions.jsPDF?.unit || "mm",
          format: mergedOptions.format || "a4",
          orientation: mergedOptions.orientation || "portrait",
        },
      };

      const pdfBlob = await html2pdf()
        .set(pdfOptions)
        .from(container)
        .outputPdf("blob");

      document.body.removeChild(container);

      return pdfBlob;
    } catch (error) {
      console.error("PDF conversion failed:", error);
      throw new Error("Failed to convert resume to PDF. Please try again.");
    }
  }

  /**
   * Simple fallback: Create basic HTML download when PDF conversion fails
   */
  private static async simpleFallbackPDF(
    htmlContent: string,
    filename: string,
  ): Promise<void> {
    console.log("Using simple fallback - downloading as HTML instead of PDF");

    // Clean the HTML content for better readability
    const cleanContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

    // Create a complete HTML document for download
    const fullHtmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resume</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  background: white;
              }
              h1, h2, h3 { color: #2c3e50; margin-top: 20px; }
              h1 { font-size: 28px; margin-bottom: 10px; }
              h2 { font-size: 22px; margin-bottom: 8px; }
              h3 { font-size: 18px; margin-bottom: 6px; }
              p { margin-bottom: 8px; }
              ul { margin-bottom: 12px; }
              li { margin-bottom: 4px; }
              .section { margin-bottom: 25px; }
              @media print {
                  body { margin: 0; padding: 15mm; }
                  .no-print { display: none; }
              }
          </style>
      </head>
      <body>
          <div class="no-print" style="background: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #007bff;">
              <strong>Note:</strong> PDF generation is temporarily unavailable. This HTML version can be printed using your browser's print function (Ctrl+P or Cmd+P).
          </div>
          ${cleanContent}
      </body>
      </html>
    `;

    // Create and download the HTML file
    const blob = new Blob([fullHtmlContent], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(".pdf", ".html");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("HTML file downloaded successfully as fallback");
  }

  /**
   * Clean HTML content for PDF conversion
   */
  private static cleanHtmlForPdf(htmlContent: string): string {
    // Start with original content
    let cleanHtml = htmlContent;

    // Remove problematic elements that don't render in PDF
    cleanHtml = cleanHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    cleanHtml = cleanHtml.replace(/<link[^>]*>/gi, "");
    cleanHtml = cleanHtml.replace(/<meta[^>]*>/gi, "");

    // Remove problematic CSS that might cause blank rendering
    cleanHtml = cleanHtml.replace(/backdrop-filter:[^;]*;/gi, "");
    cleanHtml = cleanHtml.replace(/filter:[^;]*blur[^;]*;/gi, "");
    cleanHtml = cleanHtml.replace(/transform:[^;]*;/gi, "");

    // Convert CSS classes to inline styles for better PDF rendering
    cleanHtml = this.convertCommonClassesToInlineStyles(cleanHtml);

    // Ensure minimum content structure with visible styles
    if (!cleanHtml.includes("<html") && !cleanHtml.includes("<body")) {
      cleanHtml = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #000000; background: #ffffff; width: 100%; min-height: 200px; padding: 20px;">
          ${cleanHtml}
        </div>
      `;
    }

    // Add fallback content if HTML is too minimal
    if (cleanHtml.length < 100) {
      cleanHtml = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #000000; background: #ffffff; width: 100%; min-height: 200px; padding: 20px;">
          <h1 style="color: #333;">Resume</h1>
          <p style="color: #666;">เนื้อหา Resume ของคุณ</p>
          ${cleanHtml}
        </div>
      `;
    }

    return cleanHtml;
  }

  /**
   * Convert common CSS classes to inline styles for better PDF rendering
   */
  private static convertCommonClassesToInlineStyles(
    htmlContent: string,
  ): string {
    let content = htmlContent;

    // Common class conversions
    const classConversions = [
      { class: "font-bold", style: "font-weight: bold;" },
      { class: "font-semibold", style: "font-weight: 600;" },
      { class: "font-medium", style: "font-weight: 500;" },
      { class: "text-lg", style: "font-size: 18px;" },
      { class: "text-xl", style: "font-size: 20px;" },
      { class: "text-2xl", style: "font-size: 24px;" },
      { class: "text-sm", style: "font-size: 14px;" },
      { class: "text-xs", style: "font-size: 12px;" },
      { class: "text-gray-600", style: "color: #666666;" },
      { class: "text-gray-500", style: "color: #999999;" },
      { class: "text-gray-900", style: "color: #111111;" },
      { class: "text-blue-600", style: "color: #2563eb;" },
      { class: "mb-2", style: "margin-bottom: 8px;" },
      { class: "mb-4", style: "margin-bottom: 16px;" },
      { class: "mb-6", style: "margin-bottom: 24px;" },
      { class: "mt-2", style: "margin-top: 8px;" },
      { class: "mt-4", style: "margin-top: 16px;" },
      { class: "p-2", style: "padding: 8px;" },
      { class: "p-4", style: "padding: 16px;" },
      { class: "px-4", style: "padding-left: 16px; padding-right: 16px;" },
      { class: "py-2", style: "padding-top: 8px; padding-bottom: 8px;" },
    ];

    // Apply conversions
    for (const conversion of classConversions) {
      const regex = new RegExp(
        `class="([^"]*\\s)?${conversion.class}(\\s[^"]*)?"`,
      );
      content = content.replace(regex, (match, before, after) => {
        const existingStyle = content.match(/style="([^"]*)"/);
        const newStyle = existingStyle
          ? `${existingStyle[1]}${conversion.style}`
          : conversion.style;
        return (
          match
            .replace(/style="[^"]*"/, `style="${newStyle}"`)
            .replace(/style="/, `style="${conversion.style}`) ||
          `${match} style="${conversion.style}"`
        );
      });
    }

    return content;
  }

  /**
   * Apply resume-specific styles for better PDF output
   */
  private static applyResumeStyles(container: HTMLElement): void {
    // Add CSS styles for better PDF rendering
    const style = document.createElement("style");
    style.textContent = `
      /* PDF-specific styles */
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      /* Container styles */
      .pdf-container {
        width: 100%;
        max-width: 794px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #000;
        background-color: white;
      }
      
      /* Typography */
      h1, h2, h3, h4, h5, h6 {
        margin-top: 0;
        margin-bottom: 12px;
        font-weight: bold;
        color: #000;
        page-break-after: avoid;
      }
      
      h1 { font-size: 28px; margin-bottom: 8px; }
      h2 { font-size: 22px; margin-bottom: 10px; }
      h3 { font-size: 18px; margin-bottom: 8px; }
      h4 { font-size: 16px; margin-bottom: 6px; }
      
      p {
        margin-top: 0;
        margin-bottom: 10px;
        color: #000;
        word-wrap: break-word;
      }
      
      /* Content sections */
      .section {
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      
      .section-title {
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 10px;
        color: #000;
        border-bottom: 2px solid #333;
        padding-bottom: 5px;
      }
      
      /* Experience, Education, Projects */
      .experience-item,
      .education-item,
      .project-item {
        margin-bottom: 15px;
        page-break-inside: avoid;
      }
      
      .job-title,
      .degree-title,
      .project-title {
        font-weight: bold;
        font-size: 16px;
        color: #000;
        margin-bottom: 4px;
      }
      
      .company-name,
      .institution-name {
        font-style: italic;
        color: #333;
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .date-range {
        color: #666;
        font-size: 12px;
        margin-bottom: 6px;
      }
      
      /* Skills */
      .skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 10px;
      }
      
      .skill-item {
        background-color: #f0f0f0;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #000;
        border: 1px solid #ddd;
      }
      
      /* Lists */
      ul, ol {
        margin-top: 0;
        margin-bottom: 10px;
        padding-left: 20px;
      }
      
      li {
        margin-bottom: 5px;
        color: #000;
        line-height: 1.4;
      }
      
      /* Contact info */
      .contact-info {
        margin-bottom: 20px;
      }
      
      .contact-item {
        display: inline-block;
        margin-right: 20px;
        margin-bottom: 5px;
        font-size: 14px;
      }
      
      /* Ensure visibility */
      div, span, p, h1, h2, h3, h4, h5, h6 {
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
      }
      
      /* Inline elements */
      span, strong, em, a {
        display: inline !important;
      }
      
      /* Remove any hidden elements */
      [hidden] {
        display: none !important;
      }
      
      /* Ensure proper page breaks */
      .page-break {
        page-break-before: always;
      }
      
      .no-break {
        page-break-inside: avoid;
      }
      
      /* Tables */
      table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 16px;
      }
      
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      
      th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
    `;

    container.appendChild(style);

    // Add a wrapper class to the container
    container.classList.add("pdf-container");
  }

  /**
   * Generate filename based on resume data
   */
  static generateFilename(resumeData?: any): string {
    const timestamp = new Date().toISOString().split("T")[0];
    const name = resumeData?.personalInfo?.name || "resume";
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    return `${cleanName}_${timestamp}.pdf`;
  }

  /**
   * Validate HTML content before conversion
   */
  static validateHtmlContent(htmlContent: string): boolean {
    if (!htmlContent || htmlContent.trim().length === 0) {
      return false;
    }

    // Basic HTML validation
    const hasContent = htmlContent.includes("<") && htmlContent.includes(">");
    return hasContent;
  }

  /**
   * Get PDF conversion status
   */
  static isSupported(): boolean {
    // Check if the browser supports the necessary APIs
    return (
      typeof window !== "undefined" &&
      typeof document !== "undefined" &&
      "createElement" in document
    );
  }
}

export default PDFConverter;
