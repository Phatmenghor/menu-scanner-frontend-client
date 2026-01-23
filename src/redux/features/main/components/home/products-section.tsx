import React, { useRef, useEffect, useState } from "react";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductCardSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import {
  SectionHeader,
  SectionWrapper,
} from "@/components/shared/common/section-header";

interface ProductsSectionProps {
  products: ProductDetailResponseModel[];
  loading: boolean;
  error: string | null;
  title?: string;
  subtitle?: string;
  showIcon?: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isInitialLoading?: boolean;
}

export const ProductsSection = ({
  products,
  loading,
  error,
  title = "Featured Products",
  subtitle,
  showIcon = false,
  hasMore,
  onLoadMore,
  isInitialLoading = false,
}: ProductsSectionProps) => {
  const observerRef = useRef<HTMLDivElement>(null);
  const isPaginationLoading = loading && products.length > 0;
  const [skeletonCount, setSkeletonCount] = useState(30);

  useEffect(() => {
    const updateSkeletonCount = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setSkeletonCount(4); // 2 cols × 2 rows
      } else if (width < 768) {
        setSkeletonCount(6); // 3 cols × 2 rows
      } else if (width < 1024) {
        setSkeletonCount(8); // 4 cols × 2 rows
      } else if (width < 1280) {
        setSkeletonCount(10); // 5 cols × 2 rows
      } else {
        setSkeletonCount(12); // 6 cols × 2 rows
      }
    };

    updateSkeletonCount();
    window.addEventListener("resize", updateSkeletonCount);
    return () => window.removeEventListener("resize", updateSkeletonCount);
  }, []);

  useEffect(() => {
    if (!observerRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (isInitialLoading) {
    return (
      <SectionWrapper>
        <SectionHeader
          title={title}
          subtitle={subtitle}
          icon={showIcon ? Sparkles : undefined}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </SectionWrapper>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <SectionWrapper>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        icon={showIcon ? Sparkles : undefined}
      />

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {products.map((product, index) => (
          <ProductCard key={product.id + "-" + index} product={product} />
        ))}
      </div>

      {/* Loading indicator for pagination - smooth and centered */}
      {isPaginationLoading && (
        <div className="flex items-center justify-center py-8 mt-4">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading more products...</p>
          </div>
        </div>
      )}

      {/* Infinite scroll trigger - hidden */}
      {hasMore && !loading && <div ref={observerRef} className="h-10" />}

      {/* End of products message */}
      {!hasMore && products.length > 0 && (
        <div className="flex flex-col items-center justify-center mt-10 py-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">You've seen it all!</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            You've reached the end of our featured products. Check back later
            for new arrivals!
          </p>
        </div>
      )}
    </SectionWrapper>
  );
};
