"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";

interface CategoryCardProps {
  category: CategoriesResponseModel;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/products?categoryId=${category.id}`} className="group">
      <Card
        className={cn(
          "overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer h-full",
          className
        )}
      >
        <CardContent className="p-4 flex flex-col items-center justify-center">
          {/* Image/Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-3 overflow-hidden rounded-full bg-muted group-hover:bg-primary/5 transition-colors">
            {!imageError && category.imageUrl ? (
              <Image
                src={category.imageUrl}
                alt={category.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-2xl sm:text-3xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                {category.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Category Name */}
          <h3 className="font-semibold text-center text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors min-h-[32px] flex items-center">
            {category.name}
          </h3>

          {/* Product Count */}
          {category.activeProducts > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {category.activeProducts} items
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
