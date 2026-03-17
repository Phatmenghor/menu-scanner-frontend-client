import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AddToCartRequest,
  UpdateCartItemRequest,
} from "../models/request/cart-request";
import { CartResponseModel, CartItemModel } from "../models/response/cart-response";
import { AppDefault } from "@/constants/app-resource/default/default";

// Normalize API response to internal format
const normalizeCartResponse = (data: any): CartResponseModel => {
  return {
    businessId: data.businessId,
    businessName: data.businessName,
    items: (data.items || []).map((item: any) => ({
      id: item.id,
      product: item.product,
      productId: item.product?.id,
      productName: item.product?.name,
      productImageUrl: item.product?.imageUrl,
      productSizeId: item.product?.sizeId || null,
      sizeName: item.product?.sizeName || null,
      currentPrice: item.currentPrice,
      finalPrice: item.finalPrice,
      hasActivePromotion: item.hasActivePromotion,
      hasPromotion: item.hasActivePromotion,
      quantity: item.quantity,
      totalBeforeDiscount: item.totalBeforeDiscount,
      discountAmount: item.discountAmount,
      totalPrice: item.totalPrice,
      isAvailable: true,
      promotionType: item.promotionType,
      promotionValue: item.promotionValue,
      promotionFromDate: item.promotionFromDate,
      promotionToDate: item.promotionToDate,
    })),
    totalItems: data.totalItems,
    subtotalBeforeDiscount: data.subtotalBeforeDiscount,
    subtotal: data.subtotal,
    totalDiscount: data.totalDiscount,
    finalTotal: data.finalTotal,
  };
};

export const fetchCart = createApiThunk<CartResponseModel, void>(
  "cart/fetchCart",
  async (_, signal) => {
    const businessId = AppDefault.BUSINESS_ID;
    const response = await axiosClientWithAuth.get(
      `/api/v1/cart/${businessId}`,
      { signal }
    );
    return normalizeCartResponse(response.data.data);
  },
);

export const addToCart = createApiThunk<CartResponseModel, AddToCartRequest>(
  "cart/addToCart",
  async (data, signal) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { optimisticTimestamp, ...requestData } = data;
    const response = await axiosClientWithAuth.post("/api/v1/cart", requestData, {
      signal,
    });
    return normalizeCartResponse(response.data.data);
  },
);

export const updateCartItem = createApiThunk<
  CartResponseModel,
  UpdateCartItemRequest
>("cart/updateCartItem", async (data, signal) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { optimisticTimestamp, ...requestData } = data;
  const response = await axiosClientWithAuth.post("/api/v1/cart", requestData, {
    signal,
  });
  return normalizeCartResponse(response.data.data);
});

export const clearCart = createApiThunk<void, void>(
  "cart/clearCart",
  async (_, signal) => {
    const businessId = AppDefault.BUSINESS_ID;
    await axiosClientWithAuth.delete(`/api/v1/cart/${businessId}/clear`, {
      signal,
    });
  },
);
