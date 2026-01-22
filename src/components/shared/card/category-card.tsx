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
          "overflow-hidden hover:shadow-2xl hover:shadow-primary/20 border-2 border-transparent hover:border-primary/30 transition-all duration-300 cursor-pointer h-full relative hover:-translate-y-2 bg-gradient-to-br from-card to-card/50",
          className
        )}
      >
        <CardContent className="p-5 sm:p-6 flex flex-col items-center justify-center relative">
          {/* Background gradient effect - Enhanced */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Icon/Image Container - Enhanced with ring */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl ring-2 ring-primary/10 group-hover:ring-primary/30">
            {!imageError && category.imageUrl ? (
              <>
                {!imageLoaded && (
                  <Skeleton className="absolute inset-0 w-full h-full rounded-2xl" />
                )}
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  width={88}
                  height={88}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                {category.name.charAt(0)}
              </span>
            )}
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-6 h-6 bg-primary/20 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Category Name */}
          <h3 className="font-bold text-center text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[40px] flex items-center z-10 px-2 leading-tight">
            {category.name}
          </h3>

          {/* Product Count with enhanced design */}
          {category.activeProducts > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-all duration-300 z-10 bg-primary/5 px-3 py-1 rounded-full group-hover:bg-primary/10">
              <span className="font-semibold">{category.activeProducts}</span>
              <span className="font-medium">Products</span>
              <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
