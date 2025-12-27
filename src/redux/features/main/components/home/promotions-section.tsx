import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";

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
  title = "🔥 Hot Deals & Promotions",
}: PromotionsSectionProps) => {
  // Filter products that have active promotions
  const promotionProducts =
    products?.filter((product) => product.hasPromotion) || [];
  const displayProducts = promotionProducts.slice(0, limit);

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <ProductGridSkeleton count={limit} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="p-8 bg-destructive/10 rounded-xl text-center">
          <p className="text-destructive">Failed to load promotions</p>
        </div>
      </div>
    );
  }

  if (!displayProducts || displayProducts.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      {/* Promotions Header with gradient background */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">
              Limited time offers - Don't miss out!
            </p>
          </div>
          {promotionProducts.length > limit && (
            <Link href="/products?hasPromotion=true">
              <Button variant="default">View All Deals</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
