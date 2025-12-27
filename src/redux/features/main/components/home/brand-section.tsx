import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrandGridSkeleton } from "@/components/shared/skeletons/brand-card-skeleton";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";

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
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <BrandGridSkeleton count={limit} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="p-8 bg-destructive/10 rounded-xl text-center">
          <p className="text-destructive">Failed to load brands</p>
        </div>
      </div>
    );
  }

  if (!displayBrands || displayBrands.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {brands.length > limit && (
          <Link href="/brands">
            <Button variant="outline">View All</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayBrands.map((brand) => (
          <Link key={brand.id} href={`/products?brandId=${brand.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="w-32 h-32 flex items-center justify-center mb-4 overflow-hidden rounded-full bg-muted group-hover:bg-muted/70 transition-colors">
                  {brand.imageUrl ? (
                    <Image
                      src={brand.imageUrl}
                      alt={brand.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-muted-foreground">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-center line-clamp-1 mb-1">
                  {brand.name}
                </h3>
                {brand.activeProducts > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {brand.activeProducts} products
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
