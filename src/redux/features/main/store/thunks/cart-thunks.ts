import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AddToCartRequest,
  UpdateCartItemRequest,
  RemoveFromCartRequest,
} from "../models/request/cart-request";
import {
  CartResponseModel,
  CartItemResponseModel,
} from "../models/response/cart-response";

export const fetchCart = createApiThunk<CartResponseModel, void>(
  "cart/fetchCart",
  async () => {
    const response = await axiosClientWithAuth.get("/api/v1/cart");
    return response.data.data;
  }
);

export const addToCart = createApiThunk<CartItemResponseModel, AddToCartRequest>(
  "cart/addToCart",
  async (data) => {
    const response = await axiosClientWithAuth.post("/api/v1/cart/add", data);
    return response.data.data;
  }
);

export const updateCartItem = createApiThunk<
  CartItemResponseModel,
  UpdateCartItemRequest
>("cart/updateCartItem", async (data) => {
  const response = await axiosClientWithAuth.put(
    `/api/v1/cart/update/${data.cartItemId}`,
    { quantity: data.quantity }
  );
  return response.data.data;
});

export const removeFromCart = createApiThunk<void, RemoveFromCartRequest>(
  "cart/removeFromCart",
  async (data) => {
    await axiosClientWithAuth.delete(`/api/v1/cart/remove/${data.cartItemId}`);
  }
);

export const clearCart = createApiThunk<void, void>(
  "cart/clearCart",
  async () => {
    await axiosClientWithAuth.delete("/api/v1/cart/clear");
  }
);
