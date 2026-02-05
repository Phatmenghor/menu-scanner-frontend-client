"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { QuantitySelector } from "@/components/shared/input/quantity-selector";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import {
  ProductDetailResponseModel,
  ProductSize,
} from "@/redux/features/business/store/models/response/product-response";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import {
  addToCart,
  updateCartItem,
} from "@/redux/features/main/store/thunks/cart-thunks";
import {
  addLocalCartItem,
  updateLocalCartItem,
} from "@/redux/features/main/store/slice/cart-slice";
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
  const [fullProduct, setFullProduct] =
    useState<ProductDetailResponseModel | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Refs for debounced API calls and tracking known quantities
  const apiDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const knownQtyRef = useRef<Map<string, number>>(new Map());

  // The product to display: use fetched full product if available, otherwise use the passed product
  const displayProduct = fullProduct || product;

  // Get cart quantity for a specific size
  const getCartQuantityForSize = useCallback(
    (sizeId: string | null) => {
      if (!displayProduct) return 0;
      const cartItem = cartItems.find(
        (item) =>
          item.productId === displayProduct.id && item.productSizeId === sizeId,
      );
      return cartItem?.quantity || 0;
    },
    [cartItems, displayProduct],
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
        product.hasSizes && (!product.sizes || product.sizes.length === 0);

      if (needsFetch) {
        setIsLoadingDetail(true);
        setFullProduct(null);
        setSelectedSize(null);

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
      }
    }

    if (!open) {
      setFullProduct(null);
      setSelectedSize(null);
      setIsLoadingDetail(false);
      knownQtyRef.current.clear();
      if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
    }
  }, [open, product, productDispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
    };
  }, []);

  // Handle quantity change with optimistic update + debounced API
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (!displayProduct) return;

      const sizeId = selectedSize?.id || null;
      const key = `${displayProduct.id}_${sizeId}`;
      const knownQty =
        knownQtyRef.current.get(key) ?? getCartQuantityForSize(sizeId);

      // Optimistic update
      if (knownQty === 0 && newQuantity > 0) {
        // Adding new item
        const displayPrice =
          selectedSize?.finalPrice || displayProduct.displayPrice || 0;
        const originalPrice = selectedSize?.hasPromotion
          ? selectedSize.price
          : displayProduct.displayOriginPrice || displayPrice;
        const hasDiscount = selectedSize
          ? selectedSize.hasPromotion
          : displayProduct.hasActivePromotion;

        dispatch(
          addLocalCartItem({
            productId: displayProduct.id,
            productSizeId: sizeId,
            quantity: newQuantity,
            productName: displayProduct.name,
            productMainImageUrl: displayProduct.mainImageUrl,
            productSizeName: selectedSize?.name || null,
            displayPrice,
            originalPrice,
            hasActivePromotion: hasDiscount,
          }),
        );
      } else {
        // Updating existing item (or removing if 0)
        dispatch(
          updateLocalCartItem({
            productId: displayProduct.id,
            productSizeId: sizeId,
            quantity: newQuantity,
          }),
        );
      }

      knownQtyRef.current.set(key, newQuantity);

      // Debounced API call
      if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
      apiDebounceRef.current = setTimeout(() => {
        const latestQty = knownQtyRef.current.get(key) ?? newQuantity;

        if (latestQty > 0) {
          dispatch(
            addToCart({
              productId: displayProduct.id,
              productSizeId: sizeId,
              quantity: latestQty,
            }),
          )
            .unwrap()
            .catch((error: any) => {
              showToast.error(error?.message || "Failed to update cart");
            });
        } else {
          dispatch(
            updateCartItem({
              productId: displayProduct.id,
              productSizeId: sizeId,
              quantity: 0,
            }),
          )
            .unwrap()
            .then(() => {
              showToast.success("Removed from cart");
            })
            .catch((error: any) => {
              showToast.error(error?.message || "Failed to update cart");
            });
        }
      }, 500);
    },
    [displayProduct, selectedSize, dispatch, getCartQuantityForSize],
  );

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
          <DialogTitle className="text-lg font-bold">Choose Size</DialogTitle>
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
                              100,
                          )}%`
                        : displayProduct?.displayPromotionType === "PERCENTAGE"
                          ? `-${displayProduct?.displayPromotionValue}%`
                          : `-${formatCurrency(
                              displayProduct?.displayPromotionValue || 0,
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
                                : "border-border",
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

              {/* Quantity Selector - shows current cart quantity, editable */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">Quantity</h4>
                <QuantitySelector
                  value={currentCartQuantity}
                  onChange={handleQuantityChange}
                  min={0}
                  size="sm"
                />
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-3 border-t mb-4">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(displayPrice * currentCartQuantity)}
                </span>
              </div>

              {/* Done button */}
              <CustomButton
                className="w-full"
                onClick={() => {
                  onOpenChange(false);
                  onSuccess?.();
                }}
              >
                Done
              </CustomButton>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
