"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchPublicProducts,
  fetchPublicCategories,
  fetchPublicBrands,
} from "@/redux/features/main/store/thunks/public-product-thunks";
import { clearProducts } from "@/redux/features/main/store/slice/public-product-slice";
import { usePublicProductState } from "@/redux/features/main/store/state/public-product-state";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { Loader2, CheckCircle2 } from "lucide-react";
import { ProductFilters } from "@/redux/features/main/components/product/product-filters";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const observerRef = useRef<HTMLDivElement>(null);

  const { dispatch, pagination, loading, categories, brands } =
    usePublicProductState();

  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<ProductDetailResponseModel[]>(
    []
  );
  const [skeletonCount, setSkeletonCount] = useState(12);

  const search = searchParams.get("q");
  const hasPromotion = searchParams.get("hasPromotion") === "true";
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy");

  useEffect(() => {
    dispatch(fetchPublicCategories());
    dispatch(fetchPublicBrands());
  }, [dispatch]);

  useEffect(() => {
    const updateSkeletonCount = () => {
      const width = window.innerWidth;
      if (width < 640) setSkeletonCount(4);
      else if (width < 768) setSkeletonCount(6);
      else if (width < 1024) setSkeletonCount(8);
      else if (width < 1280) setSkeletonCount(10);
      else setSkeletonCount(12);
    };

    updateSkeletonCount();
    window.addEventListener("resize", updateSkeletonCount);
    return () => window.removeEventListener("resize", updateSkeletonCount);
  }, []);

  const loadProducts = useCallback(
    async (pageNo: number) => {
      const result = await dispatch(
        fetchPublicProducts({
          pageNo,
          pageSize: 20,
          ...(search && { search }),
          ...(hasPromotion && { hasPromotion: true }),
          ...(categoryId && { categoryId }),
          ...(brandId && { brandId }),
        })
      ).unwrap();

      if (pageNo === 1) {
        setAllProducts(result.content || []);
      } else {
        setAllProducts((prev) => [...prev, ...(result.content || [])]);
      }
    },
    [dispatch, search, hasPromotion, categoryId, brandId, status, sortBy]
  );

  useEffect(() => {
    dispatch(clearProducts());
    setAllProducts([]);
    setPage(1);
    loadProducts(1);
  }, [
    search,
    hasPromotion,
    categoryId,
    brandId,
    status,
    sortBy,
    loadProducts,
    dispatch,
  ]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !loading.list) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage);
    }
  }, [pagination.hasMore, loading.list, page, loadProducts]);

  useEffect(() => {
    if (!observerRef.current || !pagination.hasMore || loading.list) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && !loading.list) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [pagination.hasMore, loading.list, handleLoadMore]);

  const getTitle = () => {
    if (search) return `Search results for "${search}"`;
    if (hasPromotion) return "🔥 All Promotions";
    if (categoryId) {
      const category = categories.find((c) => c.id === categoryId);
      return category ? category.name : "Products by Category";
    }
    if (brandId) {
      const brand = brands.find((b) => b.id === brandId);
      return brand ? brand.name : "Products by Brand";
    }
    return "All Products";
  };

  const isInitialLoad = allProducts.length === 0 && loading.list;
  const isPaginationLoading = allProducts.length > 0 && loading.list;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilters
              categories={categories}
              brands={brands}
              totalResults={allProducts.length}
            />
          </aside>

          <div className="flex-1">
            <div className="lg:hidden mb-6">
              <ProductFilters
                categories={categories}
                brands={brands}
                totalResults={allProducts.length}
              />
            </div>

            {isInitialLoad && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {Array.from({ length: 30 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            )}

            {!isInitialLoad && allProducts.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {allProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}

                  {isPaginationLoading && (
                    <>
                      {Array.from({ length: skeletonCount }).map((_, index) => (
                        <ProductCardSkeleton key={`loading-${index}`} />
                      ))}
                    </>
                  )}
                </div>

                {isPaginationLoading && (
                  <div className="flex items-center justify-center mt-6 py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                {pagination.hasMore && !loading.list && (
                  <div ref={observerRef} className="h-20" />
                )}

                {!pagination.hasMore && allProducts.length > 0 && (
                  <div className="flex flex-col items-center justify-center mt-10 py-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      You've seen it all!
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      You've reached the end of products. Check back later for
                      new arrivals!
                    </p>
                  </div>
                )}
              </>
            )}

            {!isInitialLoad && allProducts.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground">
                  {search
                    ? `No results for "${search}". Try different keywords.`
                    : "Try adjusting your filters or check back later"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
