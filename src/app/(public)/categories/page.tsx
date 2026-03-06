"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { usePublicCategoriesState } from "@/redux/features/main/store/state/public-categories-state";
import { LayoutGrid, Loader2, Search } from "lucide-react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { CategoryCardSkeleton } from "@/components/shared/skeletons/category-card-skeleton";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/common/page-container";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/utils/debounce/debounce";

export default function CategoriesPage() {
  const isLoadingRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    categories,
    pagination,
    loaded,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    totalCategories,
    fetchCategories,
  } = usePublicCategoriesState();

  const pageSize = 12;
  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);

  // Smart scroll: Keep position on navigation, reset on browser refresh
  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "categories",
  });

  // Maintain scroll position during load more (YouTube-like)
  const { containerRef } = useScrollAnchor(isLoadingMore);

  // Initial load & Search effect
  useEffect(() => {
    fetchCategories({
      pageNo: 1,
      pageSize,
      status: "ACTIVE",
      search: debouncedSearch || undefined,
    });
  }, [debouncedSearch, pageSize, fetchCategories]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoadingRef.current) {
      isLoadingRef.current = true;
      fetchCategories({
        pageNo: pagination.currentPage + 1,
        pageSize,
        status: "ACTIVE",
        search: debouncedSearch || undefined,
        append: true,
      }).finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [
    isLoadingMore,
    hasMore,
    pagination.currentPage,
    pageSize,
    fetchCategories,
    debouncedSearch,
  ]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="py-4 sm:py-8">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-8 sticky top-16 z-10 bg-background/95 backdrop-blur-sm py-3 sm:py-4 border-b">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold">Categories</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {totalCategories > 0
                ? `Explore ${totalCategories} categories`
                : "Browse all categories"}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 focus:bg-background transition-colors"
              />
            </div>
          </div>
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
          <EmptyState
            icon={LayoutGrid}
            title={
              debouncedSearch ? "No categories found" : "No categories found"
            }
            description={
              debouncedSearch
                ? `We couldn't find any categories matching "${debouncedSearch}"`
                : "There are no categories available at this time"
            }
            size="lg"
            action={
              debouncedSearch
                ? {
                    label: "Clear Search",
                    onClick: () => setSearchQuery(""),
                    variant: "outline",
                  }
                : undefined
            }
          />
        )}

        {/* Categories Grid */}
        {!isInitialLoading && categories.length > 0 && (
          <div ref={containerRef}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}

              {/* Show skeleton cards while loading more */}
              {isLoadingMore &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <CategoryCardSkeleton key={`loading-${i}`} />
                ))}
            </div>

            {/* Loading indicator */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-6 mt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading more categories...</span>
                </div>
              </div>
            )}

            {/* Infinite Scroll Trigger */}
            {hasMore && !isLoadingMore && (
              <div ref={observerTarget} className="h-10" />
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
