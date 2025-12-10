/**
 * PDF generation request parameters
 * Used for client-side direct API calls
 */
export interface PdfGenerationRequest {
  candidateId: string;
  template: "template1" | "template2" | "template3";
  privacyMode: boolean;
  userToken: string; // Firebase ID token
  onProgress?: (status: string) => void;
}

/**
 * PDF generation result
 * Returned after client-side download attempt
 */
export interface PdfGenerationResult {
  success: boolean;
  error?: string;
  retryAttempt: number;
}

/**
 * PDF generation metadata for Firestore
 */
export interface PdfMetadata {
  candidateId: string;
  template: "template1" | "template2" | "template3";
  privacyMode: boolean;
  generatedAt: number;
  pdfUrl?: string;
  fileSize?: number;
  regenerationCount: number;
}
