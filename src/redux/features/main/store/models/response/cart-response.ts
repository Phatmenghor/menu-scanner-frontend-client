export interface CartResponseModel {
  businessId: string;
  businessName: string;
  items: CartItemModel[];
  totalItems: number;
  subtotalBeforeDiscount?: number;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
}

export interface ProductInCart {
  id: string;
  name: string;
  imageUrl: string;
  sizeId: string | null;
  sizeName: string | null;
  status: string;
}

export interface CartItemModel {
  id: string;
  product: ProductInCart;
  productId?: string;
  productName?: string;
  productImageUrl?: string;
  productSizeId?: string | null;
  sizeName?: string | null;
  currentPrice: number;
  finalPrice: number;
  hasActivePromotion: boolean;
  hasPromotion?: boolean;
  quantity: number;
  totalBeforeDiscount?: number;
  discountAmount?: number;
  totalPrice: number;
  isAvailable?: boolean;
  promotionType: string | null;
  promotionValue: number | null;
  promotionFromDate: string | null;
  promotionToDate: string | null;
  promotionEndDate?: string | null;
  lastOptimisticTimestamp?: number;
}

// Backward compatible alias
export type CartItemResponseModel = CartItemModel;
