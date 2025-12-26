"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    mainImageUrl: string;
    displayPrice: number;
    displayOriginPrice?: number;
    hasPromotion?: boolean;
    displayPromotionValue?: number;
    displayPromotionType?: string;
    status: string;
    isBestSeller?: boolean;
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const hasDiscount =
    product.hasPromotion &&
    product.displayOriginPrice &&
    product.displayOriginPrice > product.displayPrice;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.displayOriginPrice! - product.displayPrice) /
          product.displayOriginPrice!) *
          100
      )
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart(true);
    // Add to cart logic here
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsAddingToCart(false);
    // Show success toast
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // Add to wishlist logic here
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className={cn(
          "group relative bg-card rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 h-[320px] flex flex-col",
          className
        )}
      >
        {/* Image Container - 70% of height */}
        <div className="relative h-[224px] overflow-hidden bg-muted/30 flex-shrink-0">
          <Image
            src={"https://picsum.photos/200/200?random=11224"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Best Seller Badge - Top Left */}
          {product.isBestSeller && (
            <Badge
              variant="default"
              className="absolute top-2 left-2 z-10 shadow-md bg-gray-900 hover:bg-gray-900 text-xs font-medium px-2 py-1"
            >
              BEST SELLERS
            </Badge>
          )}

          {/* Promotion Badge - Top Right */}
          {product.hasPromotion && discountPercentage > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 z-10 shadow-md text-xs font-bold px-2 py-1"
            >
              -{discountPercentage}%
            </Badge>
          )}

          {/* Out of Stock Overlay */}
          {product.status === "OUT_OF_STOCK" && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
              <Badge
                variant="secondary"
                className="shadow-lg text-sm font-semibold px-4 py-1.5"
              >
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info - 30% of height */}
        <div className="p-3 flex flex-col flex-1">
          {/* Product Name - 2 lines max */}
          <h3 className="font-medium text-sm line-clamp-2 h-10 group-hover:text-primary transition-colors leading-5 mb-1">
            {product.name}
          </h3>

          {/* Price Section and Action Buttons */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-bold text-primary">
                {formatCurrency(product.displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(product.displayOriginPrice!)}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-primary hover:text-white hover:border-primary transition-colors"
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.status === "OUT_OF_STOCK"}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className={cn(
                  "h-9 w-9 flex items-center justify-center rounded-md transition-colors",
                  isFavorite
                    ? "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600"
                    : "hover:bg-red-50 hover:text-red-500 hover:border-red-500"
                )}
                onClick={handleToggleFavorite}
              >
                <Heart
                  className={cn("h-4 w-4", isFavorite && "fill-current")}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
