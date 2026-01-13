"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchPublicProducts,
  fetchPublicCategories,
  fetchPublicBrands,
} from "@/redux/features/main/store/thunks/public-product-thunks";
import {
  clearProducts,
  setScrollY,
} from "@/redux/features/main/store/slice/public-product-slice";
import { usePublicProductState } from "@/redux/features/main/store/state/public-product-state";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { Loader2, CheckCircle2 } from "lucide-react";
import { ProductFilters } from "@/redux/features/main/components/product/product-filters";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const observerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const {
    dispatch,
    products,
    pagination,
    loading,
    categories,
    brands,
    scrollY,
  } = usePublicProductState();

  const [page, setPage] = useState(1);
  const [skeletonCount, setSkeletonCount] = useState(12);

  const search = searchParams.get("q");
  const hasPromotion = searchParams.get("hasPromotion") === "true";
  const categoryId = searchParams.get("categoryId");
  const brandId = searchParams.get("brandId");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy");

  // Fetch categories and brands once
  useEffect(() => {
    dispatch(fetchPublicCategories());
    dispatch(fetchPublicBrands());
  }, [dispatch]);

  // Update skeleton count based on screen size
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

  // Restore scroll ONLY on initial mount (coming back from product detail)
  useEffect(() => {
    if (isInitialMount.current && scrollY > 0) {
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 100);
    }
    isInitialMount.current = false;
  }, [scrollY]);

  // Save scroll position on page scroll (for navigation to product detail)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        dispatch(setScrollY(window.scrollY));
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [dispatch]);

  const loadProducts = useCallback(
    async (pageNo: number) => {
      await dispatch(
        fetchPublicProducts({
          pageNo,
          pageSize: 20,
          ...(search && { search }),
          ...(hasPromotion && { hasPromotion: true }),
          ...(categoryId && { categoryId }),
          ...(brandId && { brandId }),
          ...(status && { status }),
          ...(sortBy && { sortBy }),
        })
      );
    },
    [dispatch, search, hasPromotion, categoryId, brandId, status, sortBy]
  );

  // Reset and load products when filters change + SCROLL TO TOP
  useEffect(() => {
    dispatch(clearProducts());
    setPage(1);

    // Scroll page to top when filters change
    window.scrollTo({ top: 0, behavior: "smooth" });

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

  // Intersection observer for infinite scroll
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

  const isInitialLoad = products.length === 0 && loading.list;
  const isPaginationLoading = products.length > 0 && loading.list;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6 lg:gap-8">
        {/* Desktop Sidebar Filters - Sticky with Own Scroll */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <ProductFilters
            categories={categories}
            brands={brands}
            totalResults={pagination.totalElements}
          />
        </aside>

        {/* Main Product List - Scrolls with Page */}
        <div className="flex-1 min-w-0">
          {/* Mobile Filters */}
          <div className="lg:hidden mb-6">
            <ProductFilters
              categories={categories}
              brands={brands}
              totalResults={pagination.totalElements}
            />
          </div>

          {/* Initial Loading */}
          {isInitialLoad && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 20 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Products Grid */}
          {!isInitialLoad && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}

                {/* Pagination Loading Skeletons */}
                {isPaginationLoading &&
                  Array.from({ length: skeletonCount }).map((_, index) => (
                    <ProductCardSkeleton key={`loading-${index}`} />
                  ))}
              </div>

              {/* Loading Spinner */}
              {isPaginationLoading && (
                <div className="flex items-center justify-center mt-6 py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {/* Intersection Observer Target */}
              {pagination.hasMore && !loading.list && (
                <div ref={observerRef} className="h-20" />
              )}

              {/* End of Results */}
              {!pagination.hasMore && products.length > 0 && (
                <div className="flex flex-col items-center justify-center mt-10 py-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    You've seen it all!
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    You've reached the end of products. Check back later for new
                    arrivals!
                  </p>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {!isInitialLoad && products.length === 0 && (
            <div className="text-center py-16">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 mx-auto">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
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
  );
}
