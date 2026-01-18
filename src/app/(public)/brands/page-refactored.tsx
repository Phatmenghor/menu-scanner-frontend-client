/**
 * Brands Page - Refactored with Redux and Caching
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
import { usePublicBrandsState } from "@/redux/features/main/store/state/public-brands-state";
import { Button } from "@/components/ui/button";
import { Loader2, PackageOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
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
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <Skeleton className="w-32 h-32 rounded-full mb-4" />
                  <Skeleton className="h-5 w-24" />
                </CardContent>
              </Card>
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
                <Link
                  key={brand.id}
                  href={`/products?brandId=${brand.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                      <div className="relative w-32 h-32 mb-4">
                        <Image
                          src={brand.imageUrl || "https://picsum.photos/200"}
                          alt={brand.name}
                          fill
                          className="object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-semibold text-center text-sm group-hover:text-primary transition-colors">
                        {brand.name}
                      </h3>
                      {brand.totalProducts !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {brand.totalProducts} products
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
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
                    <span>Loading more brands...</span>
                  </div>
                )}
              </div>
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
