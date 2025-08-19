// components/ui/load-more-pagination.tsx
"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMorePaginationProps<T> {
  // Data
  items: T[];
  totalElements: number;
  hasMore: boolean | null;

  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;

  // Callbacks
  onLoadMore: () => Promise<void>;

  // Customization
  loadMoreText?: string;
  loadingText?: string;
  noMoreText?: string;
  showCount?: boolean;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "sm" | "default" | "lg";
  className?: string;
}

export function LoadMorePagination<T>({
  items,
  totalElements,
  hasMore,
  isLoading,
  isLoadingMore,
  onLoadMore,
  loadMoreText = "View All",
  loadingText = "Loading more...",
  noMoreText = "No more items",
  showCount = true,
  buttonVariant = "outline",
  buttonSize = "default",
  className = "",
}: LoadMorePaginationProps<T>) {
  // Don't render if initial loading
  if (isLoading) {
    return null;
  }

  // Don't render if no items
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center gap-4 mt-8 ${className}`}>
      {/* Count Display */}
      {showCount && (
        <p className="text-sm text-gray-500">
          Showing {items.length} of {totalElements} items
        </p>
      )}

      {/* Load More Button */}
      {hasMore ? (
        <Button
          variant={buttonVariant}
          size={buttonSize}
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="min-w-[120px]"
        >
          {isLoadingMore ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {loadingText}
            </>
          ) : (
            loadMoreText
          )}
        </Button>
      ) : (
        // End message
        items.length > 0 && (
          <p className="text-sm text-gray-400 italic">{noMoreText}</p>
        )
      )}
    </div>
  );
}
