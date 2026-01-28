"use client";

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";

// ============================================
// Types
// ============================================

interface CoverUploaderProps {
  currentCover?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  disabled: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
}

// ============================================
// Component
// ============================================

export function CoverUploader({
  currentCover,
  onUpload,
  onRemove,
  disabled,
  uploadProgress = 0,
  isUploading = false,
}: CoverUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    // Reset input for same file re-upload
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">รูปปกบริษัท</label>

      {/* File input (hidden) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="sr-only"
        id="cover-upload"
        aria-label="อัพโหลดรูปปก"
      />

      {currentCover ? (
        // Show current cover preview
        <div className="relative">
          <div className="relative h-[150px] w-full overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={currentCover}
              alt="Company cover"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute right-2 top-2"
              onClick={onRemove}
              aria-label="ลบรูปปก"
            >
              <X className="mr-1 h-4 w-4" />
              ลบ
            </Button>
          )}
        </div>
      ) : (
        // Show upload area
        <label htmlFor="cover-upload">
          <div
            className={`flex h-[150px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-secondary-500 hover:bg-gray-100 ${
              disabled ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={!disabled && !isUploading ? handleClick : undefined}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-secondary-600" />
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">อัพโหลดรูปปก</span>
                <span className="text-xs text-gray-400">แนะนำ 1200×300 พิกเซล</span>
              </>
            )}
          </div>
        </label>
      )}

      <p className="text-xs text-gray-500">
        รองรับ JPG, PNG, WebP ขนาดไม่เกิน 10MB | แนะนำ 1200×300 พิกเซล
      </p>
    </div>
  );
}
