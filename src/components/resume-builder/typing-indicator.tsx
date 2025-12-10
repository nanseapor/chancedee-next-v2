import { MessageSquare } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <MessageSquare className="h-4 w-4" />
      <span className="text-sm">AI กำลังพิมพ์</span>
      <span className="flex gap-1">
        <span className="animate-pulse">•</span>
        <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>
          •
        </span>
        <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>
          •
        </span>
      </span>
    </div>
  );
}
