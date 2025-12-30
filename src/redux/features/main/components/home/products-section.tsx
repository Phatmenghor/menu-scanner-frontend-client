import React from "react";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { Sparkles } from "lucide-react";
import {
  SectionHeader,
  SectionWrapper,
} from "@/components/shared/common/section-header";

interface ProductsSectionProps {
  products: ProductDetailResponseModel[];
  loading: boolean;
  error: string | null;
  limit?: number;
  title?: string;
  subtitle?: string;
  seeAllLink?: string;
  showIcon?: boolean;
}

export const ProductsSection = ({
  products,
  loading,
  error,
  limit = 8,
  title = "Featured Products",
  subtitle,
  seeAllLink = "/products",
  showIcon = false,
}: ProductsSectionProps) => {
  const displayProducts = products?.slice(0, limit) || [];

  if (loading) {
    return (
      <SectionWrapper>
        <SectionHeader title={title} subtitle={subtitle} />
        <ProductGridSkeleton count={limit} />
      </SectionWrapper>
    );
  }

  if (error || !displayProducts || displayProducts.length === 0) {
    return null;
  }

  return (
    <SectionWrapper>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        icon={showIcon ? Sparkles : undefined}
        viewAllLink={products.length > limit ? seeAllLink : undefined}
      />
      {/* Responsive Grid: 2 cols mobile, 3 cols tablet, 4-6 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </SectionWrapper>
  );
};
