"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppDispatch } from "@/redux/store";
import { fetchAllCategoriesService } from "@/redux/features/master-data/store/thunks/categories-thunks";
import { CategoryCard } from "@/components/shared/card/category-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useSkeletonCount, SkeletonPresets } from "@/hooks/use-skeleton-count";

export default function CategoriesPage() {
  const dispatch = useAppDispatch();

  const [categories, setCategories] = useState<CategoriesResponseModel[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const pageSize = 12;

  // Use responsive skeleton count
  const skeletonCount = useSkeletonCount(SkeletonPresets.categoryGrid);

  // Scroll restoration
  useScrollRestoration({
    enabled: true,
    restoreOnMount: true,
    customKey: "categories",
  });

  const loadCategories = useCallback(
    async (pageNo: number, append: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await dispatch(
          fetchAllCategoriesService({
            pageNo,
            pageSize,
            status: "ACTIVE",
          })
        ).unwrap();

        if (append) {
          setCategories((prev) => [...prev, ...(response.content || [])]);
        } else {
          setCategories(response.content || []);
        }

        setHasMore(response.hasNext || false);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setIsLoading(false);
        setInitialLoad(false);
      }
    },
    [dispatch, pageSize]
  );

  // Initial load
  useEffect(() => {
    loadCategories(1, false);
  }, [loadCategories]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadCategories(nextPage, true);
    }
  }, [isLoading, hasMore, page, loadCategories]);

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
          <h1 className="text-3xl font-bold mb-2">All Categories</h1>
          <p className="text-muted-foreground">
            Browse all {categories.length} categories
          </p>
        </div>

        {/* Initial Loading */}
        {initialLoad && (
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

        {/* Categories Grid */}
        {!initialLoad && categories.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
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
                  <span>Loading more categories...</span>
                </div>
              )}
              {!hasMore && categories.length > 0 && (
                <p className="text-muted-foreground">
                  No more categories to load
                </p>
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
                  Load More Categories
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!initialLoad && categories.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No categories found</h3>
            <p className="text-muted-foreground">
              Check back later for new categories
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
