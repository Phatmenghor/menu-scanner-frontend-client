"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Check, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/redux/features/business/store/models/response/product-response";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { addToCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { fetchPublicProductById } from "@/redux/features/main/store/thunks/public-product-thunks";
import { usePublicProductState } from "@/redux/features/main/store/state/public-product-state";

interface SizeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDetailResponseModel | null;
  onSuccess?: () => void;
}

export function SizeSelectionModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: SizeSelectionModalProps) {
  const { dispatch, items: cartItems } = useCartState();
  const { dispatch: productDispatch } = usePublicProductState();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [fullProduct, setFullProduct] =
    useState<ProductDetailResponseModel | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  // Local loading state for add to cart - independent from global cart loading
  const [isAdding, setIsAdding] = useState(false);

  // The product to display: use fetched full product if available, otherwise use the passed product
  const displayProduct = fullProduct || product;

  // Get cart quantity for a specific size
  const getCartQuantityForSize = useCallback(
    (sizeId: string | null) => {
      if (!displayProduct) return 0;
      const cartItem = cartItems.find(
        (item) =>
          item.productId === displayProduct.id &&
          item.productSizeId === sizeId
      );
      return cartItem?.quantity || 0;
    },
    [cartItems, displayProduct]
  );

  // Get current quantity in cart for selected size
  const currentCartQuantity = selectedSize
    ? getCartQuantityForSize(selectedSize.id)
    : displayProduct
    ? getCartQuantityForSize(null)
    : 0;

  // Fetch full product details when modal opens if sizes are missing
  useEffect(() => {
    if (open && product) {
      const needsFetch =
        product.hasSizes &&
        (!product.sizes || product.sizes.length === 0);

      if (needsFetch) {
        setIsLoadingDetail(true);
        setFullProduct(null);
        setSelectedSize(null);
        setQuantity(1);

        productDispatch(fetchPublicProductById(product.id))
          .unwrap()
          .then((detail: ProductDetailResponseModel) => {
            setFullProduct(detail);
            if (detail.sizes && detail.sizes.length > 0) {
              setSelectedSize(detail.sizes[0]);
            }
          })
          .catch(() => {
            showToast.error("Failed to load product details");
          })
          .finally(() => {
            setIsLoadingDetail(false);
          });
      } else {
        // Sizes already available, use them directly
        setFullProduct(null);
        if (product.sizes && product.sizes.length > 0) {
          setSelectedSize(product.sizes[0]);
        } else {
          setSelectedSize(null);
        }
        setQuantity(1);
      }
    }

    if (!open) {
      setFullProduct(null);
      setSelectedSize(null);
      setQuantity(1);
      setIsLoadingDetail(false);
      setIsAdding(false);
    }
  }, [open, product, productDispatch]);

  const handleAddToCart = async () => {
    if (!displayProduct) return;

    setIsAdding(true);
    try {
      await dispatch(
        addToCart({
          productId: displayProduct.id,
          productSizeId: selectedSize?.id || null,
          quantity,
        })
      ).unwrap();
      showToast.success("Added to cart");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      showToast.error(error?.message || "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  if (!product) return null;

  const displayPrice =
    selectedSize?.finalPrice || displayProduct?.displayPrice || 0;
  const originalPrice = selectedSize?.hasPromotion
    ? selectedSize.price
    : displayProduct?.hasActivePromotion
    ? displayProduct?.displayOriginPrice
    : null;
  const hasDiscount = selectedSize
    ? selectedSize.hasPromotion
    : displayProduct?.hasActivePromotion;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-bold">
            Select Size & Quantity
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-2">
          {/* Loading State */}
          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                Loading product details...
              </p>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="flex gap-4 mb-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={displayProduct?.mainImageUrl || appImages.NoImage}
                    alt={displayProduct?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {displayProduct?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(displayPrice)}
                    </span>
                    {hasDiscount && originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(originalPrice)}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      {selectedSize?.hasPromotion
                        ? `-${Math.round(
                            ((selectedSize.price - selectedSize.finalPrice) /
                              selectedSize.price) *
                              100
                          )}%`
                        : displayProduct?.displayPromotionType === "PERCENTAGE"
                        ? `-${displayProduct?.displayPromotionValue}%`
                        : `-${formatCurrency(
                            displayProduct?.displayPromotionValue || 0
                          )}`}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              {displayProduct?.hasSizes &&
                displayProduct?.sizes &&
                displayProduct.sizes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-sm">Choose Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {displayProduct.sizes.map((size) => {
                        const sizeCartQty = getCartQuantityForSize(size.id);
                        return (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "relative border-2 rounded-lg px-3 py-2 transition-all cursor-pointer hover:border-primary",
                              selectedSize?.id === size.id
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border"
                            )}
                          >
                            <div className="font-semibold text-xs">
                              {size.name}
                            </div>
                            <div className="text-primary font-bold text-sm">
                              {formatCurrency(size.finalPrice)}
                            </div>
                            {size.hasPromotion && (
                              <div className="text-xs text-muted-foreground line-through">
                                {formatCurrency(size.price)}
                              </div>
                            )}
                            {selectedSize?.id === size.id && (
                              <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                                <Check className="h-2.5 w-2.5" />
                              </div>
                            )}
                            {/* Show cart quantity badge */}
                            {sizeCartQty > 0 && (
                              <div className="absolute -top-1.5 -left-1.5 bg-green-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold">
                                {sizeCartQty}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Current cart info for selected size */}
              {currentCartQuantity > 0 && (
                <div className="mb-4 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {selectedSize
                      ? `${currentCartQuantity} "${selectedSize.name}" already in cart`
                      : `${currentCartQuantity} already in cart`}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">Add Quantity</h4>
                <div className="flex items-center gap-3">
                  <CustomButton
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-9 w-9"
                  >
                    <Minus className="h-4 w-4" />
                  </CustomButton>
                  <span className="w-12 text-center font-bold text-lg">
                    {quantity}
                  </span>
                  <CustomButton
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-9 w-9"
                  >
                    <Plus className="h-4 w-4" />
                  </CustomButton>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-3 border-t mb-4">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(displayPrice * quantity)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <CustomButton
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={
                    isAdding ||
                    (displayProduct?.hasSizes && !selectedSize)
                  }
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </CustomButton>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
