"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { CustomButton } from "../button/custom-button";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";

interface ProductCardProps {
  product: ProductDetailResponseModel;
  className?: string;
}

// Global cache to track loaded images across all product cards
const imageLoadedCache = new Set<string>();

export function ProductCard({ product, className }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [isFavorite, setIsFavorite] = useState(product.isFavorited || false);

  // Get image URL
  const imageUrl =
    product.mainImageUrl ||
    `https://picsum.photos/300/300?random=${product.id}`;

  // Check if this image was already loaded before (from cache)
  const [imageLoaded, setImageLoaded] = useState(
    imageLoadedCache.has(imageUrl)
  );

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsAddingToCart(false);
    setQuantity(1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    } else if (quantity === 1) {
      setQuantity(0);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    // Add to cache so it won't show skeleton next time
    imageLoadedCache.add(imageUrl);
  };

  const isOutOfStock = product.status === "OUT_OF_STOCK";
  const isInCart = quantity > 0;
  const hasDiscount = product.hasPromotion;

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className={cn(
          "group relative bg-card rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 flex flex-col",
          isOutOfStock && "opacity-75",
          className
        )}
      >
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}

          <Image
            src={imageUrl}
            alt={product.name}
            fill
            priority={imageLoadedCache.has(imageUrl)} // Priority load for cached images
            loading={imageLoadedCache.has(imageUrl) ? undefined : "lazy"}
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleImageLoad}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          />

          <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none">
            {product.status === "NEW" && (
              <Badge className="bg-blue-600 hover:bg-blue-600 text-xs px-2 py-0.5 shadow-md pointer-events-auto">
                NEW
              </Badge>
            )}
            {hasDiscount && product.displayPromotionValue > 0 && (
              <Badge
                variant="destructive"
                className="text-xs font-bold px-2 py-0.5 shadow-md ml-auto pointer-events-auto"
              >
                {product.displayPromotionType === "PERCENTAGE"
                  ? `-${product.displayPromotionValue}%`
                  : `-${formatCurrency(product.displayPromotionValue)}`}
              </Badge>
            )}
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center pointer-events-none">
              <Badge
                variant="secondary"
                className="text-xs font-semibold px-3 py-1"
              >
                Out of Stock
              </Badge>
            </div>
          )}

          <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <CustomButton
              size="icon"
              variant="secondary"
              className={cn(
                "h-8 w-8 rounded-full shadow-lg transition-all duration-200",
                isFavorite
                  ? "bg-red-500 text-white hover:bg-red-600 scale-110"
                  : "bg-white hover:bg-red-50 hover:text-red-500"
              )}
              onClick={handleToggleFavorite}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </CustomButton>
          </div>
        </div>

        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[40px]">
            {product.name}
          </h3>

          <div className="mt-auto">
            <div className="flex flex-col mb-2">
              <span className="text-lg font-bold text-primary">
                {formatCurrency(product.displayPrice)}
              </span>
              {hasDiscount &&
                product.displayOriginPrice > product.displayPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.displayOriginPrice)}
                  </span>
                )}
            </div>

            {isInCart ? (
              <div
                className="flex items-center gap-2 w-full"
                onClick={(e) => e.preventDefault()}
              >
                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleDecrement}
                  disabled={isAddingToCart}
                >
                  <Minus className="h-3 w-3" />
                </CustomButton>

                <div className="flex-1 text-center h-8 px-2 bg-primary/10 text-primary font-semibold text-sm rounded border border-primary/20 flex items-center justify-center">
                  {quantity}
                </div>

                <CustomButton
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shrink-0 hover:bg-primary hover:text-primary-foreground"
                  onClick={handleIncrement}
                  disabled={isAddingToCart}
                >
                  <Plus className="h-3 w-3" />
                </CustomButton>
              </div>
            ) : (
              <CustomButton
                className={cn(
                  "w-full gap-2 transition-all duration-300",
                  isAddingToCart && "opacity-80"
                )}
                onClick={handleAddToCart}
                disabled={isAddingToCart || isOutOfStock}
                size="sm"
              >
                {isAddingToCart ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-xs font-semibold">Add to Cart</span>
                  </>
                )}
              </CustomButton>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
