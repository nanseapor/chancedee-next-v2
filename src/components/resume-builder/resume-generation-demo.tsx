/**
 * Demo component showing how to use the enhanced resume generation
 * This demonstrates the improved state management and callbacks
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChancedeeChat } from "@/hooks/use-chancedee-chat-enhanced";
import { CheckCircle, Clock, Loader2, RotateCcw, XCircle } from "lucide-react";

export function ResumeGenerationDemo() {
  const { generateResume, resumeGeneration, error, generatedResume } =
    useChancedeeChat();

  const {
    isGenerating,
    generationProgress,
    creationTime,
    canGenerate,
    hasResult,
    retryGeneration,
    clearResult,
  } = resumeGeneration;

  const getProgressIcon = () => {
    switch (generationProgress) {
      case "starting":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "generating":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getProgressText = () => {
    switch (generationProgress) {
      case "starting":
        return "เริ่มต้นการสร้าง...";
      case "generating":
        return "กำลังสร้าง Resume...";
      case "success":
        return "สร้างสำเร็จ!";
      case "error":
        return "เกิดข้อผิดพลาด";
      default:
        return "พร้อมสร้าง Resume";
    }
  };

  const getProgressColor = () => {
    switch (generationProgress) {
      case "starting":
      case "generating":
        return "bg-blue-500";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getProgressIcon()}
          Resume Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Status */}
        <div className="flex items-center gap-2">
          <Badge
            variant={generationProgress === "success" ? "default" : "secondary"}
            className={`${getProgressColor()} text-white`}
          >
            {getProgressText()}
          </Badge>
          {creationTime && (
            <span className="text-sm text-muted-foreground">
              {(creationTime / 1000).toFixed(2)}s
            </span>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Generation Result */}
        {hasResult && generatedResume && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              Resume created successfully using template:{" "}
              {generatedResume.templateName}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Generated at:{" "}
              {new Date(generatedResume.generatedAt).toLocaleString("th-TH")}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={generateResume}
            disabled={!canGenerate || isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังสร้าง...
              </>
            ) : (
              "สร้าง Resume"
            )}
          </Button>

          {generationProgress === "error" && (
            <Button
              onClick={retryGeneration}
              variant="outline"
              disabled={isGenerating}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          {hasResult && (
            <Button
              onClick={clearResult}
              variant="outline"
              disabled={isGenerating}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Development Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Can Generate: {canGenerate ? "Yes" : "No"}</p>
          <p>Has Result: {hasResult ? "Yes" : "No"}</p>
          <p>Is Generating: {isGenerating ? "Yes" : "No"}</p>
          <p>Progress: {generationProgress}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResumeGenerationDemo;
