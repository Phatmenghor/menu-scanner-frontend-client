"use client";

import { useEffect, useCallback } from "react";
import { usePublicCategoriesState } from "@/redux/features/main/store/state/public-categories-state";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { CategoryCardSkeleton } from "@/components/shared/skeletons/category-card-skeleton";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState, EmptyStatePresets } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/common/page-container";

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

  // Smart scroll: Keep position on navigation, reset on browser refresh
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
  }, [
    isLoadingMore,
    hasMore,
    pagination.currentPage,
    pageSize,
    fetchCategories,
  ]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="py-8">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isInitialLoading && categories.length === 0 && (
          <EmptyState {...EmptyStatePresets.noCategories} size="lg" />
        )}

        {/* Categories Grid */}
        {!isInitialLoading && categories.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}

              {/* Show skeleton cards while loading more - smooth inline loading (like YouTube) */}
              {isLoadingMore &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <CategoryCardSkeleton key={`loading-${i}`} />
                ))}
            </div>

            {/* Infinite Scroll Trigger - hidden */}
            {hasMore && !isLoadingMore && (
              <div ref={observerTarget} className="h-10" />
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
      </PageContainer>
    </div>
  );
}
