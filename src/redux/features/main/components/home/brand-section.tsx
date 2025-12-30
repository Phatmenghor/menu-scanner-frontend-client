import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { BrandGridSkeleton } from "@/components/shared/skeletons/brand-card-skeleton";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";
import {
  GridWrapper,
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
      <GridWrapper cols={{ default: 3, sm: 4, md: 5, lg: 6 }} gap={4}>
        {displayBrands.map((brand) => (
          <Link key={brand.id} href={`/products?brandId=${brand.id}`}>
            <Card className="overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mb-3 overflow-hidden rounded-full bg-muted group-hover:bg-primary/5 transition-colors">
                  {brand.imageUrl ? (
                    <Image
                      src={brand.imageUrl}
                      alt={brand.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-center text-xs md:text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                  {brand.name}
                </h3>
                {brand.activeProducts > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    {brand.activeProducts} items
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </GridWrapper>
    </SectionWrapper>
  );
};
