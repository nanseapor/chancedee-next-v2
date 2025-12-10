/**
 * Loading Overlay Component
 * Provides a blur overlay with spinner and progress bar
 */

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ProgressBar } from "./progress-bar";

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  description?: string;
  showProgress?: boolean;
  progressDuration?: number;
  className?: string;
  onProgressComplete?: () => void;
}

export function LoadingOverlay({
  isVisible,
  title = "กำลังสร้าง Resume...",
  description = "กรุณารอสักครู่",
  showProgress = true,
  progressDuration = 90000, // 1:30 seconds
  className,
  onProgressComplete,
}: LoadingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progressText, setProgressText] = useState("กำลังประมวลผล...");

  const steps = [
    { text: "กำลังวิเคราะห์ข้อมูล...", duration: 20000 },
    { text: "กำลังสร้างเนื้อหา...", duration: 30000 },
    { text: "กำลังจัดรูปแบบ...", duration: 25000 },
    { text: "กำลังสำเร็จ...", duration: 15000 },
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setProgressText("กำลังประมวลผล...");
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let currentTime = 0;

    const updateStep = () => {
      const step = steps[currentStep];
      if (!step) return;

      setProgressText(step.text);
      currentTime += step.duration;

      if (currentStep < steps.length - 1) {
        timeoutId = setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, step.duration);
      }
    };

    updateStep();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible, currentStep]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center",
        "bg-black/20 backdrop-blur-sm transition-all duration-300",
        className,
      )}
    >
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 border">
        <div className="text-center space-y-4">
          {/* Spinner */}
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

          {/* Description */}
          <p className="text-sm text-gray-600">{description}</p>

          {/* Progress Bar */}
          {showProgress && (
            <div className="space-y-2">
              <ProgressBar
                animate={true}
                duration={progressDuration}
                maxValue={99}
                onComplete={onProgressComplete}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{progressText}</span>
                <span>กรุณารอสักครู่</span>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>• AI กำลังวิเคราะห์ข้อมูลของคุณ</p>
            <p>• การสร้าง Resume ที่เหมาะสม</p>
            <p>• ปรับแต่งรูปแบบให้สวยงาม</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
