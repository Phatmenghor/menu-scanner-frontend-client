"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePublicCategoriesState } from "@/redux/features/main/store/state/public-categories-state";
import { LayoutGrid, Loader2 } from "lucide-react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { CategoryCardSkeleton } from "@/components/shared/skeletons/category-card-skeleton";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/common/page-container";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";
import { PageHeader } from "@/components/shared/common/page-header";

export default function CategoriesPage() {
  const isLoadingRef = useRef(false);

  const {
    categories,
    pagination,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    totalCategories,
    fetchCategories,
  } = usePublicCategoriesState();

  const pageSize = 12;
  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);

  useScrollRestoration({ enabled: true, restoreOnMount: true, customKey: "categories" });
  const { containerRef } = useScrollAnchor(isLoadingMore);

  useEffect(() => {
    fetchCategories({ pageNo: 1, pageSize, status: "ACTIVE" });
  }, [pageSize, fetchCategories]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoadingRef.current) {
      isLoadingRef.current = true;
      fetchCategories({
        pageNo: pagination.currentPage + 1,
        pageSize,
        status: "ACTIVE",
        append: true,
      }).finally(() => {
        isLoadingRef.current = false;
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
      <PageContainer className="py-4 sm:py-8">
        <PageHeader
          title="Categories"
          icon={LayoutGrid}
          count={totalCategories}
          subtitle={
            isInitialLoading
              ? "Loading categories..."
              : totalCategories > 0
              ? `${totalCategories} categories available`
              : "Browse all categories"
          }
        />

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
          <EmptyState
            icon={LayoutGrid}
            title="No categories found"
            description="There are no categories available at this time"
            size="lg"
          />
        )}

        {/* Categories Grid */}
        {!isInitialLoading && categories.length > 0 && (
          <div ref={containerRef}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
              {isLoadingMore &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <CategoryCardSkeleton key={`more-${i}`} />
                ))}
            </div>

            {isLoadingMore && (
              <div className="flex items-center justify-center py-6 mt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              </div>
            )}

            {!hasMore && !isLoadingMore && categories.length > 0 && (
              <p className="text-center text-xs text-muted-foreground py-6">
                Showing all {totalCategories} categories
              </p>
            )}

            {hasMore && !isLoadingMore && (
              <div ref={observerTarget} className="h-10" />
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
