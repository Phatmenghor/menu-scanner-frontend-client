"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppDispatch } from "@/redux/store";
import { fetchAllBrandService } from "@/redux/features/master-data/store/thunks/brand-thunks";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function BrandsPage() {
  const dispatch = useAppDispatch();

  const [brands, setBrands] = useState<BrandResponseModel[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const pageSize = 12;

  const loadBrands = useCallback(
    async (pageNo: number, append: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await dispatch(
          fetchAllBrandService({
            pageNo,
            pageSize,
            status: "ACTIVE",
          })
        ).unwrap();

        if (append) {
          setBrands((prev) => [...prev, ...(response.content || [])]);
        } else {
          setBrands(response.content || []);
        }

        setHasMore(response.hasNext || false);
      } catch (error) {
        console.error("Error loading brands:", error);
      } finally {
        setIsLoading(false);
        setInitialLoad(false);
      }
    },
    [dispatch, pageSize]
  );

  // Initial load
  useEffect(() => {
    loadBrands(1, false);
  }, [loadBrands]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadBrands(nextPage, true);
    }
  }, [isLoading, hasMore, page, loadBrands]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Brands</h1>
          <p className="text-muted-foreground">
            Browse all {brands.length} brands
          </p>
        </div>

        {/* Initial Loading */}
        {initialLoad && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <Skeleton className="w-32 h-32 rounded-full mb-4" />
                  <Skeleton className="h-5 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Brands Grid */}
        {!initialLoad && brands.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brandId=${brand.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardContent className="p-6 flex flex-col items-center justify-center">
                      <div className="w-32 h-32 flex items-center justify-center mb-4 overflow-hidden rounded-full bg-muted group-hover:bg-muted/70 transition-colors">
                        {brand.imageUrl ? (
                          <Image
                            src={brand.imageUrl}
                            alt={brand.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-bold text-muted-foreground">
                            {brand.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-center line-clamp-1 mb-1">
                        {brand.name}
                      </h3>
                      {brand.activeProducts > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {brand.activeProducts} products
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Infinite Scroll Observer */}
            <div
              ref={observerTarget}
              className="h-20 flex items-center justify-center mt-8"
            >
              {isLoading && hasMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading more brands...</span>
                </div>
              )}
              {!hasMore && brands.length > 0 && (
                <p className="text-muted-foreground">No more brands to load</p>
              )}
            </div>

            {/* Manual Load More Button (fallback) */}
            {hasMore && !isLoading && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  size="lg"
                  disabled={isLoading}
                >
                  Load More Brands
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!initialLoad && brands.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No brands found</h3>
            <p className="text-muted-foreground">
              Check back later for new brands
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
