"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatSearchBarProps {
  /** Current search value (controlled) */
  value?: string;
  /** Callback when search value changes */
  onChange?: (value: string) => void;
  /** Callback when search should be executed (for uncontrolled with debounce) */
  onSearch: (query: string) => void;
  /** Clear callback */
  onClear?: () => void;
  /** Debounce delay in ms (0 for no debounce) */
  debounceMs?: number;
  /** Show loading indicator */
  isLoading?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * ChatSearchBar Component
 *
 * Search input for filtering chat rooms.
 * Supports both controlled and uncontrolled modes with optional debouncing.
 *
 * Per CHAT-R01 RIS §3.3 Search Functionality
 */
export function ChatSearchBar({
  value: controlledValue,
  onChange,
  onSearch,
  onClear,
  debounceMs = 300,
  isLoading = false,
  className,
}: ChatSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Uncontrolled internal state
  const [internalValue, setInternalValue] = useState("");

  // Determine if we're in controlled mode
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Handle input change
  const handleChange = useCallback(
    (newValue: string) => {
      if (isControlled) {
        onChange?.(newValue);
      } else {
        setInternalValue(newValue);
      }

      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Execute search with debounce
      if (debounceMs > 0) {
        debounceTimerRef.current = setTimeout(() => {
          onSearch(newValue);
        }, debounceMs);
      } else {
        onSearch(newValue);
      }
    },
    [isControlled, onChange, onSearch, debounceMs]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    if (isControlled) {
      onChange?.("");
    } else {
      setInternalValue("");
    }
    onSearch("");
    onClear?.();
    inputRef.current?.focus();
  }, [isControlled, onChange, onSearch, onClear]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape" && value) {
        handleClear();
      }
    },
    [value, handleClear]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div role="search" className={cn("relative", className)}>
      {/* Search icon */}
      <Search
        data-testid="search-icon"
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
      />

      {/* Input */}
      <Input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label="ค้นหาการสนทนา"
        placeholder="ค้นหาการสนทนา..."
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-10 pr-10"
      />

      {/* Loading indicator or clear button */}
      {isLoading ? (
        <Loader2
          data-testid="search-loading"
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin"
        />
      ) : value ? (
        <Button
          data-testid="clear-button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-muted"
          onClick={handleClear}
          aria-label="ล้างการค้นหา"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
