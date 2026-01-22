"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Plus, Minus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/common/currency-format";
import { CustomButton } from "../button/custom-button";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useWishlistState } from "@/redux/features/main/store/state/wishlist-state";
import { addToCart, updateCartItem, removeFromCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { addToWishlist, removeFromWishlist } from "@/redux/features/main/store/thunks/wishlist-thunks";
import { showToast } from "../common/show-toast";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";

interface ProductCardProps {
  product: ProductDetailResponseModel;
  className?: string;
}

// Global cache to track loaded images across all product cards
const imageLoadedCache = new Set<string>();

export function ProductCard({ product, className }: ProductCardProps) {
  const { dispatch: cartDispatch, items: cartItems } = useCartState();
  const { dispatch: wishlistDispatch, items: wishlistItems } = useWishlistState();
  const { isAuthenticated } = useAuthState();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Get current cart item for this product
  const cartItem = cartItems.find((item) => item.productId === product.id);
  const quantity = cartItem?.quantity || product.quantityInCart || 0;

  // Get favorite status from product or wishlist
  const isFavorited = product.isFavorited || wishlistItems.some((item) => item.productId === product.id);

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

    if (!isAuthenticated) {
      showToast.error("Please login to add items to cart");
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartDispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      showToast.success("Added to cart");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;

    setIsAddingToCart(true);
    try {
      await cartDispatch(
        updateCartItem({ cartItemId: cartItem.id, quantity: quantity + 1 })
      ).unwrap();
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;

    setIsAddingToCart(true);
    try {
      if (quantity > 1) {
        await cartDispatch(
          updateCartItem({ cartItemId: cartItem.id, quantity: quantity - 1 })
        ).unwrap();
      } else if (quantity === 1) {
        await cartDispatch(removeFromCart({ cartItemId: cartItem.id })).unwrap();
        showToast.success("Removed from cart");
      }
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast.error("Please login to add to wishlist");
      return;
    }

    setIsTogglingFavorite(true);
    try {
      if (isFavorited) {
        await wishlistDispatch(removeFromWishlist({ productId: product.id })).unwrap();
        showToast.success("Removed from wishlist");
      } else {
        await wishlistDispatch(addToWishlist({ productId: product.id })).unwrap();
        showToast.success("Added to wishlist");
      }
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update wishlist");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    // Add to cache so it won't show skeleton next time
    imageLoadedCache.add(imageUrl);
  };

  const isOutOfStock = product.status === "OUT_OF_STOCK";
  const isInCart = quantity > 0;
  // Check for active promotion
  const hasActivePromotion = product.hasPromotion &&
    product.displayPromotionValue > 0 &&
    product.displayPrice < product.displayOriginPrice;

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className={cn(
          "group relative bg-card rounded-lg border-2 border-transparent hover:border-primary/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-2 flex flex-col",
          isOutOfStock && "opacity-75",
          hasActivePromotion && "ring-1 ring-amber-500/20",
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

          <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10 pointer-events-none gap-2">
            <div className="flex flex-col gap-1.5">
              {product.status === "NEW" && (
                <Badge className="bg-blue-600 hover:bg-blue-600 text-xs px-2 py-0.5 shadow-md pointer-events-auto font-semibold">
                  NEW
                </Badge>
              )}
              {hasActivePromotion && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 text-xs px-2 py-0.5 shadow-md pointer-events-auto font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>SALE</span>
                </Badge>
              )}
            </div>
            {hasActivePromotion && (
              <Badge
                variant="destructive"
                className="text-xs font-bold px-2 py-0.5 shadow-md pointer-events-auto"
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
                isFavorited
                  ? "bg-red-500 text-white hover:bg-red-600 scale-110"
                  : "bg-white hover:bg-red-50 hover:text-red-500"
              )}
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
            >
              <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
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
              {hasActivePromotion && (
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
