"use client";

import { getFirebaseApp } from "./client";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

export interface FileUploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

export interface FileUploadOptions {
  bucket?: string;
  folder?: string;
  userId?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

const DEFAULT_OPTIONS: Required<FileUploadOptions> = {
  bucket: "ai-assistant",
  folder: "uploads",
  userId: "anonymous",
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ],
};

export class FirebaseStorageService {
  private storage;

  constructor() {
    this.storage = getStorage(getFirebaseApp());
  }

  /**
   * Validates file against size and type constraints
   */
  validateFile(
    file: File,
    options: FileUploadOptions = {},
  ): { isValid: boolean; error?: string } {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Check file size
    if (file.size > opts.maxSize) {
      return {
        isValid: false,
        error: `ไฟล์ขนาดใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)}MB) ขนาดสูงสุด ${(opts.maxSize / 1024 / 1024).toFixed(0)}MB`,
      };
    }

    // Check file type
    if (!opts.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WebP) หรือ PDF เท่านั้น",
      };
    }

    return { isValid: true };
  }

  /**
   * Uploads file to Firebase Storage
   */
  async uploadFile(
    file: File,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Validate file
    const validation = this.validateFile(file, opts);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop() || "";
    const fileName = `${timestamp}_${file.name}`;

    // Create storage path
    const storagePath = `${opts.bucket}/${opts.userId}/${opts.folder}/${fileName}`;
    const storageRef = ref(this.storage, storagePath);

    try {
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        path: storagePath,
        name: file.name,
        size: file.size,
      };
    } catch (error) {
      console.error("Firebase Storage upload error:", error);
      throw new Error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
    }
  }

  /**
   * Deletes file from Firebase Storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Firebase Storage delete error:", error);
      throw new Error("เกิดข้อผิดพลาดในการลบไฟล์");
    }
  }

  /**
   * Gets file type category
   */
  getFileType(file: File): "image" | "pdf" | "other" {
    if (file.type.startsWith("image/")) {
      return "image";
    } else if (file.type === "application/pdf") {
      return "pdf";
    }
    return "other";
  }

  /**
   * Formats file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  }
}

// Export singleton instance
export const firebaseStorageService = new FirebaseStorageService();

// Convenience functions
export const uploadFileToAIAssistant = async (
  file: File,
  userId: string,
): Promise<FileUploadResult> => {
  return firebaseStorageService.uploadFile(file, {
    bucket: "ai-assistant",
    folder: "uploads",
    userId,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ],
  });
};

export const validateAIAssistantFile = (
  file: File,
): { isValid: boolean; error?: string } => {
  return firebaseStorageService.validateFile(file, {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ],
  });
};
