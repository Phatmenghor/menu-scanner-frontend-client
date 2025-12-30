import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { Flame, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/shared/common/section-header";

interface PromotionsSectionProps {
  products: ProductDetailResponseModel[];
  loading: boolean;
  error: string | null;
  limit?: number;
  title?: string;
}

export const PromotionsSection = ({
  products,
  loading,
  error,
  limit = 6,
  title = "Hot Deals & Promotions",
}: PromotionsSectionProps) => {
  const displayProducts = products?.slice(0, limit) || [];

  if (loading) {
    return (
      <SectionWrapper>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="relative">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              {title}
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Limited time offers - Don't miss out!
            </p>
          </div>
        </div>
        <ProductGridSkeleton count={limit} />
      </SectionWrapper>
    );
  }

  if (error || !displayProducts || displayProducts.length === 0) {
    return null;
  }

  return (
    <SectionWrapper>
      {/* Promotions Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-4 sm:p-6 md:p-8 mb-6 shadow-sm">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-br from-red-200/20 to-orange-200/20 dark:from-red-800/10 dark:to-orange-800/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-red-500 animate-pulse" />
              {title}
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Limited time offers - Don't miss out! 🎁
            </p>
          </div>
          {products.length > limit && (
            <Link href="/products?hasPromotion=true">
              <Button
                variant="default"
                size="sm"
                className="gap-2 group shadow-lg"
              >
                View All
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </SectionWrapper>
  );
};
