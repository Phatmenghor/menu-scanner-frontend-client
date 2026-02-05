import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AddToCartRequest,
  UpdateCartItemRequest,
} from "../models/request/cart-request";
import { CartResponseModel } from "../models/response/cart-response";
import { AppDefault } from "@/constants/app-resource/default/default";

export const fetchCart = createApiThunk<CartResponseModel, void>(
  "cart/fetchCart",
  async () => {
    const businessId = AppDefault.BUSINESS_ID;
    const response = await axiosClientWithAuth.get(
      `/api/v1/cart/${businessId}`,
    );
    return response.data.data;
  },
);

export const addToCart = createApiThunk<CartResponseModel, AddToCartRequest>(
  "cart/addToCart",
  async (data) => {
    const response = await axiosClientWithAuth.post("/api/v1/cart", data);
    return response.data.data;
  },
);

export const updateCartItem = createApiThunk<
  CartResponseModel,
  UpdateCartItemRequest
>("cart/updateCartItem", async (data) => {
  const response = await axiosClientWithAuth.post("/api/v1/cart", data);
  return response.data.data;
});

export const clearCart = createApiThunk<void, void>(
  "cart/clearCart",
  async () => {
    const businessId = AppDefault.BUSINESS_ID;
    await axiosClientWithAuth.delete(`/api/v1/cart/clear/${businessId}`);
  },
);
