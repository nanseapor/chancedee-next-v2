"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, FileText, Download, Trash2, File, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/jobsmarket/use-file-upload";
import { jobsmarketStorageService, type FileInfo } from "@/lib/jobsmarket/services/storage-service";
import { useToast } from "@/hooks/use-toast-notification";

interface DocumentsSectionProps {
  uid: string;
}

/**
 * CAND-R02 Batch 4B: Documents Section (Real Implementation)
 *
 * Features:
 * - Upload documents (PDF, DOC, DOCX)
 * - Progress bar during upload
 * - List uploaded documents
 * - Download and delete functionality
 * - File validation
 */
export function DocumentsSection({ uid }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const { uploadDocument, deleteFile, validateDocument, isUploading, progress, error } = useFileUpload();

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [uid]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await jobsmarketStorageService.listDocuments(uid);
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      addToast("เกิดข้อผิดพลาดในการโหลดเอกสาร", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateDocument(file);
    if (!validation.isValid) {
      addToast(validation.error || "ไฟล์ไม่ถูกต้อง", "error");
      return;
    }

    try {
      await uploadDocument(uid, file);
      addToast("อัปโหลดเอกสารสำเร็จ", "success");
      await loadDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      addToast("เกิดข้อผิดพลาดในการอัปโหลดเอกสาร", "error");
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = (doc: FileInfo) => {
    window.open(doc.url, "_blank");
  };

  const handleDeleteClick = async (doc: FileInfo) => {
    // Use browser confirm for simplicity (alert-dialog component doesn't exist)
    const confirmed = window.confirm(
      `คุณต้องการลบเอกสาร "${doc.name}" หรือไม่?\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`
    );

    if (!confirmed) return;

    try {
      await deleteFile(doc.path);
      addToast("ลบเอกสารสำเร็จ", "success");
      await loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      addToast("เกิดข้อผิดพลาดในการลบเอกสาร", "error");
    }
  };

  const getFileIcon = (type: string) => {
    if (type === "application/pdf") {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <File className="w-5 h-5 text-blue-500" />;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div data-testid="documents-section" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="document-file-input"
      />

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">เอกสารแนบ</h2>
        <Button
          onClick={handleUploadClick}
          variant="outline"
          size="default"
          className="gap-2"
          disabled={isUploading}
        >
          <Upload className="w-4 h-4" />
          {isUploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
        </Button>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">กำลังอัปโหลด...</span>
            <span className="text-sm font-semibold text-blue-900">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Document List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 italic mb-2">ยังไม่มีเอกสารแนบ</p>
          <p className="text-sm text-gray-400">คลิกอัปโหลดเพื่อเพิ่มเอกสาร PDF, DOC, DOCX (สูงสุด 10MB)</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.path}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(doc.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {jobsmarketStorageService.formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleDownload(doc)}
                  variant="ghost"
                  size="default"
                  className="gap-1"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลด
                </Button>
                <Button
                  onClick={() => handleDeleteClick(doc)}
                  variant="ghost"
                  size="default"
                  className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบ
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
