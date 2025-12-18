/**
 * PDF Export Hook
 * CAND-R02 Batch 3E
 *
 * React hook for managing PDF export state and operations.
 */

"use client";

import { useState, useCallback } from 'react';
import {
  downloadResumePdf,
  PdfTemplate,
  PdfServiceError
} from '../services/pdf-service';
import { useToast } from '@/hooks/use-toast-notification';

interface UsePdfExportOptions {
  candidateId: string;
  candidateName: string;
}

export function usePdfExport({ candidateId, candidateName }: UsePdfExportOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<PdfServiceError | null>(null);
  const { addToast } = useToast();

  const exportPdf = useCallback(async (template: PdfTemplate = 'template3') => {
    setIsGenerating(true);
    setError(null);

    try {
      await downloadResumePdf(candidateId, candidateName, template);

      addToast('ดาวน์โหลดไฟล์ PDF แล้ว', 'success');
    } catch (err) {
      const pdfError = err as PdfServiceError;
      setError(pdfError);

      addToast(pdfError.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [candidateId, candidateName, addToast]);

  return {
    exportPdf,
    isGenerating,
    error,
  };
}
