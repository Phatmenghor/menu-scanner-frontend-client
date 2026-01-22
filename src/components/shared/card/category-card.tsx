"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

interface CategoryCardProps {
  category: CategoriesResponseModel;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link href={`/products?categoryId=${category.id}`} className="group">
      <Card
        className={cn(
          "overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer h-full relative hover:-translate-y-1",
          className
        )}
      >
        <CardContent className="p-4 sm:p-5 flex flex-col items-center justify-center relative">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Icon/Image Container */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center mb-3 overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted group-hover:scale-110 transition-transform duration-300 shadow-md">
            {!imageError && category.imageUrl ? (
              <>
                {!imageLoaded && (
                  <Skeleton className="absolute inset-0 w-full h-full rounded-xl" />
                )}
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  width={72}
                  height={72}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-500",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <span className="text-3xl sm:text-4xl font-bold text-primary/60 group-hover:text-primary transition-colors">
                {category.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Category Name */}
          <h3 className="font-semibold text-center text-xs sm:text-sm line-clamp-2 mb-1.5 group-hover:text-primary transition-colors min-h-[32px] flex items-center z-10 px-1">
            {category.name}
          </h3>

          {/* Product Count */}
          {category.activeProducts > 0 && (
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground group-hover:text-primary transition-colors z-10">
              <span className="font-medium">{category.activeProducts} Products</span>
              <ArrowRight className="h-2.5 w-2.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
