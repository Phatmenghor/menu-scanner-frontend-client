import React from "react";
import { useAppSelector } from "@/redux/store";
import { selectAllBrands } from "@/redux/features/master-data/store/selectors/brand-selector";
import { BrandGridSkeleton } from "@/components/skeletons/BrandSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface BrandsSectionProps {
  loading: boolean;
  error: string | null;
  limit?: number;
  title?: string;
}

export const BrandsSection = ({
  loading,
  error,
  limit = 12,
  title = "Shop by Brand",
}: BrandsSectionProps) => {
  const brands = useAppSelector(selectAllBrands);
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
        <Link to="/brands">
          <Button variant="outline">View All</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayBrands.map((brand) => (
          <Card
            key={brand.id}
            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
          >
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="w-32 h-32 flex items-center justify-center mb-4 overflow-hidden rounded-full bg-muted group-hover:bg-muted/70 transition-colors">
                {brand.imageUrl || brand.image ? (
                  <img
                    src={brand.imageUrl || brand.image}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-muted-foreground">
                    {brand.name.charAt(0)}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-center line-clamp-1">
                {brand.name}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
