/**
 * PDF Content Test
 * Creates test HTML content to verify PDF generation works
 */

export class PDFContentTest {
  /**
   * Generate simple test resume HTML
   */
  static getTestResumeHTML(): string {
    return `
      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #000000; background: #ffffff; padding: 20px;">
        <h1 style="color: #333333; font-size: 24px; margin-bottom: 10px; font-weight: bold;">John Doe</h1>
        <h2 style="color: #666666; font-size: 18px; margin-bottom: 20px; font-weight: normal;">Software Engineer</h2>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 5px 0; color: #000000;"><strong>Email:</strong> john.doe@example.com</p>
          <p style="margin: 5px 0; color: #000000;"><strong>Phone:</strong> +1 (555) 123-4567</p>
          <p style="margin: 5px 0; color: #000000;"><strong>Location:</strong> San Francisco, CA</p>
        </div>
        
        <h3 style="color: #333333; font-size: 16px; margin-top: 20px; margin-bottom: 10px; font-weight: bold;">Experience</h3>
        <div style="margin-bottom: 15px;">
          <h4 style="color: #000000; font-size: 14px; margin-bottom: 5px; font-weight: bold;">Senior Software Engineer</h4>
          <p style="margin: 2px 0; color: #666666; font-style: italic;">Tech Company Inc.</p>
          <p style="margin: 2px 0; color: #666666; font-size: 12px;">2020 - Present</p>
          <ul style="margin: 8px 0; padding-left: 20px; color: #000000;">
            <li style="margin: 3px 0;">Led development of microservices architecture</li>
            <li style="margin: 3px 0;">Improved system performance by 40%</li>
            <li style="margin: 3px 0;">Mentored junior developers</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h4 style="color: #000000; font-size: 14px; margin-bottom: 5px; font-weight: bold;">Software Engineer</h4>
          <p style="margin: 2px 0; color: #666666; font-style: italic;">Startup Corp</p>
          <p style="margin: 2px 0; color: #666666; font-size: 12px;">2018 - 2020</p>
          <ul style="margin: 8px 0; padding-left: 20px; color: #000000;">
            <li style="margin: 3px 0;">Developed full-stack web applications</li>
            <li style="margin: 3px 0;">Implemented CI/CD pipelines</li>
            <li style="margin: 3px 0;">Collaborated with cross-functional teams</li>
          </ul>
        </div>
        
        <h3 style="color: #333333; font-size: 16px; margin-top: 20px; margin-bottom: 10px; font-weight: bold;">Education</h3>
        <div style="margin-bottom: 15px;">
          <h4 style="color: #000000; font-size: 14px; margin-bottom: 5px; font-weight: bold;">Bachelor of Computer Science</h4>
          <p style="margin: 2px 0; color: #666666; font-style: italic;">University of Technology</p>
          <p style="margin: 2px 0; color: #666666; font-size: 12px;">2014 - 2018</p>
          <p style="margin: 2px 0; color: #666666; font-size: 12px;">GPA: 3.8/4.0</p>
        </div>
        
        <h3 style="color: #333333; font-size: 16px; margin-top: 20px; margin-bottom: 10px; font-weight: bold;">Skills</h3>
        <div style="margin-bottom: 15px;">
          <p style="margin: 5px 0; color: #000000;"><strong>Programming Languages:</strong> JavaScript, TypeScript, Python, Java</p>
          <p style="margin: 5px 0; color: #000000;"><strong>Frameworks:</strong> React, Node.js, Express, Django</p>
          <p style="margin: 5px 0; color: #000000;"><strong>Tools:</strong> Git, Docker, AWS, Kubernetes</p>
          <p style="margin: 5px 0; color: #000000;"><strong>Databases:</strong> PostgreSQL, MongoDB, Redis</p>
        </div>
        
        <h3 style="color: #333333; font-size: 16px; margin-top: 20px; margin-bottom: 10px; font-weight: bold;">Projects</h3>
        <div style="margin-bottom: 15px;">
          <h4 style="color: #000000; font-size: 14px; margin-bottom: 5px; font-weight: bold;">E-commerce Platform</h4>
          <p style="margin: 5px 0; color: #666666;">Built a full-stack e-commerce application with React, Node.js, and PostgreSQL</p>
          <p style="margin: 5px 0; color: #666666;">Features: User authentication, payment processing, inventory management</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h4 style="color: #000000; font-size: 14px; margin-bottom: 5px; font-weight: bold;">Task Management App</h4>
          <p style="margin: 5px 0; color: #666666;">Developed a collaborative task management application using React and Firebase</p>
          <p style="margin: 5px 0; color: #666666;">Features: Real-time collaboration, drag-and-drop interface, notifications</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate minimal test HTML
   */
  static getMinimalTestHTML(): string {
    return `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #000000; background: #ffffff; padding: 30px; min-height: 400px;">
        <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Test Resume</h1>
        <p style="color: #000000; margin-bottom: 15px;">This is a test resume to verify PDF generation is working correctly.</p>
        <p style="color: #000000; margin-bottom: 15px;">Name: Test User</p>
        <p style="color: #000000; margin-bottom: 15px;">Email: test@example.com</p>
        <p style="color: #000000; margin-bottom: 15px;">Phone: +1 234-567-8900</p>
        <h2 style="color: #333333; font-size: 18px; margin-top: 20px; margin-bottom: 10px;">Experience</h2>
        <p style="color: #000000; margin-bottom: 10px;">Software Engineer at Tech Company (2020-Present)</p>
        <p style="color: #000000; margin-bottom: 10px;">Developed web applications and improved system performance.</p>
        <h2 style="color: #333333; font-size: 18px; margin-top: 20px; margin-bottom: 10px;">Skills</h2>
        <p style="color: #000000; margin-bottom: 10px;">JavaScript, React, Node.js, Python, AWS</p>
      </div>
    `;
  }

  /**
   * Test PDF generation with known good content
   */
  static async testPDFGeneration(): Promise<{
    success: boolean;
    error?: string;
    testResults: Array<{
      name: string;
      success: boolean;
      error?: string;
      contentLength?: number;
    }>;
  }> {
    const testResults = [];
    let overallSuccess = true;

    // Test 1: Minimal HTML
    try {
      const minimalHTML = this.getMinimalTestHTML();
      const { PDFConverter } = await import("./pdf-converter");

      // Create a blob to test without downloading
      const blob = await PDFConverter.convertToBlob(minimalHTML);

      testResults.push({
        name: "Minimal HTML Test",
        success: blob.size > 1000, // At least 1KB
        contentLength: blob.size,
      });
    } catch (error) {
      testResults.push({
        name: "Minimal HTML Test",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      overallSuccess = false;
    }

    // Test 2: Full Resume HTML with old method
    try {
      const fullHTML = this.getTestResumeHTML();
      const { PDFConverter } = await import("./pdf-converter");

      const blob = await PDFConverter.convertToBlob(fullHTML);

      testResults.push({
        name: "Full Resume HTML Test (html2pdf)",
        success: blob.size > 5000, // At least 5KB for full resume
        contentLength: blob.size,
      });
    } catch (error) {
      testResults.push({
        name: "Full Resume HTML Test (html2pdf)",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      overallSuccess = false;
    }

    // Test 3: Image-based PDF conversion
    try {
      const fullHTML = this.getTestResumeHTML();
      const { PDFImageConverter } = await import("./pdf-image-converter");

      const testResult = await PDFImageConverter.testConversion();

      testResults.push({
        name: "Image-based PDF Test",
        success: testResult.success,
        error: testResult.error,
        contentLength: testResult.imageSize,
      });

      if (!testResult.success) {
        overallSuccess = false;
      }
    } catch (error) {
      testResults.push({
        name: "Image-based PDF Test",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      overallSuccess = false;
    }

    return {
      success: overallSuccess,
      testResults,
    };
  }

  /**
   * Log test results
   */
  static async runTests(): Promise<void> {
    console.group("📄 PDF Content Tests");

    const results = await this.testPDFGeneration();

    console.log("Overall success:", results.success);

    for (const result of results.testResults) {
      if (result.success) {
        console.log(
          `✅ ${result.name}: Success (${result.contentLength} bytes)`,
        );
      } else {
        console.log(`❌ ${result.name}: Failed - ${result.error}`);
      }
    }

    console.groupEnd();
  }
}

export default PDFContentTest;
