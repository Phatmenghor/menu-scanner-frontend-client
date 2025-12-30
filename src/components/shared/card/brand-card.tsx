"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandResponseModel } from "@/redux/features/master-data/store/models/response/brand-response";

interface BrandCardProps {
  brand: BrandResponseModel;
  className?: string;
}

export function BrandCard({ brand, className }: BrandCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/products?brandId=${brand.id}`} className="group">
      <Card
        className={cn(
          "overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer h-full relative",
          className
        )}
      >
        <div className="relative w-full" style={{ aspectRatio: "5/3" }}>
          <CardContent className="absolute inset-0 p-3 sm:p-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center overflow-hidden rounded-full bg-muted group-hover:bg-primary/5 transition-colors relative">
              {!imageError && brand.imageUrl ? (
                <>
                  {!imageLoaded && (
                    <Skeleton className="absolute inset-0 w-full h-full rounded-full" />
                  )}
                  <Image
                    src={brand.imageUrl}
                    alt={brand.name}
                    width={64}
                    height={64}
                    className={cn(
                      "w-full h-full object-cover transition-opacity duration-500",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                </>
              ) : (
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                  {brand.name.charAt(0)}
                </span>
              )}
            </div>
          </CardContent>

          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/90 via-black/80 to-transparent p-2 sm:p-3">
            <h3 className="font-semibold text-white text-center text-xs sm:text-sm line-clamp-1">
              {brand.name}
            </h3>
            {brand.activeProducts > 0 && (
              <p className="text-xs text-white/80 text-center">
                {brand.activeProducts} items
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
