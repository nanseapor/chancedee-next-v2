"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description?: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed: 0 = first step active, steps.length = all complete
}

/**
 * ProgressStepper - Shows onboarding progress for pending users
 * Per AUTH-R05 RIS §5.2-5.3
 *
 * Staff flow: 3 steps
 * - Signup completed
 * - Waiting for company approval  ← current
 * - Complete
 *
 * Company flow: 5 steps
 * - Signup completed
 * - Waiting for Chancedee approval  ← current
 * - Documents verified
 * - Employer contract signed
 * - Complete
 */
export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full py-4">
      <ol className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <li key={index} className="flex gap-4 items-start">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-background text-primary",
                    isPending && "border-muted bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-8 mt-2",
                      index < currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pt-1">
                <p
                  className={cn(
                    "font-medium text-sm",
                    isCurrent && "text-foreground",
                    isCompleted && "text-muted-foreground",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
