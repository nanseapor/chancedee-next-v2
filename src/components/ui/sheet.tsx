"use client";

import type * as React from "react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface SheetContentProps {
  className?: string;
  children: React.ReactNode;
  side?: 'right' | 'bottom';
}

interface SheetHeaderProps {
  children: React.ReactNode;
}

interface SheetTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface SheetDescriptionProps {
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

export function SheetContent({ className = "", children, side = 'right' }: SheetContentProps) {
  const sideStyles = side === 'bottom'
    ? 'bottom-0 left-0 right-0 border-t'
    : 'right-0 top-0 h-full border-l';

  return (
    <div
      className={`fixed bg-background shadow-lg ${sideStyles} ${className}`}
    >
      {children}
    </div>
  );
}

export function SheetHeader({ children }: SheetHeaderProps) {
  return <div className="border-b p-4">{children}</div>;
}

export function SheetTitle({ className = "", children }: SheetTitleProps) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

export function SheetDescription({ children }: SheetDescriptionProps) {
  return <p className="text-sm text-muted-foreground mt-1">{children}</p>;
}

interface SheetFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function SheetFooter({ className = "", children }: SheetFooterProps) {
  return <div className={`border-t p-4 flex gap-2 ${className}`}>{children}</div>;
}
