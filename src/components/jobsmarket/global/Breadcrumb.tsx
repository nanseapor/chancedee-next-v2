"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * Breadcrumb Component
 * Per Section 2 of 01-navigation-shells.md
 *
 * Displays current location with navigation links
 * Format: Home > Section > Page
 */

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Link href (omit for current page) */
  href?: string;
}

export interface BreadcrumbProps {
  /** List of breadcrumb items */
  items: BreadcrumbItem[];
  /** Additional className */
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 ${className}`}>
      {/* Home Icon */}
      <Link
        href="/"
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="หน้าหลัก"
      >
        <Home className="w-4 h-4" />
      </Link>

      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {/* Separator */}
            <ChevronRight className="w-4 h-4 text-gray-400" />

            {/* Breadcrumb Item */}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`text-sm ${isLast ? "text-gray-900 font-medium" : "text-gray-600"}`}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
