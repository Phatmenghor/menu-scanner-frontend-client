import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { Flame, ArrowRight } from "lucide-react";
import {
  GridWrapper,
  SectionWrapper,
} from "@/components/shared/common/section-header";

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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-6 md:p-8 mb-6 shadow-sm">
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 mb-2">
              <Flame className="h-6 w-6 md:h-7 md:w-7 text-red-500" />
              {title}
            </h2>
            <p className="text-muted-foreground text-sm">
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-6 md:p-8 mb-6 shadow-sm">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-200/20 to-orange-200/20 dark:from-red-800/10 dark:to-orange-800/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-yellow-200/20 to-orange-200/20 dark:from-yellow-800/10 dark:to-orange-800/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 mb-2">
              <Flame className="h-6 w-6 md:h-7 md:w-7 text-red-500 animate-pulse" />
              {title}
            </h2>
            <p className="text-muted-foreground text-sm">
              Limited time offers - Don't miss out! 🎁
            </p>
          </div>
          {products.length > limit && (
            <Link href="/products?hasPromotion=true">
              <Button
                variant="default"
                size="lg"
                className="gap-2 group shadow-lg"
              >
                View All Deals
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <GridWrapper cols={{ default: 1, sm: 2, lg: 3 }} gap={6}>
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </GridWrapper>
    </SectionWrapper>
  );
};
