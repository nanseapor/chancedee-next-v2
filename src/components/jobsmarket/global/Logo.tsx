"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * ChanceDee Logo Component
 * Per Section 2 of 01-navigation-shells.md
 *
 * Displays ChanceDee logo/wordmark using brand assets
 * Used across all shells
 */

export interface LogoProps {
  /** Variant for different contexts */
  variant?: "default" | "compact";
  /** Link destination */
  href?: string;
  /** Additional className */
  className?: string;
}

export function Logo({ variant = "default", href = process.env.NEXT_PUBLIC_CONTENT_HOST || "/", className = "" }: LogoProps) {
  const isCompact = variant === "compact";

  if (isCompact) {
    // Compact: Logo icon only
    return (
      <Link
        href={href}
        className={`flex items-center ${className}`}
        aria-label="ChanceDee"
      >
        <Image
          src="/icons/brand/logo-icon.svg"
          alt="ChanceDee"
          width={32}
          height={32}
          className="w-8 h-8"
        />
      </Link>
    );
  }

  // Default: Horizontal logo with wordmark
  return (
    <Link
      href={href}
      className={`flex items-center ${className}`}
      aria-label="ChanceDee"
    >
      <Image
        src="/images/brand/horizontal-logo.svg"
        alt="ChanceDee"
        width={140}
        height={40}
        className="h-8 w-auto"
      />
    </Link>
  );
}
