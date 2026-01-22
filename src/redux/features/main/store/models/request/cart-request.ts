export interface AddToCartRequest {
  productId: string;
  quantity: number;
  sizeId?: string;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  cartItemId: string;
}
