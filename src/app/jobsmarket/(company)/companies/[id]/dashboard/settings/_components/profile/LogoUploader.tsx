"use client";

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";

// ============================================
// Types
// ============================================

interface LogoUploaderProps {
  currentLogo?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  disabled: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
}

// ============================================
// Component
// ============================================

export function LogoUploader({
  currentLogo,
  onUpload,
  onRemove,
  disabled,
  uploadProgress = 0,
  isUploading = false,
}: LogoUploaderProps) {
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
      <label className="block text-sm font-medium text-gray-700">โลโก้บริษัท</label>

      {/* File input (hidden) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="sr-only"
        id="logo-upload"
        aria-label="อัพโหลดโลโก้"
      />

      {currentLogo ? (
        // Show current logo preview
        <div className="relative inline-block">
          <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={currentLogo}
              alt="Company logo"
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
              onClick={onRemove}
              aria-label="ลบโลโก้"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        // Show upload area
        <label htmlFor="logo-upload">
          <div
            className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-secondary-500 hover:bg-gray-100 ${
              disabled ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={!disabled && !isUploading ? handleClick : undefined}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-1">
                <Loader2 className="h-6 w-6 animate-spin text-secondary-600" />
                <span className="text-xs text-gray-600">{uploadProgress}%</span>
              </div>
            ) : (
              <>
                <Upload className="mb-1 h-6 w-6 text-gray-400" />
                <span className="text-xs text-gray-500">อัพโหลดโลโก้</span>
              </>
            )}
          </div>
        </label>
      )}

      <p className="text-xs text-gray-500">รองรับ JPG, PNG ขนาดไม่เกิน 5MB</p>
    </div>
  );
}
