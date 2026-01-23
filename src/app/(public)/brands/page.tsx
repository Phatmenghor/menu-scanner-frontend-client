"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePublicBrandsState } from "@/redux/features/main/store/state/public-brands-state";
import { Button } from "@/components/ui/button";
import { PackageOpen, Loader2 } from "lucide-react";
import { BrandCard } from "@/components/shared/card/brand-card";
import { BrandCardSkeleton } from "@/components/shared/skeletons/brand-card-skeleton";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState } from "@/components/shared/empty-state";
import { useScrollAnchor } from "@/hooks/use-scroll-anchor";

export default function BrandsPage() {
  const isLoadingRef = useRef(false);

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

  // Initial load - only if not already loaded (caching!)
  useEffect(() => {
    if (!loaded) {
      fetchBrands({ pageNo: 1, pageSize, status: "ACTIVE" });
    }
  }, [loaded, pageSize]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoadingRef.current) {
      isLoadingRef.current = true;
      fetchBrands({
        pageNo: pagination.currentPage + 1,
        pageSize,
        status: "ACTIVE",
        append: true, // Append to existing data
      }).finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [isLoadingMore, hasMore, pagination.currentPage, pageSize, fetchBrands]);

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
          <h1 className="text-3xl font-bold mb-2">All Brands</h1>
          <p className="text-muted-foreground">
            {totalBrands > 0
              ? `Browse all ${totalBrands} brands`
              : "Discover our brands"}
          </p>
        </div>

        {/* Initial Loading */}
        {isInitialLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <BrandCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isInitialLoading && brands.length === 0 && (
          <EmptyState
            icon={PackageOpen}
            title="No brands found"
            description="There are no brands available at this time"
            size="lg"
          />
        )}

        {/* Brands Grid */}
        {!isInitialLoading && brands.length > 0 && (
          <div ref={containerRef}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}

              {/* Show skeleton cards while loading more - smooth inline loading (like YouTube) */}
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

            {/* Infinite Scroll Trigger - hidden */}
            {hasMore && !isLoadingMore && (
              <div ref={observerTarget} className="h-10" />
            )}

            {/* Load More Button (fallback) */}
            {!isLoadingMore && hasMore && (
              <div className="flex justify-center mt-8">
                <Button onClick={handleLoadMore} variant="outline" size="lg">
                  Load More Brands
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
