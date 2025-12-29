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
          "overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full",
          className
        )}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <div className="w-32 h-32 flex items-center justify-center mb-4 overflow-hidden rounded-full bg-muted group-hover:bg-muted/70 transition-colors">
            {!imageError && category.imageUrl ? (
              <Image
                src={category.imageUrl}
                alt={category.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-4xl font-bold text-muted-foreground">
                {category.name.charAt(0)}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-center line-clamp-1 mb-1">
            {category.name}
          </h3>
          {category.activeProducts > 0 && (
            <p className="text-xs text-muted-foreground">
              {category.activeProducts} products
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
