"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  LogIn,
} from "lucide-react";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/common/currency-format";
import { showToast } from "@/components/shared/common/show-toast";
import Link from "next/link";
import {
  clearCart,
  fetchCart,
} from "@/redux/features/main/store/thunks/cart-thunks";
import { updateLocalCartItem } from "@/redux/features/main/store/slice/cart-slice";
import { useCartDebounce, cartItemKey } from "@/hooks/use-cart-debounce";
import { LoginModal } from "@/components/shared/modal/login-modal";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, authReady } = useAuthState();
  const {
    dispatch,
    items,
    totalItems,
    subtotal,
    totalDiscount,
    finalTotal,
    loading,
    loaded,
  } = useCartState();

  const { debouncedUpdate, immediateUpdate } = useCartDebounce(dispatch);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    // Wait for auth to initialize before doing anything
    if (!authReady) return;

    if (!isAuthenticated) {
      // Don't redirect - show not-logged-in state instead
      return;
    }

    if (!loaded && !loading.fetch) {
      dispatch(fetchCart());
    }
  }, [authReady, isAuthenticated, loaded, loading.fetch, dispatch]);

  const handleUpdateQuantity = useCallback(
    (productId: string, productSizeId: string | null, newQuantity: number) => {
      const key = cartItemKey(productId, productSizeId);
      const timestamp = Date.now();

      // Optimistic update immediately
      dispatch(
        updateLocalCartItem({
          productId,
          productSizeId,
          quantity: newQuantity,
          optimisticTimestamp: timestamp,
        }),
      );

      if (newQuantity === 0) {
        showToast.success("Item removed from cart");
      }

      // Debounced API call (aborts previous in-flight request)
      debouncedUpdate(key, productId, productSizeId, newQuantity, timestamp);
    },
    [dispatch, debouncedUpdate],
  );

  const handleRemoveItem = useCallback(
    (productId: string, productSizeId: string | null) => {
      const key = cartItemKey(productId, productSizeId);
      const timestamp = Date.now();

      // Optimistic update immediately
      dispatch(
        updateLocalCartItem({
          productId,
          productSizeId,
          quantity: 0,
          optimisticTimestamp: timestamp,
        }),
      );

      showToast.success("Item removed from cart");

      // Immediate API call for explicit remove (cancels any pending debounce)
      immediateUpdate(key, productId, productSizeId, 0, timestamp);
    },
    [dispatch, immediateUpdate],
  );

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    try {
      await dispatch(clearCart()).unwrap();
      showToast.success("Cart cleared");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to clear cart");
    }
  };

  const handleCheckout = () => {
    // TODO: Navigate to checkout page
    showToast.success("Proceeding to checkout...");
    // router.push("/checkout");
  };

  // Show loading skeleton while auth is initializing
  if (!authReady) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show not-logged-in state
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to view your cart and start shopping.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <CustomButton
              onClick={() => setLoginModalOpen(true)}
              size="lg"
              className="gap-2"
            >
              <LogIn className="h-5 w-5" />
              Sign In
            </CustomButton>
            <CustomButton
              variant="outline"
              onClick={() => router.push("/products")}
              size="lg"
              className="gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Browse Products
            </CustomButton>
          </div>
        </div>
        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </div>
    );
  }

  if (loading.fetch && !loaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added any items to your cart yet. Start
            shopping to fill it up!
          </p>
          <CustomButton
            onClick={() => router.push("/products")}
            size="lg"
            className="gap-2"
          >
            <ShoppingBag className="h-5 w-5" />
            Continue Shopping
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <CustomButton
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </CustomButton>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    href={`/products/${item.productId}`}
                    className="flex-shrink-0"
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={
                          item.productImageUrl ||
                          `https://picsum.photos/200/200?random=${item.productId}`
                        }
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="font-semibold text-sm sm:text-base mb-1 hover:text-primary transition-colors line-clamp-2">
                        {item.productName}
                      </h3>
                    </Link>
                    {item.sizeName && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Size: {item.sizeName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-primary">
                        {formatCurrency(item.finalPrice)}
                      </span>
                      {item.hasPromotion &&
                        item.currentPrice > item.finalPrice && (
                          <>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(item.currentPrice)}
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              {item.promotionType === "PERCENTAGE"
                                ? `-${item.promotionValue}%`
                                : `-${formatCurrency(item.promotionValue || 0)}`}
                            </Badge>
                          </>
                        )}
                    </div>

                    {/* Quantity Controls - never disabled, optimistic updates */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <CustomButton
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.productSizeId,
                              item.quantity - 1,
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </CustomButton>
                        <div className="w-12 text-center font-semibold">
                          {item.quantity}
                        </div>
                        <CustomButton
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.productSizeId,
                              item.quantity + 1,
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </CustomButton>
                      </div>
                      <CustomButton
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleRemoveItem(item.productId, item.productSizeId)
                        }
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </CustomButton>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="hidden sm:block text-right">
                    <p className="font-bold text-lg">
                      {formatCurrency(item.totalPrice)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.finalPrice)} each
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-end pt-4">
              <CustomButton
                variant="outline"
                onClick={handleClearCart}
                disabled={loading.clear}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </CustomButton>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({totalItems} items)
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-semibold text-green-600">
                      -{formatCurrency(totalDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                  {totalDiscount > 0 && (
                    <p className="text-xs text-green-600 text-right mt-1">
                      You save {formatCurrency(totalDiscount)}!
                    </p>
                  )}
                </div>
              </div>

              <CustomButton
                className="w-full mb-3 gap-2"
                size="lg"
                onClick={handleCheckout}
              >
                <CreditCard className="h-5 w-5" />
                Proceed to Checkout
              </CustomButton>
              <CustomButton
                variant="outline"
                className="w-full gap-2"
                onClick={() => router.push("/products")}
              >
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
