/**
 * Enhanced Detail Modal with 2-Column Support
 * Supports flexible layouts and dynamic sizing
 */

"use client";

import React, { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import Loading from "@/components/shared/common/loading";
import { cn } from "@/lib/utils";
import { ModalSize } from "./dynamic-modal";

export interface EnhancedDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  avatarUrl?: string;
  avatarName?: string;
  badges?: ReactNode;
  children: ReactNode;
  /** Modal size (default: xl for 2-column detail views) */
  size?: ModalSize;
  /** Custom max width */
  customMaxWidth?: string;
  /** Additional className for content */
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  "2xl": "max-w-4xl",
  "3xl": "max-w-5xl",
  "4xl": "max-w-6xl",
  full: "max-w-[95vw]",
};

/**
 * Enhanced Detail Modal with support for 2-column layouts
 *
 * Usage:
 * ```tsx
 * <EnhancedDetailModal
 *   isOpen={true}
 *   onClose={handleClose}
 *   title="Brand Details"
 *   size="lg"
 * >
 *   <DetailGrid columns={2}>
 *     <DetailRow label="Name" value="Brand Name" />
 *     <DetailRow label="Status" value={<Badge>Active</Badge>} />
 *   </DetailGrid>
 * </EnhancedDetailModal>
 * ```
 */
export function EnhancedDetailModal({
  isOpen,
  onClose,
  isLoading = false,
  title = "Details",
  description,
  avatarUrl,
  avatarName,
  badges,
  children,
  size = "xl",
  customMaxWidth,
  className,
}: EnhancedDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "w-[90%] h-[90vh] p-0 gap-0 flex flex-col",
          customMaxWidth ? "" : sizeClasses[size]
        )}
        style={customMaxWidth ? { maxWidth: customMaxWidth } : undefined}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            {(avatarUrl || avatarName) && (
              <CustomAvatar imageUrl={avatarUrl} name={avatarName} size="xl" />
            )}

            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
              {badges && (
                <div className="flex items-center gap-2 mt-2">{badges}</div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className={cn("p-6", className)}>
            {isLoading ? <Loading /> : children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/**
 * DetailGrid - Grid layout for detail rows
 */
export interface DetailGridProps {
  children: ReactNode;
  columns?: 1 | 2;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

export function DetailGrid({
  children,
  columns = 1,
  gap = "md",
  className,
}: DetailGridProps) {
  return (
    <div
      className={cn(
        "grid",
        columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * DetailRow - Individual field in detail view
 */
export interface DetailRowProps {
  label: string;
  value?: ReactNode;
  /** Whether this is the last row (removes bottom border) */
  isLast?: boolean;
  /** Additional className */
  className?: string;
}

export function DetailRow({
  label,
  value,
  isLast = false,
  className,
}: DetailRowProps) {
  return (
    <div
      className={cn(
        "py-3",
        !isLast && "border-b border-border/50",
        className
      )}
    >
      <dt className="text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </dt>
      <dd className="text-sm text-foreground">
        {value || (
          <span className="text-muted-foreground italic">Not provided</span>
        )}
      </dd>
    </div>
  );
}

/**
 * DetailSection - Grouped section with title
 */
export interface DetailSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  /** Show divider before section */
  divider?: boolean;
}

export function DetailSection({
  title,
  children,
  className,
  divider = false,
}: DetailSectionProps) {
  return (
    <div className={cn(divider && "border-t pt-6 mt-6", "space-y-3", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-foreground border-l-2 border-primary pl-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/**
 * DetailFullRow - Spans full width in 2-column grid
 */
export function DetailFullRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("md:col-span-2", className)}>{children}</div>;
}
