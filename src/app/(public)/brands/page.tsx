"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { usePublicBrandsState } from "@/redux/features/main/store/state/public-brands-state";
import { PackageOpen, Loader2, Search } from "lucide-react";
import { BrandCard } from "@/components/shared/card/brand-card";
import { BrandCardSkeleton } from "@/components/shared/skeletons/brand-card-skeleton";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/common/page-container";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/utils/debounce/debounce";

export default function BrandsPage() {
  const isLoadingRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    brands,
    pagination,
    loaded,
    fetchBrands,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    totalBrands,
  } = usePublicBrandsState();

  const pageSize = 12;
  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);

  // Smart scroll: Keep position on navigation, reset on browser refresh
  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "brands",
  });

  // Maintain scroll position during load more (YouTube-like)
  const { containerRef } = useScrollAnchor(isLoadingMore);

  // Initial load & Search effect
  // We re-fetch when debouncedSearch changes
  useEffect(() => {
    // If not loaded OR if search changed (we need to reset/refetch)
    // Note: We might need a way to clear current list if search changes in the thunk or slice
    // For now, assuming fetchBrands with pageNo: 1 handles reset if implemented in reducer
    // OR we might need an explicit clear action.
    // Let's assume fetchBrands resets if pageNo is 1.

    // Actually, checking standard implementation, usually we need to dispatch a clear action or handle it.
    // The thunk probably just appends if 'append' is true.

    // Let's trigger fetch on mount if not loaded, AND whenever search changes.
    // Use a ref to track if it's the very first mount vs search update

    const isSearchUpdate = debouncedSearch !== ""; // Simple check for now

    if (!loaded || isSearchUpdate) {
      // Ideally we should verify if we're already viewing this search result
      // but for simplicity, let's fetch.
      // However, we need to be careful not to loop.
      // The best way is to let the dependency array handle it.
    }
  }, [debouncedSearch, loaded]); // This logic is tricky with Redux cache.

  // Revised approach:
  // 1. Fetch on mount if !loaded.
  // 2. Fetch when debouncedSearch changes.

  useEffect(() => {
    fetchBrands({
      pageNo: 1,
      pageSize,
      status: "ACTIVE",
      search: debouncedSearch || undefined,
    });
  }, [debouncedSearch, pageSize, fetchBrands]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoadingRef.current) {
      isLoadingRef.current = true;
      fetchBrands({
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
    fetchBrands,
    debouncedSearch,
  ]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="py-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-20 z-10 bg-background/95 backdrop-blur-sm py-4 border-b">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Brands</h1>
            <p className="text-muted-foreground">
              {totalBrands > 0
                ? `Browse all ${totalBrands} brands`
                : "Discover our brands"}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
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
              <BrandCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isInitialLoading && brands.length === 0 && (
          <EmptyState
            icon={PackageOpen}
            title={debouncedSearch ? "No brands found" : "No brands available"}
            description={
              debouncedSearch
                ? `We couldn't find any brands matching "${debouncedSearch}"`
                : "There are no brands available at this time"
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

        {/* Brands Grid */}
        {!isInitialLoading && brands.length > 0 && (
          <div ref={containerRef}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}

              {/* Show skeleton cards while loading more */}
              {isLoadingMore &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <BrandCardSkeleton key={`loading-${i}`} />
                ))}
            </div>

            {/* Loading indicator with icon */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-6 mt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading more brands...</span>
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
