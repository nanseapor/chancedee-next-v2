/**
 * PDF Generation Test Utility
 * Simple test to verify PDF generation functionality
 */

export class PDFTest {
  /**
   * Test if html2pdf library can be loaded
   */
  static async testLibraryLoad(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Test basic browser environment
      if (typeof window === "undefined" || typeof document === "undefined") {
        return {
          success: false,
          error: "Not in browser environment",
        };
      }

      // Test dynamic import
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default;

      if (!html2pdf) {
        return {
          success: false,
          error: "html2pdf library is not available",
        };
      }

      // Test if we can create an instance
      const instance = html2pdf();
      if (!instance) {
        return {
          success: false,
          error: "Cannot create html2pdf instance",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Test PDF generation with simple content
   */
  static async testSimpleGeneration(): Promise<{
    success: boolean;
    error?: string;
    size?: number;
  }> {
    try {
      // First test library load
      const loadTest = await this.testLibraryLoad();
      if (!loadTest.success) {
        return {
          success: false,
          error: `Library load failed: ${loadTest.error}`,
        };
      }

      // Simple HTML content for testing
      const testHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Test Resume</h1>
          <h2>Personal Information</h2>
          <p><strong>Name:</strong> Test User</p>
          <p><strong>Email:</strong> test@example.com</p>
          <p><strong>Phone:</strong> +1 234-567-8900</p>
          
          <h2>Experience</h2>
          <div style="margin-bottom: 15px;">
            <h3>Software Engineer</h3>
            <p><em>Tech Company</em></p>
            <p>2020 - Present</p>
            <p>Developed web applications using modern technologies.</p>
          </div>
          
          <h2>Skills</h2>
          <ul>
            <li>JavaScript</li>
            <li>React</li>
            <li>Node.js</li>
          </ul>
        </div>
      `;

      // Load html2pdf
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default;

      // Create container
      const container = document.createElement("div");
      container.innerHTML = testHtml;
      container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 210mm;
        background: white;
        padding: 20px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #000000;
      `;

      document.body.appendChild(container);

      // Generate PDF as blob for testing
      const blob = await html2pdf()
        .set({
          margin: 15,
          image: { type: "jpeg", quality: 0.9 },
          html2canvas: { scale: 1.5 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(container)
        .outputPdf("blob");

      // Clean up
      document.body.removeChild(container);

      // Check if blob is valid
      if (!blob || blob.size === 0) {
        return {
          success: false,
          error: "Generated PDF is empty",
        };
      }

      return {
        success: true,
        size: blob.size,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Log test results to console
   */
  static async runAllTests(): Promise<void> {
    console.group("📄 PDF Generation Tests");

    console.log("🔍 Testing library load...");
    const loadTest = await this.testLibraryLoad();
    console.log(
      loadTest.success
        ? "✅ Library loaded successfully"
        : `❌ Library load failed: ${loadTest.error}`,
    );

    if (loadTest.success) {
      console.log("🔍 Testing PDF generation...");
      const genTest = await this.testSimpleGeneration();
      console.log(
        genTest.success
          ? `✅ PDF generation successful (${genTest.size} bytes)`
          : `❌ PDF generation failed: ${genTest.error}`,
      );
    }

    console.groupEnd();
  }
}

export default PDFTest;
