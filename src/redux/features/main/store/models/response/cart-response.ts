export interface CartItemResponseModel {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  sizeId?: string;
  sizeName?: string;
  hasPromotion: boolean;
  promotionType?: string;
  promotionValue?: number;
  displayPrice: number;
  displayOriginPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponseModel {
  items: CartItemResponseModel[];
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
}
