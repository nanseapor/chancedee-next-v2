/**
 * PDF Service - Resume PDF Generation
 * CAND-R02 Batch 3E
 *
 * Integrates with external PDF generation service to create
 * downloadable resume PDFs from candidate profile data.
 */

import { getAuth } from 'firebase/auth';

export type PdfTemplate = 'template1' | 'template2' | 'template3';

export interface GeneratePdfOptions {
  candidateId: string;
  template?: PdfTemplate;
}

export interface PdfServiceError {
  code: 'AUTH_ERROR' | 'API_ERROR' | 'NETWORK_ERROR';
  message: string;
}

/**
 * Generate resume PDF using external PDF generation service
 *
 * @param options.candidateId - Candidate UID
 * @param options.template - PDF template (default: template3)
 * @returns PDF as Blob
 * @throws PdfServiceError
 */
export async function generateResumePdf({
  candidateId,
  template = 'template3',
}: GeneratePdfOptions): Promise<Blob> {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw {
      code: 'AUTH_ERROR',
      message: 'ไม่สามารถยืนยันตัวตนได้ กรุณาเข้าสู่ระบบอีกครั้ง',
    } as PdfServiceError;
  }

  const idToken = await currentUser.getIdToken();

  const apiUrl = process.env.NEXT_PUBLIC_PDF_GENERATOR_API_URL;
  if (!apiUrl) {
    throw {
      code: 'API_ERROR',
      message: 'PDF service configuration missing',
    } as PdfServiceError;
  }

  try {
    const response = await fetch(`${apiUrl}/generateResumePdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ candidateId, template }),
    });

    if (!response.ok) {
      throw {
        code: 'API_ERROR',
        message: `เกิดข้อผิดพลาดในการสร้าง PDF: ${response.statusText}`,
      } as PdfServiceError;
    }

    return response.blob();
  } catch (error) {
    if ((error as PdfServiceError).code) {
      throw error;
    }
    throw {
      code: 'NETWORK_ERROR',
      message: 'ไม่สามารถเชื่อมต่อบริการ PDF ได้',
    } as PdfServiceError;
  }
}

/**
 * Generate and download resume PDF
 *
 * Creates a temporary download link and triggers browser download.
 *
 * @param candidateId - Candidate UID
 * @param candidateName - Candidate name for filename
 * @param template - PDF template (default: template3)
 */
export async function downloadResumePdf(
  candidateId: string,
  candidateName: string,
  template: PdfTemplate = 'template3'
): Promise<void> {
  const blob = await generateResumePdf({ candidateId, template });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Resume_${candidateName}_${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
