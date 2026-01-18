/**
 * Dynamic Modal Component
 * Supports multiple width sizes and responsive behavior
 */

"use client";

import React, { ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";

export interface DynamicModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  className?: string;
  /** Custom max width (e.g., "800px", "90%") */
  customMaxWidth?: string;
}

/**
 * Size configuration mapping
 */
const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",     // 448px - Small forms (login, simple inputs)
  md: "max-w-lg",     // 512px - Medium forms (2-3 fields)
  lg: "max-w-2xl",    // 672px - Large forms (multi-field, good for 2-column)
  xl: "max-w-3xl",    // 768px - Extra large (detail views, complex forms)
  "2xl": "max-w-4xl", // 896px - Very large (current default for edit)
  "3xl": "max-w-5xl", // 1024px - Extra wide (products with images)
  "4xl": "max-w-6xl", // 1152px - Maximum width (complex dashboards)
  full: "max-w-[95vw]", // Almost full screen
};

/**
 * Dynamic Modal Component
 *
 * Usage:
 * ```tsx
 * <DynamicModal isOpen={true} onClose={handleClose} size="lg">
 *   <YourContent />
 * </DynamicModal>
 * ```
 */
export function DynamicModal({
  isOpen,
  onClose,
  children,
  size = "2xl",
  className,
  customMaxWidth,
}: DynamicModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "w-[90%] max-h-[90vh] p-0 flex flex-col",
          customMaxWidth ? "" : sizeClasses[size],
          className
        )}
        style={customMaxWidth ? { maxWidth: customMaxWidth } : undefined}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Preset configurations for common use cases
 */
export const ModalSizePresets = {
  // Form modals
  simpleForm: "md" as ModalSize,      // 2-3 fields in 1 column
  standardForm: "lg" as ModalSize,    // Good for 2-column layouts
  complexForm: "2xl" as ModalSize,    // Multi-section forms

  // Detail/View modals
  detailView: "xl" as ModalSize,      // Good for 2-column detail view
  fullDetail: "2xl" as ModalSize,     // Extensive details

  // Specialized
  productForm: "3xl" as ModalSize,    // Products with image galleries
  dashboard: "4xl" as ModalSize,      // Analytics/reports
};
