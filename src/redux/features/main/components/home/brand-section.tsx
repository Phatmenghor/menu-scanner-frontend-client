import React from "react";
import { BrandCard } from "@/components/shared/card/brand-card";
import { BrandGridSkeleton } from "@/components/shared/skeletons/brand-card-skeleton";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import {
  SectionHeader,
  SectionWrapper,
} from "@/components/shared/common/section-header";

interface BrandsSectionProps {
  brands: BrandResponseModel[];
  loading: boolean;
  error: string | null;
  limit?: number;
  title?: string;
}

export const BrandsSection = ({
  brands,
  loading,
  error,
  limit = 12,
  title = "Shop by Brand",
}: BrandsSectionProps) => {
  const displayBrands = brands?.slice(0, limit) || [];

  if (loading) {
    return (
      <SectionWrapper>
        <SectionHeader
          title={title}
          subtitle="Explore products from top brands"
        />
        <BrandGridSkeleton count={limit} />
      </SectionWrapper>
    );
  }

  if (error || !displayBrands || displayBrands.length === 0) {
    return null;
  }

  return (
    <SectionWrapper>
      <SectionHeader
        title={title}
        subtitle="Explore products from top brands"
        viewAllLink={brands.length > limit ? "/brands" : undefined}
      />
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
        {displayBrands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>
    </SectionWrapper>
  );
};
