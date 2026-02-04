import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  clearCart,
} from "../thunks/cart-thunks";
import {
  CartResponseModel,
  CartItemModel,
} from "../models/response/cart-response";

interface CartState {
  items: CartItemModel[];
  totalItems: number;
  totalOriginalPrice: number;
  totalDiscount: number;
  totalPayment: number;
  loading: {
    fetch: boolean;
    add: boolean;
    update: boolean;
    clear: boolean;
  };
  error: string | null;
  loaded: boolean;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalOriginalPrice: 0,
  totalDiscount: 0,
  totalPayment: 0,
  loading: {
    fetch: false,
    add: false,
    update: false,
    clear: false,
  },
  error: null,
  loaded: false,
};

// Helper to update cart state from response
const updateCartFromResponse = (
  state: CartState,
  response: CartResponseModel
) => {
  state.items = response.items || [];
  state.totalItems = response.totalItems || 0;
  state.totalOriginalPrice = response.totalOriginalPrice || 0;
  state.totalDiscount = response.totalDiscount || 0;
  state.totalPayment = response.totalPayment || 0;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalOriginalPrice = 0;
      state.totalDiscount = 0;
      state.totalPayment = 0;
      state.loaded = false;
      state.error = null;
    },
    // Optimistic add for instant UI feedback
    addLocalCartItem: (
      state,
      action: PayloadAction<{
        productId: string;
        productSizeId?: string | null;
        quantity: number;
        productName: string;
        productMainImageUrl: string;
        productSizeName?: string | null;
        displayPrice: number;
        originalPrice: number;
        hasActivePromotion?: boolean;
      }>
    ) => {
      const {
        productId,
        productSizeId,
        quantity,
        productName,
        productMainImageUrl,
        productSizeName,
        displayPrice,
        originalPrice,
        hasActivePromotion,
      } = action.payload;

      // Check if item already exists
      const existingItem = state.items.find(
        (i) =>
          i.productId === productId &&
          i.productSizeId === (productSizeId || null)
      );

      if (existingItem) {
        // Update existing item quantity
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.displayPrice * existingItem.quantity;
        existingItem.totalOriginalPrice = existingItem.originalPrice * existingItem.quantity;
      } else {
        // Add new item with temporary ID
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        state.items.push({
          id: tempId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "",
          updatedBy: "",
          productId,
          productName,
          productMainImageUrl,
          productSizeId: productSizeId || null,
          productSizeName: productSizeName || null,
          quantity,
          originalPrice,
          displayPrice,
          unitPrice: displayPrice,
          totalOriginalPrice: originalPrice * quantity,
          totalPrice: displayPrice * quantity,
          discountAmount: (originalPrice - displayPrice) * quantity,
          promotionType: "",
          promotionValue: 0,
          promotionFromDate: "",
          promotionToDate: "",
          hasActivePromotion: hasActivePromotion || false,
          note: null,
        });
      }

      // Recalculate totals
      state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
      state.totalOriginalPrice = state.items.reduce(
        (sum, i) => sum + i.totalOriginalPrice,
        0
      );
      state.totalPayment = state.items.reduce((sum, i) => sum + i.totalPrice, 0);
      state.totalDiscount = state.totalOriginalPrice - state.totalPayment;
    },
    updateLocalCartItem: (
      state,
      action: PayloadAction<{
        productId: string;
        productSizeId?: string | null;
        quantity: number;
      }>
    ) => {
      const item = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.productSizeId === action.payload.productSizeId
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          // Remove item
          state.items = state.items.filter((i) => i.id !== item.id);
        } else {
          item.quantity = action.payload.quantity;
          item.totalPrice = item.displayPrice * action.payload.quantity;
          item.totalOriginalPrice = item.originalPrice * action.payload.quantity;
        }
        // Recalculate totals
        state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
        state.totalOriginalPrice = state.items.reduce(
          (sum, i) => sum + i.totalOriginalPrice,
          0
        );
        state.totalPayment = state.items.reduce(
          (sum, i) => sum + i.totalPrice,
          0
        );
        state.totalDiscount = state.totalOriginalPrice - state.totalPayment;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(
        fetchCart.fulfilled,
        (state, action: PayloadAction<CartResponseModel>) => {
          state.loading.fetch = false;
          updateCartFromResponse(state, action.payload);
          state.loaded = true;
          state.error = null;
        }
      )
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.error.message || "Failed to fetch cart";
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading.add = true;
        state.error = null;
      })
      .addCase(
        addToCart.fulfilled,
        (state, action: PayloadAction<CartResponseModel>) => {
          state.loading.add = false;
          updateCartFromResponse(state, action.payload);
          state.loaded = true;
          state.error = null;
        }
      )
      .addCase(addToCart.rejected, (state, action) => {
        state.loading.add = false;
        state.error = action.error.message || "Failed to add item to cart";
      })

      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(
        updateCartItem.fulfilled,
        (state, action: PayloadAction<CartResponseModel>) => {
          state.loading.update = false;
          updateCartFromResponse(state, action.payload);
          state.error = null;
        }
      )
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.error.message || "Failed to update cart item";
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading.clear = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading.clear = false;
        state.items = [];
        state.totalItems = 0;
        state.totalOriginalPrice = 0;
        state.totalDiscount = 0;
        state.totalPayment = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading.clear = false;
        state.error = action.error.message || "Failed to clear cart";
      });
  },
});

export const { resetCart, addLocalCartItem, updateLocalCartItem } = cartSlice.actions;
export default cartSlice.reducer;
