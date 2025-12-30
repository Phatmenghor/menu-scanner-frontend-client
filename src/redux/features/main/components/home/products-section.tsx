import React from "react";
import { ProductCard } from "@/components/shared/card/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons/product-card-skeleton";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { Sparkles } from "lucide-react";
import {
  GridWrapper,
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
      <GridWrapper cols={{ default: 1, sm: 2, lg: 4 }} gap={6}>
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </GridWrapper>
    </SectionWrapper>
  );
};
