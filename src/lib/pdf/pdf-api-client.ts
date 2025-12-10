/**
 * PDF API Client - Client Side
 * Calls PDF generation API directly from browser and triggers download
 *
 * Note: This is CLIENT-SIDE code (no "use server")
 * The PDF API returns a file stream, so we call it directly from the browser
 * and trigger an automatic download.
 */

const PDF_API_URL =
  process.env.NEXT_PUBLIC_PDF_API_URL ||
  "https://chancedee-pdf-generator-291870271662.asia-southeast1.run.app";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export interface GeneratePdfParams {
  candidateId: string;
  template: "template1" | "template2" | "template3";
  privacyMode: boolean;
  userToken: string; // Firebase ID token
  onProgress?: (status: string) => void;
}

export interface GeneratePdfResult {
  success: boolean;
  error?: string;
  retryAttempt: number;
}

/**
 * Generate PDF and trigger browser download
 * CLIENT-SIDE ONLY - Calls PDF API directly from browser
 *
 * @example
 * const result = await generateAndDownloadPdf({
 *   candidateId: user.uid,
 *   template: "template1",
 *   privacyMode: false,
 *   userToken: await user.getIdToken(),
 *   onProgress: (status) => console.log(status)
 * });
 */
export async function generateAndDownloadPdf(
  params: GeneratePdfParams
): Promise<GeneratePdfResult> {
  const { candidateId, template, privacyMode, userToken, onProgress } = params;

  let lastError: string | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      onProgress?.(
        attempt > 0
          ? `กำลังลองใหม่... (ครั้งที่ ${attempt + 1}/${MAX_RETRIES + 1})`
          : "กำลังสร้าง PDF..."
      );

      const response = await fetch(`${PDF_API_URL}/generateResumePdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          candidateId,
          template,
          privacyMode,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = errorText || response.statusText;

        // If it's a 4xx error, don't retry (client error)
        if (response.status >= 400 && response.status < 500) {
          return {
            success: false,
            error: `ข้อผิดพลาด: ${lastError}`,
            retryAttempt: attempt,
          };
        }

        throw new Error(lastError);
      }

      onProgress?.("กำลังดาวน์โหลด...");

      // Response should be PDF file stream
      const blob = await response.blob();

      // Verify it's actually a PDF
      if (!blob.type.includes("application/pdf")) {
        throw new Error("Response is not a PDF file");
      }

      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume_${candidateId}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      onProgress?.("✅ ดาวน์โหลดสำเร็จ");

      return {
        success: true,
        retryAttempt: attempt,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error";

      console.error(
        `[PDF API] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        lastError
      );

      // If this is not the last attempt, wait before retrying
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * (attempt + 1); // Exponential backoff
        onProgress?.(`รอ ${delay / 1000} วินาทีก่อนลองใหม่...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  // All retries failed
  return {
    success: false,
    error: `ไม่สามารถสร้าง PDF ได้ หลังจากลอง ${MAX_RETRIES + 1} ครั้ง: ${lastError}`,
    retryAttempt: MAX_RETRIES,
  };
}

/**
 * Get PDF API URL (for display/debugging purposes)
 */
export function getPdfApiUrl(): string {
  return PDF_API_URL;
}
