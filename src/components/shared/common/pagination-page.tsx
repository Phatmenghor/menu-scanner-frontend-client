"use client";

import React, { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  className?: string;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
  showResultsText?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
}

type PaginationItem = number | "ellipsis" | "first" | "last";

export default function ImprovedPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 20, 50, 100],
  showResultsText = true,
  showFirstLast = false,
  maxVisiblePages = 7,
  size = "default",
  disabled = false,
}: PaginationProps) {
  // Memoized calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem =
      totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return {
      totalPages,
      startItem,
      endItem,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages,
    };
  }, [currentPage, totalItems, itemsPerPage]);

  // Generate pagination items
  const paginationItems = useMemo((): PaginationItem[] => {
    const { totalPages } = paginationData;
    const items: PaginationItem[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Complex pagination logic
      const sidePages = Math.floor((maxVisiblePages - 3) / 2); // Reserve space for first, last, and ellipsis

      if (showFirstLast) {
        items.push("first");
      } else {
        items.push(1);
      }

      let start = Math.max(2, currentPage - sidePages);
      let end = Math.min(totalPages - 1, currentPage + sidePages);

      // Adjust range if we're near the beginning
      if (currentPage <= sidePages + 1) {
        end = Math.min(totalPages - 1, maxVisiblePages - 2);
      }

      // Adjust range if we're near the end
      if (currentPage >= totalPages - sidePages) {
        start = Math.max(2, totalPages - maxVisiblePages + 3);
      }

      // Add ellipsis before start if needed
      if (start > 2) {
        items.push("ellipsis");
      }

      // Add page numbers
      for (let i = start; i <= end; i++) {
        items.push(i);
      }

      // Add ellipsis after end if needed
      if (end < totalPages - 1) {
        items.push("ellipsis");
      }

      // Add last page
      if (showFirstLast) {
        items.push("last");
      } else if (totalPages > 1) {
        items.push(totalPages);
      }
    }

    return items;
  }, [currentPage, paginationData.totalPages, maxVisiblePages, showFirstLast]);

  // Event handlers
  const handlePageChange = useCallback(
    (page: number) => {
      if (disabled || page === currentPage) return;
      onPageChange(Math.max(1, Math.min(page, paginationData.totalPages)));
    },
    [currentPage, paginationData.totalPages, onPageChange, disabled]
  );

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage: number) => {
      if (disabled || !onItemsPerPageChange) return;

      // Maintain the first visible item when changing items per page
      const currentFirstItem = (currentPage - 1) * itemsPerPage + 1;
      const newPage = Math.ceil(currentFirstItem / newItemsPerPage);

      onItemsPerPageChange(newItemsPerPage);
      onPageChange(Math.max(1, newPage));
    },
    [currentPage, itemsPerPage, onItemsPerPageChange, onPageChange, disabled]
  );

  // Handle special page navigation
  const handleSpecialPage = useCallback(
    (item: PaginationItem) => {
      switch (item) {
        case "first":
          handlePageChange(1);
          break;
        case "last":
          handlePageChange(paginationData.totalPages);
          break;
        case "ellipsis":
          // Do nothing for ellipsis
          break;
        default:
          handlePageChange(item);
      }
    },
    [handlePageChange, paginationData.totalPages]
  );

  // Size variants
  const sizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  const buttonSizes = {
    sm: "sm" as const,
    default: "sm" as const,
    lg: "default" as const,
  };

  if (totalItems === 0) {
    return (
      <div className={cn("flex items-center justify-center py-4", className)}>
        <p className={cn("text-muted-foreground", sizeClasses[size])}>
          No items to display
        </p>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      {/* Pagination navigation and controls in a single row */}
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Results text */}
        {showResultsText && (
          <p className={cn("text-muted-foreground", sizeClasses[size])}>
            Showing{" "}
            <span className="font-medium text-foreground">
              {paginationData.startItem.toLocaleString()}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {paginationData.endItem.toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {totalItems.toLocaleString()}
            </span>{" "}
            results
          </p>
        )}

        {/* Center: Pagination navigation */}
        <nav
          className="flex items-center gap-1"
          aria-label="Pagination navigation"
        >
          {/* Previous button */}
          <Button
            variant="outline"
            size={buttonSizes[size]}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!paginationData.hasPrevious || disabled}
            aria-label="Go to previous page"
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {paginationItems.map((item, index) => {
              if (item === "ellipsis") {
                return (
                  <div
                    key={`ellipsis-${index}`}
                    className="flex h-9 w-9 items-center justify-center"
                    aria-hidden="true"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              }

              const isCurrentPage =
                item === currentPage ||
                (item === "first" && currentPage === 1) ||
                (item === "last" && currentPage === paginationData.totalPages);

              const displayText =
                item === "first"
                  ? "1"
                  : item === "last"
                  ? paginationData.totalPages.toString()
                  : item.toString();

              return (
                <Button
                  key={item}
                  variant={isCurrentPage ? "default" : "outline"}
                  size={buttonSizes[size]}
                  onClick={() => handleSpecialPage(item)}
                  disabled={isCurrentPage || disabled}
                  aria-label={
                    item === "first"
                      ? "Go to first page"
                      : item === "last"
                      ? "Go to last page"
                      : `Go to page ${item}`
                  }
                  aria-current={isCurrentPage ? "page" : undefined}
                  className="h-9 w-9 p-0"
                >
                  {displayText}
                </Button>
              );
            })}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size={buttonSizes[size]}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!paginationData.hasNext || disabled}
            aria-label="Go to next page"
            className="gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>

        {/* Right side: Items per page selector */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-muted-foreground whitespace-nowrap",
                sizeClasses[size]
              )}
            >
              Items per page:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => handleItemsPerPageChange(Number(value))}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn(
                  "w-20",
                  size === "sm" && "h-8 text-xs",
                  size === "lg" && "h-11 text-base"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
