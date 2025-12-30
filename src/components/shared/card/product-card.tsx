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
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsAddingToCart(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className={cn(
          "group relative bg-card rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 flex flex-col",
          className
        )}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <Image
            src={
              product.mainImageUrl ||
              `https://picsum.photos/300/300?random=${product.id}`
            }
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
            {product.isBestSeller && (
              <Badge className="bg-gray-900 hover:bg-gray-900 text-xs px-2 py-0.5 shadow-md">
                BEST
              </Badge>
            )}
            {product.hasPromotion && discountPercentage > 0 && (
              <Badge
                variant="destructive"
                className="text-xs font-bold px-2 py-0.5 shadow-md ml-auto"
              >
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {product.status === "OUT_OF_STOCK" && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
              <Badge
                variant="secondary"
                className="text-xs font-semibold px-3 py-1"
              >
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Quick Actions - Show on Hover */}
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-8 w-8 rounded-full shadow-lg transition-colors",
                isFavorite
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white hover:bg-red-50 hover:text-red-500"
              )}
              onClick={handleToggleFavorite}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 flex flex-col flex-1">
          {/* Product Name */}
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[40px]">
            {product.name}
          </h3>

          {/* Price and Cart */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">
                {formatCurrency(product.displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(product.displayOriginPrice!)}
                </span>
              )}
            </div>

            <Button
              size="icon"
              variant="default"
              className="h-9 w-9 rounded-full shadow-md"
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.status === "OUT_OF_STOCK"}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
