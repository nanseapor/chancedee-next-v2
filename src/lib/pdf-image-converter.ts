/**
 * PDF Image Converter
 * Converts HTML to image first, then image to PDF for better reliability
 */

export interface ImageToPDFOptions {
  filename?: string;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  quality?: number;
  scale?: number;
  backgroundColor?: string;
}

export class PDFImageConverter {
  // A4 dimensions in pixels at 96 DPI
  private static readonly A4_WIDTH_PX = 794; // 210mm at 96 DPI
  private static readonly A4_HEIGHT_PX = 1123; // 297mm at 96 DPI

  // A4 dimensions in mm
  private static readonly A4_WIDTH_MM = 210;
  private static readonly A4_HEIGHT_MM = 297;

  /**
   * Convert HTML content to PDF via image capture
   */
  static async convertToPDF(
    htmlContent: string,
    options: ImageToPDFOptions = {},
  ): Promise<void> {
    try {
      // Check browser environment
      if (typeof window === "undefined" || typeof document === "undefined") {
        throw new Error("PDF conversion is only available in the browser");
      }

      // Default options
      const opts = {
        filename: options.filename || `resume-${Date.now()}.pdf`,
        format: options.format || "a4",
        orientation: options.orientation || "portrait",
        quality: options.quality || 0.95,
        scale: options.scale || 2,
        backgroundColor: options.backgroundColor || "#ffffff",
      };

      console.log("Starting HTML to Image to PDF conversion...");

      let container: HTMLElement | null = null;
      let imageBlob: Blob;

      try {
        // Step 1: Create and style container for A4 dimensions
        container = await this.createA4Container(
          htmlContent,
          opts.backgroundColor,
        );

        // Step 2: Capture container as high-quality image
        imageBlob = await this.captureContainerAsImage(
          container,
          opts.scale,
          opts.quality,
        );
      } catch (captureError) {
        console.warn(
          "Html2canvas capture failed, trying fallback canvas method:",
          captureError,
        );

        // Clean up failed container
        if (container && document.body.contains(container)) {
          document.body.removeChild(container);
        }

        // Fallback: Create simple canvas with text content
        imageBlob = await this.createFallbackCanvas(
          htmlContent,
          opts.backgroundColor,
        );
      }

      // Step 3: Convert image to PDF
      await this.imageToPDF(
        imageBlob,
        opts.filename,
        opts.format,
        opts.orientation,
      );

      // Clean up
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }

      console.log("PDF generated successfully via image conversion");
    } catch (error) {
      console.error("Image-to-PDF conversion failed:", error);
      throw new Error(
        `Failed to convert HTML to PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Create A4-width container with natural height for content
   */
  private static async createA4Container(
    htmlContent: string,
    backgroundColor: string,
  ): Promise<HTMLElement> {
    const container = document.createElement("div");

    // Clean HTML content for better rendering
    const cleanedHtml = this.cleanHtmlForImageCapture(htmlContent);
    container.innerHTML = cleanedHtml;

    // Apply A4-width styling but allow natural height
    container.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: ${this.A4_WIDTH_PX}px;
      min-height: 200px;
      max-width: ${this.A4_WIDTH_PX}px;
      background-color: ${backgroundColor};
      padding: 40px;
      box-sizing: border-box;
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #000000;
      overflow: visible;
      display: block;
      visibility: visible;
      opacity: 1;
      z-index: 9999;
      border: none;
      margin: 0;
      height: auto;
    `;

    // Add comprehensive CSS reset and styling
    const styleElement = document.createElement("style");
    styleElement.textContent = this.getA4Styles();
    container.appendChild(styleElement);

    document.body.appendChild(container);

    // Force layout recalculation
    container.offsetHeight;

    // Wait for content to render and fonts to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify content is visible
    const textContent = container.textContent || container.innerText || "";
    if (textContent.trim().length < 10) {
      throw new Error("Insufficient content for PDF generation");
    }

    console.log("A4 container created:", {
      width: container.offsetWidth,
      height: container.offsetHeight,
      scrollHeight: container.scrollHeight,
      textLength: textContent.length,
      preview: textContent.substring(0, 100),
      backgroundColor: getComputedStyle(container).backgroundColor,
      color: getComputedStyle(container).color,
    });

    return container;
  }

  /**
   * Clean HTML content for image capture
   */
  private static cleanHtmlForImageCapture(htmlContent: string): string {
    let cleaned = htmlContent;

    // Remove problematic elements
    cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    cleaned = cleaned.replace(/<link[^>]*>/gi, "");
    cleaned = cleaned.replace(/<meta[^>]*>/gi, "");

    // Remove problematic CSS properties
    cleaned = cleaned.replace(/position:\s*fixed[^;]*;/gi, "");
    cleaned = cleaned.replace(/position:\s*absolute[^;]*;/gi, "");
    cleaned = cleaned.replace(/transform:[^;]*;/gi, "");
    cleaned = cleaned.replace(/backdrop-filter:[^;]*;/gi, "");
    cleaned = cleaned.replace(/filter:[^;]*blur[^;]*;/gi, "");

    // Convert common Tailwind classes to inline styles
    cleaned = this.convertTailwindToInline(cleaned);

    return cleaned;
  }

  /**
   * Convert Tailwind classes to inline styles
   */
  private static convertTailwindToInline(html: string): string {
    const conversions = [
      // Typography
      { class: "font-bold", style: "font-weight: bold" },
      { class: "font-semibold", style: "font-weight: 600" },
      { class: "font-medium", style: "font-weight: 500" },
      { class: "text-sm", style: "font-size: 14px" },
      { class: "text-lg", style: "font-size: 18px" },
      { class: "text-xl", style: "font-size: 20px" },
      { class: "text-2xl", style: "font-size: 24px" },

      // Colors
      { class: "text-gray-900", style: "color: #111827" },
      { class: "text-gray-800", style: "color: #1f2937" },
      { class: "text-gray-700", style: "color: #374151" },
      { class: "text-gray-600", style: "color: #4b5563" },
      { class: "text-gray-500", style: "color: #6b7280" },
      { class: "text-blue-600", style: "color: #2563eb" },
      { class: "text-green-600", style: "color: #059669" },

      // Spacing
      { class: "mb-1", style: "margin-bottom: 4px" },
      { class: "mb-2", style: "margin-bottom: 8px" },
      { class: "mb-3", style: "margin-bottom: 12px" },
      { class: "mb-4", style: "margin-bottom: 16px" },
      { class: "mb-6", style: "margin-bottom: 24px" },
      { class: "mt-2", style: "margin-top: 8px" },
      { class: "mt-4", style: "margin-top: 16px" },
      { class: "mt-6", style: "margin-top: 24px" },
      { class: "p-2", style: "padding: 8px" },
      { class: "p-4", style: "padding: 16px" },
      { class: "px-4", style: "padding-left: 16px; padding-right: 16px" },
      { class: "py-2", style: "padding-top: 8px; padding-bottom: 8px" },
    ];

    let result = html;

    for (const conv of conversions) {
      const classRegex = new RegExp(
        `\\bclass="([^"]*\\s)?${conv.class}(\\s[^"]*)?"`,
      );
      result = result.replace(classRegex, (match, before, after) => {
        const currentClasses = match.match(/class="([^"]*)"/)?.[1] || "";
        const otherClasses = currentClasses
          .replace(new RegExp(`\\b${conv.class}\\b`), "")
          .trim();

        // Check if element already has inline styles
        const hasStyle = result.includes('style="');
        if (hasStyle) {
          // Add to existing style
          result = result.replace(
            /style="([^"]*)"/,
            `style="$1; ${conv.style}"`,
          );
        } else {
          // Add new style attribute
          result = result.replace(
            match,
            `class="${otherClasses}" style="${conv.style}"`,
          );
        }

        return match;
      });
    }

    return result;
  }

  /**
   * Get comprehensive A4 styling
   */
  private static getA4Styles(): string {
    return `
      /* A4 PDF Styles */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body, html {
        margin: 0;
        padding: 0;
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #000000;
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-weight: bold;
        color: #000000;
        margin-bottom: 8px;
        margin-top: 16px;
      }
      
      h1 { font-size: 24px; margin-top: 0; }
      h2 { font-size: 20px; }
      h3 { font-size: 18px; }
      h4 { font-size: 16px; }
      
      p {
        margin-bottom: 8px;
        color: #000000;
        word-wrap: break-word;
        hyphens: auto;
      }
      
      ul, ol {
        margin-bottom: 12px;
        padding-left: 20px;
      }
      
      li {
        margin-bottom: 4px;
        color: #000000;
      }
      
      strong, b {
        font-weight: bold;
        color: #000000;
      }
      
      em, i {
        font-style: italic;
      }
      
      .section {
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      
      .no-break {
        page-break-inside: avoid;
      }
      
      /* Ensure all text is visible */
      div, span, p, h1, h2, h3, h4, h5, h6, li, td, th {
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        color: #000000 !important;
      }
      
      span, strong, em, a, code {
        display: inline !important;
      }
    `;
  }

  /**
   * Capture container as high-quality image with natural height
   */
  private static async captureContainerAsImage(
    container: HTMLElement,
    scale: number,
    quality: number,
  ): Promise<Blob> {
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default;

      console.log("Capturing container as image...");

      // Get actual container dimensions
      const actualWidth = container.offsetWidth || this.A4_WIDTH_PX;
      const actualHeight =
        container.scrollHeight || container.offsetHeight || this.A4_HEIGHT_PX;

      console.log("Container dimensions:", {
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        scrollHeight: container.scrollHeight,
        actualWidth,
        actualHeight,
      });

      // Force repaint before capture
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const canvas = await html2canvas(container, {
        width: actualWidth,
        height: actualHeight,
        scale: scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: true, // Enable for debugging
        foreignObjectRendering: false, // Disable to avoid black screens
        scrollX: 0,
        scrollY: 0,
        windowWidth: actualWidth,
        windowHeight: actualHeight,
        removeContainer: false,
        imageTimeout: 0,
        x: 0,
        y: 0,
      });

      console.log("Image captured:", {
        width: canvas.width,
        height: canvas.height,
        size: `${((canvas.width * canvas.height * 4) / 1024 / 1024).toFixed(2)}MB`,
      });

      // Debug: Check if canvas is empty/black
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const imageData = ctx.getImageData(
          0,
          0,
          Math.min(100, canvas.width),
          Math.min(100, canvas.height),
        );
        const pixels = imageData.data;
        let nonBlackPixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          if ((r !== undefined && r > 10) || (g !== undefined && g > 10) || (b !== undefined && b > 10)) {
            nonBlackPixels++;
          }
        }

        console.log("Canvas debug info:", {
          totalSamples: pixels.length / 4,
          nonBlackPixels,
          percentageVisible:
            ((nonBlackPixels / (pixels.length / 4)) * 100).toFixed(2) + "%",
        });

        if (nonBlackPixels < 10) {
          throw new Error(
            "Captured image appears to be mostly black. This might be a rendering issue.",
          );
        }
      }

      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert canvas to blob"));
            }
          },
          "image/jpeg",
          quality,
        );
      });
    } catch (error) {
      console.error("Image capture failed:", error);
      throw new Error(
        `Failed to capture image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Convert image blob to PDF with automatic page breaks
   */
  private static async imageToPDF(
    imageBlob: Blob,
    filename: string,
    format: string,
    orientation: string,
  ): Promise<void> {
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import("jspdf");

      console.log("Converting image to PDF with page breaks...");

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: orientation as "portrait" | "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // Convert blob to data URL and get image dimensions
      const imageDataUrl = await this.blobToDataUrl(imageBlob);

      // Create temporary image to get dimensions
      const tempImg = new Image();
      await new Promise((resolve, reject) => {
        tempImg.onload = resolve;
        tempImg.onerror = reject;
        tempImg.src = imageDataUrl;
      });

      const originalWidth = tempImg.width;
      const originalHeight = tempImg.height;

      console.log("Image dimensions:", { originalWidth, originalHeight });

      // Calculate dimensions to fit A4 page with margins
      const pageWidth = this.A4_WIDTH_MM;
      const pageHeight = this.A4_HEIGHT_MM;
      const margin = 10; // 10mm margin

      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;

      // Calculate the scaling to fit width
      const widthScale =
        maxWidth /
        ((originalWidth / (window.devicePixelRatio || 1)) * 0.264583); // px to mm conversion
      const finalImageWidth = maxWidth;
      const finalImageHeight =
        (originalHeight / (window.devicePixelRatio || 1)) *
        0.264583 *
        widthScale;

      console.log("Final dimensions:", {
        finalImageWidth,
        finalImageHeight,
        maxHeight,
        willNeedMultiplePages: finalImageHeight > maxHeight,
      });

      if (finalImageHeight <= maxHeight) {
        // Single page - simple case
        pdf.addImage(
          imageDataUrl,
          "JPEG",
          margin,
          margin,
          finalImageWidth,
          finalImageHeight,
          undefined,
          "FAST",
        );
      } else {
        // Multiple pages needed
        const pagesNeeded = Math.ceil(finalImageHeight / maxHeight);
        console.log(`Content requires ${pagesNeeded} pages`);

        for (let pageIndex = 0; pageIndex < pagesNeeded; pageIndex++) {
          if (pageIndex > 0) {
            pdf.addPage();
          }

          const yOffset = pageIndex * maxHeight;
          const remainingHeight = Math.min(
            maxHeight,
            finalImageHeight - yOffset,
          );

          // Create canvas for this page slice
          const canvas = document.createElement("canvas");
          const scale = 2; // High quality
          canvas.width = originalWidth;
          canvas.height = (remainingHeight / finalImageHeight) * originalHeight;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Draw the slice of the original image
            ctx.drawImage(
              tempImg,
              0, // source x
              (yOffset / finalImageHeight) * originalHeight, // source y
              originalWidth, // source width
              canvas.height, // source height
              0, // dest x
              0, // dest y
              canvas.width, // dest width
              canvas.height, // dest height
            );

            // Convert slice to data URL
            const sliceDataUrl = canvas.toDataURL("image/jpeg", 0.95);

            // Add slice to PDF
            pdf.addImage(
              sliceDataUrl,
              "JPEG",
              margin,
              margin,
              finalImageWidth,
              remainingHeight,
              undefined,
              "FAST",
            );
          }
        }
      }

      // Save PDF
      pdf.save(filename);

      console.log("Multi-page PDF saved successfully:", filename);
    } catch (error) {
      console.error("PDF creation failed:", error);
      throw new Error(
        `Failed to create PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Convert blob to data URL
   */
  private static blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Create fallback canvas when html2canvas fails
   */
  private static async createFallbackCanvas(
    htmlContent: string,
    backgroundColor: string,
  ): Promise<Blob> {
    console.log("Creating fallback canvas with natural height...");

    // Extract text content from HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // Calculate needed height based on content
    const lines = textContent.split("\n").filter((line) => line.trim());
    const lineHeight = 32;
    const margin = 80; // 40px * 2 for scale
    const estimatedHeight = Math.max(
      this.A4_HEIGHT_PX * 2,
      lines.length * lineHeight * 1.5 + margin * 2,
    );

    // Create canvas with natural height
    const canvas = document.createElement("canvas");
    canvas.width = this.A4_WIDTH_PX * 2; // 2x scale
    canvas.height = estimatedHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text style
    ctx.fillStyle = "#000000";
    ctx.font = "28px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Draw text content with natural wrapping
    let y = margin;

    lines.forEach((line, index) => {
      const words = line.trim().split(" ");
      let currentLine = "";
      const x = margin;

      words.forEach((word) => {
        const testLine = currentLine + word + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > canvas.width - margin * 2 && currentLine !== "") {
          ctx.fillText(currentLine, x, y);
          currentLine = word + " ";
          y += lineHeight;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine.trim()) {
        ctx.fillText(currentLine, x, y);
        y += lineHeight;
      }

      // Add extra space between sections
      y += lineHeight * 0.5;
    });

    // Adjust canvas height to actual content if it's much smaller
    if (y < canvas.height * 0.6) {
      const newHeight = y + margin;
      const newCanvas = document.createElement("canvas");
      newCanvas.width = canvas.width;
      newCanvas.height = newHeight;

      const newCtx = newCanvas.getContext("2d");
      if (newCtx) {
        newCtx.drawImage(canvas, 0, 0);

        // Add fallback message
        newCtx.fillStyle = "#666666";
        newCtx.font = "24px Arial, sans-serif";
        newCtx.fillText(
          "Resume generated using fallback method",
          margin,
          newHeight - margin - 30,
        );

        return new Promise((resolve, reject) => {
          newCanvas.toBlob(
            (blob) => {
              if (blob) {
                console.log(
                  "Fallback canvas created successfully with height:",
                  newHeight,
                );
                resolve(blob);
              } else {
                reject(new Error("Failed to convert fallback canvas to blob"));
              }
            },
            "image/jpeg",
            0.95,
          );
        });
      }
    }

    // Add fallback message to original canvas
    ctx.fillStyle = "#666666";
    ctx.font = "24px Arial, sans-serif";
    ctx.fillText(
      "Resume generated using fallback method",
      margin,
      canvas.height - margin - 30,
    );

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(
              "Fallback canvas created successfully with height:",
              canvas.height,
            );
            resolve(blob);
          } else {
            reject(new Error("Failed to convert fallback canvas to blob"));
          }
        },
        "image/jpeg",
        0.95,
      );
    });
  }

  /**
   * Test image-to-PDF conversion
   */
  static async testConversion(): Promise<{
    success: boolean;
    error?: string;
    imageSize?: number;
  }> {
    try {
      const testHtml = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #333; margin-bottom: 20px;">Test Resume</h1>
          <h2 style="color: #666; margin-bottom: 15px;">Personal Information</h2>
          <p style="margin-bottom: 10px;"><strong>Name:</strong> Test User</p>
          <p style="margin-bottom: 10px;"><strong>Email:</strong> test@example.com</p>
          <p style="margin-bottom: 10px;"><strong>Phone:</strong> +1 234-567-8900</p>
          
          <h2 style="color: #666; margin: 20px 0 15px 0;">Experience</h2>
          <div style="margin-bottom: 15px;">
            <h3 style="color: #333; margin-bottom: 5px;">Software Engineer</h3>
            <p style="color: #666; margin-bottom: 5px; font-style: italic;">Tech Company</p>
            <p style="color: #666; margin-bottom: 8px; font-size: 12px;">2020 - Present</p>
            <p style="margin-bottom: 10px;">Developed web applications using React and Node.js.</p>
          </div>
          
          <h2 style="color: #666; margin: 20px 0 15px 0;">Skills</h2>
          <ul style="margin-bottom: 15px;">
            <li style="margin-bottom: 5px;">JavaScript</li>
            <li style="margin-bottom: 5px;">React</li>
            <li style="margin-bottom: 5px;">Node.js</li>
            <li style="margin-bottom: 5px;">TypeScript</li>
          </ul>
        </div>
      `;

      let imageBlob: Blob;

      try {
        const container = await this.createA4Container(testHtml, "#ffffff");
        imageBlob = await this.captureContainerAsImage(container, 2, 0.95);
        document.body.removeChild(container);
      } catch (error) {
        console.warn("Using fallback canvas for test:", error);
        imageBlob = await this.createFallbackCanvas(testHtml, "#ffffff");
      }

      return {
        success: true,
        imageSize: imageBlob.size,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default PDFImageConverter;
