/**
 * Categories Page - Refactored with Redux and Caching
 *
 * Features:
 * - Redux state management with caching
 * - Scroll position restoration
 * - Infinite scroll
 * - Responsive skeleton loading
 * - Empty state handling
 * - No re-fetch when navigating back
 */

"use client";

import { useEffect, useCallback } from "react";
import { usePublicCategoriesState } from "@/redux/features/main/store/state/public-categories-state";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryCard } from "@/components/shared/card/category-card";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState, EmptyStatePresets } from "@/components/shared/empty-state";

export default function CategoriesPage() {
  const {
    categories,
    pagination,
    loaded,
    fetchCategories,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    totalCategories,
  } = usePublicCategoriesState();

  const pageSize = 12;
  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);

  // Scroll restoration
  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "categories",
  });

  // Initial load - only if not already loaded (caching!)
  useEffect(() => {
    if (!loaded) {
      fetchCategories({ pageNo: 1, pageSize, status: "ACTIVE" });
    }
  }, [loaded, pageSize]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchCategories({
        pageNo: pagination.currentPage + 1,
        pageSize,
        status: "ACTIVE",
        append: true,
      });
    }
  }, [isLoadingMore, hasMore, pagination.currentPage, pageSize, fetchCategories]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Categories</h1>
          <p className="text-muted-foreground">
            {totalCategories > 0
              ? `Browse all ${totalCategories} categories`
              : "Explore our categories"}
          </p>
        </div>

        {/* Initial Loading */}
        {isInitialLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className="h-[200px] flex flex-col rounded-lg border overflow-hidden"
              >
                <Skeleton className="h-[140px] w-full" />
                <div className="p-3 flex-1 flex items-center justify-center">
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isInitialLoading && categories.length === 0 && (
          <EmptyState
            {...EmptyStatePresets.noCategories}
            size="lg"
          />
        )}

        {/* Categories Grid */}
        {!isInitialLoading && categories.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div
                ref={observerTarget}
                className="flex justify-center items-center py-8"
              >
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading more categories...</span>
                  </div>
                )}
              </div>
            )}

            {/* Load More Button (fallback) */}
            {!isLoadingMore && hasMore && (
              <div className="flex justify-center mt-8">
                <Button onClick={handleLoadMore} variant="outline" size="lg">
                  Load More Categories
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
