import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../thunks/cart-thunks";
import {
  CartResponseModel,
  CartItemResponseModel,
} from "../models/response/cart-response";

interface CartState {
  items: CartItemResponseModel[];
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
  loading: {
    fetch: boolean;
    add: boolean;
    update: boolean;
    remove: boolean;
    clear: boolean;
  };
  error: string | null;
  loaded: boolean;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  discount: 0,
  total: 0,
  loading: {
    fetch: false,
    add: false,
    update: false,
    remove: false,
    clear: false,
  },
  error: null,
  loaded: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
      state.discount = 0;
      state.total = 0;
      state.loaded = false;
      state.error = null;
    },
    updateLocalCartItem: (
      state,
      action: PayloadAction<{ cartItemId: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.cartItemId);
      if (item) {
        item.quantity = action.payload.quantity;
        item.totalPrice = item.displayPrice * action.payload.quantity;
        // Recalculate totals
        state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
        state.subtotal = state.items.reduce((sum, i) => sum + i.totalPrice, 0);
        state.total = state.subtotal - state.discount;
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
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems || 0;
          state.subtotal = action.payload.subtotal || 0;
          state.discount = action.payload.discount || 0;
          state.total = action.payload.total || 0;
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
        (state, action: PayloadAction<CartItemResponseModel>) => {
          state.loading.add = false;
          // Check if item already exists
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (existingItemIndex >= 0) {
            state.items[existingItemIndex] = action.payload;
          } else {
            state.items.push(action.payload);
          }
          state.totalItems = state.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          state.subtotal = state.items.reduce(
            (sum, item) => sum + item.totalPrice,
            0
          );
          state.total = state.subtotal - state.discount;
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
        (state, action: PayloadAction<CartItemResponseModel>) => {
          state.loading.update = false;
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index >= 0) {
            state.items[index] = action.payload;
          }
          state.totalItems = state.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          state.subtotal = state.items.reduce(
            (sum, item) => sum + item.totalPrice,
            0
          );
          state.total = state.subtotal - state.discount;
          state.error = null;
        }
      )
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.error.message || "Failed to update cart item";
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading.remove = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading.remove = false;
        const cartItemId = action.meta.arg.cartItemId;
        state.items = state.items.filter((item) => item.id !== cartItemId);
        state.totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        state.subtotal = state.items.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        );
        state.total = state.subtotal - state.discount;
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading.remove = false;
        state.error = action.error.message || "Failed to remove item from cart";
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
        state.subtotal = 0;
        state.discount = 0;
        state.total = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading.clear = false;
        state.error = action.error.message || "Failed to clear cart";
      });
  },
});

export const { resetCart, updateLocalCartItem } = cartSlice.actions;
export default cartSlice.reducer;
