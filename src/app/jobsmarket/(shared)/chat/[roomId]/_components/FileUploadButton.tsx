"use client";

import { useRef, useCallback, ChangeEvent } from "react";
import { Paperclip, Image, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FileUploadButtonProps } from "@/types/chat.types";

const ACCEPT_IMAGES = "image/jpeg,image/png,image/gif,image/webp";
const ACCEPT_DOCUMENTS =
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

export function FileUploadButton({
  onFileSelect,
  disabled = false,
  multiple = false,
}: FileUploadButtonProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Only handle first file for now (multi-file handled separately)
      const firstFile = files[0];
      if (firstFile) {
        onFileSelect(firstFile);
      }

      // Reset input
      e.target.value = "";
    },
    [onFileSelect]
  );

  const handleImageClick = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleDocumentClick = useCallback(() => {
    documentInputRef.current?.click();
  }, []);

  return (
    <>
      <input
        ref={imageInputRef}
        data-testid="image-input"
        type="file"
        accept={ACCEPT_IMAGES}
        onChange={handleFileChange}
        className="hidden"
        multiple={multiple}
      />
      <input
        ref={documentInputRef}
        data-testid="document-input"
        type="file"
        accept={ACCEPT_DOCUMENTS}
        onChange={handleFileChange}
        className="hidden"
        multiple={multiple}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            data-testid="file-upload-button"
            variant="ghost"
            size="icon"
            disabled={disabled}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            data-testid="upload-image-option"
            onClick={handleImageClick}
          >
            <Image className="h-4 w-4 mr-2" />
            รูปภาพ
          </DropdownMenuItem>
          <DropdownMenuItem
            data-testid="upload-document-option"
            onClick={handleDocumentClick}
          >
            <FileText className="h-4 w-4 mr-2" />
            เอกสาร
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
