"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";

interface BrandCardProps {
  brand: BrandResponseModel;
  className?: string;
}

export function BrandCard({ brand, className }: BrandCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/products?brandId=${brand.id}`} className="group">
      <Card
        className={cn(
          "overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer h-full",
          className
        )}
      >
        <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 overflow-hidden rounded-full bg-muted group-hover:bg-primary/5 transition-colors">
            {!imageError && brand.imageUrl ? (
              <Image
                src={brand.imageUrl}
                alt={brand.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                {brand.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Brand Name */}
          <h3 className="font-semibold text-center text-xs sm:text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {brand.name}
          </h3>

          {/* Product Count */}
          {brand.activeProducts > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {brand.activeProducts}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
