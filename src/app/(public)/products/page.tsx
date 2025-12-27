"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchAllProductService } from "@/redux/features/business/store/thunks/product-thunks";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useInfiniteScroll } from "@/components/shared/common/use-infinite-scroll";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const pageSize = 10;
  const hasPromotion = searchParams.get("hasPromotion") === "true";
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");

  const loadProducts = useCallback(
    async (pageNo: number, append: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await dispatch(
          fetchAllProductService({
            pageNo,
            pageSize,
            ...(hasPromotion && { hasPromotion: true }),
            ...(categoryId && { categoryId }),
            ...(brandId && { brandId }),
          })
        ).unwrap();

        if (append) {
          setProducts((prev) => [...prev, ...(response.content || [])]);
        } else {
          setProducts(response.content || []);
        }

        setHasMore(response.hasNext || false);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
        setInitialLoad(false);
      }
    },
    [dispatch, hasPromotion, categoryId, brandId, pageSize]
  );

  // Initial load
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    loadProducts(1, false);
  }, [loadProducts]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage, true);
    }
  }, [isLoading, hasMore, page, loadProducts]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading,
  });

  const getTitle = () => {
    if (hasPromotion) return "🔥 All Promotions";
    if (categoryId) return "Products by Category";
    if (brandId) return "Products by Brand";
    return "All Products";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{getTitle()}</h1>
          <p className="text-muted-foreground">
            {products.length} {products.length === 1 ? "product" : "products"}{" "}
            found
          </p>
        </div>

        {/* Initial Loading */}
        {initialLoad && <ProductGridSkeleton count={10} />}

        {/* Products Grid */}
        {!initialLoad && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
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
                  <span>Loading more products...</span>
                </div>
              )}
              {!hasMore && products.length > 0 && (
                <p className="text-muted-foreground">
                  No more products to load
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
                  Load More Products
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!initialLoad && products.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
