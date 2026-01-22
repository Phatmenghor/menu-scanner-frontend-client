"use client";

import { useEffect, useCallback } from "react";
import { usePublicBrandsState } from "@/redux/features/main/store/state/public-brands-state";
import { Button } from "@/components/ui/button";
import { PackageOpen } from "lucide-react";
import { BrandCard } from "@/components/shared/card/brand-card";
import { BrandCardSkeleton } from "@/components/shared/skeletons/brand-card-skeleton";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";
import { EmptyState } from "@/components/shared/empty-state";

export default function BrandsPage() {
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

  // Scroll restoration
  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "brands",
  });

  // Initial load - only if not already loaded (caching!)
  useEffect(() => {
    if (!loaded) {
      fetchBrands({ pageNo: 1, pageSize, status: "ACTIVE" });
    }
  }, [loaded, pageSize]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchBrands({
        pageNo: pagination.currentPage + 1,
        pageSize,
        status: "ACTIVE",
        append: true, // Append to existing data
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
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}

              {/* Show skeleton cards while loading more - smooth inline loading */}
              {isLoadingMore &&
                Array.from({ length: 6 }).map((_, i) => (
                  <BrandCardSkeleton key={`loading-${i}`} />
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
                  Load More Brands
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
