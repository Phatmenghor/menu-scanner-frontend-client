import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";

interface ProductsSectionProps {
  products: ProductDetailResponseModel[];
  loading: boolean;
  error: string | null;
  limit?: number;
  title?: string;
  seeAllLink?: string;
}

export const ProductsSection = ({
  products,
  loading,
  error,
  limit = 8,
  title = "Featured Products",
  seeAllLink = "/products",
}: ProductsSectionProps) => {
  const displayProducts = products?.slice(0, limit) || [];

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
          <p className="text-destructive">Failed to load products</p>
        </div>
      </div>
    );
  }

  if (!displayProducts || displayProducts.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {products.length > limit && (
          <Link href={seeAllLink}>
            <Button variant="outline">View All</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
