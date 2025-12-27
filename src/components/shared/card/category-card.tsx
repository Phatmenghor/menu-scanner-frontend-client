"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

interface CategoryCardProps {
  category: CategoriesResponseModel;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/categories/${category.id}`}>
      <div
        className={cn(
          "group relative bg-card rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-[200px] flex flex-col",
          className
        )}
      >
        {/* Image Container - 70% of height */}
        <div className="relative h-[140px] overflow-hidden bg-muted/30 flex-shrink-0">
          {!imageError ? (
            <Image
              src={category.imageUrl || "https://picsum.photos/200/200"}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-4xl font-bold text-muted-foreground">
                {category.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Product Count Badge */}
          {category.activeProducts > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                {category.activeProducts} items
              </div>
            </div>
          )}
        </div>

        {/* Category Name - 30% of height */}
        <div className="p-3 flex items-center justify-center flex-1 bg-gradient-to-t from-background to-card">
          <h3 className="font-semibold text-sm text-center line-clamp-2 group-hover:text-primary transition-colors leading-5">
            {category.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
