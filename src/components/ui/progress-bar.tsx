/**
 * Progress Bar Component with Fake Progress Animation
 */

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  value?: number;
  className?: string;
  animate?: boolean;
  duration?: number; // in milliseconds
  maxValue?: number; // maximum value to reach (e.g., 99 for 99%)
  onComplete?: () => void;
}

export function ProgressBar({
  value = 0,
  className,
  animate = false,
  duration = 90000, // 1:30 seconds
  maxValue = 99,
  onComplete,
}: ProgressBarProps) {
  const [progress, setProgress] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animate && !isAnimating) {
      setIsAnimating(true);
      setProgress(0);

      const startTime = Date.now();
      const endTime = startTime + duration;

      const updateProgress = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progressPercent = Math.min(
          (elapsed / duration) * maxValue,
          maxValue,
        );

        // Easing function for smooth animation (ease-out)
        const easedProgress =
          maxValue * (1 - Math.pow(1 - elapsed / duration, 3));
        const clampedProgress = Math.min(easedProgress, maxValue);

        setProgress(clampedProgress);

        if (currentTime < endTime && clampedProgress < maxValue) {
          requestAnimationFrame(updateProgress);
        } else {
          setProgress(maxValue);
          onComplete?.();
        }
      };

      requestAnimationFrame(updateProgress);
    }
  }, [animate, duration, maxValue, onComplete, isAnimating]);

  useEffect(() => {
    if (!animate) {
      setProgress(value);
      setIsAnimating(false);
    }
  }, [animate, value]);

  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          transition: animate ? "width 0.3s ease-out" : "width 0.3s ease-out",
        }}
      />
    </div>
  );
}

export default ProgressBar;
