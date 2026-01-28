"use client";

import { useMemo } from "react";
import { X, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AttachmentPreviewProps } from "@/types/chat.types";

export function AttachmentPreview({
  file,
  onRemove,
  progress,
  isUploading,
}: AttachmentPreviewProps) {
  const isImage = file.type.startsWith("image/");

  const previewUrl = useMemo(() => {
    if (isImage) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file, isImage]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      data-testid="attachment-preview"
      className="relative flex items-center gap-3 p-3 bg-muted rounded-lg border"
    >
      {isImage && previewUrl ? (
        <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden">
          <img
            data-testid="image-preview"
            src={previewUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <div
          data-testid="file-icon"
          className="w-16 h-16 shrink-0 rounded-md bg-secondary-100 flex items-center justify-center"
        >
          <FileText className="h-8 w-8 text-secondary-500" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p
          data-testid="file-name"
          className="text-sm font-medium truncate"
        >
          {file.name}
        </p>
        <p data-testid="file-size" className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </p>

        {isUploading && (
          <div className="mt-2">
            <Progress
              data-testid="upload-progress"
              value={progress}
              className="h-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              กำลังอัปโหลด {progress}%
            </p>
          </div>
        )}
      </div>

      {!isUploading && (
        <Button
          data-testid="remove-button"
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
