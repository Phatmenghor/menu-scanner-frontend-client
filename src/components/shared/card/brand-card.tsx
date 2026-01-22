"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
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
          "overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer h-full relative hover:-translate-y-1",
          className
        )}
      >
        <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

          <CardContent className="absolute inset-0 p-4 sm:p-6 flex flex-col items-center justify-center">
            {/* Logo Container */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border border-primary/10">
              {!imageError && brand.imageUrl ? (
                <>
                  {!imageLoaded && (
                    <Skeleton className="absolute inset-0 w-full h-full rounded-xl" />
                  )}
                  <Image
                    src={brand.imageUrl}
                    alt={brand.name}
                    width={80}
                    height={80}
                    className={cn(
                      "w-full h-full object-contain p-2 transition-opacity duration-500",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  {brand.name.charAt(0)}
                </span>
              )}
            </div>
          </CardContent>

          {/* Brand Info - Slides up on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/95 via-black/90 to-transparent p-3 sm:p-4 backdrop-blur-sm">
            <h3 className="font-bold text-white text-center text-sm sm:text-base line-clamp-1 mb-1">
              {brand.name}
            </h3>
            {brand.activeProducts > 0 && (
              <div className="flex items-center justify-center gap-1 text-xs text-white/90">
                <span className="font-medium">{brand.activeProducts} Products</span>
                <ArrowRight className="h-3 w-3 animate-bounce" />
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
