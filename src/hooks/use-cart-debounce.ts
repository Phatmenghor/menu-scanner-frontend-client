"use client";

import { useRef, useEffect, useCallback } from "react";
import { AppDispatch } from "@/redux/store";
import {
  addToCart,
  updateCartItem,
} from "@/redux/features/main/store/thunks/cart-thunks";
import { showToast } from "@/components/shared/common/show-toast";

const DEBOUNCE_DELAY = 500;

/**
 * Hook that manages debounced cart API calls per item key.
 *
 * - Tracks the latest desired quantity in a ref so the API always sends the final value.
 * - Aborts previous in-flight requests for the same item key to prevent stale responses
 *   from overwriting optimistic state.
 * - Provides `debouncedUpdate` (waits 500ms) and `immediateUpdate` (fires instantly,
 *   e.g. for explicit "remove" actions).
 */
export function useCartDebounce(dispatch: AppDispatch) {
  // Debounce timers per item key
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  // Latest desired quantity per item key
  const latestQtyRef = useRef<Map<string, number>>(new Map());
  // In-flight thunk promises per item key (has .abort())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inFlightRef = useRef<Map<string, any>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    const timers = timersRef.current;
    const inFlight = inFlightRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      inFlight.forEach((promise) => promise.abort());
      inFlight.clear();
    };
  }, []);

  /**
   * Debounced API call. Call this on every +/- click.
   * Only the LAST call within 500ms actually fires the API request.
   * Previous in-flight requests for the same key are aborted.
   */
  const debouncedUpdate = useCallback(
    (
      key: string,
      productId: string,
      productSizeId: string | null,
      quantity: number
    ) => {
      // Always store the latest quantity
      latestQtyRef.current.set(key, quantity);

      // Clear existing timer for this key
      const existingTimer = timersRef.current.get(key);
      if (existingTimer) clearTimeout(existingTimer);

      timersRef.current.set(
        key,
        setTimeout(() => {
          timersRef.current.delete(key);

          // Read the LATEST quantity (not the stale closure value)
          const finalQty = latestQtyRef.current.get(key) ?? quantity;
          latestQtyRef.current.delete(key);

          // Abort previous in-flight request to prevent stale response overwriting state
          const prev = inFlightRef.current.get(key);
          if (prev) prev.abort();

          // Dispatch the appropriate thunk
          const thunkAction =
            finalQty > 0
              ? addToCart({ productId, productSizeId, quantity: finalQty })
              : updateCartItem({ productId, productSizeId, quantity: 0 });

          const promise = dispatch(thunkAction);
          inFlightRef.current.set(key, promise);

          promise
            .unwrap()
            .then(() => {
              inFlightRef.current.delete(key);
              if (finalQty === 0) {
                showToast.success("Removed from cart");
              }
            })
            .catch((error: any) => {
              inFlightRef.current.delete(key);
              // Silently ignore aborted requests
              if (error?.aborted) return;
              showToast.error(error?.message || "Failed to update cart");
            });
        }, DEBOUNCE_DELAY)
      );
    },
    [dispatch]
  );

  /**
   * Immediate API call (no debounce). Use for explicit "Remove" / "Clear" actions.
   * Cancels any pending debounce timer and aborts in-flight requests for the key.
   */
  const immediateUpdate = useCallback(
    (
      key: string,
      productId: string,
      productSizeId: string | null,
      quantity: number
    ) => {
      // Cancel pending debounce
      const existingTimer = timersRef.current.get(key);
      if (existingTimer) clearTimeout(existingTimer);
      timersRef.current.delete(key);
      latestQtyRef.current.delete(key);

      // Abort previous in-flight request
      const prev = inFlightRef.current.get(key);
      if (prev) prev.abort();

      // Fire immediately
      const promise = dispatch(
        updateCartItem({ productId, productSizeId, quantity })
      );
      inFlightRef.current.set(key, promise);

      promise
        .unwrap()
        .then(() => {
          inFlightRef.current.delete(key);
        })
        .catch((error: any) => {
          inFlightRef.current.delete(key);
          if (error?.aborted) return;
          showToast.error(error?.message || "Failed to update cart");
        });
    },
    [dispatch]
  );

  /**
   * Cancel all pending debounces and abort in-flight requests.
   * Useful when switching context (e.g. changing selected size).
   */
  const cancelAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    latestQtyRef.current.clear();
    inFlightRef.current.forEach((promise) => promise.abort());
    inFlightRef.current.clear();
  }, []);

  return { debouncedUpdate, immediateUpdate, cancelAll };
}

/** Helper to build a debounce key from productId + sizeId */
export function cartItemKey(
  productId: string,
  productSizeId: string | null | undefined
): string {
  return `${productId}_${productSizeId ?? "null"}`;
}
