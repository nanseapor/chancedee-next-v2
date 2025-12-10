"use client";

export function TypingDots() {
  return (
    <div className="flex items-center gap-1 p-3">
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-[bounce_1.4s_ease-in-out_0s_infinite]" />
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
    </div>
  );
}
