"use client";

import { firebaseStorageService, type FileUploadResult } from "@/lib/firebase/storage";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type UploadTask,
  type UploadTaskSnapshot,
} from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase/client";

/**
 * File information returned from storage operations
 */
export interface FileInfo {
  name: string;
  url: string;
  path: string;
  size: number;
  uploadedAt: number;
  type: string;
}

/**
 * Progress callback type for file uploads
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Validation result for file uploads
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * CAND-R02 Batch 4B: Storage Service for Jobsmarket
 *
 * Provides file upload/download/delete functionality for:
 * - Candidate documents (PDF, DOC, DOCX)
 * - Profile photos (JPG, PNG)
 */
export class JobsmarketStorageService {
  private storage;

  constructor() {
    this.storage = getStorage(getFirebaseApp());
  }

  /**
   * Validates document files (PDF, DOC, DOCX, max 10MB)
   */
  validateDocument(file: File): FileValidationResult {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `ไฟล์ขนาดใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)}MB) ขนาดสูงสุด 10MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "รองรับเฉพาะไฟล์ PDF, DOC, DOCX เท่านั้น",
      };
    }

    return { isValid: true };
  }

  /**
   * Validates profile photo files (JPG, PNG, max 5MB)
   */
  validatePhoto(file: File): FileValidationResult {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `ไฟล์ขนาดใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)}MB) ขนาดสูงสุด 5MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "รองรับเฉพาะไฟล์ JPG, PNG เท่านั้น",
      };
    }

    return { isValid: true };
  }

  /**
   * Uploads a document file with progress tracking
   * @param uid - User ID
   * @param file - File to upload
   * @param onProgress - Optional progress callback (0-100)
   * @returns Promise with file URL
   */
  async uploadDocument(
    uid: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    // Validate file
    const validation = this.validateDocument(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create storage path: candidates/{uid}/documents/{timestamp}_{filename}
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storagePath = `candidates/${uid}/documents/${fileName}`;
    const storageRef = ref(this.storage, storagePath);

    // Upload with progress tracking
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => {
          // Progress callback
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          // Error callback
          console.error("Upload error:", error);
          reject(new Error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์"));
        },
        async () => {
          // Success callback
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(new Error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์"));
          }
        }
      );
    });
  }

  /**
   * Uploads a profile photo with progress tracking
   * @param uid - User ID
   * @param file - Image file to upload
   * @param onProgress - Optional progress callback (0-100)
   * @returns Promise with file URL
   */
  async uploadProfilePhoto(
    uid: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    // Validate file
    const validation = this.validatePhoto(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Get file extension
    const extension = file.name.split(".").pop() || "jpg";

    // Create storage path: candidates/{uid}/photo/profile.{ext}
    const storagePath = `candidates/${uid}/photo/profile.${extension}`;
    const storageRef = ref(this.storage, storagePath);

    // Upload with progress tracking
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => {
          // Progress callback
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          // Error callback
          console.error("Upload error:", error);
          reject(new Error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ"));
        },
        async () => {
          // Success callback
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(new Error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ"));
          }
        }
      );
    });
  }

  /**
   * Deletes a file from storage
   * @param path - Full storage path (e.g., "candidates/{uid}/documents/{filename}")
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Delete error:", error);
      throw new Error("เกิดข้อผิดพลาดในการลบไฟล์");
    }
  }

  /**
   * Lists all documents for a candidate
   * @param uid - User ID
   * @returns Array of file information
   */
  async listDocuments(uid: string): Promise<FileInfo[]> {
    try {
      const documentsRef = ref(this.storage, `candidates/${uid}/documents`);
      const result = await listAll(documentsRef);

      const fileInfos = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);

          // Extract timestamp from filename (format: timestamp_filename)
          const nameParts = itemRef.name.split("_");
          const timestamp = nameParts.length > 1 && nameParts[0] ? parseInt(nameParts[0]) : Date.now();

          // Extract original filename
          const originalName = nameParts.length > 1 ? nameParts.slice(1).join("_") : itemRef.name;

          // Get file type from extension
          const extension = itemRef.name.split(".").pop()?.toLowerCase() || "";
          let contentType = "application/octet-stream";
          if (extension === "pdf") {
            contentType = "application/pdf";
          } else if (extension === "doc") {
            contentType = "application/msword";
          } else if (extension === "docx") {
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          }

          return {
            name: originalName,
            url,
            path: itemRef.fullPath,
            size: 0, // Size not available without metadata
            uploadedAt: timestamp,
            type: contentType,
          };
        })
      );

      // Sort by upload date (newest first)
      return fileInfos.sort((a, b) => b.uploadedAt - a.uploadedAt);
    } catch (error) {
      console.error("List documents error:", error);
      // Return empty array if folder doesn't exist yet
      return [];
    }
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
export const jobsmarketStorageService = new JobsmarketStorageService();
